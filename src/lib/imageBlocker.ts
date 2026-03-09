import fs from "node:fs/promises";
import path from "node:path";
import { Jimp, compareHashes } from "jimp";

const BANNED_REFERENCE_FILES = [
  path.join(process.cwd(), "src/lib/banned-images/messi100-size-chart.png"),
];

const HASH_SIMILARITY_THRESHOLD = 0.14;

let bannedHashesPromise: Promise<string[]> | null = null;

async function imageHashFromBuffer(buffer: Buffer): Promise<string> {
  const image = await Jimp.read(buffer);
  return image.hash(16);
}

async function imageHashFromFile(filePath: string): Promise<string | null> {
  try {
    const data = await fs.readFile(filePath);
    return await imageHashFromBuffer(data);
  } catch {
    return null;
  }
}

async function getBannedHashes(): Promise<string[]> {
  if (!bannedHashesPromise) {
    bannedHashesPromise = (async () => {
      const hashes = await Promise.all(BANNED_REFERENCE_FILES.map(imageHashFromFile));
      return hashes.filter((h): h is string => Boolean(h));
    })();
  }
  return bannedHashesPromise;
}

function timeoutSignal(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

export async function isBannedImageByContent(imageUrl?: string | null): Promise<boolean> {
  if (!imageUrl) return false;
  const normalized = imageUrl.trim();
  if (!normalized) return false;

  try {
    const res = await fetch(normalized, {
      signal: timeoutSignal(9000),
      cache: "no-store",
    });
    if (!res.ok) return false;

    const contentType = res.headers.get("content-type") || "";
    if (contentType && !contentType.toLowerCase().startsWith("image/")) {
      return false;
    }

    const bytes = Buffer.from(await res.arrayBuffer());
    const currentHash = await imageHashFromBuffer(bytes);
    const bannedHashes = await getBannedHashes();
    if (bannedHashes.length === 0) return false;

    return bannedHashes.some(
      (bannedHash) => compareHashes(currentHash, bannedHash) <= HASH_SIMILARITY_THRESHOLD
    );
  } catch {
    return false;
  }
}

export async function filterAllowedImages(
  urls: Array<string | undefined | null>
): Promise<{ allowed: string[]; blockedCount: number }> {
  const normalized = urls.map((u) => (u || "").trim()).filter(Boolean);
  const allowed: string[] = [];
  let blockedCount = 0;

  for (const url of normalized) {
    // eslint-disable-next-line no-await-in-loop
    const blocked = await isBannedImageByContent(url);
    if (blocked) {
      blockedCount += 1;
      continue;
    }
    allowed.push(url);
  }

  return { allowed, blockedCount };
}
