"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import PLPGridSkeleton from "@/components/PLPGridSkeleton";
import { Product, getProductId } from "@/data/products";

type ProductsResponse = {
  products: Product[];
  total?: number;
  totalPages?: number;
  page?: number;
};

export default function WorldCupPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          league: "international-teams",
          nationalTeamsOnly: "true",
          worldCup2026Only: "true",
          nameContains: "26/27",
          page: String(page),
          limit: "24",
          sort: "newest",
        });
        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as ProductsResponse;
        if (cancelled) return;
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch {
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      {/* Hero — full-bleed under nav; Brazil / tournament vibe */}
      <section className="relative -mt-[var(--site-header-height)] w-full min-h-[min(92vh,980px)] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero/world-cup-trophy-hero.png"
            alt="FIFA World Cup trophy on the pitch at sunset"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] scale-105 sm:object-center"
            unoptimized
          />
        </div>
        {/* Colour wash: Brasil green + seleção blue + gold flare */}
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-b from-[#002776]/88 via-[#009C3B]/35 to-[#050608]"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-r from-black/80 via-black/25 to-[#FEDD00]/15"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1] opacity-30 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 20%, rgba(254, 221, 0, 0.25) 0%, transparent 55%)",
          }}
          aria-hidden
        />

        {/* Flag-inspired accent strip */}
        <div
          className="absolute bottom-0 left-0 right-0 z-[2] h-1.5 bg-gradient-to-r from-[#009C3B] via-[#FFDF00] to-[#002776]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[min(92vh,980px)] max-w-[1600px] flex-col justify-end px-5 pb-16 pt-[calc(var(--site-header-height)+2.5rem)] sm:px-10 sm:pb-20 lg:px-14">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-white/35" aria-hidden />
            <span className="text-[#FFDF00]/90">World Cup</span>
          </nav>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] text-[#FFDF00] backdrop-blur-md sm:text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-[#FFDF00]" aria-hidden />
            2026 / 27 · International
          </div>

          <h1 className="max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl xl:text-7xl">
            The cup.
            <span className="block bg-gradient-to-r from-[#FFDF00] via-white to-[#7dd3a8] bg-clip-text text-transparent">
              The colours.
            </span>
            <span className="mt-1 block text-[0.42em] font-semibold uppercase tracking-[0.28em] text-white/80 sm:text-[0.38em]">
              O jogo bonito — national kits for the next chapter
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Green pitch, gold hour, one trophy — every nation’s story on fabric. Shop{" "}
            <span className="font-semibold text-[#FFDF00]">26/27</span> international jerseys in one
            place: the season that leads to the world stage.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#kits"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#009C3B] to-[#007a30] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_40px_rgba(0,156,59,0.35)] transition hover:brightness-110"
            >
              Browse kits
            </a>
            <Link
              href="/league/international-teams"
              className="text-sm font-medium text-white/70 underline-offset-4 transition hover:text-white hover:underline"
            >
              All national teams
            </Link>
          </div>
        </div>
      </section>

      {/* Content: light shell so product cards pop like a stadium shop */}
      <section
        id="kits"
        className="relative border-t border-white/[0.06] bg-[var(--background)] text-[var(--foreground)]"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#009C3B]/[0.07] to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
          <div className="mb-10 flex flex-col gap-3 border-b border-[color:var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#009C3B]">
                Collection
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)] sm:text-3xl">
                2026/27 national team jerseys
              </h2>
              <p className="mt-2 max-w-lg text-sm text-[var(--muted)]">
                Only the{" "}
                <a
                  href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#009C3B] underline-offset-2 hover:underline"
                >
                  2026 World Cup
                </a>{" "}
                nations (48 teams), no clubs. Titles include{" "}
                <span className="font-medium text-[var(--foreground)]">26/27</span>.
              </p>
            </div>
            {!loading && (
              <p className="text-sm tabular-nums text-[var(--muted)]">
                <span className="font-semibold text-[var(--foreground)]">{total}</span> kits
              </p>
            )}
          </div>

          {loading ? (
            <PLPGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold text-[var(--foreground)]">
                No 26/27 kits in stock yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
                Check back soon or browse the full international aisle.
              </p>
              <Link
                href="/league/international-teams"
                className="mt-6 inline-flex rounded-full bg-brand-green px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
              >
                International teams
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-7 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={getProductId(product)} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-[var(--muted)]">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
