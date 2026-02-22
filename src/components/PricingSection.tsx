"use client";

import { PRICING } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { Truck, Zap, Package } from "lucide-react";

export default function PricingSection() {
  const { formatPrice } = useCurrency();

  const tiers = [
    {
      name: "Fans",
      subtitle: "Stadium Ready",
      price: PRICING.fans,
      featured: false,
      features: ["High quality fabric", "Embroidered badges", "All sizes S–XXL"],
    },
    {
      name: "Player",
      subtitle: "Match Day",
      price: PRICING.player,
      featured: true,
      features: [
        "Match-day quality",
        "Slim fit design",
        "Premium embroidery",
      ],
    },
    {
      name: "Retro",
      subtitle: "Timeless Classics",
      price: PRICING.retro,
      featured: false,
      features: ["Classic designs", "Vintage aesthetic", "Collector quality"],
    },
  ];

  return (
    <section className="relative bg-[#0D0F14] overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.02] rounded-full blur-[200px]" />

      <div className="relative py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-14 bg-gold" />
              <span className="text-[11px] font-semibold tracking-[0.3em] text-gold uppercase">
                Pricing
              </span>
              <div className="h-px w-14 bg-gold" />
            </div>
            <h2 className="font-display text-5xl sm:text-6xl font-bold text-[#F3F4F6] tracking-[-0.03em]">
              Select Your Kit
            </h2>
            <p className="mt-4 text-[15px] text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
              Three tiers, one premium standard
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative p-10 sm:p-12 transition-all duration-500 hover:-translate-y-1 ${
                  tier.featured
                    ? "bg-[#141721] border border-gold/20 shadow-[0_0_60px_rgba(245,184,0,0.04)]"
                    : "bg-[#141721]/50 border border-white/[0.04] hover:border-white/[0.08]"
                }`}
              >
                {tier.featured && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
                )}

                <div className="mb-10">
                  <p className="text-[11px] font-semibold tracking-[0.25em] text-gold uppercase mb-2">
                    {tier.subtitle}
                  </p>
                  <h3 className="font-display text-3xl font-bold text-[#F3F4F6] tracking-tight">
                    {tier.name}
                  </h3>
                </div>

                <div className="mb-10">
                  <span className="font-display text-5xl sm:text-6xl font-bold text-[#F3F4F6] tracking-tight">
                    {formatPrice(tier.price)}
                  </span>
                  <span className="text-sm text-[#9CA3AF] ml-2">/kit</span>
                </div>

                <div className="space-y-4 mb-10">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-gold" />
                      <span className="text-sm text-[#9CA3AF]">{f}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-gold" />
                    <span className="text-sm text-[#9CA3AF]">
                      Custom name{" "}
                      <span className="text-[#F3F4F6] font-medium">
                        +{formatPrice(PRICING.customNameNumber)}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/[0.04]">
                  <p className="text-[10px] text-[#9CA3AF]/60 tracking-wide uppercase">
                    Badge from {formatPrice(PRICING.badgePrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Shipping & Discounts strip */}
          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {/* Standard Shipping */}
            <div className="bg-[#141721]/40 border border-white/[0.04] p-8 hover:border-white/[0.06] transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <Truck className="w-4 h-4 text-gold" />
                <span className="text-[11px] font-semibold tracking-[0.2em] text-[#F3F4F6] uppercase">
                  Standard
                </span>
              </div>
              <p className="font-display text-3xl font-bold text-[#F3F4F6]">
                {formatPrice(PRICING.cargo.standard.price)}
              </p>
              <p className="text-[11px] text-[#9CA3AF] mt-1 tracking-wide">
                {PRICING.cargo.standard.days} days delivery
              </p>
            </div>

            {/* Express */}
            <div className="bg-[#141721]/40 border border-white/[0.04] p-8 hover:border-white/[0.06] transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <Zap className="w-4 h-4 text-gold" />
                <span className="text-[11px] font-semibold tracking-[0.2em] text-[#F3F4F6] uppercase">
                  Express
                </span>
              </div>
              <p className="font-display text-3xl font-bold text-[#F3F4F6]">
                {formatPrice(PRICING.cargo.express.price)}
              </p>
              <p className="text-[11px] text-[#9CA3AF] mt-1 tracking-wide">
                {PRICING.cargo.express.days} days delivery
              </p>
            </div>

            {/* Bulk discounts */}
            <div className="bg-[#141721]/40 border border-white/[0.04] p-8 hover:border-white/[0.06] transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <Package className="w-4 h-4 text-gold" />
                <span className="text-[11px] font-semibold tracking-[0.2em] text-[#F3F4F6] uppercase">
                  Bulk Discounts
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-[#9CA3AF]">
                    {PRICING.discount.tier1.min}–{PRICING.discount.tier1.max}{" "}
                    kits
                  </span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {PRICING.discount.tier1.percent}% off
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-[#9CA3AF]">
                    {PRICING.discount.tier2.min}–{PRICING.discount.tier2.max}{" "}
                    kits
                  </span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {PRICING.discount.tier2.percent}% off
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[#9CA3AF]/50 mt-4 tracking-wide">
                +{formatPrice(PRICING.additionalItem)} per additional item
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
