import { NextRequest, NextResponse } from "next/server";
import type { SortOrder } from "mongoose";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import {
  getLeagueAliasSlugs,
  getFootballJerseyHubLeagueSlugs,
  INTERNATIONAL_COUNTRY_REGEX,
  INTERNATIONAL_MARKER_REGEX,
  isShopCategorySlug,
  isTurkishTeam,
  UNIVERSITY_CLUB_REGEX,
} from "@/lib/productTaxonomy";
import { MODERN_SEASON_IN_NAME_PATTERN } from "@/lib/seasonYear";
import { buildWorldCup2026TeamOrNameMongoFilter } from "@/lib/worldCup2026Teams";

const F1_TITLE_REGEX = /f1|formula\s*1|formula one/i;
const NBA_NFL_REGEX = /\bnba\b|\bnfl\b/i;

/** Collection slugs that are not football kits (Jersey hub excludes these). */
const NON_FOOTBALL_KIT_LEAGUE_SLUGS = ["f1", "nba-nfl", "windbreaker", "tracksuit", "hoody", "jackets"] as const;

const COLLECTION_REGEX: Record<string, RegExp> = {
  jersey: /jersey/i,
  windbreaker: /windbreaker/i,
  jackets: /jacket/i,
  hoody: /hoody|hoodie/i,
  tracksuit: /tracksuit/i,
  kids: /\bkids?\b/i,
  "nba-nfl": /\bnba\b|\bnfl\b/i,
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Narrow PLP results by substring in product title (e.g. 26/27 season). */
function mergeNameContains(filter: Record<string, unknown>, nameContains: string): void {
  const trimmed = nameContains.trim();
  if (!trimmed) return;
  const clause = { name: { $regex: escapeRegex(trimmed), $options: "i" } };
  if (filter.$and && Array.isArray(filter.$and)) {
    filter.$and.push(clause);
  } else {
    const rest = { ...filter };
    for (const k of Object.keys(filter)) delete (filter as Record<string, unknown>)[k];
    filter.$and = [rest, clause];
  }
}

/** Titles use 26/27, 2026/2027, 26-27, etc.; `season` field may hold the year span. */
function mergeFlexibleSeasonNameFilter(filter: Record<string, unknown>): void {
  const seasonOr = {
    $or: [
      { name: { $regex: "26\\s*\\/\\s*27", $options: "i" } },
      { name: { $regex: "2026\\s*\\/\\s*2027", $options: "i" } },
      { name: { $regex: "26\\s*-\\s*27", $options: "i" } },
      { name: { $regex: "2026\\s*-\\s*2027", $options: "i" } },
      { season: { $regex: "26/27", $options: "i" } },
      { season: { $regex: "2026/2027", $options: "i" } },
      { season: { $regex: "2026-2027", $options: "i" } },
    ],
  };
  if (filter.$and && Array.isArray(filter.$and)) {
    filter.$and.push(seasonOr);
  } else {
    const rest = { ...filter };
    for (const k of Object.keys(filter)) delete (filter as Record<string, unknown>)[k];
    filter.$and = [rest, seasonOr];
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const league = searchParams.get("league") || "";
    const nameContains = searchParams.get("nameContains") || "";
    const nationalTeamsOnly =
      searchParams.get("nationalTeamsOnly") === "true" || searchParams.get("nationalTeamsOnly") === "1";
    const worldCup2026Only =
      searchParams.get("worldCup2026Only") === "true" || searchParams.get("worldCup2026Only") === "1";
    const team = searchParams.get("team") || "";
    const featured = searchParams.get("featured") || "";
    const kitType = searchParams.get("kitType") || "";
    const sort = searchParams.get("sort") || "default";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const filter: Record<string, unknown> = { isActive: true };
    if (league) {
      if (league === "fan-made") {
        // Same inventory idea as before, but never NBA/NFL/F1 or non-football shop rows.
        filter.$and = [
          {
            $or: [
              { leagueSlug: { $in: getLeagueAliasSlugs("fan-made") } },
              { extraCategories: "fan-made" },
              { kitType: "fans" },
            ],
          },
          {
            $nor: [
              { name: { $regex: F1_TITLE_REGEX } },
              { team: { $regex: F1_TITLE_REGEX } },
              { league: { $regex: F1_TITLE_REGEX } },
              { name: { $regex: NBA_NFL_REGEX } },
              { team: { $regex: NBA_NFL_REGEX } },
              { league: { $regex: NBA_NFL_REGEX } },
              { shopCategory: { $in: ["nba-nfl", "windbreaker", "tracksuit", "jackets", "hoody"] } },
              { leagueSlug: { $in: [...NON_FOOTBALL_KIT_LEAGUE_SLUGS] } },
            ],
          },
        ];
      } else if (league === "retro-kits") {
        filter.$and = [
          { kitType: "retro" },
          { name: { $not: { $regex: MODERN_SEASON_IN_NAME_PATTERN, $options: "i" } } },
        ];
      } else if (league === "international-teams") {
        const internationalOr = [
          { leagueSlug: { $in: getLeagueAliasSlugs("international-teams") } },
          { extraCategories: "international-teams" },
          { league: { $regex: INTERNATIONAL_MARKER_REGEX } },
          { name: { $regex: INTERNATIONAL_MARKER_REGEX } },
          { team: { $regex: INTERNATIONAL_COUNTRY_REGEX } },
          { name: { $regex: INTERNATIONAL_COUNTRY_REGEX } },
        ];
        const excludeUniversityClubs = {
          $nor: [
            { name: { $regex: UNIVERSITY_CLUB_REGEX } },
            { team: { $regex: UNIVERSITY_CLUB_REGEX } },
            { league: { $regex: UNIVERSITY_CLUB_REGEX } },
          ],
        };
        /** Countries only — World Cup view also allows rows tagged via `extraCategories` only. */
        if (nationalTeamsOnly) {
          const nationalLeagueClause = worldCup2026Only
            ? {
                $or: [
                  { leagueSlug: { $in: getLeagueAliasSlugs("international-teams") } },
                  { extraCategories: "international-teams" },
                ],
              }
            : { leagueSlug: { $in: getLeagueAliasSlugs("international-teams") } };
          const wcTeamClause = worldCup2026Only ? buildWorldCup2026TeamOrNameMongoFilter() : null;
          if (team) {
            const trimmed = team.trim();
            const tokens = trimmed.split(/\s+/).filter(Boolean);
            const countryMatch: Record<string, unknown>[] = [
              { team: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" } },
            ];
            if (tokens.length > 0) {
              countryMatch.push({
                $and: tokens.map((tok) => ({
                  name: { $regex: escapeRegex(tok), $options: "i" },
                })),
              });
            }
            const teamPick = { $or: countryMatch };
            if (wcTeamClause) {
              filter.$and = [
                nationalLeagueClause,
                excludeUniversityClubs,
                { $and: [teamPick, wcTeamClause] },
              ];
            } else {
              filter.$and = [nationalLeagueClause, teamPick, excludeUniversityClubs];
            }
          } else if (wcTeamClause) {
            filter.$and = [nationalLeagueClause, excludeUniversityClubs, wcTeamClause];
          } else {
            filter.$and = [nationalLeagueClause, excludeUniversityClubs];
          }
        } else if (team) {
          const trimmed = team.trim();
          const tokens = trimmed.split(/\s+/).filter(Boolean);
          const countryMatch: Record<string, unknown>[] = [
            { team: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" } },
          ];
          if (tokens.length > 0) {
            countryMatch.push({
              $and: tokens.map((tok) => ({
                name: { $regex: escapeRegex(tok), $options: "i" },
              })),
            });
          }
          filter.$and = [{ $or: internationalOr }, { $or: countryMatch }, excludeUniversityClubs];
        } else {
          filter.$and = [{ $or: internationalOr }, excludeUniversityClubs];
        }
      } else if (league === "super-lig") {
        filter.$or = [
          { leagueSlug: { $in: getLeagueAliasSlugs("super-lig") } },
          { team: { $in: ["Galatasaray", "Fenerbahce", "Besiktas", "Trabzonspor"] } },
        ];
      } else if (league === "others") {
        filter.leagueSlug = { $in: getLeagueAliasSlugs("others") };
      } else if (league === "f1") {
        filter.$or = [
          { name: { $regex: F1_TITLE_REGEX } },
          { team: { $regex: F1_TITLE_REGEX } },
          { league: { $regex: F1_TITLE_REGEX } },
        ];
      } else if (league === "jersey") {
        // All football-related kits in one place: same inventory as leagues + international + others + fan-made + retro + kids (minus F1 / NBA / NFL / outerwear).
        const footballSlugs = getFootballJerseyHubLeagueSlugs();
        filter.$and = [
          {
            $or: [
              { leagueSlug: { $in: footballSlugs } },
              { shopCategory: "jersey" },
              { extraCategories: "jersey" },
            ],
          },
          {
            $nor: [
              { name: { $regex: F1_TITLE_REGEX } },
              { team: { $regex: F1_TITLE_REGEX } },
              { league: { $regex: F1_TITLE_REGEX } },
              { name: { $regex: NBA_NFL_REGEX } },
              { team: { $regex: NBA_NFL_REGEX } },
              { league: { $regex: NBA_NFL_REGEX } },
              { shopCategory: { $in: ["nba-nfl", "windbreaker", "tracksuit", "jackets", "hoody"] } },
              { leagueSlug: { $in: [...NON_FOOTBALL_KIT_LEAGUE_SLUGS] } },
            ],
          },
        ];
      } else if (isShopCategorySlug(league)) {
        filter.$or = [
          { leagueSlug: league },
          { shopCategory: league },
          { extraCategories: league },
          ...(COLLECTION_REGEX[league] ? [{ name: { $regex: COLLECTION_REGEX[league] } }] : []),
        ];
      } else {
        filter.$or = [
          { leagueSlug: { $in: getLeagueAliasSlugs(league) } },
          { extraCategories: league },
        ];
      }
    }
    if (team && league !== "international-teams") {
      filter.team = team;
    }
    if (featured === "true") filter.isFeatured = true;
    if (kitType && kitType !== "all") filter.kitType = kitType;

    const sortQuery: Record<string, SortOrder> =
      sort === "name" ? { team: 1 } : sort === "newest" ? { createdAt: -1 } : { isFeatured: -1, createdAt: -1 };

    const hasPagination = Boolean(pageParam || limitParam);
    const page = Math.max(1, parseInt(pageParam || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || "24", 10)));

    if (league === "others") {
      const existingTeamFilter = filter.team;
      if (existingTeamFilter) {
        const requestedTeam = String(existingTeamFilter);
        if (isTurkishTeam(requestedTeam)) {
          return NextResponse.json([]);
        }
      } else {
        filter.team = { $nin: ["Galatasaray", "Fenerbahce", "Besiktas", "Trabzonspor"] };
      }
      filter.$nor = [
        { leagueSlug: { $in: getLeagueAliasSlugs("international-teams") } },
        { league: { $regex: INTERNATIONAL_MARKER_REGEX } },
        { name: { $regex: INTERNATIONAL_MARKER_REGEX } },
        { team: { $regex: INTERNATIONAL_COUNTRY_REGEX } },
        { name: { $regex: INTERNATIONAL_COUNTRY_REGEX } },
      ];
    }

    if (nameContains.trim()) {
      if (worldCup2026Only) {
        mergeFlexibleSeasonNameFilter(filter);
      } else {
        mergeNameContains(filter, nameContains);
      }
    }

    if (!hasPagination) {
      const products = await ProductModel.find(filter).sort(sortQuery).lean();
      return NextResponse.json(products);
    }

    const total = await ProductModel.countDocuments(filter);
    const products = await ProductModel.find(filter)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
