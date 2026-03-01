import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

const SOURCE_DIR =
  "C:\\Users\\Samim\\Downloads\\FOOTXI (2) (1)\\FOOTXI\\Fan Made\\FanMade";
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing. Run with --env-file=.env.local");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];

const TEAM_PREFIXES = [
  "AC Milan",
  "Inter Milan",
  "Santos FC",
  "Barcelona",
  "Mexico",
  "Japan",
  "Arsenal",
  "Brazil",
  "Germany",
  "Italy",
  "Manchester City",
  "PSG",
  "Real Madrid",
];

function removeLeadingCode(name) {
  return name.replace(/^\d{2,4}(?:,\d{2})?\s+/, "").trim();
}

function inferType(name) {
  const n = name.toLowerCase();
  if (n.includes("retro")) return "retro";
  if (n.includes("away")) return "away";
  if (n.includes("third")) return "third";
  return "home";
}

function inferTeam(name) {
  const cleaned = removeLeadingCode(name);
  const hit = TEAM_PREFIXES.find((prefix) =>
    cleaned.toLowerCase().startsWith(prefix.toLowerCase())
  );
  if (hit) return hit;
  return cleaned.split(/\s+/).slice(0, 2).join(" ");
}

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uploadToCloudinary(filePath, publicId) {
  const res = await cloudinary.uploader.upload(filePath, {
    folder: "footxi/fan-made",
    public_id: publicId,
    resource_type: "image",
    overwrite: true,
    transformation: [{ width: 800, height: 1000, crop: "limit", quality: "auto" }],
  });
  return res.secure_url;
}

function addSeasonSuffix(name) {
  if (/\b25\/26\b/.test(name)) return name;
  return `${name} 25/26`;
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const products = mongoose.connection.collection("products");

  const kitDirs = await fs.readdir(SOURCE_DIR, { withFileTypes: true });
  let upserted = 0;

  for (const kitDir of kitDirs) {
    if (!kitDir.isDirectory()) continue;

    const rawName = kitDir.name;
    const cleanedName = removeLeadingCode(rawName);
    const team = inferTeam(rawName);
    const type = inferType(rawName);
    const kitPath = path.join(SOURCE_DIR, rawName);

    const files = (await fs.readdir(kitPath)).filter((f) =>
      IMAGE_EXT.includes(path.extname(f).toLowerCase())
    );

    const front = files.find((f) => /^1\./i.test(f)) || files[0];
    const back = files.find((f) => /^2\./i.test(f)) || "";

    if (!front) {
      console.log(`Skipping ${rawName}: no image found`);
      continue;
    }

    const frontPath = path.join(kitPath, front);
    const backPath = back ? path.join(kitPath, back) : null;
    const keyBase = slugify(cleanedName);

    const frontUrl = await uploadToCloudinary(frontPath, `${keyBase}-front`);
    const backUrl = backPath
      ? await uploadToCloudinary(backPath, `${keyBase}-back`)
      : "";

    const doc = {
      name: addSeasonSuffix(cleanedName),
      team,
      league: "Fan Made",
      leagueSlug: "fan-made",
      season: "2025/26",
      type,
      kitType: type === "retro" ? "retro" : "fans",
      image: frontUrl,
      backImage: backUrl,
      sizes: ["S", "M", "L", "XL", "XXL"],
      badges: [{ name: "Fan Made Badge", price: 3 }],
      isNewArrival: true,
      isFeatured: true,
      isActive: true,
      updatedAt: new Date(),
    };

    await products.updateOne(
      { name: doc.name, leagueSlug: "fan-made" },
      {
        $set: doc,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    upserted += 1;
    console.log(`Upserted: ${doc.name}`);
  }

  console.log(`Done. Upserted ${upserted} fan-made products.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
