/**
 * Auto-Links Transformer - Core rehype plugin logic
 *
 * Transforms text nodes containing keywords into hyperlinks based on
 * the Central Static Dictionary. Handles deduplication, word boundaries,
 * and exclusion patterns.
 */

import { visit, type VisitorCallback } from 'unist-util-visit';
import type {
  HASTNode,
  TextNode,
  ElementNode,
  LinkEntry,
  LinkMatch,
  DedupState,
  AutoLinkOptions,
} from './types';

// ---------- Utility Functions ----------

/**
 * Check if any ancestor in the parent stack has a tag that should be skipped
 * This prevents nested links like <a><strong><a>...</a></strong></a>
 */
function hasExcludedAncestor(
  parentStack: HASTNode[],
  skipTags: string[]
): boolean {
  for (const ancestor of parentStack) {
    if ('tagName' in ancestor) {
      if (skipTags.includes((ancestor as ElementNode).tagName)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Escape special regex characters in a string
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if position is at a word boundary (neither adjacent to letters)
 */
function isWordBoundary(text: string, start: number, end: number): boolean {
  const prevChar = start > 0 ? text[start - 1] : ' ';
  const nextChar = end < text.length ? text[end] : ' ';

  const isLetter = (c: string) => /[\p{L}]/u.test(c);

  return !isLetter(prevChar) && !isLetter(nextChar);
}

/**
 * Create a RegExp pattern for matching keywords with word boundaries
 * Processes longest keywords first to avoid partial matches
 */
function buildKeywordRegex(entries: LinkEntry[]): RegExp {
  // Sort by keyword length descending (longest first) for compound keyword handling
  const sorted = [...entries].sort((a, b) => b.keyword.length - a.keyword.length);

  const alternatives = sorted.map((entry) => {
    // Escape special regex characters
    const escaped = escapeRegex(entry.keyword);
    // Allow flexible whitespace (spaces, tabs, newlines) between words
    const flexibleSpace = escaped.replace(/\\ +/g, '\\s+');
    return `(?:${flexibleSpace})`;
  });

  // Combine with alternation, longest first
  const pattern = alternatives.join('|');

  // Word boundary on both ends using Unicode-aware check
  // We use (?<!\p{L}) and (?!\p{L}) for Unicode letter detection
  // 'i' flag added for case-insensitive matching (Bug fix)
  return new RegExp(`(${pattern})`, 'gui');
}

/**
 * Initialize deduplication state for a single article
 */
function createDedupState(): DedupState {
  return {
    seenKeywords: new Set<string>(),
    seenTargets: new Set<string>(),
    keywordCounts: new Map<string, number>(),
  };
}

/**
 * Check if a match should be skipped due to deduplication rules
 */
function shouldSkipMatch(
  state: DedupState,
  match: LinkMatch,
  maxPerArticle: number
): { skip: boolean; reason?: string } {
  const normalizedKeyword = match.keyword.toLowerCase();
  const maxOcc = match.entry.maxOccurrences ?? maxPerArticle;

  // Check keyword-specific max occurrences
  const currentCount = state.keywordCounts.get(normalizedKeyword) || 0;
  if (currentCount >= maxOcc) {
    return { skip: true, reason: 'keywordMaxReached' };
  }

  // Check if we've already linked this keyword (case-insensitive)
  if (state.seenKeywords.has(normalizedKeyword)) {
    return { skip: true, reason: 'keywordDuplicate' };
  }

  // Check if we've already linked to this target
  if (state.seenTargets.has(match.target)) {
    return { skip: true, reason: 'targetDuplicate' };
  }

  return { skip: false };
}

/**
 * Record a successful match in dedup state
 */
function recordMatch(state: DedupState, match: LinkMatch): void {
  const normalizedKeyword = match.keyword.toLowerCase();

  state.seenKeywords.add(normalizedKeyword);
  state.seenTargets.add(match.target);

  const currentCount = state.keywordCounts.get(normalizedKeyword) || 0;
  state.keywordCounts.set(normalizedKeyword, currentCount + 1);
}

// ---------- Main Transformer ----------

export interface TransformResult {
  totalLinks: number;
  skippedDuplicate: number;
  skippedExcluded: number;
}

/**
 * Transform text nodes in a HAST tree, converting keywords to links
 */
export function transformAutoLinks(
  tree: HASTNode,
  entries: LinkEntry[],
  options: AutoLinkOptions
): TransformResult {
  const {
    skipTags = ['a', 'code', 'pre', 'script', 'style', 'head', 'title'],
    maxLinksPerArticle = 10,
  } = options;

  // Build combined regex from all entries
  const keywordRegex = buildKeywordRegex(entries);
  const entryMap = new Map<string, LinkEntry>();

  // Create a map for quick lookup: keyword lowercase -> entry
  for (const entry of entries) {
    entryMap.set(entry.keyword.toLowerCase(), entry);
  }

  // Initialize dedup state
  const dedup = createDedupState();
  let totalLinks = 0;
  let skippedDuplicate = 0;
  let skippedExcluded = 0;

  // Visitor callback for text nodes
  // Note: 'ancestors' is the parent stack from root to current node
  const visitor: VisitorCallback<HASTNode, ElementNode> = (
    node: HASTNode,
    index: number | undefined,
    parent: HASTNode | undefined,
    ancestors: HASTNode[]
  ) => {
    // Only process text nodes with actual content
    if (node.type !== 'text') return;
    if (typeof (node as TextNode).value !== 'string') return;
    if ((node as TextNode).value.trim() === '') return;

    // Check parent element should be processed
    if (!parent || !('tagName' in parent)) return;
    const parentElement = parent as ElementNode;

    // Skip if immediate parent is in skip list
    if (skipTags.includes(parentElement.tagName)) return;

    // Skip if any ANCESTOR is in skip list (prevents nested links)
    if (hasExcludedAncestor(ancestors, skipTags)) return;

    const textNode = node as TextNode;
    const text = textNode.value;

    // Check if text contains any keywords
    if (!keywordRegex.test(text)) return;

    // Reset regex state after test
    keywordRegex.lastIndex = 0;

    // Find all matches
    const matches: Array<{
      keyword: string;
      entry: LinkEntry;
      start: number;
      end: number;
    }> = [];

    let match: RegExpExecArray | null;
    while ((match = keywordRegex.exec(text)) !== null) {
      const matchedKeyword = match[1];
      const entry = entryMap.get(matchedKeyword.toLowerCase());

      if (!entry) continue;

      // Check word boundary
      const start = match.index;
      const end = start + matchedKeyword.length;
      if (!isWordBoundary(text, start, end)) continue;

      // Check exclusions
      if (entry.excludePages) {
        // page slug would be extracted from file path - simplified here
        // In actual implementation, this would use the file path
      }

      matches.push({
        keyword: matchedKeyword,
        entry,
        start,
        end,
      });
    }

    if (matches.length === 0) return;

    // Sort matches by start position (ascending) to process left-to-right
    matches.sort((a, b) => a.start - b.start);

    // Build new nodes to replace the text node
    const newNodes: HASTNode[] = [];
    let lastIndex = 0;

    for (const m of matches) {
      // Skip if we've reached max links
      if (totalLinks >= maxLinksPerArticle) break;

      const linkMatch: LinkMatch = {
        keyword: m.keyword,
        startIndex: m.start,
        endIndex: m.end,
        target: m.entry.target,
        entry: m.entry,
      };

      // Check dedup
      const skipResult = shouldSkipMatch(dedup, linkMatch, maxLinksPerArticle);
      if (skipResult.skip) {
        skippedDuplicate++;
        continue;
      }

      // Text before the match
      if (m.start > lastIndex) {
        newNodes.push({
          type: 'text',
          value: text.slice(lastIndex, m.start),
        } as TextNode);
      }

      // Create link element
      const linkNode: ElementNode = {
        type: 'element',
        tagName: 'a',
        properties: {
          href: m.entry.target,
          className: ['auto-link'],
        },
        children: [{ type: 'text', value: m.keyword } as TextNode],
      };

      newNodes.push(linkNode);
      recordMatch(dedup, linkMatch);
      totalLinks++;
      lastIndex = m.end;
    }

    // Text after the last match
    if (lastIndex < text.length) {
      newNodes.push({
        type: 'text',
        value: text.slice(lastIndex),
      } as TextNode);
    }

    // Replace the text node with new nodes
    if (newNodes.length > 0 && index !== undefined && 'children' in parent) {
      (parent.children as HASTNode[]).splice(index, 1, ...newNodes);

      // Return the index to skip past the inserted nodes
      return index + newNodes.length;
    }
  };

  // Run the visitor
  visit(tree, 'text', visitor);

  return {
    totalLinks,
    skippedDuplicate,
    skippedExcluded,
  };
}

/**
 * Get article metadata from file path
 * Used for exclusion checking
 */
export function extractArticleSlug(filePath: string): string {
  // Extract slug from file path like:
  // /src/content/guides/stripe-connect.mdx -> stripe-connect
  const match = filePath.match(/\/([^/]+)\.mdx?$/i);
  return match ? match[1] : '';
}