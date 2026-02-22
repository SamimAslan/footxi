"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { PRICING, Product } from "@/data/products";

export default function HeroSection() {
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function fetchHeroProduct() {
      try {
        const res = await fetch("/api/products/search?q=Torino");
        if (res.ok) {
          const data: Product[] = await res.json();
          const away = data.find(
            (p) => p.team === "Torino" && p.type === "away"
          );
          if (away) setHeroProduct(away);
        }
      } catch {
        /* ignore */
      }
    }
    fetchHeroProduct();
  }, []);

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-[#0D0F14]">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        {/* Radial spotlight */}
        <div className="absolute top-1/3 right-1/4 w-[900px] h-[900px] bg-gold/[0.03] rounded-full blur-[250px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gold/[0.02] rounded-full blur-[180px]" />

        {/* Vertical light rays */}
        <div className="absolute top-0 right-[30%] w-px h-full bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
        <div className="absolute top-0 right-[42%] w-px h-[60%] bg-gradient-to-b from-white/[0.02] via-transparent to-transparent" />

        {/* Diagonal accent line */}
        <div className="absolute top-0 right-0 w-[1px] h-[70vh] bg-gradient-to-b from-gold/[0.08] to-transparent origin-top-right rotate-[15deg] translate-x-[-200px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Typography */}
          <div className="space-y-10">
            {/* Tag */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
              style={{ animation: "fadeUp 0.6s ease-out" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[11px] font-medium tracking-[0.2em] text-silver uppercase">
                25/26 Season Available
              </span>
            </div>

            {/* Heading */}
            <div
              className="space-y-5"
              style={{ animation: "fadeUp 0.8s ease-out 0.1s both" }}
            >
              <h1 className="font-display text-7xl sm:text-8xl lg:text-[9rem] font-bold tracking-[-0.04em] leading-[0.82]">
                <span className="block text-[#F3F4F6]">FOOT</span>
                <span className="block text-gold">XI</span>
              </h1>
              <div className="max-w-md space-y-2">
                <p className="text-xl sm:text-2xl font-light text-silver tracking-wide leading-relaxed">
                  Elite Football Kits
                </p>
                <p className="text-base text-[#9CA3AF] tracking-wide">
                  Every League. Every Era.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div
              className="flex flex-col sm:flex-row gap-4"
              style={{ animation: "fadeUp 0.8s ease-out 0.2s both" }}
            >
              <Link
                href="/league/premier-league"
                className="group inline-flex items-center justify-center gap-3 px-10 py-[18px] bg-gold text-[#0D0F14] font-bold text-sm tracking-[0.1em] uppercase hover:bg-gold-light transition-all duration-300"
              >
                EXPLORE KITS
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#leagues"
                className="inline-flex items-center justify-center gap-3 px-10 py-[18px] border border-white/[0.08] text-silver font-medium text-sm tracking-[0.1em] uppercase hover:border-white/20 hover:text-white hover:bg-white/[0.02] backdrop-blur-sm transition-all duration-300"
              >
                VIEW LEAGUES
              </Link>
            </div>

            {/* Mobile Jersey */}
            <div className="lg:hidden relative mx-auto w-full max-w-[240px] h-[280px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-gold/[0.06] rounded-full blur-[80px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-[float_6s_ease-in-out_infinite]">
                  {heroProduct?.image ? (
                    <img
                      src={heroProduct.image}
                      alt=""
                      className="w-40 h-auto drop-shadow-[0_0_40px_rgba(245,184,0,0.1)]"
                    />
                  ) : (
                    <div className="w-32 h-44 bg-white/[0.02] rounded-2xl flex items-center justify-center border border-white/[0.04]">
                      <span className="text-4xl font-display font-bold text-white/[0.04]">
                        XI
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 right-2 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] px-4 py-2.5">
                <p className="text-[9px] tracking-[0.2em] text-gold uppercase font-medium">
                  From
                </p>
                <p className="text-lg font-bold text-white">
                  {formatPrice(PRICING.fans)}
                </p>
              </div>
            </div>
          </div>

          {/* Right - Floating Jersey (Desktop) */}
          <div className="relative hidden lg:flex items-center justify-center h-[620px]">
            {/* Spotlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-gold/[0.05] rounded-full blur-[120px]" />

            {/* Ring decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-white/[0.03]" />

            {/* Jersey */}
            <div className="relative animate-[float_6s_ease-in-out_infinite]">
              {heroProduct?.image ? (
                <Link
                  href={
                    heroProduct
                      ? `/product/${heroProduct._id || heroProduct.id}`
                      : "/league/serie-a"
                  }
                >
                  <img
                    src={heroProduct.image}
                    alt={heroProduct.name || "Featured Kit"}
                    className="max-h-[480px] w-auto object-contain drop-shadow-[0_0_80px_rgba(245,184,0,0.12)] hover:scale-[1.03] transition-transform duration-700"
                  />
                </Link>
              ) : (
                <div className="w-64 h-80 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl flex items-center justify-center border border-white/[0.03]">
                  <span className="text-6xl font-display font-bold text-white/[0.03]">
                    XI
                  </span>
                </div>
              )}
            </div>

            {/* Glass price badge */}
            <div className="absolute bottom-20 right-4 bg-[#141721]/80 backdrop-blur-xl border border-white/[0.08] px-6 py-4 animate-[float_5s_ease-in-out_infinite_1.5s]">
              <p className="text-[10px] font-semibold tracking-[0.25em] text-gold uppercase">
                From
              </p>
              <p className="text-2xl font-bold text-[#F3F4F6] mt-0.5">
                {formatPrice(PRICING.fans)}
              </p>
            </div>

            {/* Small accent badge */}
            <div className="absolute top-20 left-0 bg-gold/[0.08] backdrop-blur-sm border border-gold/[0.15] px-4 py-2 animate-[float_7s_ease-in-out_infinite_3s]">
              <p className="text-[10px] font-bold tracking-[0.15em] text-gold uppercase">
                Premium Quality
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[9px] tracking-[0.3em] text-[#9CA3AF] uppercase font-medium">
          Scroll
        </span>
        <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0D0F14] to-transparent pointer-events-none" />
    </section>
  );
}
