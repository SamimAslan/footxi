"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { PRICING, Product } from "@/data/products";

const TEAMS = [
  "BARCELONA",
  "REAL MADRID",
  "MANCHESTER UNITED",
  "LIVERPOOL",
  "AC MILAN",
  "BAYERN MUNICH",
  "PSG",
  "JUVENTUS",
  "ARSENAL",
  "INTER MILAN",
  "GALATASARAY",
  "CHELSEA",
  "DORTMUND",
  "NAPOLI",
  "FENERBAHCE",
];

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TEAMS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchHeroProduct() {
      try {
        const res = await fetch("/api/products/search?q=Torino");
        if (res.ok) {
          const data: Product[] = await res.json();
          const away = data.find((p) => p.team === "Torino" && p.type === "away");
          if (away) setHeroProduct(away);
        }
      } catch { /* ignore */ }
    }
    fetchHeroProduct();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full border border-amber-400/[0.03] animate-[spin_60s_linear_infinite]" />
        <div className="absolute -top-1/3 -right-1/3 w-[600px] h-[600px] rounded-full border border-amber-400/[0.05] animate-[spin_45s_linear_infinite_reverse]" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[700px] h-[700px] rounded-full border border-white/[0.02] animate-[spin_50s_linear_infinite]" />
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-400/[0.04] rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/6 w-72 h-72 bg-amber-500/[0.03] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-center min-h-screen py-24">
          {/* Left - Main content */}
          <div className="lg:col-span-7 space-y-8">
            {/* Main heading */}
            <div className="space-y-2">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.85]">
                <span className="block text-white">FOOT</span>
                <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  XI
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-zinc-500 font-light tracking-wide max-w-lg">
                Premium football kits.
                <br />
                <span className="text-zinc-300">Every league. Every team.</span>
              </p>
            </div>

            {/* Animated team name */}
            <div className="h-12 overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span
                  key={activeIndex}
                  className="text-sm font-mono tracking-widest text-zinc-600 animate-[fadeSlideIn_0.5s_ease-out]"
                >
                  NOW AVAILABLE &mdash; {TEAMS[activeIndex]}
                </span>
              </div>
            </div>

            {/* Mobile Visual - Jersey Animation */}
            <div className="lg:hidden relative mx-auto w-full max-w-[280px] h-[320px] my-4">
              {/* Rotating ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[250px] h-[250px] rounded-full border border-amber-400/10 animate-[spin_20s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400/40" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[200px] h-[200px] rounded-full border border-white/[0.04] animate-[spin_15s_linear_infinite_reverse]" />
              </div>

              {/* Main jersey */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative animate-[float_6s_ease-in-out_infinite]">
                  {heroProduct?.image ? (
                    <img
                      src={heroProduct.image}
                      alt={heroProduct.name || "Featured Kit"}
                      className="w-44 h-auto drop-shadow-2xl"
                    />
                  ) : (
                    <svg viewBox="0 0 120 150" className="w-40 h-52 drop-shadow-2xl">
                      <defs>
                        <linearGradient id="jerseyGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#27272a" />
                          <stop offset="100%" stopColor="#18181b" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M30,10 L10,30 L10,50 L25,45 L25,140 L95,140 L95,45 L110,50 L110,30 L90,10 L75,20 L45,20 Z"
                        fill="url(#jerseyGradMobile)"
                        stroke="rgba(251,191,36,0.15)"
                        strokeWidth="0.8"
                      />
                    </svg>
                  )}
                  {/* Glow behind jersey */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-400/[0.06] rounded-full blur-[60px] -z-10" />
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute top-4 left-0 bg-zinc-900/90 border border-white/10 backdrop-blur-sm px-3 py-2 animate-[float_5s_ease-in-out_infinite]">
                <p className="text-[9px] text-amber-400 font-bold tracking-wider">FANS</p>
                <p className="text-sm font-black text-white">{formatPrice(PRICING.fans)}</p>
              </div>

              <div className="absolute top-8 right-0 bg-zinc-900/90 border border-white/10 backdrop-blur-sm px-3 py-2 animate-[float_5s_ease-in-out_infinite_1.5s]">
                <p className="text-[9px] text-amber-400 font-bold tracking-wider">PLAYER</p>
                <p className="text-sm font-black text-white">{formatPrice(PRICING.player)}</p>
              </div>

              <div className="absolute bottom-6 left-4 bg-amber-400 px-3 py-1.5 animate-[float_5s_ease-in-out_infinite_3s]">
                <p className="text-[9px] font-black text-black tracking-wider">25/26 SEASON</p>
              </div>

              <div className="absolute bottom-12 right-2 bg-zinc-900/90 border border-white/10 backdrop-blur-sm px-3 py-2 animate-[float_5s_ease-in-out_infinite_4s]">
                <p className="text-[9px] text-zinc-500 font-bold tracking-wider">RETRO</p>
                <p className="text-sm font-black text-white">{formatPrice(PRICING.retro)}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/league/premier-league"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-400 text-black font-bold text-sm tracking-wide rounded-none hover:bg-amber-300 transition-all duration-300"
              >
                SHOP NOW
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-zinc-800 text-zinc-400 font-medium text-sm tracking-wide rounded-none hover:border-zinc-600 hover:text-white transition-all duration-300"
              >
                CONTACT US
              </Link>
            </div>

            {/* Bottom stats */}
            <div className="flex items-center gap-12 pt-8 border-t border-white/5">
              <div>
                <p className="text-3xl font-black text-white">8+</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
                  Leagues
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">40+</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
                  Teams
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">{formatPrice(PRICING.fans)}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
                  Starting
                </p>
              </div>
            </div>
          </div>

          {/* Right - Visual */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative h-[600px] flex items-center justify-center">
              {/* Background ring */}
              <div className="absolute w-[400px] h-[400px] rounded-full border border-white/[0.03]" />
              <div className="absolute w-[500px] h-[500px] rounded-full border border-white/[0.02]" />
              
              {/* Main jersey card */}
              <Link
                href={heroProduct ? `/product/${heroProduct._id || heroProduct.id}` : "/league/serie-a"}
                className="relative w-72 h-[420px] bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/[0.06] backdrop-blur-sm overflow-hidden group hover:border-amber-400/20 transition-all duration-500 block"
              >
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                
                {/* Jersey image */}
                <div className="flex items-center justify-center h-full p-4">
                  {heroProduct?.image ? (
                    <img
                      src={heroProduct.image}
                      alt={heroProduct.name || "Featured Kit"}
                      className="max-h-[340px] w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <svg viewBox="0 0 120 150" className="w-44 h-56 opacity-60 group-hover:opacity-80 transition-opacity duration-500">
                      <path
                        d="M30,10 L10,30 L10,50 L25,45 L25,140 L95,140 L95,45 L110,50 L110,30 L90,10 L75,20 L45,20 Z"
                        className="fill-zinc-800 group-hover:fill-zinc-700 transition-colors duration-500"
                        stroke="rgba(251,191,36,0.1)"
                        strokeWidth="1"
                      />
                      <text x="60" y="80" textAnchor="middle" className="fill-amber-400/20 text-[14px] font-black">
                        XI
                      </text>
                    </svg>
                  )}
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  {heroProduct ? (
                    <>
                      <p className="text-[10px] text-amber-400 tracking-widest uppercase">
                        {heroProduct.team}
                      </p>
                      <p className="text-3xl font-black text-white">{formatPrice(PRICING.fans)}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-amber-400 tracking-widest uppercase">From</p>
                      <p className="text-3xl font-black text-white">{formatPrice(PRICING.fans)}</p>
                    </>
                  )}
                </div>

                {/* Corner decoration */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-amber-400/20" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-amber-400/20" />
              </Link>

              {/* Floating cards */}
              <div className="absolute top-12 -left-8 bg-zinc-900/80 border border-white/5 backdrop-blur-sm px-4 py-3 animate-[float_6s_ease-in-out_infinite]">
                <p className="text-[10px] text-zinc-500">FANS VERSION</p>
                <p className="text-lg font-bold text-white">{formatPrice(PRICING.fans)}</p>
              </div>

              <div className="absolute bottom-20 -right-4 bg-zinc-900/80 border border-white/5 backdrop-blur-sm px-4 py-3 animate-[float_6s_ease-in-out_infinite_2s]">
                <p className="text-[10px] text-zinc-500">PLAYER VERSION</p>
                <p className="text-lg font-bold text-white">{formatPrice(PRICING.player)}</p>
              </div>

              <div className="absolute top-1/2 -right-8 bg-amber-400 px-3 py-1.5 animate-[float_6s_ease-in-out_infinite_4s]">
                <p className="text-[10px] font-bold text-black">NEW SEASON</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
    </section>
  );
}
