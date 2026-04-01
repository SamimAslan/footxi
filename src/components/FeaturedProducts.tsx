"use client";

import { useState, useEffect } from "react";
import { Product, getProductId } from "@/data/products";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const all: Product[] = await res.json();

        const fanMade = all.filter((p) => p.leagueSlug === "fan-made");
        const selected: Product[] = fanMade.slice(0, 8);

        if (selected.length < 8) {
          for (const p of all) {
            if (!selected.find((s) => getProductId(s) === getProductId(p))) {
              selected.push(p);
            }
            if (selected.length >= 8) break;
          }
        }

        setProducts(selected.slice(0, 8));
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      }
    }
    fetchFeatured();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="relative bg-[var(--background)]">
      <div className="relative pt-28 pb-14 sm:pt-36 sm:pb-20">
        {/* Subtle bg gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-green/[0.08] via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-14 bg-white/40" />
                <span className="text-[11px] font-semibold tracking-[0.3em] text-white uppercase">
                  Trending Now
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] tracking-[-0.03em] leading-[0.95]">
                Best Sellers
                <br />
                <span className="text-[var(--muted)]">This Week</span>
              </h2>
            </div>
            <Link
              href="/league/fan-made"
              className="hidden sm:inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[var(--muted)] hover:text-white transition-colors duration-300 uppercase"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Product Grid - 4 per row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
            {products.map((product) => (
              <ProductCard key={getProductId(product)} product={product} />
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-12 text-center sm:hidden">
            <Link
              href="/league/fan-made"
              className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-white uppercase"
            >
              View all kits
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
