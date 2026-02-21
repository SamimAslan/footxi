import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { products as staticProducts } from "@/data/products";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const existingCount = await ProductModel.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({
        message: `Database already has ${existingCount} products. Skipped seeding.`,
        count: existingCount,
        seeded: false,
      });
    }

    const productsToInsert = staticProducts.map((p) => ({
      name: p.name,
      team: p.team,
      league: p.league,
      leagueSlug: p.leagueSlug,
      season: p.season,
      type: p.type,
      kitType: p.kitType,
      image: p.image,
      sizes: ["S", "M", "L", "XL", "XXL"],
      badges: p.badges,
      isNew: p.isNew || false,
      isFeatured: p.isFeatured || false,
      isActive: true,
    }));

    const result = await ProductModel.insertMany(productsToInsert);

    return NextResponse.json({
      message: `Seeded ${result.length} products successfully`,
      count: result.length,
      seeded: true,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
