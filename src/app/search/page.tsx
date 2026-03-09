"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Product, getProductId } from "@/data/products";
import ProductCard from "@/components/ProductCard";

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
    async function runSearch() {
      if (normalizedQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(
            normalizedQuery
          )}&paginated=true&page=${page}&limit=24`
        );
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
  }, [normalizedQuery, page]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setPage(1);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-12">
        <div className="mb-8">
          <Link href="/" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
            Home
          </Link>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-[-0.02em]">
            Search Products
          </h1>
        </div>

        <form onSubmit={onSubmit} className="relative max-w-2xl mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams, leagues, kits..."
            className="w-full pl-12 pr-4 py-3.5 bg-[var(--surface)] border border-[color:var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-gold/35"
          />
        </form>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : normalizedQuery.length < 2 ? (
          <p className="text-sm text-[var(--muted)]">
            Type at least 2 characters to search.
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No products found for &ldquo;{normalizedQuery}&rdquo;.
          </p>
        ) : (
          <>
            <p className="text-xs text-[var(--muted)] mb-4">
              {total} results
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
              {results.map((product) => (
                <ProductCard key={getProductId(product)} product={product} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-[var(--muted)]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
