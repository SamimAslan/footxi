"use client";

import { PRICING } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { useState } from "react";
import {
  Check,
  Truck,
  Award,
  Shirt,
  Zap,
  Package,
  Percent,
  Shield,
  Sparkles,
} from "lucide-react";

export default function PricingSection() {
  const [shippingTab, setShippingTab] = useState<"standard" | "express">(
    "standard"
  );
  const { formatPrice } = useCurrency();

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Simple{" "}
            <span className="text-amber-400">Pricing</span>
          </h2>
          <p className="mt-3 text-zinc-500 max-w-md mx-auto">
            Transparent pricing with bulk discounts available
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Fans */}
          <div className="relative bg-zinc-900/50 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Shirt className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Fans Version
              </h3>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                {formatPrice(PRICING.fans)}
              </span>
              <span className="text-zinc-500 ml-1">/kit</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                High quality fabric
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Embroidered badges
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                All sizes available
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Custom name +{formatPrice(PRICING.customNameNumber)}
              </li>
            </ul>
          </div>

          {/* Player - Featured */}
          <div className="relative bg-zinc-900/50 border border-amber-400/30 rounded-2xl p-8 shadow-lg shadow-amber-400/5 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-black text-xs font-bold rounded-full">
              POPULAR
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Player Version
              </h3>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                {formatPrice(PRICING.player)}
              </span>
              <span className="text-zinc-500 ml-1">/kit</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Match-day quality
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Slim fit design
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Premium embroidery
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Custom name +{formatPrice(PRICING.customNameNumber)}
              </li>
            </ul>
          </div>

          {/* Retro */}
          <div className="relative bg-zinc-900/50 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Shirt className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Retro Kit</h3>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                {formatPrice(PRICING.retro)}
              </span>
              <span className="text-zinc-500 ml-1">/kit</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Classic designs
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Vintage style
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Collector quality
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Custom name +{formatPrice(PRICING.customNameNumber)}
              </li>
            </ul>
          </div>
        </div>

        {/* Order Extras Panel */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 via-transparent to-amber-400/10 p-px">
              <div className="w-full h-full rounded-2xl bg-zinc-950" />
            </div>

            <div className="relative bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Order Extras
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Shipping options, discounts &amp; add-ons
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Left: Shipping */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-white">
                      Shipping
                    </h4>
                  </div>

                  <div className="bg-zinc-900/80 rounded-xl p-1 flex mb-4">
                    <button
                      onClick={() => setShippingTab("standard")}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                        shippingTab === "standard"
                          ? "bg-zinc-800 text-white shadow-lg shadow-black/20"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Package className="w-3.5 h-3.5" />
                        Standard
                      </div>
                    </button>
                    <button
                      onClick={() => setShippingTab("express")}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                        shippingTab === "express"
                          ? "bg-zinc-800 text-white shadow-lg shadow-black/20"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-3.5 h-3.5" />
                        Express
                      </div>
                    </button>
                  </div>

                  <div className="bg-zinc-900/40 rounded-xl p-4 border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
                    {shippingTab === "standard" ? (
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-bold text-white">
                            {formatPrice(PRICING.cargo.standard.price)}
                          </span>
                          <span className="text-xs text-zinc-500 bg-zinc-800/60 px-2.5 py-1 rounded-full">
                            {PRICING.cargo.standard.days} days
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 leading-relaxed">
                          Standard international shipping. Trackable once dispatched.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-bold text-white">
                            {formatPrice(PRICING.cargo.express.price)}
                          </span>
                          <span className="text-xs text-amber-400/80 bg-amber-400/10 px-2.5 py-1 rounded-full font-medium">
                            {PRICING.cargo.express.days} days
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 leading-relaxed">
                          Priority express delivery. Full tracking &amp; faster processing.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 border border-white/[0.04] rounded-full">
                    <Package className="w-3 h-3 text-zinc-500" />
                    <span className="text-[11px] text-zinc-400">
                      Each additional item{" "}
                      <span className="text-white font-semibold">
                        +{formatPrice(PRICING.additionalItem)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Right: Bulk Discounts */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Percent className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-white">
                      Bulk Discounts
                    </h4>
                  </div>

                  <div className="space-y-2.5 mb-4">
                    <div className="group bg-zinc-900/40 rounded-xl p-4 border border-white/[0.04] hover:border-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-400">
                              {PRICING.discount.tier1.percent}%
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {PRICING.discount.tier1.min}–
                              {PRICING.discount.tier1.max} kits
                            </p>
                            <p className="text-[10px] text-zinc-600">
                              Team orders
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                          Save {PRICING.discount.tier1.percent}%
                        </span>
                      </div>
                    </div>

                    <div className="group bg-zinc-900/40 rounded-xl p-4 border border-white/[0.04] hover:border-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-400">
                              {PRICING.discount.tier2.percent}%
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {PRICING.discount.tier2.min}–
                              {PRICING.discount.tier2.max} kits
                            </p>
                            <p className="text-[10px] text-zinc-600">
                              Bulk orders
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                          Save {PRICING.discount.tier2.percent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 border border-white/[0.04] rounded-full">
                    <Shield className="w-3 h-3 text-zinc-500" />
                    <span className="text-[11px] text-zinc-400">
                      Arm badges{" "}
                      <span className="text-white font-semibold">
                        {formatPrice(PRICING.badgePrice)} each
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Summary Strip */}
              <div className="mt-8 pt-6 border-t border-white/[0.04]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-[11px] text-zinc-500">
                        Kits from{" "}
                        <span className="text-white font-semibold">
                          {formatPrice(PRICING.fans)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[11px] text-zinc-500">
                        Save up to{" "}
                        <span className="text-emerald-400 font-semibold">
                          {PRICING.discount.tier2.percent}%
                        </span>{" "}
                        on bulk
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[11px] text-zinc-500">
                        Worldwide delivery
                      </span>
                    </div>
                  </div>

                  <div className="bg-zinc-900/60 border border-white/[0.04] rounded-xl px-4 py-2.5 flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-medium">
                        Example
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        5 fans kits
                      </p>
                    </div>
                    <div className="w-px h-6 bg-white/5" />
                    <div className="text-center">
                      <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-medium">
                        Total
                      </p>
                      <p className="text-sm font-bold text-white">
                        {formatPrice(5 * PRICING.fans * 0.95 + PRICING.cargo.standard.price + 4 * PRICING.additionalItem)}
                      </p>
                    </div>
                    <div className="w-px h-6 bg-white/5" />
                    <div className="text-center">
                      <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-medium">
                        You Save
                      </p>
                      <p className="text-sm font-bold text-emerald-400">
                        {formatPrice(5 * PRICING.fans * 0.05)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
