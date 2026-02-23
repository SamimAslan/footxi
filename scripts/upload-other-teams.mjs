import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

const SOURCE_DIR = "C:\\Users\\Samim\\Downloads\\FOOTXI (3)\\FOOTXI\\Other Teams";
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

function normalizeTeamName(name) {
  return name
    .replace("Fenerbah�e", "Fenerbahce")
    .replace("Fenerbahçe", "Fenerbahce")
    .trim();
}

function mapType(folderName) {
  const key = folderName.toLowerCase();
  if (key === "home") return "home";
  if (key === "away") return "away";
  if (key === "third") return "third";
  if (key === "retro") return "retro";
  return null;
}

function findImageByPriority(files, names) {
  for (const n of names) {
    const hit = files.find((f) => f.toLowerCase() === n.toLowerCase());
    if (hit) return hit;
  }
  return null;
}

async function uploadToCloudinary(filePath, publicId) {
  const res = await cloudinary.uploader.upload(filePath, {
    folder: "footxi/others",
    public_id: publicId,
    resource_type: "image",
    overwrite: true,
    transformation: [{ width: 800, height: 1000, crop: "limit", quality: "auto" }],
  });
  return res.secure_url;
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const products = mongoose.connection.collection("products");

  const teamDirs = await fs.readdir(SOURCE_DIR, { withFileTypes: true });
  let upserted = 0;

  for (const teamDir of teamDirs) {
    if (!teamDir.isDirectory()) continue;
    const teamRaw = teamDir.name;
    const team = normalizeTeamName(teamRaw);
    const teamPath = path.join(SOURCE_DIR, teamRaw);
    const typeDirs = await fs.readdir(teamPath, { withFileTypes: true });

    for (const typeDir of typeDirs) {
      if (!typeDir.isDirectory()) continue;
      const type = mapType(typeDir.name);
      if (!type) continue;

      const kitFolderPath = path.join(teamPath, typeDir.name);
      const files = (await fs.readdir(kitFolderPath)).filter((f) =>
        IMAGE_EXT.includes(path.extname(f).toLowerCase())
      );

      const front = findImageByPriority(files, [
        "1.png",
        "1.jpg",
        "1.jpeg",
        "1.webp",
        "a.png",
        "a.jpg",
        "a.jpeg",
        "a.webp",
      ]);
      const back = findImageByPriority(files, [
        "2.png",
        "2.jpg",
        "2.jpeg",
        "2.webp",
        "aa.png",
        "aa.jpg",
        "aa.jpeg",
        "aa.webp",
      ]);

      if (!front) {
        console.log(`Skipping ${team} ${type}: no front image`);
        continue;
      }

      const frontPath = path.join(kitFolderPath, front);
      const backPath = back ? path.join(kitFolderPath, back) : null;
      const keyBase = `${team.toLowerCase().replace(/\s+/g, "-")}-${type}`;

      const frontUrl = await uploadToCloudinary(frontPath, `${keyBase}-front`);
      const backUrl = backPath
        ? await uploadToCloudinary(backPath, `${keyBase}-back`)
        : "";

      const doc = {
        name: `${team} ${type.charAt(0).toUpperCase() + type.slice(1)} Kit 25/26`,
        team,
        league: "Others",
        leagueSlug: "others",
        season: "2025/26",
        type,
        kitType: type === "retro" ? "retro" : "fans",
        image: frontUrl,
        backImage: backUrl,
        sizes: ["S", "M", "L", "XL", "XXL"],
        badges: [{ name: "Others Badge", price: 3 }],
        isNewArrival: true,
        isFeatured: false,
        isActive: true,
        updatedAt: new Date(),
      };

      await products.updateOne(
        { team, type, leagueSlug: "others" },
        {
          $set: doc,
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      upserted += 1;
      console.log(`Upserted: ${team} ${type}`);
    }
  }

  console.log(`Done. Upserted ${upserted} products.`);
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

