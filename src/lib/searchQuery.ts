/**
 * Search query normalization and intent helpers for `/api/products/search`.
 */

/** Shop rows where fans/player/retro kit version rarely maps 1:1 like jerseys — relax kit filters when the user clearly searches these. */
export const OUTERWEAR_SHOP_CATEGORIES = [
  "tracksuit",
  "windbreaker",
  "jackets",
  "hoody",
  "nba-nfl",
] as const;

/**
 * Collapse common synonyms so tokens hit `shopCategory` slugs and titles (e.g. "track suit" → "tracksuit").
 */
export function normalizeSearchQueryForProducts(q: string): string {
  let s = q.trim().replace(/\s+/g, " ");
  if (s.length < 2) return s;

  s = s.replace(/\btracksuits\b/gi, "tracksuit");

  s = s.replace(/\btrack\s*[-]?\s*suit\b/gi, "tracksuit");
  s = s.replace(/\bsweat\s*suit\b/gi, "tracksuit");
  s = s.replace(/\bsweatsuit\b/gi, "tracksuit");
  s = s.replace(/\btraining\s+suit\b/gi, "tracksuit");
  s = s.replace(/\bjogging\s+suit\b/gi, "tracksuit");
  s = s.replace(/\beşofman\b/gi, "tracksuit");
  s = s.replace(/\besofman\b/gi, "tracksuit");

  s = s.replace(/\bwind\s*breaker\b/gi, "windbreaker");
  s = s.replace(/\bhoodie\b/gi, "hoody");

  return s;
}

/** True when the user is clearly looking for outerwear / tracksuits (so kit version filters should not hide these rows). */
export function queryIntentIncludesOuterwear(q: string): boolean {
  const raw = q.trim();
  const n = normalizeSearchQueryForProducts(raw).toLowerCase();
  return (
    /\b(tracksuit|windbreaker|jacket|hoody|hoodie|nba|nfl|eşofman|esofman|sweatsuit|outerwear)\b/i.test(raw) ||
    /\b(tracksuit|windbreaker|jacket|hoody|nba|nfl)\b/i.test(n)
  );
}
