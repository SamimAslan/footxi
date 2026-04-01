"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Baby,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudRainWind,
  Gauge,
  Goal,
  History,
  Layers,
  Palette,
  Shirt,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  Product,
  getProductBasePrice,
  getProductId,
  getKitVersionDisplayLabel,
  getEffectiveKitType,
  leagues,
} from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { useCartStore } from "@/store/cart";
import { getDisplayTeamName } from "@/lib/productDisplay";

/**
 * Hero: `imagePosition` = object-position for object-cover (France = top-weighted so Pogba/trophy stays in frame).
 * `unoptimized` serves the PNG as-is — avoids an extra resize pass that can look soft on ~1024px sources.
 * Replace files with ≥1920px wide exports when you have them.
 */
const HERO_SLIDES = [
  {
    title: "Japan pink",
    subtitle: "Sakura away & pink away collection",
    image: "/hero/hero-milan-derby-hd.png",
    href: "/search?q=Japan+pink",
    imagePosition: "object-center",
  },
  {
    title: "Barcelona retro",
    subtitle: "Classic Camp Nou eras",
    image: "/hero/hero-beckham-hd.png",
    href: "/search?q=Barcelona+retro",
    imagePosition: "object-center",
  },
  {
    title: "France national team",
    subtitle: "Les Bleus — home & away",
    image: "/hero/hero-france-pogba-hd.png",
    href: "/search?q=France+national",
    /** Upper half of frame (player + trophy), not vertical center */
    imagePosition: "object-top",
  },
] as const;

const HOMEPAGE_CATEGORIES = [
  {
    label: "Jerseys",
    slug: "jersey",
    blurb: "Club & national kits — home, away, third & player editions.",
  },
  {
    label: "Windbreakers",
    slug: "windbreaker",
    blurb: "Lightweight layers built for stadium weather.",
  },
  {
    label: "Jackets",
    slug: "jackets",
    blurb: "Outerwear with team branding and clean cuts.",
  },
  {
    label: "Hoodies",
    slug: "hoody",
    blurb: "Casual hoodies and pullovers for everyday wear.",
  },
  {
    label: "Tracksuits",
    slug: "tracksuit",
    blurb: "Full sets for travel, warm-ups, and off-pitch style.",
  },
  {
    label: "Kids",
    slug: "kids",
    blurb: "Youth sizing across selected clubs and nations.",
  },
  {
    label: "NBA / NFL",
    slug: "nba-nfl",
    blurb: "Basketball and American football jerseys & apparel.",
  },
  {
    label: "F1",
    slug: "f1",
    blurb: "Racing suits, polos, and team merch from the grid.",
  },
  {
    label: "Retro Kits",
    slug: "retro-kits",
    blurb: "Throwback seasons and cult classics back in stock.",
  },
  {
    label: "Fan Made",
    slug: "fan-made",
    blurb: "Special editions, collabs, and supporter-led drops.",
  },
] as const;

/** Icons chosen to match what each category actually sells (not generic decoration). */
const CATEGORY_ICONS: Record<(typeof HOMEPAGE_CATEGORIES)[number]["slug"], LucideIcon> = {
  jersey: Goal,
  windbreaker: CloudRainWind,
  jackets: Layers,
  hoody: Shirt,
  tracksuit: Activity,
  kids: Baby,
  "nba-nfl": Trophy,
  f1: Gauge,
  "retro-kits": History,
  "fan-made": Palette,
};

/** Pinned featured jerseys (exact DB product name / listing title). */
const FEATURED_EXACT_NAMES = {
  japan: "24/25 Japan Special Edition Fans 1:1 Quality Soccer Jersey",
  barcelona:
    "2008-2009 Retro Barcelona Home Champions League Long sleeve 1:1 Quality Soccer Jersey",
  france: "2006 France Away White Fans 1:1 Quality Retro Soccer Jersey",
} as const;

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

async function fetchProductByExactName(name: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/find-by-name?name=${encodeURIComponent(name)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== "object") return null;
    const p = data as Product;
    return getProductId(p) ? p : null;
  } catch {
    return null;
  }
}

