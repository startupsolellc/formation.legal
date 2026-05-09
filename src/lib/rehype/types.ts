/**
 * Auto-linking Rehype Plugin - TypeScript Types
 *
 * Defines the core interfaces for the Central Static Dictionary system
 * and the auto-linking transformation logic.
 */

// ---------- Core Link Entry ----------

export interface LinkEntry {
  /** The keyword/phrase to match in content */
  keyword: string;
  /** The target URL to link to */
  target: string;
  /** Higher priority wins when multiple keywords match same text */
  priority?: number;
  /** Max occurrences per article (default: 1) */
  maxOccurrences?: number;
  /** Skip linking in these pillars */
  excludePillars?: PillarSlug[];
  /** Skip linking on these page slugs */
  excludePages?: string[];
  /** Custom class name for the link (default: 'auto-link') */
  className?: string;
}

export type PillarSlug =
  | 'payment-access'
  | 'address-banking'
  | 'compliance'
  | 'providers'
  | 'playbooks';

// ---------- Match Result Types ----------

export interface LinkMatch {
  keyword: string;
  startIndex: number;
  endIndex: number;
  target: string;
  entry: LinkEntry;
}

export interface LinkResult {
  matches: LinkMatch[];
  totalCount: number;
  skippedDuplicate: number;
  skippedExcluded: number;
}

// ---------- Dedup Tracking ----------

export interface DedupState {
  seenKeywords: Set<string>;
  seenTargets: Set<string>;
  keywordCounts: Map<string, number>;
}

// ---------- Plugin Options ----------

export interface AutoLinkOptions {
  /** The central static dictionary - source of truth for all auto-links */
  dictionary: LinkEntry[];
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Silently fail on errors (default: true) */
  failQuietly?: boolean;
  /** Skip elements by tag name (default: ['a', 'code', 'pre', 'script', 'style']) */
  skipTags?: string[];
  /** Per-article max links (default: 10) */
  maxLinksPerArticle?: number;
  /**
   * Heading tags to skip (h1-h6). These are always skipped for auto-linking
   * to avoid cluttering headings with links. (default: ['h1','h2','h3','h4','h5','h6'])
   */
  skipHeadings?: boolean;
}

// ---------- HAST Node Types (for reference) ----------

export interface HASTNode {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HASTNode[];
  position?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface TextNode extends HASTNode {
  type: 'text';
  value: string;
}

export interface ElementNode extends HASTNode {
  type: 'element';
  tagName: string;
  properties: Record<string, unknown>;
  children: HASTNode[];
}