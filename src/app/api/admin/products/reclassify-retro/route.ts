import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { hasModernSeasonInName } from "@/lib/seasonYear";

function inferDemotedType(name: string): "home" | "away" | "third" {
  const n = name.toLowerCase();
  if (n.includes("away")) return "away";
  if (n.includes("third")) return "third";
  return "home";
}

function inferDemotedKitType(name: string): "fans" | "player" {
  const n = name.toLowerCase();
  if (/\bf1\b|formula\s*1|formula one/i.test(n)) return "player";
  if (n.includes("player")) return "player";
  return "fans";
}

/**
 * One-time / occasional fix: products stored as `kitType: retro` but title has a season
 * starting 2018+ (e.g. 26/27) are demoted to fans/player + home/away/third.
 */
export async function POST(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const retro = await ProductModel.find({ kitType: "retro" }).lean();
    let updated = 0;

    for (const p of retro) {
      const name = p.name || "";
      if (!hasModernSeasonInName(name)) continue;

      // eslint-disable-next-line no-await-in-loop
      const doc = await ProductModel.findByIdAndUpdate(
        p._id,
        {
          $set: {
            type: inferDemotedType(name),
            kitType: inferDemotedKitType(name),
          },
        },
        { new: true }
      );
      if (doc) updated += 1;
    }

    return NextResponse.json({ success: true, scanned: retro.length, updated });
  } catch (e) {
    console.error("reclassify-retro:", e);
    return NextResponse.json({ error: "Failed to reclassify" }, { status: 500 });
  }
}
