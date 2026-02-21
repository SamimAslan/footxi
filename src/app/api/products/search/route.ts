import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (q.trim().length < 2) {
      return NextResponse.json([]);
    }

    await connectDB();

    const products = await ProductModel.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { team: { $regex: q, $options: "i" } },
        { league: { $regex: q, $options: "i" } },
        { type: { $regex: q, $options: "i" } },
      ],
    })
      .limit(20)
      .lean();

    // Deduplicate by team+type+kitType
    const seen = new Set<string>();
    const unique = [];
    for (const p of products) {
      const key = `${p.team}-${p.type}-${p.kitType}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(p);
      }
      if (unique.length >= 8) break;
    }

    return NextResponse.json(unique);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
