import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const paginated = searchParams.get("paginated") === "true" || searchParams.has("page");
    const page = Number.isFinite(pageParam) ? Math.max(1, pageParam) : 1;
    const limitParam = parseInt(searchParams.get("limit") || "8", 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 80) : 8;

    if (q.trim().length < 2) {
      return NextResponse.json([]);
    }

    await connectDB();

    const baseFilter = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { team: { $regex: q, $options: "i" } },
        { league: { $regex: q, $options: "i" } },
        { type: { $regex: q, $options: "i" } },
      ],
    };

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
      .limit(Math.max(20, limit * 3))
      .lean();

    // Compact quick-search mode (navbar): keep small, deduped preview list.
    const seen = new Set<string>();
    const unique = [];
    for (const p of products) {
      const key = `${p.team}-${p.type}-${p.kitType}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(p);
      }
      if (unique.length >= limit) break;
    }
    return NextResponse.json(unique);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
