/**
 * ★ Central Static Dictionary - Otomatik İç Linkleme Kaynağı
 *
 * Bu dosya OTOMATİK İÇİN LİNK SÖZLÜĞÜDÜR.
 *
 * Kullanım:
 * 1. Yeni bir link eklemek için: LINK_DICTIONARY array'ine yeni entry ekle
 * 2. Bir keyword'ü kaldırmak için: entry'yi sil veya comment out yap
 * 3. Mevcut linki güncellemek için: target veya keyword'ü değiştir
 *
 * Önemli Kurallar:
 * - Her keyword benzersiz olmalı (duplicate prevention)
 * - Compound keywords önce listelenmeli (longer phrases first)
 * - priority ile çakışmaları çöz
 * - target URL'ler MEVCUT sayfa yollarını göstermeli (404 önleme)
 *
 * @example
 * // Yeni link ekleme
 * { keyword: "llc formation", target: "/research/what-is-llc-formation" }
 */

import type { LinkEntry } from './rehype/types';

export const LINK_DICTIONARY: LinkEntry[] = [
  // ============ COMPOUND KEYWORDS (önce listelenmeli - longer first) ============

  {
    keyword: "stripe connect account",
    target: "/guides/us-llc-for-stripe",
    priority: 100,
    maxOccurrences: 2,
  },
  {
    keyword: "registered agent service",
    target: "/guides/registered-agent-address-vs-business-address",
    priority: 90,
  },
  {
    keyword: "ein application",
    target: "/compliance/how-to-get-ein",
    priority: 85,
  },
  {
    keyword: "boi report",
    target: "/guides/boi-reporting-us-llc-2026",
    priority: 95,
  },
  {
    keyword: "beneficial ownership information",
    target: "/guides/boi-reporting-us-llc-2026",
    priority: 90,
  },
  {
    keyword: "nonresident alien",
    target: "/guides/form-5472-foreign-owned-llc",
    priority: 85,
    maxOccurrences: 2,
  },
  {
    keyword: "stripe atlas",
    target: "/providers/stripe",
    priority: 60,
  },
  {
    keyword: "merchant of record",
    target: "/guides/payment-stack-for-non-us-founders",
    priority: 75,
  },
  {
    keyword: "pro forma 1120",
    target: "/guides/form-5472-foreign-owned-llc",
    priority: 80,
  },
  {
    keyword: "registered agent address",
    target: "/guides/registered-agent-address-vs-business-address",
    priority: 70,
  },
  {
    keyword: "home country address",
    target: "/guides/us-llc-for-stripe",
    priority: 65,
  },
  {
    keyword: "stripe connect",
    target: "/guides/us-llc-for-stripe",
    priority: 55,
  },
  {
    keyword: "formation service",
    target: "/providers",
    priority: 60,
    excludePillars: ["providers"],
  },
  {
    keyword: "formation fee",
    target: "/providers",
    priority: 50,
  },
  {
    keyword: "state filing fee",
    target: "/providers",
    priority: 45,
  },
  {
    keyword: "annual fee",
    target: "/providers",
    priority: 40,
  },
  {
    keyword: "rolling reserve",
    target: "/guides/us-llc-for-paypal",
    priority: 60,
  },
  {
    keyword: "virtual mailbox",
    target: "/guides/registered-agent-address-vs-business-address",
    priority: 55,
  },
  {
    keyword: "virtual office",
    target: "/guides/registered-agent-address-vs-business-address",
    priority: 50,
  },
  {
    keyword: "us ip address",
    target: "/guides/us-llc-for-paypal",
    priority: 55,
  },

  // ============ STANDARD KEYWORDS ============

  {
    keyword: "stripe",
    target: "/guides/us-llc-for-stripe",
    priority: 50,
    maxOccurrences: 3,
  },
  {
    keyword: "paypal",
    target: "/guides/us-llc-for-paypal",
    priority: 50,
    maxOccurrences: 2,
  },
  {
    keyword: "llc",
    target: "/research/what-is-llc-formation",
    priority: 40,
    maxOccurrences: 5,
  },
  {
    keyword: "registered agent",
    target: "/guides/registered-agent-address-vs-business-address",
    priority: 75,
    maxOccurrences: 3,
  },
  {
    keyword: "ein",
    target: "/compliance/how-to-get-ein",
    priority: 70,
    maxOccurrences: 3,
  },
  {
    keyword: "fein",
    target: "/compliance/how-to-get-ein",
    priority: 65,
    maxOccurrences: 2,
  },
  {
    keyword: "employer identification number",
    target: "/compliance/how-to-get-ein",
    priority: 60,
  },
  {
    keyword: "itin",
    target: "/compliance/how-to-get-ein",
    priority: 70,
  },
  {
    keyword: "ssn",
    target: "/compliance/how-to-get-ein",
    priority: 60,
  },
  {
    keyword: "form ss-4",
    target: "/compliance/how-to-get-ein",
    priority: 75,
  },
  {
    keyword: "kyc",
    target: "/guides/us-llc-for-stripe",
    priority: 70,
    maxOccurrences: 3,
  },
  {
    keyword: "boi",
    target: "/guides/boi-reporting-us-llc-2026",
    priority: 80,
  },
  {
    keyword: "fincen",
    target: "/guides/boi-reporting-us-llc-2026",
    priority: 80,
  },
  {
    keyword: "corporate transparency act",
    target: "/guides/boi-reporting-us-llc-2026",
    priority: 75,
  },
  {
    keyword: "formation",
    target: "/research/what-is-llc-formation",
    priority: 30,
    excludePillars: ["providers"],
  },
  {
    keyword: "payment access",
    target: "/payment-access",
    priority: 25,
  },
  {
    keyword: "compliance",
    target: "/compliance",
    priority: 20,
  },
  {
    keyword: "form 5472",
    target: "/guides/form-5472-foreign-owned-llc",
    priority: 85,
  },
  {
    keyword: "disregarded entity",
    target: "/guides/form-5472-foreign-owned-llc",
    priority: 70,
  },
  {
    keyword: "foreign owned us llc",
    target: "/guides/form-5472-foreign-owned-llc",
    priority: 75,
    maxOccurrences: 2,
  },
  {
    keyword: "foreign owned",
    target: "/guides/form-5472-foreign-owned-llc",
    priority: 60,
  },
  {
    keyword: "non-us founder",
    target: "/guides/us-llc-for-stripe",
    priority: 70,
    maxOccurrences: 2,
  },
  {
    keyword: "international founder",
    target: "/guides/us-llc-for-stripe",
    priority: 55,
  },
  {
    keyword: "non-us founders",
    target: "/guides/us-llc-for-stripe",
    priority: 65,
    maxOccurrences: 2,
  },
  {
    keyword: "delaware",
    target: "/research/what-is-llc-formation",
    priority: 50,
    excludePillars: ["providers"],
  },
  {
    keyword: "wyoming",
    target: "/research/what-is-llc-formation",
    priority: 50,
  },
  {
    keyword: "new mexico",
    target: "/research/what-is-llc-formation",
    priority: 45,
  },
  {
    keyword: "c-corp",
    target: "/research/what-is-llc-formation",
    priority: 45,
  },
  {
    keyword: "single-member llc",
    target: "/research/what-is-llc-formation",
    priority: 50,
  },
  {
    keyword: "paddle",
    target: "/guides/payment-stack-for-non-us-founders",
    priority: 60,
  },
  {
    keyword: "lemon squeezy",
    target: "/guides/payment-stack-for-non-us-founders",
    priority: 55,
  },

  // ============ BANKING PROVIDERS ============

  {
    keyword: "mercury",
    target: "/guides/us-llc-for-stripe",
    priority: 55,
    maxOccurrences: 2,
  },
  {
    keyword: "relay",
    target: "/guides/us-llc-for-stripe",
    priority: 50,
  },
  {
    keyword: "wise",
    target: "/guides/us-llc-for-stripe",
    priority: 45,
  },

  // ============ PROVIDER-RELATED ============

  {
    keyword: "bizee",
    target: "/providers/bizee",
    priority: 45,
  },
  {
    keyword: "inc authority",
    target: "/providers/inc-authority",
    priority: 45,
  },
  {
    keyword: "docketed",
    target: "/providers/docketed",
    priority: 40,
  },
  {
    keyword: "legalzoom",
    target: "/providers/legalzoom",
    priority: 40,
  },
  {
    keyword: "incfile",
    target: "/providers/incfile",
    priority: 40,
  },
  {
    keyword: "northwest registered agent",
    target: "/providers/northwest",
    priority: 45,
  },

  // ============ GEOGRAPHIC / HIGH-RISK ============

  {
    keyword: "nigeria",
    target: "/guides/us-llc-for-stripe",
    priority: 50,
  },
  {
    keyword: "pakistan",
    target: "/guides/us-llc-for-stripe",
    priority: 50,
  },
  {
    keyword: "bangladesh",
    target: "/guides/us-llc-for-stripe",
    priority: 50,
  },

  // ============ DOCUMENT/PROOF TERMS ============

  {
    keyword: "utility bill",
    target: "/guides/us-llc-for-stripe",
    priority: 50,
  },
  {
    keyword: "bank statement",
    target: "/guides/us-llc-for-stripe",
    priority: 45,
  },
  {
    keyword: "proof of address",
    target: "/guides/us-llc-for-stripe",
    priority: 50,
  },

  // ============ BUSINESS MODEL TERMS ============

  {
    keyword: "saas",
    target: "/research/what-is-llc-formation",
    priority: 40,
  },
  {
    keyword: "digital product",
    target: "/guides/payment-stack-for-non-us-founders",
    priority: 45,
  },
  {
    keyword: "ecommerce",
    target: "/guides/us-llc-for-stripe",
    priority: 45,
  },
  {
    keyword: "amazon",
    target: "/guides/us-llc-for-stripe",
    priority: 50,
  },
  {
    keyword: "shopify",
    target: "/guides/us-llc-for-stripe",
    priority: 45,
  },
];

/**
 * Helper: Get dictionary sorted by priority (descending)
 * Use this when you need to process links in priority order
 */
export function getSortedDictionary(): LinkEntry[] {
  return [...LINK_DICTIONARY].sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

/**
 * Helper: Get all keywords as a RegExp-ready string
 */
export function getKeywordPattern(): string {
  const sorted = getSortedDictionary();
  const escaped = sorted.map((e) => escapeRegex(e.keyword));
  // Longest keywords first for proper matching
  return escaped.sort((a, b) => b.length - a.length).join('|');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}