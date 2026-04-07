/**
 * 2026 FIFA World Cup (Canada / Mexico / USA) — final tournament teams per official draw.
 * Source: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams
 *
 * Each inner array is one nation + common spellings used in product `team` fields.
 */

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 48 teams — alias groups for exact `team` match (case-insensitive). */
export const WORLD_CUP_2026_TEAM_ALIAS_GROUPS: string[][] = [
  ["Mexico"],
  ["South Africa"],
  ["South Korea", "Korea Republic", "Korea"],
  ["Czech Republic", "Czechia"],
  ["Canada"],
  ["Bosnia and Herzegovina", "Bosnia"],
  ["Qatar"],
  ["Switzerland"],
  ["Brazil", "Brasil"],
  ["Morocco", "Maroc"],
  ["Haiti"],
  ["Scotland"],
  ["United States", "USA", "US"],
  ["Paraguay"],
  ["Australia"],
  ["Türkiye", "Turkey", "Turkiye"],
  ["Germany", "Deutschland"],
  ["Curaçao", "Curacao"],
  ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire"],
  ["Ecuador"],
  ["Netherlands", "Holland"],
  ["Japan"],
  ["Sweden"],
  ["Tunisia"],
  ["Belgium"],
  ["Egypt"],
  ["Iran"],
  ["New Zealand"],
  ["Spain", "España", "Espana"],
  ["Cape Verde", "Cabo Verde"],
  ["Saudi Arabia"],
  ["Uruguay"],
  ["France"],
  ["Senegal"],
  ["Iraq"],
  ["Norway"],
  ["Argentina"],
  ["Algeria"],
  ["Austria"],
  ["Jordan"],
  ["Portugal"],
  ["DR Congo", "Congo DR", "Democratic Republic of Congo", "DRC"],
  ["Uzbekistan"],
  ["Colombia"],
  ["England"],
  ["Croatia"],
  ["Ghana"],
  ["Panama"],
];

/** Mongo `$or` of exact `team` matches for World Cup 2026 nations only. */
export function buildWorldCup2026TeamMongoFilter(): Record<string, unknown> {
  const clauses = WORLD_CUP_2026_TEAM_ALIAS_GROUPS.flatMap((aliases) =>
    aliases.map((alias) => ({
      team: { $regex: `^${escapeRegex(alias)}$`, $options: "i" },
    }))
  );
  return { $or: clauses };
}

/**
 * Same nations, but also match when the country appears in the listing `name` (many imports use
 * team="Unknown" or club-style strings while the title still says "Argentina 26/27").
 */
export function buildWorldCup2026TeamOrNameMongoFilter(): Record<string, unknown> {
  const teamClauses = WORLD_CUP_2026_TEAM_ALIAS_GROUPS.flatMap((aliases) =>
    aliases.map((alias) => ({
      team: { $regex: `^${escapeRegex(alias)}$`, $options: "i" },
    }))
  );
  const canonical = WORLD_CUP_2026_TEAM_ALIAS_GROUPS.map((g) => g[0]);
  const pattern = canonical.map(escapeRegex).join("|");
  const nameCountryClause = { name: { $regex: pattern, $options: "i" } };
  return { $or: [...teamClauses, nameCountryClause] };
}