const F1_REGEX = /f1|formula\s*1|formula one/i;
const WOMENS_REGEX = /\b(women|womens|women's|ladies|female|kadın|kadin|bayan)\b/i;

const NON_JERSEY_LEAGUE_SLUGS = new Set([
  "nba-nfl",
  "windbreaker",
  "tracksuit",
  "hoody",
  "jackets",
  "kids",
  "f1",
]);

function isF1Product(p: Product): boolean {
  return (
    F1_REGEX.test(p.name || "") ||
    F1_REGEX.test(p.team || "") ||
    F1_REGEX.test(p.league || "")
  );
}

/** Homepage product filter: men's football jerseys only — excludes F1, NBA/NFL, women's, outerwear, etc. */
function isMensFootballJersey(p: Product): boolean {
  const slug = p.leagueSlug || "";
  const shop = p.shopCategory || "jersey";
  if (NON_JERSEY_LEAGUE_SLUGS.has(slug)) return false;
  if (["windbreaker", "tracksuit", "hoody", "jackets", "kids", "nba-nfl"].includes(shop)) return false;
  if (WOMENS_REGEX.test(p.name || "") || WOMENS_REGEX.test(p.team || "")) return false;
  if (isF1Product(p)) return false;
  if (/\bnfl\b|\bnba\b/i.test(p.name || "")) return false;
  return true;
}

async function fetchTrendingMix(): Promise<Product[]> {
  const [japan, premier, laLiga, serieA, international, fanMade] = await Promise.all([
    searchProducts("japan", 4),
    fetchProducts(new URLSearchParams({ league: "premier-league", page: "1", limit: "5", sort: "default" })),
    fetchProducts(new URLSearchParams({ league: "la-liga", page: "1", limit: "5", sort: "default" })),
    fetchProducts(new URLSearchParams({ league: "serie-a", page: "1", limit: "5", sort: "default" })),
    fetchProducts(new URLSearchParams({ league: "international-teams", page: "1", limit: "5", sort: "default" })),
    fetchProducts(new URLSearchParams({ league: "fan-made", page: "1", limit: "4", sort: "default" })),
  ]);
  const seen = new Set<string>();
  const merged: Product[] = [];
  const lists = [japan, premier.items, laLiga.items, serieA.items, international.items, fanMade.items];
  for (const list of lists) {
    const items = Array.isArray(list) ? list : (list as { items: Product[] }).items || [];
    for (const p of items) {
      if (!isMensFootballJersey(p)) continue;
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

async function fetchHomepageFeaturedFive(): Promise<Product[]> {
  const [jExact, bExact, fExact, palList, flaList] = await Promise.all([
    fetchProductByExactName(FEATURED_EXACT_NAMES.japan),
    fetchProductByExactName(FEATURED_EXACT_NAMES.barcelona),
    fetchProductByExactName(FEATURED_EXACT_NAMES.france),
    searchProducts("palestine", 60),
    searchProducts("flamengo pink", 60),
  ]);

  const out: Product[] = [];
  const ids = new Set<string>();
  const push = (p: Product | null | undefined) => {
    if (!p || !isMensFootballJersey(p)) return;
    const id = getProductId(p);
    if (!id || ids.has(id)) return;
    ids.add(id);
    out.push(p);
  };

  push(jExact);
  push(bExact);
  push(palList.find((p) => isMensFootballJersey(p) && /palestine/i.test(p.name)));
  push(
    flaList.find(
      (p) => isMensFootballJersey(p) && /flamengo/i.test(p.name) && /(pink|pembe)/i.test(p.name)
    ) ?? flaList.find((p) => isMensFootballJersey(p) && /flamengo/i.test(p.name))
  );
  push(fExact);

  if (out.length >= 5) return out.slice(0, 5);

  const pool = (
    await Promise.all([
      searchProducts("japan pink", 40),
      searchProducts("barcelona retro", 40),
      searchProducts("france", 40),
      searchProducts("premier league", 24),
    ])
  )
    .flat()
    .filter(isMensFootballJersey);
  for (const p of pool) {
    push(p);
    if (out.length >= 5) break;
  }
  return out.slice(0, 5);
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[17px] sm:text-xl font-bold uppercase tracking-[0.06em] text-brand-green">{children}</h3>
  );
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
      className="group rounded-lg border border-[color:var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider bg-brand-green text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="p-3 sm:p-3.5 space-y-1.5 sm:space-y-2">
        <p className="text-[13px] sm:text-[14px] font-bold text-brand-green line-clamp-1">{displayTeam}</p>
        <p className="text-[10px] tracking-[0.14em] text-[var(--muted)]">
          {getKitVersionDisplayLabel(product)}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-[17px] sm:text-[19px] font-bold text-[var(--foreground)]">{formatPrice(price)}</p>
          <div className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
            <Star className="w-3.5 h-3.5 text-brand-green fill-brand-green/90" />
            {rating}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAdd(product);
            setJustAdded(true);
          }}
          className={`w-full h-9 sm:h-10 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all duration-200 active:scale-[0.98] ${
            justAdded
              ? "bg-brand-green text-white"
              : "bg-brand-green text-white hover:bg-brand-green-dark"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            {justAdded ? <Check className="w-3.5 h-3.5" /> : null}
            {justAdded ? "Added" : "Add to cart"}
          </span>
        </button>
      </div>
    </Link>
  );
}

export default function MarketplaceHomepage() {
  const addItem = useCartStore((s) => s.addItem);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [featuredFive, setFeaturedFive] = useState<Product[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((v) => (v + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goPrevBanner = () => {
    setBannerIndex((v) => (v - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const goNextBanner = () => {
    setBannerIndex((v) => (v + 1) % HERO_SLIDES.length);
  };

  useEffect(() => {
    async function init() {
      const homeFeatured = await fetchHomepageFeaturedFive();
      if (homeFeatured.length >= 5) {
        setFeaturedFive(homeFeatured.slice(0, 5));
        return;
      }

      const fallback = await fetchTrendingMix();
      const merged = [...homeFeatured];
      const seen = new Set(homeFeatured.map((p) => getProductId(p)));
      const seenCore = new Set(
        homeFeatured
          .map((p) => `${p.team} ${p.name}`.toLowerCase())
          .flatMap((txt) => [
            txt.includes("japan") ? "japan" : "",
            txt.includes("barcelona") ? "barcelona" : "",
            txt.includes("palestine") ? "palestine" : "",
            txt.includes("flamengo") ? "flamengo" : "",
            txt.includes("france") ? "france" : "",
          ])
          .filter(Boolean)
      );
      for (const p of fallback) {
        const id = getProductId(p);
        const txt = `${p.team} ${p.name}`.toLowerCase();
        const key =
          txt.includes("japan")
            ? "japan"
            : txt.includes("barcelona")
              ? "barcelona"
              : txt.includes("palestine")
                ? "palestine"
                : txt.includes("flamengo")
                  ? "flamengo"
                  : txt.includes("france")
                    ? "france"
                    : "";
        if (!seen.has(id)) {
          if (key && seenCore.has(key)) continue;
          seen.add(id);
          if (key) seenCore.add(key);
          merged.push(p);
        }
        if (merged.length >= 5) break;
      }
      setFeaturedFive(merged.slice(0, 5));
    }
    init();
  }, []);

  const addQuick = (p: Product) => {
    addItem({
      product: p,
      selectedKitType: getEffectiveKitType(p),
      quantity: 1,
      selectedBadges: [],
      customName: "",
      customNumber: "",
      hasCustomNameNumber: false,
      size: "M",
    });
  };


  const leagueCards = leagues.filter((l) =>
    ["premier-league", "la-liga", "serie-a", "bundesliga", "ligue-1", "super-lig", "international-teams", "others"].includes(l.slug)
  );

  return (
    <div className="bg-[var(--background)]">
      {/* Full-width hero — image + overlay copy */}
      <section className="relative w-full min-h-[min(50vh,480px)] sm:min-h-[min(54vh,520px)] lg:min-h-[min(56vh,560px)] overflow-hidden border-b border-black/10">
        <Link href={HERO_SLIDES[bannerIndex].href} className="block absolute inset-0 z-0">
          <div className="absolute inset-0 z-[1]">
            <Image
              key={HERO_SLIDES[bannerIndex].image}
              src={HERO_SLIDES[bannerIndex].image}
              alt={HERO_SLIDES[bannerIndex].title}
              fill
              sizes="100vw"
              quality={100}
              priority={bannerIndex === 0}
              unoptimized
              className={`object-cover ${HERO_SLIDES[bannerIndex].imagePosition}`}
            />
          </div>
          <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/80 via-black/44 to-black/22 sm:from-black/70 sm:via-black/30 sm:to-black/12" />
          <div className="relative z-10 min-h-[min(50vh,480px)] sm:min-h-[min(54vh,520px)] lg:min-h-[min(56vh,560px)] max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 flex flex-col justify-center items-start py-16 sm:py-20">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-white/80 font-semibold">
              Men's football jerseys
            </p>
            <h2 className="mt-3 max-w-lg text-left text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.05] font-bold text-white uppercase tracking-tight">
              {HERO_SLIDES[bannerIndex].title}
            </h2>
            <p className="mt-3 max-w-md text-[14px] sm:text-[16px] text-white/90 leading-relaxed">
              {HERO_SLIDES[bannerIndex].subtitle}
            </p>
            <span className="mt-8 inline-flex items-center rounded-sm border-2 border-white px-7 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-white hover:bg-white hover:text-brand-green transition-colors">
              Shop collection
            </span>
          </div>
        </Link>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setBannerIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${i === bannerIndex ? "w-9 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goPrevBanner}
          className="absolute left-2 sm:left-5 top-1/2 z-20 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 text-brand-green hover:bg-white flex items-center justify-center shadow-lg"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={goNextBanner}
          className="absolute right-2 sm:right-5 top-1/2 z-20 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 text-brand-green hover:bg-white flex items-center justify-center shadow-lg"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
        <section className="space-y-4">
          <SectionTitle>Featured 5 Kits</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {featuredFive.map((p) => (
              <ProductTile key={getProductId(p)} product={p} onAdd={addQuick} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Browse by league</SectionTitle>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
            {leagueCards.map((league) => (
              <Link
                key={league.slug}
                href={`/league/${league.slug}`}
                className="rounded-lg sm:rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-2 sm:p-3 text-center shadow-sm hover:shadow-md transition-shadow"
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
                <p className="mt-1 sm:mt-2 text-[11px] sm:text-[12px] font-semibold text-brand-green line-clamp-1">{league.name}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6 pb-10 sm:pb-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[color:var(--border)] pb-5">
            <div className="max-w-2xl">
              <SectionTitle>Shop by category</SectionTitle>
              <p className="mt-2 text-[13px] sm:text-[14px] leading-relaxed text-[var(--muted)]">
                Browse the same departments as our top navigation — jerseys first, then outerwear, kids, and crossover sports.
              </p>
            </div>
            <Link
              href="/league/jersey"
              className="inline-flex items-center gap-1.5 shrink-0 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.12em] text-brand-green hover:text-brand-green-dark transition-colors group/link"
            >
              All jerseys
              <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {HOMEPAGE_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category.slug];
              return (
                <Link
                  key={category.slug}
                  href={`/league/${category.slug}`}
                  className="group relative flex flex-col rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 sm:p-5 text-left shadow-sm ring-0 ring-transparent transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green/30 hover:shadow-md hover:ring-1 hover:ring-brand-green/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green transition-colors duration-200 group-hover:bg-brand-green group-hover:text-white">
                      <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
                    </div>
                    <ChevronRight
                      className="mt-1 h-4 w-4 shrink-0 text-[var(--muted)] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-brand-green"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-4 text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--foreground)] transition-colors group-hover:text-brand-green">
                    {category.label}
                  </h3>
                  <p className="mt-1.5 text-[11px] sm:text-[12px] leading-snug text-[var(--muted)] line-clamp-2">
                    {category.blurb}
                  </p>
                  <span className="mt-4 text-[10px] font-bold uppercase tracking-wider text-brand-green/80 group-hover:text-brand-green">
                    Shop now
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
