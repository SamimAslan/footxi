import { NextRequest, NextResponse } from "next/server";
import type { SortOrder } from "mongoose";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import {
  getLeagueAliasSlugs,
  INTERNATIONAL_COUNTRY_REGEX,
  INTERNATIONAL_MARKER_REGEX,
  isShopCategorySlug,
  isTurkishTeam,
} from "@/lib/productTaxonomy";

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

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const league = searchParams.get("league") || "";
    const team = searchParams.get("team") || "";
    const featured = searchParams.get("featured") || "";
    const kitType = searchParams.get("kitType") || "";
    const sort = searchParams.get("sort") || "default";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const filter: Record<string, unknown> = { isActive: true };
    if (league) {
      if (league === "fan-made") {
        filter.$or = [
          { leagueSlug: { $in: getLeagueAliasSlugs("fan-made") } },
          { extraCategories: "fan-made" },
          { kitType: "fans" },
        ];
      } else if (league === "retro-kits") {
        filter.kitType = "retro";
      } else if (league === "international-teams") {
        const internationalOr = [
          { leagueSlug: { $in: getLeagueAliasSlugs("international-teams") } },
          { extraCategories: "international-teams" },
          { league: { $regex: INTERNATIONAL_MARKER_REGEX } },
          { name: { $regex: INTERNATIONAL_MARKER_REGEX } },
          { team: { $regex: INTERNATIONAL_COUNTRY_REGEX } },
          { name: { $regex: INTERNATIONAL_COUNTRY_REGEX } },
        ];
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
          filter.$and = [{ $or: internationalOr }, { $or: countryMatch }];
        } else {
          filter.$or = internationalOr;
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
          { name: { $regex: /f1|formula\s*1|formula one/i } },
          { team: { $regex: /f1|formula\s*1|formula one/i } },
          { league: { $regex: /f1|formula\s*1|formula one/i } },
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
