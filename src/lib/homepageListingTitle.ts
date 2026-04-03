import type { Product } from "@/data/products";
import { getDisplayTeamName } from "@/lib/productDisplay";

/**
 * Cleaner listing title for homepage vitrines (strip supplier jargon, keep readable product story).
 */
export function getHomepageListingTitle(product: Product): string {
  let t = (product.name || "")
    .replace(/\b1[:.]?1\b/gi, "")
    .replace(/\bquality\b/gi, "")
    .replace(/\b(fans?|player)\s+1:1\b/gi, "")
    .replace(/\b(soccer|football)\s+jerseys?\b/gi, "Jersey")
    .replace(/\s+/g, " ")
    .trim();

  if (t.length > 80) {
    t = `${t.slice(0, 77).trim()}…`;
  }

  if (t.length < 6) {
    const team = getDisplayTeamName(product);
    const bits = [team, product.season, product.type !== "home" ? product.type : ""].filter(Boolean);
    return bits.join(" · ") || team;
  }

  return t;
}
