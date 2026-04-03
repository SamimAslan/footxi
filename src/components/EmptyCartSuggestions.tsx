"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product, getProductId } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import TrustRow from "@/components/TrustRow";
import { ArrowLeft, ShoppingBag } from "lucide-react";

const SHOP_LINKS = [
  { label: "Jerseys", href: "/league/jersey" },
  { label: "Retro", href: "/league/retro-kits" },
  { label: "Kids", href: "/league/kids" },
] as const;

export default function EmptyCartSuggestions() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/products?limit=4&page=1");
        if (!res.ok) return;
        const data = (await res.json()) as { products?: Product[] } | Product[];
        const list = Array.isArray(data) ? data : data.products ?? [];
        if (!cancelled) setProducts(list.slice(0, 4));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-lg rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-8 py-10 text-center shadow-lg shadow-black/10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface-muted)]">
            <ShoppingBag className="h-7 w-7 text-[var(--muted)]" aria-hidden />
          </div>
          <h1 className="mb-2 font-display text-2xl font-bold text-[var(--foreground)]">Your cart is empty</h1>
          <p className="mb-8 text-sm leading-relaxed text-[var(--muted)]">
            Browse the store and add kits — sizes and options stay saved here until checkout.
          </p>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-6 py-3 font-semibold text-white shadow-glow-mint transition-opacity hover:opacity-95 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Browse kits
          </Link>
        </div>

        <TrustRow className="mt-10" />

        <div className="mt-10">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Shop by category
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {SHOP_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] transition hover:border-brand-green/35"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {products.length > 0 && (
          <section className="mt-14" aria-labelledby="empty-cart-picks">
            <h2 id="empty-cart-picks" className="text-center font-display text-lg font-semibold text-[var(--foreground)]">
              Popular right now
            </h2>
            <p className="mx-auto mt-1 max-w-md text-center text-sm text-[var(--muted)]">
              A few kits other fans are adding — tap to view details.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={getProductId(p)} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
