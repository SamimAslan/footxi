"use client";

import { PRICING } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { Truck, Zap, Package } from "lucide-react";

export default function PricingSection() {
  const { formatPrice } = useCurrency();

  const tiers = [
    {
      name: "Fans",
      price: PRICING.fans,
      featured: false,
      description: "Stadium ready. High quality fabric with embroidered badges.",
    },
    {
      name: "Player",
      price: PRICING.player,
      featured: true,
      description: "Match-day quality. Slim fit design with premium embroidery.",
    },
    {
      name: "Retro",
      price: PRICING.retro,
      featured: false,
      description: "Timeless classics. Vintage aesthetic in collector quality.",
    },
  ];

  return (
    <section className="relative bg-[var(--background)] overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.015] rounded-full blur-[200px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-display font-bold text-black/[0.03] whitespace-nowrap select-none pointer-events-none tracking-[-0.04em]">
        PRICING
      </div>

      <div className="relative py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="text-center mb-24">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-14 bg-gold" />
              <span className="text-[11px] font-semibold tracking-[0.3em] text-gold uppercase">
                Pricing
              </span>
              <div className="h-px w-14 bg-gold" />
            </div>
            <h2 className="font-display text-5xl sm:text-6xl font-bold text-[var(--foreground)] tracking-[-0.03em]">
              Select Your Kit
            </h2>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-0 mb-24">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative px-10 sm:px-12 py-14 sm:py-16 transition-all duration-500 group ${
                  tier.featured
                    ? "bg-[var(--surface)] border-y border-x md:border-x-0 md:border-y border-gold/25 md:scale-[1.02] z-10"
                    : "bg-[var(--surface)] border border-[color:var(--border)] md:border-y md:first:border-l md:last:border-r md:[&:not(:first-child):not(:last-child)]:border-x-0"
                }`}
              >
                {tier.featured && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                )}

                {/* Name */}
                <h3 className="font-display text-[13px] font-semibold tracking-[0.3em] text-[var(--muted)] uppercase mb-8">
                  {tier.name}
                </h3>

                {/* Price */}
                <div className="mb-8">
                  <span className="font-display text-6xl sm:text-7xl font-bold text-[var(--foreground)] tracking-[-0.03em]">
                    {formatPrice(tier.price)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[13px] text-[var(--muted)] leading-relaxed mb-10 max-w-[240px]">
                  {tier.description}
                </p>

                {/* Extras */}
                <div className="space-y-3 pt-8 border-t border-[color:var(--border)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--muted)] tracking-wide">
                      Custom name & number
                    </span>
                    <span className="text-[11px] text-[var(--foreground)] font-medium">
                      +{formatPrice(PRICING.customNameNumber)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--muted)] tracking-wide">
                      Arm badge
                    </span>
                    <span className="text-[11px] text-[var(--foreground)] font-medium">
                      {formatPrice(PRICING.badgePrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--muted)] tracking-wide">
                      Sizes
                    </span>
                    <span className="text-[11px] text-[var(--foreground)] font-medium">
                      S – XXL
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shipping & Discounts */}
          <div className="grid sm:grid-cols-3 gap-px bg-white/[0.04]">
            <div className="bg-[var(--surface)] p-8 sm:p-10">
              <Truck className="w-4 h-4 text-gold mb-5" />
              <p className="font-display text-2xl font-bold text-[var(--foreground)] mb-1">
                {formatPrice(PRICING.cargo.standard.price)}
              </p>
              <p className="text-[11px] text-[var(--muted)] tracking-wide">
                Standard · {PRICING.cargo.standard.days} days
              </p>
            </div>

            <div className="bg-[var(--surface)] p-8 sm:p-10">
              <Zap className="w-4 h-4 text-gold mb-5" />
              <p className="font-display text-2xl font-bold text-[var(--foreground)] mb-1">
                {formatPrice(PRICING.cargo.express.price)}
              </p>
              <p className="text-[11px] text-[var(--muted)] tracking-wide">
                Express · {PRICING.cargo.express.days} days
              </p>
            </div>

            <div className="bg-[var(--surface)] p-8 sm:p-10">
              <Package className="w-4 h-4 text-gold mb-5" />
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--muted)]">
                    {PRICING.discount.tier1.min}–{PRICING.discount.tier1.max}{" "}
                    kits
                  </span>
                  <span className="text-[12px] font-medium text-emerald-400">
                    {PRICING.discount.tier1.percent}% off
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--muted)]">
                    {PRICING.discount.tier2.min}–{PRICING.discount.tier2.max}{" "}
                    kits
                  </span>
                  <span className="text-[12px] font-medium text-emerald-400">
                    {PRICING.discount.tier2.percent}% off
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--muted)] mt-3 tracking-wide">
                +{formatPrice(PRICING.additionalItem)} per extra item
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
