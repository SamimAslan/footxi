import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const league = searchParams.get("league") || "";
    const team = searchParams.get("team") || "";
    const featured = searchParams.get("featured") || "";

    const filter: Record<string, unknown> = { isActive: true };
    if (league) filter.leagueSlug = league;
    if (team) filter.team = team;
    if (featured === "true") filter.isFeatured = true;

    const products = await ProductModel.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
