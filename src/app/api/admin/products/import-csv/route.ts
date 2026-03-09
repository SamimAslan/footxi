import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { filterAllowedImages, isBannedImageByContent } from "@/lib/imageBlocker";

type CsvRow = {
  product_name?: string;
  product_url?: string;
  team_name?: string;
  category?: string;
  price?: string;
  description?: string;
  badges?: string;
  sizes?: string;
  main_image_url?: string;
  image_url_2?: string;
  image_url_3?: string;
  image_url_4?: string;
  image_url_5?: string;
  all_image_urls?: string;
  local_image_paths?: string;
  date_scraped?: string;
};

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function inferType(name: string): "home" | "away" | "third" | "retro" {
  const n = name.toLowerCase();
  if (n.includes("retro")) return "retro";
  if (n.includes("away")) return "away";
  if (n.includes("third")) return "third";
  return "home";
}

function inferSeason(name: string): string {
  const m = name.match(/\b(20\d{2})[\/-](20\d{2})\b/);
  if (m) return `${m[1]}/${m[2].slice(-2)}`;
  return "2025/26";
}

function splitSizes(raw?: string): string[] {
  if (!raw) return ["S", "M", "L", "XL", "XXL"];
  const values = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  return values.length > 0 ? values : ["S", "M", "L", "XL", "XXL"];
}

function splitBadges(raw: string | undefined, league: string): { name: string; price: number }[] {
  if (!raw || !raw.trim()) {
    return [{ name: `${league} Badge`, price: 3 }];
  }
  return raw
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean)
    .map((name) => ({ name, price: 3 }));
}

async function getImages(row: CsvRow): Promise<{
  image: string;
  backImage: string;
  blockedRemovedCount: number;
}> {
  const allImagesRaw = (row.all_image_urls || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const candidates = [
    row.main_image_url,
    row.image_url_2,
    row.image_url_3,
    row.image_url_4,
    row.image_url_5,
    ...allImagesRaw,
  ];
  const { allowed, blockedCount } = await filterAllowedImages(candidates);

  return {
    image: allowed[0] || "",
    backImage: allowed[1] || "",
    blockedRemovedCount: blockedCount,
  };
}

async function normalizeRow(row: CsvRow) {
  const name = (row.product_name || "").trim();
  const team = (row.team_name || "").trim() || "Unknown Team";
  const league = (row.category || "").trim() || "Imported";
  const leagueSlug = slugify(league) || "imported";
  const type = inferType(name);
  const kitType: "fans" | "retro" = type === "retro" ? "retro" : "fans";
  const { image, backImage, blockedRemovedCount } = await getImages(row);

  return {
    name,
    team,
    league,
    leagueSlug,
    season: inferSeason(name),
    type,
    kitType,
    image,
    backImage,
    blockedRemovedCount,
    sizes: splitSizes(row.sizes),
    badges: splitBadges(row.badges, league),
    isNewArrival: true,
    isFeatured: false,
    isActive: true,
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const csvText = await file.text();
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as CsvRow[];

    if (records.length === 0) {
      return NextResponse.json({ error: "CSV is empty" }, { status: 400 });
    }

    await connectDB();

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let blockedImageReferencesRemoved = 0;
    const errors: string[] = [];

    for (const row of records) {
      const name = (row.product_name || "").trim();
      if (!name) {
        skipped += 1;
        continue;
      }

      const payload = await normalizeRow(row);
      blockedImageReferencesRemoved += payload.blockedRemovedCount;
      if (!payload.image) {
        skipped += 1;
        errors.push(`Skipped "${name}" (missing valid image URL after blocked-image filter)`);
        continue;
      }

      if (payload.backImage) {
        const backBlocked = await isBannedImageByContent(payload.backImage);
        if (backBlocked) {
          payload.backImage = "";
          blockedImageReferencesRemoved += 1;
        }
      }

      const existing = await ProductModel.findOne({
        name: payload.name,
        team: payload.team,
        leagueSlug: payload.leagueSlug,
        type: payload.type,
      }).lean();

      if (existing) {
        await ProductModel.findByIdAndUpdate(existing._id, {
          ...payload,
          blockedRemovedCount: undefined,
          updatedAt: new Date(),
        });
        updated += 1;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { blockedRemovedCount: _ignored, ...safePayload } = payload;
        await ProductModel.create(safePayload);
        created += 1;
      }
    }

    return NextResponse.json({
      success: true,
      totalRows: records.length,
      created,
      updated,
      skipped,
      blockedImageReferencesRemoved,
      errors,
    });
  } catch (error) {
    console.error("Error importing products from CSV:", error);
    return NextResponse.json({ error: "Failed to import CSV" }, { status: 500 });
  }
}
