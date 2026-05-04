/**
 * Auto-Linking Rehype Plugin - Entry Point
 *
 * This is the main plugin file that Astro loads via markdown.rehypePlugins.
 * It creates a factory function that returns the rehype transformer.
 */

import type { AutoLinkOptions, HASTNode } from './types';
import { transformAutoLinks } from './auto-links';

// Re-export types for consumers
export type { AutoLinkOptions, LinkEntry, PillarSlug } from './types';

/**
 * Create the auto-linking rehype plugin
 *
 * @param options - Plugin configuration
 * @param options.dictionary - The Central Static Dictionary of link entries
 * @param options.debug - Enable verbose logging (default: false)
 * @param options.failQuietly - Continue on errors (default: true)
 * @param options.skipTags - HTML tags to skip (default: ['a', 'code', 'pre', ...])
 * @param options.maxLinksPerArticle - Max links per article (default: 10)
 */
export function autoLinkPlugin(options: AutoLinkOptions) {
  const {
    dictionary,
    debug = false,
    failQuietly = true,
    skipTags = ['a', 'code', 'pre', 'script', 'style', 'head', 'title'],
    maxLinksPerArticle = 10,
  } = options;

  // Validate dictionary
  if (!dictionary || !Array.isArray(dictionary)) {
    const error = new Error('[auto-link] Invalid dictionary: must be an array');
    if (failQuietly) {
      console.warn(error.message);
      return () => {
        /* noop */
      };
    }
    throw error;
  }

  if (dictionary.length === 0) {
    if (debug) console.log('[auto-link] Dictionary is empty, skipping');
    return () => {
      /* noop */
    };
  }

  if (debug) {
    console.log(`[auto-link] Initializing with ${dictionary.length} entries`);
  }

  // Return the transformer function
  return function transformer(tree: HASTNode, file: { filename?: string; path?: string; history?: string[] }) {
    try {
      // Fix: file.filename may be undefined in Astro's VFile
      // Use history[0] or path as fallback (Bug fix #3)
      const filePath = file.history?.[0] ?? file.path ?? file.filename ?? 'unknown';
      const slug = filePath.split('/').pop()?.replace(/\.mdx?$/i, '') ?? 'unknown';

      if (debug) {
        console.log(`[auto-link] Processing: ${slug}`);
      }

      const result = transformAutoLinks(tree, dictionary, {
        dictionary,
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
        console.warn(`[auto-link] Error processing ${slug}:`, error);
      } else {
        throw error;
      }
    }
  };
}

/**
 * Default plugin instance with empty dictionary (for configuration)
 * Use this as a placeholder when you want to configure via astro.config.mjs
 */
export function createDefaultPlugin(dictionary: AutoLinkOptions['dictionary']) {
  return autoLinkPlugin({ dictionary: dictionary || [] });
}