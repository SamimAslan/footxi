export const TURKISH_TEAMS = ["galatasaray", "fenerbahce", "besiktas", "trabzonspor"];

export const SHOP_CATEGORY_META = {
  jersey: { name: "Jersey", slug: "jersey" },
  windbreaker: { name: "Windbreaker", slug: "windbreaker" },
  jackets: { name: "Jackets", slug: "jackets" },
  hoody: { name: "Hoody", slug: "hoody" },
  tracksuit: { name: "Tracksuit", slug: "tracksuit" },
  kids: { name: "Kids", slug: "kids" },
  "nba-nfl": { name: "NBA & NFL", slug: "nba-nfl" },
} as const;

export const SHOP_CATEGORY_SLUGS = Object.keys(SHOP_CATEGORY_META);

const LEAGUE_ALIAS_MAP: Record<string, string[]> = {
  "la-liga": ["la-liga", "spain-la-liga", "spain-la-liga-jerseys", "spain-la-liga-jersey"],
  "serie-a": ["serie-a", "italy-serie-a", "italy-serie-a-jerseys", "italy-serie-a-jersey"],
  "ligue-1": ["ligue-1", "france-ligue-1", "france-ligue-1-jerseys", "france-ligue-1-jersey"],
  bundesliga: ["bundesliga", "germany-bundesliga", "germany-bundesliga-jerseys", "germany-bundesliga-jersey"],
  "premier-league": ["premier-league", "england-premier-league", "epl"],
  "super-lig": ["super-lig", "turkiye-super-lig", "turkey-super-lig", "turkish-super-lig"],
  "international-teams": ["international-teams", "international", "national-teams", "national-team"],
  others: ["others", "other-teams", "other-team", "other"],
  "fan-made": ["fan-made", "fanmade"],
  "nba-nfl": ["nba-nfl", "nba", "nfl", "nba-nfl-jerseys"],
};

