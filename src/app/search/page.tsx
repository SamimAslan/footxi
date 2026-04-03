"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Product, getProductId } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import PLPGridSkeleton from "@/components/PLPGridSkeleton";

const TRENDING_QUERIES = [
  { label: "Brazil", q: "brazil" },
  { label: "Japan", q: "japan" },
  { label: "Retro Barcelona", q: "barcelona retro" },
  { label: "Milan", q: "milan" },
  { label: "France national", q: "france" },
  { label: "Premier League", q: "premier" },
] as const;

type KitFilter = "all" | "fans" | "player" | "retro";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const kitTypeFromUrl = (searchParams.get("kitType") || "all") as KitFilter;
  const newFromUrl = searchParams.get("new") === "1";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const normalizedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    setQuery(initialQuery);
    setPage(1);
  }, [initialQuery]);

  useEffect(() => {
    setPage(1);
  }, [kitTypeFromUrl, newFromUrl]);

  useEffect(() => {
    async function runSearch() {
      if (normalizedQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: normalizedQuery,
          paginated: "true",
          page: String(page),
          limit: "24",
        });
        if (kitTypeFromUrl !== "all") params.set("kitType", kitTypeFromUrl);
        if (newFromUrl) params.set("new", "1");

        const res = await fetch(`/api/products/search?${params.toString()}`);
        if (!res.ok) {
          setResults([]);
          setTotal(0);
          setTotalPages(1);
          return;
        }
        const data = (await res.json()) as {
          products: Product[];
          total: number;
          totalPages: number;
          page: number;
        };
        setResults(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch {
        setResults([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }
    runSearch();
  }, [normalizedQuery, page, kitTypeFromUrl, newFromUrl]);

  const pushParams = (next: { kitType?: KitFilter; newArrival?: boolean }) => {
    const qStable =
      normalizedQuery.length >= 2 ? normalizedQuery : (searchParams.get("q") || "").trim();
    if (qStable.length < 2) return;

    const p = new URLSearchParams();
    p.set("q", qStable);

    const kt = next.kitType !== undefined ? next.kitType : kitTypeFromUrl;
    if (kt !== "all") p.set("kitType", kt);

    const nw = next.newArrival !== undefined ? next.newArrival : newFromUrl;
    if (nw) p.set("new", "1");

    setPage(1);
    router.replace(`/search?${p.toString()}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    const p = new URLSearchParams();
    p.set("q", q);
    if (kitTypeFromUrl !== "all") p.set("kitType", kitTypeFromUrl);
    if (newFromUrl) p.set("new", "1");
    setPage(1);
    router.push(`/search?${p.toString()}`);
  };

  const kitOptions: { value: KitFilter; label: string }[] = [
    { value: "all", label: "All versions" },
    { value: "fans", label: "Fans" },
    { value: "player", label: "Player" },
    { value: "retro", label: "Retro" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-12">
        <div className="mb-8">
          <Link href="/" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
            Home
          </Link>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-[-0.02em]">
            Find your kit
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-2xl">
            Matches the <span className="text-[var(--foreground)] font-medium">product title</span> only
            (listing text). Use several words together — e.g. <span className="italic">france pink</span> or{" "}
            <span className="italic">2008 barcelona retro</span> — all words must appear in the title.
          </p>
        </div>

        <form onSubmit={onSubmit} className="relative mb-6 max-w-3xl">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by club, season, retro, league, or product title…"
            aria-label="Search product titles"
            autoComplete="off"
            className="site-search-input w-full rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] py-4 pl-14 pr-4 text-base text-[var(--foreground)] shadow-sm placeholder:text-[var(--muted)] focus:border-[color:var(--border)] focus:outline-none sm:py-5 sm:text-lg"
          />
        </form>

        <div className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Popular searches</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TRENDING_QUERIES.map(({ label, q }) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setQuery(q);
                  setPage(1);
                  const p = new URLSearchParams();
                  p.set("q", q);
                  if (kitTypeFromUrl !== "all") p.set("kitType", kitTypeFromUrl);
                  if (newFromUrl) p.set("new", "1");
                  router.push(`/search?${p.toString()}`);
                }}
                className="rounded-full border border-[color:var(--border)] bg-[var(--surface-muted)]/80 px-4 py-2 text-xs font-medium text-[var(--foreground)] transition hover:border-brand-green/35 hover:bg-[var(--surface)]"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {normalizedQuery.length >= 2 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center mb-8 pb-6 border-b border-[color:var(--border)]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] shrink-0">
              Filters
            </span>
            <div className="flex flex-wrap gap-2">
              {kitOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => pushParams({ kitType: opt.value })}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    kitTypeFromUrl === opt.value
                      ? "bg-brand-green text-white shadow-glow-mint"
                      : "bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-brand-green/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => pushParams({ newArrival: !newFromUrl })}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors sm:ml-2 ${
                newFromUrl
                  ? "bg-brand-green text-white shadow-glow-mint"
                  : "bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-brand-green/30"
              }`}
            >
              New arrivals only
            </button>
          </div>
        )}

        {loading && normalizedQuery.length >= 2 ? (
          <PLPGridSkeleton count={8} />
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        ) : normalizedQuery.length < 2 ? (
          <div
            className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-6 py-10 text-center max-w-lg"
            role="status"
          >
            <p className="text-sm font-medium text-[var(--foreground)]">Start a search</p>
            <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
              Enter at least two characters. We match words in the product title — try club, season, or colour.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div
            className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-6 py-10 max-w-lg"
            role="status"
          >
            <p className="text-sm font-medium text-[var(--foreground)]">No kits match that search</p>
            <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
              Nothing for &ldquo;{normalizedQuery}&rdquo;
              {kitTypeFromUrl !== "all" || newFromUrl ? " with the current filters" : ""}. Try fewer words, different
              spelling, or clear filters.
            </p>
            <Link
              href="/search"
              className="mt-5 inline-block text-sm font-semibold text-[var(--brand-green)] hover:underline"
            >
              Clear and search again
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-[var(--muted)] mb-4">
              {total} result{total !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
              {results.map((product) => (
                <ProductCard key={getProductId(product)} product={product} />
              ))}
            </div>
            {totalPages > 1 && (
              <nav
                className="flex items-center justify-center gap-2 mt-8"
                aria-label="Search results pagination"
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                  className="px-4 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed"
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
                  aria-label="Next page"
                  className="px-4 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
