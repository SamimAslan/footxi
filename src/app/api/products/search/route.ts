import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split query into tokens; each token must appear in `name` (AND). No league/team-only matches. */
function buildNameSearchFilter(q: string): Record<string, unknown> {
  const tokens = q
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  if (tokens.length === 0) {
    return { _id: null }; // impossible match
  }

  const nameClauses = tokens.map((token) => ({
    name: { $regex: escapeRegex(token), $options: "i" },
  }));

  return { $and: nameClauses };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
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
      andClauses.push({ kitType });
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
