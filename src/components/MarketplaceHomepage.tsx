"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, Star } from "lucide-react";
import { Product, getProductBasePrice, getProductId, leagues } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { useCartStore } from "@/store/cart";
import { getDisplayTeamName } from "@/lib/productDisplay";

const HERO_LEFT = [
  { label: "Premier League", slug: "premier-league" },
  { label: "La Liga", slug: "la-liga" },
  { label: "Serie A", slug: "serie-a" },
  { label: "Bundesliga", slug: "bundesliga" },
  { label: "Ligue 1", slug: "ligue-1" },
  { label: "Super Lig", slug: "super-lig" },
  { label: "International Teams", slug: "international-teams" },
  { label: "Retro Kits", slug: "retro-kits" },
  { label: "Special Editions", slug: "fan-made" },
];

const HERO_BANNERS = [
  {
    title: "New Season Kits",
    subtitle: "Latest drops from top clubs",
    image: "/banners/new-season-kits.png",
    href: "/league/jersey",
  },
  {
    title: "Retro Collections",
    subtitle: "Legendary classics back in stock",
    image: "/banners/retro-collection.png",
    href: "/league/retro-kits",
  },
  {
    title: "Weekly Drops",
    subtitle: "Fresh arrivals every week",
    image: "/banners/weekly-drops.png",
    href: "/league/fan-made",
  },
];

const HERO_PROMOS = [
  {
    title: "New Drops",
    image: "/banners/promo-new-drops.png",
    href: "/league/jersey",
  },
  {
    title: "Best Sellers",
    image: "/banners/promo-best-sellers.png",
    href: "/search",
  },
  {
    title: "Under CHF 30",
    image: "/banners/promo-under-30.png",
    href: "/league/fan-made",
  },
  {
    title: "Retro Classics",
    image: "/banners/promo-retro-classics.png",
    href: "/league/retro-kits",
  },
];

const POPULAR_CLUBS = [
  "Real Madrid",
  "Barcelona",
  "Manchester United",
  "Arsenal",
  "PSG",
  "Juventus",
  "Bayern",
  "AC Milan",
];

type ProductsResponse =
  | Product[]
  | { products: Product[]; total?: number; totalPages?: number; page?: number };

async function fetchProducts(params: URLSearchParams): Promise<{ items: Product[]; totalPages: number }> {
  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) return { items: [], totalPages: 1 };
  const data = (await res.json()) as ProductsResponse;
  if (Array.isArray(data)) return { items: data, totalPages: 1 };
  return { items: data.products || [], totalPages: data.totalPages || 1 };
}

