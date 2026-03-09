import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { filterAllowedImages } from "@/lib/imageBlocker";

type CsvRow = {
  product_name?: string;
  product_url?: string;
  item_no?: string;
  weight?: string;
  category?: string;
  tag?: string;
  brand?: string;
  creation_time?: string;
  price?: string;
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

const TEAM_STOP_WORDS = [
  "home",
  "away",
  "third",
  "retro",
  "fans",
  "fan",
  "player",
  "kids",
  "kid",
  "jersey",
  "jerseys",
  "tracksuit",
  "windbreaker",
  "jacket",
  "hoody",
  "hoodie",
  "nfl",
  "nba",
  "quality",
  "classis",
];

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

function inferKitType(name: string, type: "home" | "away" | "third" | "retro"): "fans" | "player" | "retro" {
  if (type === "retro") return "retro";
  const n = name.toLowerCase();
  if (n.includes("player")) return "player";
  if (n.includes("fan")) return "fans";
  return "fans";
}

function inferTeam(name: string): string {
  const cleaned = name
    .replace(/^\d{4}(?:\/\d{4})?\s*/g, "")
    .replace(/\b1[:.]?1\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const parts = cleaned.split(" ");
  const collected: string[] = [];

  for (const part of parts) {
    const token = part.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!token) continue;
    if (TEAM_STOP_WORDS.includes(token)) break;
    collected.push(part);
    if (collected.length >= 3) break;
  }

  return (collected.join(" ").trim() || "Unknown Team").replace(/\s+/g, " ");
}

function inferPriceOverride(name: string, type: "home" | "away" | "third" | "retro"): number {
  const n = name.toLowerCase();

  if (n.includes("windbreaker")) return 50;
  if (n.includes("tracksuit")) return 50;
  if (n.includes("jacket")) return 50;
  if (n.includes("hoody") || n.includes("hoodie")) return 35;
  if (n.includes("kids") || n.includes("kid")) return 25;
  if (n.includes("nba") || n.includes("nfl")) return 30;
  if (type === "retro" || n.includes("retro")) return 33;
  if (n.includes("player")) return 30;
  if (n.includes("fan")) return 25;

  return 25;
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
  const orderedCandidates = [...new Set(candidates.map((v) => (v || "").trim()).filter(Boolean))];
  const allowed: string[] = [];
  let blockedCount = 0;

  for (const url of orderedCandidates) {
    // We only need front/back images; stop early to avoid long imports.
    if (allowed.length >= 2) break;
    // eslint-disable-next-line no-await-in-loop
    const { allowed: filtered, blockedCount: currentBlocked } = await filterAllowedImages([url]);
    blockedCount += currentBlocked;
    if (filtered.length > 0) {
      allowed.push(filtered[0]);
    }
  }

  return {
    image: allowed[0] || "",
    backImage: allowed[1] || "",
    blockedRemovedCount: blockedCount,
  };
}

async function normalizeRow(row: CsvRow) {
  const name = (row.product_name || "").trim();
  const team = inferTeam(name);
  const brand = (row.brand || "").trim();
  const league = (row.category || "").trim() || "Imported";
  const leagueSlug = slugify(league) || "imported";
  const type = inferType(name);
  const kitType = inferKitType(name, type);
  const priceOverride = inferPriceOverride(name, type);
  const { image, backImage, blockedRemovedCount } = await getImages(row);

  return {
    name,
    team,
    brand,
    league,
    leagueSlug,
    season: inferSeason(name),
    type,
    kitType,
    priceOverride,
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

async function processRecords(records: CsvRow[]) {
  if (records.length === 0) {
    return {
      success: true,
      totalRows: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      blockedImageReferencesRemoved: 0,
      errors: [] as string[],
    };
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

    // eslint-disable-next-line no-await-in-loop
    const payload = await normalizeRow(row);
    blockedImageReferencesRemoved += payload.blockedRemovedCount;
    if (!payload.image) {
      skipped += 1;
      errors.push(`Skipped "${name}" (missing valid image URL after blocked-image filter)`);
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const existing = await ProductModel.findOne({
      name: payload.name,
      team: payload.team,
      leagueSlug: payload.leagueSlug,
      type: payload.type,
    }).lean();

    if (existing) {
      // eslint-disable-next-line no-await-in-loop
      await ProductModel.findByIdAndUpdate(existing._id, {
        ...payload,
        blockedRemovedCount: undefined,
        updatedAt: new Date(),
      });
      updated += 1;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { blockedRemovedCount: _ignored, ...safePayload } = payload;
      // eslint-disable-next-line no-await-in-loop
      await ProductModel.create(safePayload);
      created += 1;
    }
  }

  return {
    success: true,
    totalRows: records.length,
    created,
    updated,
    skipped,
    blockedImageReferencesRemoved,
    errors,
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";
    let records: CsvRow[] = [];

    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      if (!Array.isArray(body?.rows)) {
        return NextResponse.json({ error: "rows array is required" }, { status: 400 });
      }
      records = body.rows as CsvRow[];
    } else {
      const formData = await req.formData();
      const file = formData.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
      }

      const csvText = await file.text();
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      }) as CsvRow[];
    }

    if (records.length === 0) {
      return NextResponse.json({ error: "CSV is empty" }, { status: 400 });
    }
    const result = await processRecords(records);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error importing products from CSV:", error);
    return NextResponse.json({ error: "Failed to import CSV" }, { status: 500 });
  }
}
