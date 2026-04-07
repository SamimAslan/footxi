import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { MODERN_SEASON_IN_NAME_PATTERN } from "@/lib/seasonYear";
import {
  normalizeSearchQueryForProducts,
  queryIntentIncludesOuterwear,
  OUTERWEAR_SHOP_CATEGORIES,
} from "@/lib/searchQuery";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Turkey national team: "turkey", "türkiye", "turkiye" must match the same products (name or team). */
const TURKEY_TOKEN = /^(turkey|türkiye|turkiye)$/i;
const TURKEY_NAME_TEAM_REGEX = /(turkey|türkiye|turkiye)/i;

function tokenToSearchClause(token: string): Record<string, unknown> {
  const t = token.trim();
  if (!t) return { _id: null };

  if (TURKEY_TOKEN.test(t)) {
    return {
      $or: [{ name: TURKEY_NAME_TEAM_REGEX }, { team: TURKEY_NAME_TEAM_REGEX }],
    };
  }

  const escaped = escapeRegex(t);
  /** Title-only search missed many rows (e.g. "jacket" lives in shopCategory, not always in name). */
  return {
    $or: [
      { name: { $regex: escaped, $options: "i" } },
      { team: { $regex: escaped, $options: "i" } },
      { league: { $regex: escaped, $options: "i" } },
      { leagueSlug: { $regex: escaped, $options: "i" } },
      { brand: { $regex: escaped, $options: "i" } },
      { shopCategory: { $regex: escaped, $options: "i" } },
      { extraCategories: { $regex: escaped, $options: "i" } },
    ],
  };
}

/** Split query into tokens; each token must match (AND). Turkey synonyms unified. */
function buildNameSearchFilter(q: string): Record<string, unknown> {
  const tokens = q
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  if (tokens.length === 0) {
    return { _id: null }; // impossible match
  }

  const clauses = tokens.map((token) => tokenToSearchClause(token));
  if (clauses.some((c) => "_id" in c && c._id === null)) {
    return { _id: null };
  }

  return { $and: clauses };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = normalizeSearchQueryForProducts(searchParams.get("q") || "");
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const paginated = searchParams.get("paginated") === "true" || searchParams.has("page");
    const page = Number.isFinite(pageParam) ? Math.max(1, pageParam) : 1;
    const limitParam = parseInt(searchParams.get("limit") || "8", 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 80) : 8;

    const kitType = searchParams.get("kitType") || "";
    const newOnly = searchParams.get("new") === "1" || searchParams.get("newArrival") === "true";

    if (q.trim().length < 2) {
      if (paginated) {
        return NextResponse.json({ products: [], total: 0, page: 1, totalPages: 1 });
      }
      return NextResponse.json([]);
    }

    await connectDB();

    const andClauses: Record<string, unknown>[] = [{ isActive: true }, buildNameSearchFilter(q)];

    if (kitType && ["fans", "player", "retro"].includes(kitType)) {
      if (kitType === "retro") {
        // DB kitType "retro" OR legacy type "retro", OR title says "retro" (often correct while kitType stayed fans).
        // Still exclude modern-season titles (18/19 … 26/27) via shared pattern.
        const notModernSeasonInName = {
          name: { $not: { $regex: MODERN_SEASON_IN_NAME_PATTERN, $options: "i" } },
        };
        andClauses.push({
          $or: [
            {
              $and: [
                { $or: [{ kitType: "retro" }, { type: "retro" }] },
                notModernSeasonInName,
              ],
            },
            {
              $and: [{ name: { $regex: "\\bretro\\b", $options: "i" } }, notModernSeasonInName],
            },
          ],
        });
      } else if (
        (kitType === "fans" || kitType === "player") &&
        queryIntentIncludesOuterwear(q)
      ) {
        // Tracksuits / jackets / hoodies etc. are often stored as kitType "fans" even when the user picks Player — don't hide them.
        andClauses.push({
          $or: [
            {
              $and: [
                { kitType },
                { shopCategory: { $nin: [...OUTERWEAR_SHOP_CATEGORIES] } },
              ],
            },
            { shopCategory: { $in: [...OUTERWEAR_SHOP_CATEGORIES] } },
          ],
        });
      } else {
        andClauses.push({ kitType });
      }
    }
    if (newOnly) {
      andClauses.push({ isNewArrival: true });
    }

    const baseFilter = { $and: andClauses };

    if (paginated) {
      const total = await ProductModel.countDocuments(baseFilter);
      const products = await ProductModel.find(baseFilter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return NextResponse.json({
        products,
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    }

    const products = await ProductModel.find(baseFilter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { products: [], total: 0, page: 1, totalPages: 1 },
      { status: 500 }
    );
  }
}