const INTERNATIONAL_COUNTRY_KEYWORDS = [
  "argentina",
  "austria",
  "albania",
  "algeria",
  "australia",
  "belgium",
  "brazil",
  "bulgaria",
  "burkina faso",
  "cameroon",
  "canada",
  "chile",
  "china",
  "colombia",
  "congo",
  "costa rica",
  "croatia",
  "czech republic",
  "denmark",
  "dr congo",
  "egypt",
  "el salvador",
  "germany",
  "finland",
  "gabon",
  "georgia",
  "ghana",
  "guatemala",
  "guinea",
  "honduras",
  "hungary",
  "iceland",
  "iran",
  "iraq",
  "italy",
  "ireland",
  "jamaica",
  "france",
  "japan",
  "jugoslavia",
  "korea",
  "madagascar",
  "mali",
  "malaysia",
  "mexico",
  "morocco",
  "netherlands",
  "nigeria",
  "northern ireland",
  "northern macedonia",
  "norway",
  "pakistan",
  "palestine",
  "panama",
  "paraguay",
  "peru",
  "philippines",
  "poland",
  "spain",
  "portugal",
  "england",
  "romania",
  "russia",
  "saudi arabia",
  "scotland",
  "senegal",
  "serbia",
  "slovakia",
  "south africa",
  "sweden",
  "switzerland",
  "tunisia",
  "turkiye",
  "usa",
  "united arab emirates",
  "uruguay",
  "ukraine",
  "venezuela",
  "wales",
  "welsh",
  "yugoslavia",

  // Common names found in user dataset that should still map here
  "other national team",
  "maradona",
  "shabab al ahli",
  "nec nijmegen",
  "erdoga",
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const INTERNATIONAL_MARKER_REGEX =
  /(national\s*team|other\s*national\s*team|world\s*cup|copa\s*america|euro\s*cup|international)/i;
export const INTERNATIONAL_COUNTRY_REGEX = new RegExp(
  `\\b(${INTERNATIONAL_COUNTRY_KEYWORDS.map(escapeRegExp).join("|")})\\b`,
  "i"
);

export function isInternationalTeamProduct(rawCategory: string, team: string, productName: string): boolean {
  const source = `${normalizeToken(rawCategory)} ${normalizeToken(team)} ${normalizeToken(productName)}`;
  return INTERNATIONAL_MARKER_REGEX.test(source) || INTERNATIONAL_COUNTRY_REGEX.test(source);
}

export function normalizeToken(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function inferShopCategoryFromText(name: string, rawCategory?: string): keyof typeof SHOP_CATEGORY_META {
  const n = normalizeToken(name);
  const c = normalizeToken(rawCategory || "");
  const source = `${n} ${c}`;

  if (source.includes("nba") || source.includes("nfl")) return "nba-nfl";
  if (source.includes("windbreaker")) return "windbreaker";
  if (source.includes("tracksuit")) return "tracksuit";
  if (source.includes("jacket")) return "jackets";
  if (source.includes("hoody") || source.includes("hoodie")) return "hoody";
  if (source.includes("kids") || source.includes("kid")) return "kids";
  return "jersey";
}

export function getLeagueAliasSlugs(slug: string): string[] {
  return LEAGUE_ALIAS_MAP[slug] || [slug];
}

export function isTurkishTeam(team: string): boolean {
  const normalized = normalizeToken(team).replace(/\s+/g, "");
  return TURKISH_TEAMS.some((t) => normalized.includes(t));
}

export function mapLeagueByRawCategory(
  rawCategory: string,
  team: string,
  productName: string,
  shopCategory: keyof typeof SHOP_CATEGORY_META
): { league: string; leagueSlug: string } {
  const c = normalizeToken(rawCategory);
  const source = `${normalizeToken(productName)} ${c}`;

  if (shopCategory === "nba-nfl" || source.includes("nba") || source.includes("nfl")) {
    return { league: "NBA & NFL", leagueSlug: "nba-nfl" };
  }

  if (isInternationalTeamProduct(rawCategory, team, productName)) {
    return { league: "International Teams", leagueSlug: "international-teams" };
  }

  if (c.includes("spain") && c.includes("la liga")) return { league: "La Liga", leagueSlug: "la-liga" };
  if (c.includes("italy") && c.includes("serie a")) return { league: "Serie A", leagueSlug: "serie-a" };
  if (c.includes("france") && c.includes("ligue 1")) return { league: "Ligue 1", leagueSlug: "ligue-1" };
  if (c.includes("germany") && c.includes("bundesliga")) return { league: "Bundesliga", leagueSlug: "bundesliga" };
  if (c.includes("premier league") || c.includes("epl") || c.includes("england")) {
    return { league: "Premier League", leagueSlug: "premier-league" };
  }
  if (c.includes("super lig") || c.includes("turkey")) return { league: "Super Lig", leagueSlug: "super-lig" };

  if (isTurkishTeam(team)) return { league: "Super Lig", leagueSlug: "super-lig" };

  if (c.includes("other teams") || c.includes("others") || c.includes("other team")) {
    return { league: "Others", leagueSlug: "others" };
  }

  if (SHOP_CATEGORY_SLUGS.includes(shopCategory) && shopCategory !== "jersey") {
    return {
      league: SHOP_CATEGORY_META[shopCategory].name,
      leagueSlug: SHOP_CATEGORY_META[shopCategory].slug,
    };
  }

  return { league: "Others", leagueSlug: "others" };
}

export function buildExtraCategories(
  leagueSlug: string,
  kitType: "fans" | "player" | "retro",
  shopCategory: keyof typeof SHOP_CATEGORY_META
): string[] {
  const extras = new Set<string>([shopCategory]);
  if (kitType === "fans" && leagueSlug !== "fan-made") {
    extras.add("fan-made");
  }
  return Array.from(extras);
}

export function isShopCategorySlug(slug: string): boolean {
  return SHOP_CATEGORY_SLUGS.includes(slug);
}
