import { Product } from "@/data/products";

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeTeamCandidate(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/^[^a-zA-Z0-9]+/, "")
      .replace(/[^a-zA-Z0-9]+$/, "")
      .replace(/\b\d{2,4}(?:[/-]\d{2,4})+\b/g, "")
      .replace(/\b\d{4}\b/g, "")
      .replace(/\b\d+(?:st|nd|rd|th)\b/gi, "")
  );
}

function isTeamInvalid(team?: string): boolean {
  const cleaned = sanitizeTeamCandidate(team || "");
  if (!cleaned) return true;
  if (/^unknown team$/i.test(cleaned)) return true;
  if (/^\d+$/.test(cleaned)) return true;
  if (cleaned.length < 3) return true;
  return false;
}

function extractTeamFromName(name: string): string {
  const cleaned = normalizeWhitespace(
    name
      .replace(/^\d{2,4}(?:[/-]\d{2,4})*\s*/g, "")
      .replace(/\b(1[:.]?1|quality|soccer|football|jerseys?|kit|kits|version)\b/gi, " ")
      .replace(/\b(home|away|third|retro|fans?|player|tracksuit|windbreaker|jackets?|hoody|hoodie|kids?)\b/gi, " ")
      .replace(/\bno\.?\s*\d+\b/gi, " ")
      .replace(/\b\d+(?:st|nd|rd|th)\b/gi, " ")
      .replace(/\b\d{2,4}(?:[/-]\d{2,4})+\b/g, " ")
      .replace(/\b\d{4}\b/g, " ")
  );

  const words = cleaned.split(" ").filter(Boolean);
  if (words.length === 0) return "";

  // Keep a concise, readable team chunk for card titles.
  const team = words.slice(0, 3).join(" ");
  return sanitizeTeamCandidate(team);
}

export function getDisplayTeamName(product: Product): string {
  if (!isTeamInvalid(product.team)) {
    return sanitizeTeamCandidate(product.team);
  }

  const fromName = extractTeamFromName(product.name || "");
  if (fromName) return fromName;

  const fallback = sanitizeTeamCandidate(product.name || "");
  return fallback || "Team";
}
