"use client";

import { useParams } from "next/navigation";
import { getLeagueBySlug, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ChevronRight, Filter, X, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

export default function LeaguePage() {
  const params = useParams();
  const leagueSlug = params.leagueSlug as string;
  const league = getLeagueBySlug(leagueSlug);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // Get unique teams from DB products for filter sidebar
  const teamsFromProducts = useMemo(() => {
    const teams = new Set(allProducts.map((p) => p.team));
    return Array.from(teams).sort();
  }, [allProducts]);

  // Use DB teams if available, fallback to static league teams
  const filterTeams = teamsFromProducts.length > 0 ? teamsFromProducts : (league?.teams || []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (selectedTeam !== "all" && p.team !== selectedTeam) return false;
      if (selectedType !== "all" && p.kitType !== selectedType) return false;
      return true;
    });
  }, [allProducts, selectedTeam, selectedType]);

  const activeFilterCount =
    (selectedTeam !== "all" ? 1 : 0) + (selectedType !== "all" ? 1 : 0);

  if (!league) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            League not found
          </h1>
          <Link href="/" className="text-amber-400 text-sm hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const filterContent = (
    <>
      {/* Team Filter */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Team
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedTeam("all")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedTeam === "all"
                ? "bg-amber-400/10 text-amber-400"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-300"
            }`}
          >
            All Teams
          </button>
          {filterTeams.map((team) => (
            <button
              key={team}
              onClick={() => setSelectedTeam(team)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedTeam === team
                  ? "bg-amber-400/10 text-amber-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-300"
              }`}
            >
              {team}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Kit Type
        </h4>
        <div className="space-y-1">
          {[
            { value: "all", label: "All Types" },
            { value: "fans", label: "Fans Version" },
            { value: "player", label: "Player Version" },
            { value: "retro", label: "Retro" },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedType === type.value
                  ? "bg-amber-400/10 text-amber-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-300"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
            <Link href="/" className="hover:text-zinc-300 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-300">{league.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {league.name}
              </h1>
              <p className="mt-1 text-zinc-500">
                {league.country} &middot; {filterTeams.length} teams &middot;{" "}
                {allProducts.length} kits
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block lg:w-56 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Filters</h3>
              </div>
              {filterContent}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between mb-6">
              <p className="text-sm text-zinc-500">
                {loading ? "Loading..." : `Showing ${filteredProducts.length} kits`}
              </p>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <Filter className="w-4 h-4 text-amber-400" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-500">No kits found with these filters</p>
                <button
                  onClick={() => {
                    setSelectedTeam("all");
                    setSelectedType("all");
                  }}
                  className="mt-2 text-sm text-amber-400 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-zinc-500 mb-6 hidden lg:block">
                  Showing {filteredProducts.length} kits
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={getProductId(product)} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] bg-zinc-950 border-t border-white/10 animate-[fadeSlideIn_0.2s_ease-out] overflow-y-auto">
            {/* Drawer header */}
            <div className="sticky top-0 bg-zinc-950 border-b border-white/5 px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Filters</h3>
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedTeam("all");
                      setSelectedType("all");
                    }}
                    className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter content */}
            <div className="px-5 py-4">
              {filterContent}
            </div>

            {/* Apply button */}
            <div className="sticky bottom-0 bg-zinc-950 border-t border-white/5 px-5 py-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition-colors"
              >
                Show {filteredProducts.length} kits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getProductId(p: Product): string {
  return p._id || p.id || "";
}
