"use client";

import { useParams } from "next/navigation";
import { getLeagueBySlug, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import PLPGridSkeleton from "@/components/PLPGridSkeleton";
import { useState, useMemo, useEffect, useRef } from "react";

function DropdownFilter({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || label;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium tracking-wide border transition-all duration-300 ${
          disabled ? "cursor-not-allowed opacity-45" : ""
        } ${
          value !== "all"
            ? "border-brand-green/35 text-white bg-brand-green/10"
            : "border-[color:var(--border)] text-[var(--muted)] hover:border-brand-green/25 hover:text-[var(--foreground)]"
        }`}
      >
        {selectedLabel}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div
          data-lenis-prevent
          className="absolute top-full left-0 mt-1 w-56 max-h-[50vh] overflow-y-auto overscroll-y-contain bg-[var(--surface)] border border-[color:var(--border)] shadow-2xl shadow-black/20 py-1 z-50 touch-pan-y"
          onWheel={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[12px] transition-all duration-200 ${
                value === opt.value
                  ? "text-white bg-brand-green/10"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/[0.04]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LeaguePage() {
  const params = useParams();
  const leagueSlug = params.leagueSlug as string;
  const league = getLeagueBySlug(leagueSlug);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          league: leagueSlug,
          page: String(page),
          limit: "24",
          sort: sortBy,
        });
        if (selectedTeam !== "all") params.set("team", selectedTeam);
        if (selectedType !== "all") params.set("kitType", selectedType);
        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [leagueSlug, selectedTeam, selectedType, sortBy, page]);

  useEffect(() => {
    setPage(1);
  }, [selectedTeam, selectedType, sortBy, leagueSlug]);

  const teamsFromProducts = useMemo(() => {
    const teams = new Set((league?.teams || []).concat(products.map((p) => p.team)));
    return Array.from(teams).sort();
  }, [league?.teams, products]);

  const filterTeams =
    teamsFromProducts.length > 0 ? teamsFromProducts : league?.teams || [];

  const activeFilterCount =
    (selectedTeam !== "all" ? 1 : 0) + (selectedType !== "all" ? 1 : 0);

  if (!league) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            League not found
          </h1>
          <Link href="/" className="text-white text-sm hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Banner Header */}
      <div className="relative bg-[var(--background)] border-b border-[color:var(--border)] overflow-hidden">
        {/* Background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
          <span className="font-display text-[12vw] sm:text-[10vw] font-bold text-white/[0.04] whitespace-nowrap tracking-[-0.03em]">
            {league.name.toUpperCase()}
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)] mb-6 tracking-wide">
            <Link
              href="/"
              className="hover:text-[var(--foreground)] transition-colors duration-300"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--foreground)]">{league.name}</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--foreground)] tracking-[-0.03em]">
            {league.name}
          </h1>
          <div className="mt-3 flex min-h-[1.25rem] flex-wrap items-center gap-3">
            <span className="text-[13px] text-[var(--muted)]">{league.country}</span>
            {loading ? (
              <>
                <span className="h-1 w-1 rounded-full bg-[color:var(--border)]" aria-hidden />
                <span className="inline-flex items-center gap-2 text-[13px] text-[var(--muted)]">
                  <span className="inline-block h-3 w-28 animate-pulse rounded bg-[var(--surface-muted)]" />
                </span>
              </>
            ) : (
              <>
                <span className="h-1 w-1 rounded-full bg-[color:var(--border)]" aria-hidden />
                <span className="text-[13px] text-[var(--muted)]">{filterTeams.length} teams</span>
                <span className="h-1 w-1 rounded-full bg-[color:var(--border)]" aria-hidden />
                <span className="text-[13px] font-medium text-[var(--foreground)]">{total} kits</span>
              </>
            )}
          </div>
          <div className="w-16 h-[2px] bg-brand-green mt-6" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10">
        {/* Horizontal Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8 sm:mb-10">
          <DropdownFilter
            label="All Teams"
            value={selectedTeam}
            disabled={loading}
            options={[
              { value: "all", label: "All Teams" },
              ...filterTeams.map((t) => ({ value: t, label: t })),
            ]}
            onChange={setSelectedTeam}
          />
          <DropdownFilter
            label="All Types"
            value={selectedType}
            disabled={loading}
            options={[
              { value: "all", label: "All Types" },
              { value: "fans", label: "Fans Version" },
              { value: "player", label: "Player Version" },
              { value: "retro", label: "Retro" },
            ]}
            onChange={setSelectedType}
          />
          <DropdownFilter
            label="Sort by"
            value={sortBy}
            disabled={loading}
            options={[
              { value: "default", label: "Default" },
              { value: "name", label: "Name A-Z" },
              { value: "newest", label: "Newest" },
            ]}
            onChange={setSortBy}
          />

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedTeam("all");
                setSelectedType("all");
                setPage(1);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-white hover:text-white/90 transition-colors duration-300 tracking-wide"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}

          <div className="ml-auto hidden sm:block">
            <span className="text-[12px] tracking-wide text-[var(--muted)]">
              {loading ? "Updating results…" : `${total} in this view`}
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <PLPGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold text-[var(--foreground)]">No kits in this view</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              Try clearing filters or browse another league — stock updates regularly.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedTeam("all");
                  setSelectedType("all");
                  setPage(1);
                }}
                className="rounded-full bg-brand-green px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
              >
                Clear filters
              </button>
              <Link
                href="/"
                className="rounded-full border border-[color:var(--border)] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-[var(--foreground)]"
              >
                Back to home
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-[var(--muted)] underline-offset-4 hover:text-white hover:underline"
              >
                Contact support
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
            {products.map((product) => (
              <ProductCard key={getProductId(product)} product={product} />
            ))}
          </div>
        )}

        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              type="button"
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
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getProductId(p: Product): string {
  return p._id || p.id || "";
}
