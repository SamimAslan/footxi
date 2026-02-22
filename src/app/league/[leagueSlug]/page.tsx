"use client";

import { useParams } from "next/navigation";
import { getLeagueBySlug, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ChevronRight, ChevronDown, Loader2, X } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";

function DropdownFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
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
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium tracking-wide border transition-all duration-300 ${
          value !== "all"
            ? "border-gold/20 text-gold bg-gold/[0.04]"
            : "border-white/[0.06] text-[#9CA3AF] hover:border-white/[0.1] hover:text-[#F3F4F6]"
        }`}
      >
        {selectedLabel}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 max-h-[50vh] overflow-y-auto bg-[#141721] border border-white/[0.06] shadow-2xl shadow-black/40 py-1 z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[12px] transition-all duration-200 ${
                value === opt.value
                  ? "text-gold bg-gold/[0.04]"
                  : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.02]"
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

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/products?league=${leagueSlug}`);
        if (res.ok) {
          const data = await res.json();
          setAllProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [leagueSlug]);

  const teamsFromProducts = useMemo(() => {
    const teams = new Set(allProducts.map((p) => p.team));
    return Array.from(teams).sort();
  }, [allProducts]);

  const filterTeams =
    teamsFromProducts.length > 0 ? teamsFromProducts : league?.teams || [];

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => {
      if (selectedTeam !== "all" && p.team !== selectedTeam) return false;
      if (selectedType !== "all" && p.kitType !== selectedType) return false;
      return true;
    });

    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.team.localeCompare(b.team));
    } else if (sortBy === "newest") {
      result = [...result].reverse();
    }

    return result;
  }, [allProducts, selectedTeam, selectedType, sortBy]);

  const activeFilterCount =
    (selectedTeam !== "all" ? 1 : 0) + (selectedType !== "all" ? 1 : 0);

  if (!league) {
    return (
      <div className="min-h-screen bg-[#0D0F14] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F3F4F6] mb-2">
            League not found
          </h1>
          <Link href="/" className="text-gold text-sm hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0F14]">
      {/* Banner Header */}
      <div className="relative bg-[#0D0F14] border-b border-white/[0.04] overflow-hidden">
        {/* Background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
          <span className="font-display text-[12vw] sm:text-[10vw] font-bold text-white/[0.015] whitespace-nowrap tracking-[-0.03em]">
            {league.name.toUpperCase()}
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF]/40 mb-6 tracking-wide">
            <Link
              href="/"
              className="hover:text-[#F3F4F6] transition-colors duration-300"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#9CA3AF]">{league.name}</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-[#F3F4F6] tracking-[-0.03em]">
            {league.name}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-[13px] text-[#9CA3AF]/60">
              {league.country}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/[0.1]" />
            <span className="text-[13px] text-[#9CA3AF]/60">
              {filterTeams.length} teams
            </span>
            <span className="w-1 h-1 rounded-full bg-white/[0.1]" />
            <span className="text-[13px] text-[#9CA3AF]/60">
              {allProducts.length} kits
            </span>
          </div>
          <div className="w-16 h-[2px] bg-gold mt-6" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10">
        {/* Horizontal Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8 sm:mb-10">
          <DropdownFilter
            label="All Teams"
            value={selectedTeam}
            options={[
              { value: "all", label: "All Teams" },
              ...filterTeams.map((t) => ({ value: t, label: t })),
            ]}
            onChange={setSelectedTeam}
          />
          <DropdownFilter
            label="All Types"
            value={selectedType}
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
            options={[
              { value: "default", label: "Default" },
              { value: "name", label: "Name A-Z" },
              { value: "newest", label: "Newest" },
            ]}
            onChange={setSortBy}
          />

          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setSelectedTeam("all");
                setSelectedType("all");
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-gold hover:text-gold-light transition-colors duration-300 tracking-wide"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}

          <div className="ml-auto hidden sm:block">
            <span className="text-[12px] text-[#9CA3AF]/40 tracking-wide">
              {loading ? "Loading..." : `${filteredProducts.length} kits`}
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#9CA3AF]/60">
              No kits found with these filters
            </p>
            <button
              onClick={() => {
                setSelectedTeam("all");
                setSelectedType("all");
              }}
              className="mt-3 text-sm text-gold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
            {filteredProducts.map((product) => (
              <ProductCard key={getProductId(product)} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getProductId(p: Product): string {
  return p._id || p.id || "";
}
