"use client";

import Link from "next/link";
import { PRICING, Product, getProductBasePrice, getProductId } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { getDisplayTeamName } from "@/lib/productDisplay";

interface ProductCardProps {
  product: Product;
}

function getEstimatedDeliveryWindow(): string {
  const [minDays, maxDays] = PRICING.cargo.standard.days
    .split("-")
    .map((v) => Number(v.trim()));

  if (!Number.isFinite(minDays) || !Number.isFinite(maxDays)) {
    return `${PRICING.cargo.standard.days} days`;
  }

  const now = new Date();
  const minDate = new Date(now);
  const maxDate = new Date(now);
  minDate.setDate(now.getDate() + minDays);
  maxDate.setDate(now.getDate() + maxDays);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  return `${fmt(minDate)} - ${fmt(maxDate)}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = getProductBasePrice(product);
  const { formatPrice } = useCurrency();
  const productId = getProductId(product);
  const estimatedDelivery = getEstimatedDeliveryWindow();
  const displayTeam = getDisplayTeamName(product);

  return (
    <Link
      href={`/product/${productId}`}
      className="group block bg-[var(--surface)] border border-[color:var(--border)] overflow-hidden hover:border-gold/[0.25] hover:shadow-[0_10px_30px_rgba(245,184,0,0.08)] transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-white overflow-hidden">
          {product.image && product.image.startsWith("http") ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <img
                src={product.image}
                alt={product.name}
                className={`max-w-full max-h-full object-contain scale-[1.04] transition-all duration-700 group-hover:scale-[1.08] ${
                  product.backImage ? "group-hover:opacity-0" : ""
                }`}
              />
            </div>
            {product.backImage && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <img
                  src={product.backImage}
                  alt={`${product.name} back`}
                  className="max-w-full max-h-full object-contain scale-[1.04] opacity-0 group-hover:opacity-100 group-hover:scale-[1.08] transition-all duration-700"
                />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl font-bold text-black/[0.08]">
              {displayTeam.substring(0, 3).toUpperCase()}
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="px-2.5 py-1 text-[9px] font-bold bg-gold text-[#0D0F14] tracking-[0.1em]">
              NEW
            </span>
          )}
          {product.kitType === "player" && (
            <span className="px-2.5 py-1 text-[9px] font-bold bg-black/[0.06] text-[#334155] backdrop-blur-sm tracking-[0.1em]">
              PLAYER
            </span>
          )}
          {product.kitType === "retro" && (
            <span className="px-2.5 py-1 text-[9px] font-bold bg-gold/[0.1] text-gold backdrop-blur-sm tracking-[0.1em]">
              RETRO
            </span>
          )}
        </div>

        {/* Hover glow border */}
        <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/[0.08] transition-all duration-700 pointer-events-none" />

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Info */}
      <div className="p-5 bg-[var(--surface)] border-t border-[color:var(--border)]">
        <h3 className="font-display text-[15px] font-semibold text-[var(--foreground)] group-hover:text-[var(--foreground)] transition-colors duration-300 tracking-tight">
          {displayTeam}
        </h3>
        <p className="text-[10px] text-[var(--muted)] mt-1 tracking-[0.15em] uppercase">
          {product.type} Kit
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-[var(--foreground)]">
            {formatPrice(price)}
          </span>
        </div>
        <p className="mt-2 text-[10px] text-[var(--muted)] tracking-[0.08em] uppercase">
          Estimated delivery: {estimatedDelivery}
        </p>
      </div>
    </Link>
  );
}
