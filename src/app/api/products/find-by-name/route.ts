import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive exact match on product name (jersey title / description). */
export async function GET(req: NextRequest) {
  try {
    const name = (req.nextUrl.searchParams.get("name") || "").trim();
    if (name.length < 2) {
      return NextResponse.json(null, { status: 400 });
    }

    await connectDB();
    const product = await ProductModel.findOne({
      isActive: true,
      name: new RegExp(`^${escapeRegex(name)}$`, "i"),
    }).lean();

    if (!product) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (e) {
    console.error("find-by-name:", e);
    return NextResponse.json(null, { status: 500 });
  }
}
