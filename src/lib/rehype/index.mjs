/**
 * Auto-Linking Rehype Plugin
 *
 * Transforms text nodes containing keywords into hyperlinks based on
 * the Central Static Dictionary. Handles deduplication, word boundaries,
 * and exclusion patterns.
 */

import { visit } from 'unist-util-visit';

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if position is at a word boundary (neither adjacent to letters)
 */
function isWordBoundary(text, start, end) {
  const prevChar = start > 0 ? text[start - 1] : ' ';
  const nextChar = end < text.length ? text[end] : ' ';

  const isLetter = (c) => /[\p{L}]/u.test(c);

  return !isLetter(prevChar) && !isLetter(nextChar);
}

/**
 * Create a RegExp pattern for matching keywords with word boundaries
 * Processes longest keywords first to avoid partial matches
 */
function buildKeywordRegex(entries) {
  // Sort by keyword length descending (longest first)
  const sorted = [...entries].sort((a, b) => b.keyword.length - a.keyword.length);

  const alternatives = sorted.map((entry) => {
    const escaped = escapeRegex(entry.keyword);
    const flexibleSpace = escaped.replace(/\\ +/g, '\\s+');
    return `(?:${flexibleSpace})`;
  });

  const pattern = alternatives.join('|');

  // Bug fix #1: Added 'i' flag for case-insensitive matching
  return new RegExp(`(${pattern})`, 'gui');
}

/**
 * Check if any ancestor has a tag that should be skipped
 * This prevents nested links like <a><strong><a>...</a></strong></a>
 */
function hasExcludedAncestor(parentStack, skipTags) {
  for (const ancestor of parentStack) {
    if (ancestor.tagName) {
      if (skipTags.includes(ancestor.tagName)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Initialize deduplication state for a single article
 */
function createDedupState() {
  return {
    seenKeywords: new Set(),
    seenTargets: new Set(),
    keywordCounts: new Map(),
  };
}

/**
 * Check if a match should be skipped
 */
function shouldSkipMatch(state, match, maxPerArticle) {
  const normalizedKeyword = match.keyword.toLowerCase();
  const maxOcc = match.entry.maxOccurrences ?? maxPerArticle;

  const currentCount = state.keywordCounts.get(normalizedKeyword) || 0;
  if (currentCount >= maxOcc) {
    return { skip: true, reason: 'keywordMaxReached' };
  }

  if (state.seenKeywords.has(normalizedKeyword)) {
    return { skip: true, reason: 'keywordDuplicate' };
  }

  if (state.seenTargets.has(match.target)) {
    return { skip: true, reason: 'targetDuplicate' };
  }

  return { skip: false };
}

/**
 * Record a successful match
 */
function recordMatch(state, match) {
  const normalizedKeyword = match.keyword.toLowerCase();

  state.seenKeywords.add(normalizedKeyword);
  state.seenTargets.add(match.target);

  const currentCount = state.keywordCounts.get(normalizedKeyword) || 0;
  state.keywordCounts.set(normalizedKeyword, currentCount + 1);
}

/**
 * Transform text nodes in a HAST tree
 */
function transformAutoLinks(tree, entries, options) {
  const {
    skipTags = ['a', 'code', 'pre', 'script', 'style', 'head', 'title'],
    maxLinksPerArticle = 10,
  } = options;

  const keywordRegex = buildKeywordRegex(entries);
  const entryMap = new Map();

  for (const entry of entries) {
    entryMap.set(entry.keyword.toLowerCase(), entry);
  }

  const dedup = createDedupState();
  let totalLinks = 0;
  let skippedDuplicate = 0;

  visit(tree, 'text', (node, index, parent) => {
    if (node.type !== 'text') return;
    if (typeof node.value !== 'string') return;
    if (node.value.trim() === '') return;

    if (!parent || !parent.tagName) return;
    const parentElement = parent;

    if (skipTags.includes(parentElement.tagName)) return;

    const text = node.value;

    if (!keywordRegex.test(text)) return;
    keywordRegex.lastIndex = 0;

    const matches = [];
    let match;
    while ((match = keywordRegex.exec(text)) !== null) {
      const matchedKeyword = match[1];
      const entry = entryMap.get(matchedKeyword.toLowerCase());

      if (!entry) continue;

      const start = match.index;
      const end = start + matchedKeyword.length;
      if (!isWordBoundary(text, start, end)) continue;

      matches.push({
        keyword: matchedKeyword,
        entry,
        start,
        end,
      });
    }

    if (matches.length === 0) return;

    matches.sort((a, b) => a.start - b.start);

    const newNodes = [];
    let lastIndex = 0;

    for (const m of matches) {
      if (totalLinks >= maxLinksPerArticle) break;

      const linkMatch = {
        keyword: m.keyword,
        startIndex: m.start,
        endIndex: m.end,
        target: m.entry.target,
        entry: m.entry,
      };

      const skipResult = shouldSkipMatch(dedup, linkMatch, maxLinksPerArticle);
      if (skipResult.skip) {
        skippedDuplicate++;
        continue;
      }

      if (m.start > lastIndex) {
        newNodes.push({
          type: 'text',
          value: text.slice(lastIndex, m.start),
        });
      }

      const linkNode = {
        type: 'element',
        tagName: 'a',
        properties: {
          href: m.entry.target,
          className: ['auto-link'],
        },
        children: [{ type: 'text', value: m.keyword }],
      };

      newNodes.push(linkNode);
      recordMatch(dedup, linkMatch);
      totalLinks++;
      lastIndex = m.end;
    }

    if (lastIndex < text.length) {
      newNodes.push({
        type: 'text',
        value: text.slice(lastIndex),
      });
    }

    if (newNodes.length > 0 && index !== undefined && parent.children) {
      parent.children.splice(index, 1, ...newNodes);
      return index + newNodes.length;
    }
  });

  return {
    totalLinks,
    skippedDuplicate,
    skippedExcluded: 0,
  };
}

/**
 * Create the auto-linking rehype plugin
 */
export function autoLinkPlugin(options) {
  const {
    dictionary,
    debug = false,
    failQuietly = true,
    skipTags = ['a', 'code', 'pre', 'script', 'style', 'head', 'title'],
    maxLinksPerArticle = 10,
  } = options;

  if (!dictionary || !Array.isArray(dictionary)) {
    const error = new Error('[auto-link] Invalid dictionary: must be an array');
    if (failQuietly) {
      console.warn(error.message);
      return () => {};
    }
    throw error;
  }

  if (dictionary.length === 0) {
    if (debug) console.log('[auto-link] Dictionary is empty, skipping');
    return () => {};
  }

  if (debug) {
    console.log(`[auto-link] Initializing with ${dictionary.length} entries`);
  }

  return function transformer(tree, file) {
    // Bug fix #3: Use history[0] or path as fallback for file.path
    const filePath = file.history?.[0] ?? file.path ?? file.filename ?? 'unknown';

    try {
      const slug = filePath.split('/').pop()?.replace(/\.mdx?$/i, '') ?? 'unknown';

      if (debug) {
        console.log(`[auto-link] Processing: ${slug}`);
      }

      const result = transformAutoLinks(tree, dictionary, {
        debug,
        failQuietly,
        skipTags,
        maxLinksPerArticle,
      });

      if (debug && result.totalLinks > 0) {
        console.log(`[auto-link] ${slug}: ${result.totalLinks} links added`);
      }
    } catch (error) {
      if (failQuietly) {
        console.warn(`[auto-link] Error processing ${filePath}:`, error);
      } else {
        throw error;
      }
    }
  };
}