async function searchProducts(q: string, limit: number): Promise<Product[]> {
  if (!q.trim()) return [];
  const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchTrendingMix(): Promise<Product[]> {
  const [japan, windbreaker, tracksuit, nba, footballFans] = await Promise.all([
    searchProducts("japan", 3),
    fetchProducts(new URLSearchParams({ league: "windbreaker", page: "1", limit: "3", sort: "default" })),
    fetchProducts(new URLSearchParams({ league: "tracksuit", page: "1", limit: "3", sort: "default" })),
    fetchProducts(new URLSearchParams({ league: "nba-nfl", page: "1", limit: "3", sort: "default" })),
    fetchProducts(new URLSearchParams({ league: "jersey", kitType: "fans", page: "1", limit: "12", sort: "default" })),
  ]);
  const seen = new Set<string>();
  const merged: Product[] = [];
  for (const list of [japan, windbreaker.items, tracksuit.items, nba.items, footballFans.items]) {
    const items = Array.isArray(list) ? list : (list as { items: Product[] }).items || [];
    for (const p of items) {
      const id = getProductId(p);
      if (id && !seen.has(id)) {
        seen.add(id);
        merged.push(p);
      }
      if (merged.length >= 18) break;
    }
    if (merged.length >= 18) break;
  }
  return merged.slice(0, 18);
}

function ProductTile({
  product,
  badge,
  onAdd,
}: {
  product: Product;
  badge?: string;
  onAdd: (p: Product) => void;
}) {
  const { formatPrice } = useCurrency();
  const price = getProductBasePrice(product);
  const displayTeam = getDisplayTeamName(product);
  const rating = (4.3 + ((displayTeam.length + price) % 6) / 10).toFixed(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1000);
    return () => clearTimeout(timer);
  }, [justAdded]);

  return (
    <Link
      href={`/product/${getProductId(product)}`}
      className="group rounded-xl sm:rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all"
    >
      <div className="relative aspect-[4/5] bg-white overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : null}
        {badge ? (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-semibold bg-gold text-[#111]">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="p-3 sm:p-3.5 space-y-1.5 sm:space-y-2">
        <p className="text-[13px] sm:text-[14px] font-semibold text-[#111] line-clamp-1">{displayTeam}</p>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#666]">{product.kitType} version</p>
        <div className="flex items-center justify-between">
          <p className="text-[18px] sm:text-[20px] font-bold text-[#111]">{formatPrice(price)}</p>
          <div className="inline-flex items-center gap-1 text-[11px] text-[#666]">
            <Star className="w-3.5 h-3.5 text-gold fill-gold" />
            {rating}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAdd(product);
            setJustAdded(true);
          }}
          className={`w-full h-8.5 sm:h-9 rounded-lg text-[12px] font-semibold transition-all duration-200 active:scale-[0.97] ${
            justAdded
              ? "bg-emerald-500 text-white shadow-[0_6px_18px_rgba(34,197,94,0.35)]"
              : "bg-[#111] text-white hover:bg-[#222] hover:scale-[1.01]"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            {justAdded ? <Check className="w-3.5 h-3.5" /> : null}
            {justAdded ? "Added to Cart" : "Quick Add to Cart"}
          </span>
        </button>
      </div>
    </Link>
  );
}

export default function MarketplaceHomepage() {
  const addItem = useCartStore((s) => s.addItem);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [trending, setTrending] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [retro, setRetro] = useState<Product[]>([]);

  const [leagueFilter, setLeagueFilter] = useState("all");
  const [clubFilter, setClubFilter] = useState("");
  const [versionFilter, setVersionFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [exploreItems, setExploreItems] = useState<Product[]>([]);
  const [explorePage, setExplorePage] = useState(1);
  const [exploreTotalPages, setExploreTotalPages] = useState(1);
  const [loadingExplore, setLoadingExplore] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((v) => (v + 1) % HERO_BANNERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const goPrevBanner = () => {
    setBannerIndex((v) => (v - 1 + HERO_BANNERS.length) % HERO_BANNERS.length);
  };

  const goNextBanner = () => {
    setBannerIndex((v) => (v + 1) % HERO_BANNERS.length);
  };

  useEffect(() => {
    async function init() {
      const newParams = new URLSearchParams({ page: "1", limit: "18", sort: "newest" });
      const retroParams = new URLSearchParams({ page: "1", limit: "12", sort: "newest", kitType: "retro" });

      const [trendingMix, n, r] = await Promise.all([
        fetchTrendingMix(),
        fetchProducts(newParams),
        fetchProducts(retroParams),
      ]);
      setTrending(trendingMix);
      setNewArrivals(n.items);
      setRetro(r.items);
    }
    init();
  }, []);

  const passPrice = useCallback((p: Product) => {
    const price = getProductBasePrice(p);
    if (priceFilter === "under-30") return price < 30;
    if (priceFilter === "30-50") return price >= 30 && price <= 50;
    if (priceFilter === "50+") return price > 50;
    return true;
  }, [priceFilter]);

  const passClub = useCallback(
    (p: Product) =>
      !clubFilter.trim() ||
      getDisplayTeamName(p).toLowerCase().includes(clubFilter.trim().toLowerCase()) ||
      p.name.toLowerCase().includes(clubFilter.trim().toLowerCase()),
    [clubFilter]
  );

  const addQuick = (p: Product) => {
    addItem({
      product: p,
      selectedKitType: p.kitType,
      quantity: 1,
      selectedBadges: [],
      customName: "",
      customNumber: "",
      hasCustomNameNumber: false,
      size: "M",
    });
  };

  const loadExplore = useCallback(
    async (page: number) => {
      setLoadingExplore(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "24",
        sort: "newest",
      });
      if (leagueFilter !== "all") params.set("league", leagueFilter);
      if (versionFilter !== "all") params.set("kitType", versionFilter);

      const { items, totalPages } = await fetchProducts(params);
      const filtered = items.filter((p) => passClub(p) && passPrice(p));
      setExploreTotalPages(totalPages);
      setExplorePage(page);
      setExploreItems(filtered);
      setLoadingExplore(false);
    },
    [leagueFilter, versionFilter, passClub, passPrice]
  );

  useEffect(() => {
    loadExplore(1);
  }, [leagueFilter, versionFilter, clubFilter, priceFilter, loadExplore]);

  const leagueCards = leagues.filter((l) =>
    ["premier-league", "la-liga", "serie-a", "bundesliga", "ligue-1", "super-lig", "international-teams", "others"].includes(l.slug)
  );

  return (
    <div className="bg-[#fff]">
      <div className="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-6 sm:space-y-8">
        <section className="lg:hidden">
          <div className="-mx-1 overflow-x-auto hide-scrollbar pb-1">
            <div className="flex gap-2 px-1">
              {HERO_LEFT.map((item) => (
                <Link
                  key={item.slug}
                  href={`/league/${item.slug}`}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-[12px] text-[#111] border border-[color:var(--border)] bg-[var(--surface)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <aside className="hidden lg:block lg:col-span-2 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-3">
            <p className="px-2 py-1 text-[11px] font-semibold text-[#666] uppercase tracking-[0.16em]">Categories</p>
            <div className="mt-2 space-y-1">
              {HERO_LEFT.map((item) => (
                <Link
                  key={item.slug}
                  href={`/league/${item.slug}`}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] text-[#111] hover:bg-[var(--surface-muted)]"
                >
                  {item.label}
                  <ChevronRight className="w-3.5 h-3.5 text-[#666]" />
                </Link>
              ))}
            </div>
          </aside>

          <div className="lg:col-span-7 relative rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] min-h-[200px] sm:min-h-[250px] overflow-hidden">
            <Link href={HERO_BANNERS[bannerIndex].href} className="block absolute inset-0">
              <img
                src={HERO_BANNERS[bannerIndex].image}
                alt={HERO_BANNERS[bannerIndex].title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
              <div className="relative h-full p-5 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/85">Marketplace Banner</p>
                  <h2 className="mt-3 text-[24px] sm:text-[32px] leading-[1.05] font-bold text-white">
                    {HERO_BANNERS[bannerIndex].title}
                  </h2>
                  <p className="mt-2 text-white/85 text-[13px] sm:text-[14px]">{HERO_BANNERS[bannerIndex].subtitle}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  {HERO_BANNERS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full ${i === bannerIndex ? "w-8 bg-gold" : "w-4 bg-white/45"}`}
                    />
                  ))}
                </div>
              </div>
            </Link>

            <button
              onClick={goPrevBanner}
              className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/35 text-white hover:bg-black/50 flex items-center justify-center"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNextBanner}
              className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/35 text-white hover:bg-black/50 flex items-center justify-center"
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <aside className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
            {HERO_PROMOS.map((promo) => (
              <Link
                key={promo.title}
                href={promo.href}
                className="relative rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] min-h-[118px] overflow-hidden hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
              >
                <img src={promo.image} alt={promo.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/5" />
                <div className="relative p-3 h-full flex items-end">
                  <p className="text-[13px] sm:text-[15px] leading-tight font-semibold text-white">{promo.title}</p>
                </div>
              </Link>
            ))}
          </aside>
        </section>

        <section className="space-y-4">
          <h3 className="text-[19px] sm:text-[24px] font-bold text-[#111]">Browse by League</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
            {leagueCards.map((league) => (
              <Link
                key={league.slug}
                href={`/league/${league.slug}`}
                className="rounded-lg sm:rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-2 sm:p-3 text-center hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
              >
                <div className="h-10 sm:h-14 flex items-center justify-center">
                  {league.logo ? (
                    <img
                      src={league.logo}
                      alt={league.name}
                      className={`object-contain ${
                        league.slug === "international-teams" ? "max-h-10 sm:max-h-14" : "max-h-8 sm:max-h-11"
                      }`}
                    />
                  ) : null}
                </div>
                <p className="mt-1 sm:mt-2 text-[11px] sm:text-[12px] text-[#111] line-clamp-1">{league.name}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[24px] font-bold text-[#111]">Trending This Week</h3>
            <Link href="/search" className="text-[13px] text-[#666] hover:text-[#111]">
              View more
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
            {trending.slice(0, 18).map((p, i) => (
              <ProductTile
                key={getProductId(p)}
                product={p}
                badge={p.isFeatured ? "BESTSELLER" : p.isNewArrival ? "NEW" : i % 5 === 0 ? "HOT" : undefined}
                onAdd={addQuick}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[24px] font-bold text-[#111]">Just Dropped</h3>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {newArrivals.slice(0, 18).map((p) => (
              <div key={getProductId(p)} className="w-[170px] sm:w-[200px] lg:w-[220px] shrink-0">
                <ProductTile product={p} badge="NEW" onAdd={addQuick} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[24px] font-bold text-[#111]">Popular Clubs</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {POPULAR_CLUBS.map((club) => (
              <Link
                key={club}
                href={`/search?q=${encodeURIComponent(club)}`}
                className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-3 py-4 text-center text-[13px] text-[#111] hover:bg-[var(--surface-muted)]"
              >
                {club}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-[color:var(--border)] bg-gradient-to-r from-[#fff2c4] to-[#ffe7a1] p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#666]">Retro Collection</p>
            <h3 className="mt-2 text-[28px] font-bold text-[#111]">Legendary Kits</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {retro.slice(0, 12).map((p) => (
              <ProductTile key={getProductId(p)} product={p} badge="RETRO" onAdd={addQuick} />
            ))}
          </div>
        </section>

        <section className="space-y-4 pb-10">
          <h3 className="text-[24px] font-bold text-[#111]">Explore More Kits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <select
              value={leagueFilter}
              onChange={(e) => setLeagueFilter(e.target.value)}
              className="h-10 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 text-[13px] text-[#111]"
            >
              <option value="all">All Leagues</option>
              {HERO_LEFT.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.label}
                </option>
              ))}
            </select>
            <input
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              placeholder="Club"
              className="h-10 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 text-[13px] text-[#111] placeholder:text-[#666]"
            />
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="h-10 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 text-[13px] text-[#111]"
            >
              <option value="all">All Prices</option>
              <option value="under-30">Under CHF 30</option>
              <option value="30-50">CHF 30 - 50</option>
              <option value="50+">CHF 50+</option>
            </select>
            <select
              value={versionFilter}
              onChange={(e) => setVersionFilter(e.target.value)}
              className="h-10 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 text-[13px] text-[#111]"
            >
              <option value="all">All Versions</option>
              <option value="fans">Fan</option>
              <option value="player">Player</option>
              <option value="retro">Retro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {exploreItems.map((p) => (
              <ProductTile key={getProductId(p)} product={p} onAdd={addQuick} />
            ))}
          </div>

          <div className="h-10 flex items-center justify-center gap-2">
            {loadingExplore ? <Loader2 className="w-5 h-5 animate-spin text-gold" /> : null}
            {!loadingExplore && (
              <>
                <button
                  onClick={() => loadExplore(Math.max(1, explorePage - 1))}
                  disabled={explorePage === 1}
                  className="px-4 py-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] text-[13px] text-[#111] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-[12px] text-[#666]">
                  Page {explorePage} / {exploreTotalPages}
                </span>
                <button
                  onClick={() => loadExplore(Math.min(exploreTotalPages, explorePage + 1))}
                  disabled={explorePage >= exploreTotalPages}
                  className="px-4 py-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] text-[13px] text-[#111] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
