"use client";

import { useState, useEffect } from "react";
import { PRICING, Product, getProductId } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export default function FeaturedProducts() {
  const { formatPrice } = useCurrency();
  const [spotlight, setSpotlight] = useState<Product | null>(null);
  const [rest, setRest] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const all: Product[] = await res.json();

        // Pick specific diverse teams for the featured section
        const picks = [
          { team: "AC Milan", type: "home" },
          { team: "Arsenal", type: "home" },
          { team: "Inter Milan", type: "away" },
          { team: "Chelsea", type: "away" },
          { team: "Juventus", type: "home" },
          { team: "Liverpool", type: "home" },
          { team: "Napoli", type: "away" },
        ];

        const selected: Product[] = [];
        for (const pick of picks) {
          const found = all.find(
            (p) => p.team === pick.team && p.type === pick.type
          );
          if (found) selected.push(found);
        }

        // Fallback: if not enough picks found, fill with latest
        if (selected.length < 7) {
          for (const p of all) {
            if (!selected.find((s) => getProductId(s) === getProductId(p))) {
              selected.push(p);
            }
            if (selected.length >= 7) break;
          }
        }

        setSpotlight(selected[0] || null);
        setRest(selected.slice(1, 7));
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      }
    }
    fetchFeatured();
  }, []);

  if (!spotlight) return null;

  return (
    <section className="relative bg-black">
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black" />

      <div className="relative py-24">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-amber-400" />
              <span className="text-[10px] font-semibold tracking-[0.3em] text-amber-400 uppercase">
                Top Picks
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              FEATURED
              <br />
              <span className="text-zinc-600">KITS</span>
            </h2>
          </div>
          <Link
            href="/league/premier-league"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-zinc-500 hover:text-amber-400 transition-colors uppercase"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Spotlight + Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Spotlight card */}
          <Link
            href={`/product/${getProductId(spotlight)}`}
            className="lg:col-span-5 group relative bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-white/[0.04] overflow-hidden hover:border-amber-400/20 transition-all duration-500"
          >
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-6 sm:p-8 h-full flex flex-col justify-between min-h-[560px]">
              {/* Top */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-amber-400 uppercase">
                    {spotlight.league}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
                    {spotlight.team}
                  </h3>
                  <p className="text-sm text-zinc-600 mt-1">
                    {spotlight.type.charAt(0).toUpperCase() + spotlight.type.slice(1)} Kit
                  </p>
                </div>
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-amber-400/30 group-hover:bg-amber-400/5 transition-all">
                  <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                </div>
              </div>

              {/* Center jersey */}
              <div className="flex-1 flex items-center justify-center">
                {spotlight.image && spotlight.image.startsWith("http") ? (
                  <img
                    src={spotlight.image}
                    alt={spotlight.name}
                    className="max-h-[420px] w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <svg viewBox="0 0 120 150" className="w-40 h-52 opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500">
                    <path
                      d="M30,10 L10,30 L10,50 L25,45 L25,140 L95,140 L95,45 L110,50 L110,30 L90,10 L75,20 L45,20 Z"
                      className="fill-zinc-800 group-hover:fill-zinc-700 transition-colors duration-500"
                      stroke="rgba(251,191,36,0.08)"
                      strokeWidth="1.5"
                    />
                    <text x="60" y="85" textAnchor="middle" className="fill-white/10 text-[9px] font-bold">
                      {spotlight.team.substring(0, 3).toUpperCase()}
                    </text>
                  </svg>
                )}
              </div>

              {/* Bottom */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                    From
                  </p>
                  <p className="text-3xl font-black text-white">{formatPrice(PRICING.fans)}</p>
                </div>
                <span className="px-3 py-1 bg-amber-400 text-black text-[10px] font-bold tracking-wider">
                  FEATURED
                </span>
              </div>
            </div>
          </Link>

          {/* Regular grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {rest.map((product) => (
              <ProductCard key={getProductId(product)} product={product} />
            ))}
          </div>
        </div>

        {/* Mobile view all */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/league/premier-league"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-400 uppercase"
          >
            View all kits
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
      </div>

      {/* Bottom gradient into pricing */}
      <div className="h-32 bg-gradient-to-b from-black to-zinc-950/50" />
    </section>
  );
}
