"use client";

import Link from "next/link";
import {
  PRICING,
  Product,
  getProductBasePrice,
  getProductId,
  getKitVersionDisplayLabel,
} from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { getHomepageListingTitle } from "@/lib/homepageListingTitle";

function estimatedDeliveryRange(): string {
  const [minDays, maxDays] = PRICING.cargo.standard.days.split("-").map((v) => Number(v.trim()));
  if (!Number.isFinite(minDays) || !Number.isFinite(maxDays)) {
    return `${PRICING.cargo.standard.days} days est.`;
  }
  const now = new Date();
  const minD = new Date(now);
  const maxD = new Date(now);
  minD.setDate(now.getDate() + minDays);
  maxD.setDate(now.getDate() + maxDays);
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  return `Est. delivery ${fmt(minD)} – ${fmt(maxD)}`;
}

export default function PremiumHomeProductCard({
  product,
  size = "default",
}: {
  product: Product;
  size?: "default" | "large";
}) {
  const { formatPrice } = useCurrency();
  const id = getProductId(product);
  const price = getProductBasePrice(product);
  const title = getHomepageListingTitle(product);
  const large = size === "large";

  return (
    <Link
      href={`/product/${id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[var(--store-border)] bg-[var(--store-surface)] shadow-[0_4px_24px_rgba(26,29,36,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_-12px_rgba(26,29,36,0.12)]"
    >
      <div
        className={`relative flex items-center justify-center bg-[#eceae6] ${large ? "aspect-[4/3] sm:aspect-[16/10]" : "aspect-[3/4]"}`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(255,255,255,0.9) 0%, transparent 70%)",
          }}
          aria-hidden
        />
        {product.image && product.image.startsWith("http") ? (
          <img
            src={product.image}
            alt={product.name}
            className={`relative z-[1] max-h-[88%] max-w-[88%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04] ${large ? "p-6 sm:p-10" : "p-4 sm:p-5"}`}
          />
        ) : (
          <span className="relative z-[1] text-sm text-[var(--store-text-secondary)]">Photo loading…</span>
        )}
        <span className="absolute left-3 top-3 z-[2] rounded-full border border-[var(--store-border)] bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--store-text)] shadow-sm backdrop-blur-sm">
          {getKitVersionDisplayLabel(product)}
        </span>
      </div>
      <div className={`flex flex-1 flex-col ${large ? "p-5 sm:p-6" : "p-4 sm:p-5"}`}>
        <p
          className={`line-clamp-2 font-semibold leading-snug text-[var(--store-text)] ${large ? "text-lg sm:text-xl" : "text-[14px] sm:text-[15px]"}`}
        >
          {title}
        </p>
        <p className="mt-2 text-[12px] text-[var(--store-text-secondary)]">
          {[product.league, product.season].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-[var(--store-text)] sm:text-[26px]">
          {formatPrice(price)}
        </p>
        <p className="mt-1 text-[11px] text-[var(--store-text-secondary)]">{estimatedDeliveryRange()}</p>
        <span
          className={`mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[var(--store-cta)] py-3 text-center text-[13px] font-semibold text-white transition group-hover:bg-[var(--store-cta-hover)] ${large ? "sm:mt-5 sm:py-3.5" : ""}`}
        >
          View kit
        </span>
      </div>
    </Link>
  );
}
