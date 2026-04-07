/**
 * Football kit seasons in titles: "17/18", "26/27", "2017/2018", "2026/2027".
 * "Retro" in our shop = season **starting** in 2017 or earlier (17/18 and older).
 * 18/19 and newer (including 26/27) are **not** retro even if the DB says so.
 */

const FULL_SEASON_RE = /\b(20\d{2})[\/-](20\d{2})\b/g;
const SHORT_SEASON_RE = /\b(\d{2})[\/-](\d{2})\b/g;

function yyToFullYear(yy: number): number {
  if (yy >= 70) return 1900 + yy;
  return 2000 + yy;
}

function shortPairToSeasonStart(a: number, b: number): number {
  const startYear = yyToFullYear(a);
  const endYear = yyToFullYear(b);
  if (Math.abs(endYear - startYear) === 1) {
    return Math.min(startYear, endYear);
  }
  return startYear;
}

/** All season **start** years found in the string (full and short patterns). */
export function parseSeasonStartYearsFromText(text: string): number[] {
  if (!text?.trim()) return [];

  const years: number[] = [];

  for (const m of text.matchAll(FULL_SEASON_RE)) {
    const y = parseInt(m[1]!, 10);
    if (Number.isFinite(y)) years.push(y);
  }

  for (const m of text.matchAll(SHORT_SEASON_RE)) {
    const a = parseInt(m[1]!, 10);
    const b = parseInt(m[2]!, 10);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    years.push(shortPairToSeasonStart(a, b));
  }

  return years;
}

/**
 * First season start year (minimum), or null if none.
 * Prefer `hasModernSeasonInName` when deciding retro vs modern.
 */
export function parseSeasonStartYearFromText(text: string): number | null {
  const ys = parseSeasonStartYearsFromText(text);
  if (ys.length === 0) return null;
  return Math.min(...ys);
}

/** True when the parsed season is old enough to count as "retro" in listings. */
export function isRetroSeasonStartYear(year: number): boolean {
  return year <= 2017;
}

/**
 * If the title contains any season starting after 2017, the product must not be treated as retro
 * (fixes wrong supplier/DB `retro` on 18/19 … 26/27 kits).
 */
export function hasModernSeasonInName(name: string): boolean {
  return parseSeasonStartYearsFromText(name).some((y) => y > 2017);
}

/**
 * Mongo `$regex` (case-insensitive): title looks like a **modern** kit season (2018/19 …, 18/19 …, full years).
 * Excludes 17/18 and older short forms. Used for `/league/retro-kits` when `kitType` was wrongly `retro`.
 */
export const MODERN_SEASON_IN_NAME_PATTERN =
  "\\b(?:20(?:1[89]|2\\d|3[0-9])\\/20\\d{4}|20(?:1[89]|2\\d|3[0-9])\\/\\d{2}|(?:1[89]|2\\d|3[0-9])\\/\\d{2})\\b";
