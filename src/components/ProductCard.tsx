"use client";

import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import {
  PRICING,
  Product,
  getProductBasePrice,
  getProductId,
  getEffectiveKitType,
} from "@/data/products";
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

  return `${fmt(minDate)} – ${fmt(maxDate)}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = getProductBasePrice(product);
  const { formatPrice } = useCurrency();
  const productId = getProductId(product);
  const estimatedDelivery = getEstimatedDeliveryWindow();
  const displayTeam = getDisplayTeamName(product);
  const effectiveKit = getEffectiveKitType(product);

  return (
    <Link
      href={`/product/${productId}`}
      className="group block rounded-2xl bg-[var(--surface)] border border-[color:var(--border)] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_44px_-12px_rgba(0,0,0,0.1)] hover:border-[color-mix(in_srgb,var(--brand-green)_30%,transparent)] hover:-translate-y-1 transition-all duration-300 ease-out"
    >
      {/* Image stage */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-white via-zinc-400 to-zinc-950">
        <div
          className="absolute inset-0 opacity-[0.55] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 65% at 50% 36%, rgba(255,255,255,0.45) 0%, transparent 62%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />

        {product.image && product.image.startsWith("http") ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-6">
              <img
                src={product.image}
                alt={product.name}
                className={`max-w-[92%] max-h-[92%] w-auto h-auto object-contain transition-all duration-700 ease-out drop-shadow-[0_12px_32px_rgba(0,0,0,0.12)] group-hover:drop-shadow-[0_18px_48px_rgba(0,0,0,0.18)] scale-[1.02] group-hover:scale-[1.07] ${
                  product.backImage ? "group-hover:opacity-0" : ""
                }`}
              />
            </div>
            {product.backImage && (
              <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-6">
                <img
                  src={product.backImage}
                  alt={`${product.name} back`}
                  className="max-w-[92%] max-h-[92%] w-auto h-auto object-contain opacity-0 group-hover:opacity-100 scale-[1.02] group-hover:scale-[1.07] transition-all duration-700 ease-out drop-shadow-[0_12px_32px_rgba(0,0,0,0.12)] group-hover:drop-shadow-[0_18px_48px_rgba(0,0,0,0.18)]"
                />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.2) 0%, transparent 55%)",
              }}
            />
            <span className="relative font-display text-4xl sm:text-5xl font-bold tracking-tight text-white/35">
              {displayTeam.substring(0, 3).toUpperCase()}
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-3 left-3 z-[1] flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-brand-green text-white tracking-[0.12em] uppercase shadow-glow-mint">
              New
            </span>
          )}
          {effectiveKit === "player" && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-white/90 text-zinc-900 border border-white/50 shadow-sm tracking-[0.12em] backdrop-blur-sm">
              Player
            </span>
          )}
          {effectiveKit === "retro" && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-brand-green/12 text-[var(--foreground)] border border-brand-green/20 tracking-[0.12em] uppercase backdrop-blur-sm">
              Retro
            </span>
          )}
        </div>

        <div className="absolute inset-0 border border-brand-green/0 group-hover:border-brand-green/20 transition-all duration-500 pointer-events-none rounded-t-2xl" />
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-brand-green/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Info */}
      <div className="relative p-4 sm:p-5 bg-[var(--surface)] border-t border-[color:var(--border)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[15px] sm:text-base font-semibold text-[var(--foreground)] tracking-tight leading-snug line-clamp-2 group-hover:text-brand-green transition-colors duration-300">
              {displayTeam}
            </h3>
            {product.league ? (
              <p className="text-[10px] text-[var(--muted)] mt-1 tracking-wide line-clamp-1">
                {product.league}
              </p>
            ) : null}
            <p className="text-[10px] text-[var(--muted)] mt-1 tracking-[0.14em] uppercase font-medium">
              {product.type} kit
            </p>
          </div>
          <span
            className="flex-shrink-0 mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)] bg-[var(--surface-muted)]/60 text-[var(--foreground)] opacity-40 translate-x-0 supports-[hover:hover]:opacity-0 supports-[hover:hover]:translate-x-1 supports-[hover:hover]:group-hover:opacity-100 supports-[hover:hover]:group-hover:translate-x-0 transition-all duration-300"
            aria-hidden
          >
            <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
          </span>
        </div>

        <div className="mt-3.5 flex items-end justify-between gap-2">
          <span className="font-display text-lg sm:text-xl font-bold text-[var(--foreground)] tabular-nums tracking-tight">
            {formatPrice(price)}
          </span>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-[var(--muted)] tracking-[0.06em]">
          <Truck className="w-3.5 h-3.5 shrink-0 text-[var(--muted)]" strokeWidth={2} />
          <span className="uppercase font-medium">Est. delivery</span>
          <span className="font-normal normal-case tracking-normal">{estimatedDelivery}</span>
        </p>
      </div>
    </Link>
  );
}
