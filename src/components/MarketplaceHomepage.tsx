"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Baby,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CloudRainWind,
  Gauge,
  Goal,
  History,
  Layers,
  Palette,
  Search,
  Shirt,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  Product,
  getProductId,
  leagues,
} from "@/data/products";
import HomeTrustBand from "@/components/HomeTrustBand";
import HomeFaqTeaser from "@/components/HomeFaqTeaser";
import PremiumHomeProductCard from "@/components/PremiumHomeProductCard";

/**
 * Hero: `imagePosition` = object-position for object-cover (France = top-weighted).
 * Copy is tuned to match each image and drive clicks to search / collections.
 */
const HERO_SLIDES = [
  {
    eyebrow: "Serie A · derby energy",
    title: "Milan & Inter — kits built for the big nights",
    subtitle:
      "San Siro vibes: home, away and special editions from Italy’s biggest clubs. Same quality story, shipped worldwide.",
    cta: "Shop Serie A & Milan",
    image: "/hero/hero-milan-derby-hd.png",
    imageAlt: "Milan and Inter derby football kits",
    href: "/search?q=Milan+Inter",
    imagePosition: "object-center",
  },
  {
    eyebrow: "Retro & national legends",
    title: "Throwback shirts that still steal the show",
    subtitle:
      "England nights, Barcelona classics and cult seasons — find the retro jersey that gets “where’d you get that?” every time.",
    cta: "Browse retro & England",
    image: "/hero/hero-beckham-hd.png",
    imageAlt: "Retro England and club football jersey",
    href: "/search?q=England+retro",
    imagePosition: "object-center",
  },
  {
    eyebrow: "National team drop",
    title: "France kits — World Cup legacy, today’s cut",
    subtitle:
      "Les Bleus home, away and limited looks for fans who want the real stadium feel — not a generic tee.",
    cta: "Shop France national",
    image: "/hero/hero-france-pogba-hd.png",
    imageAlt: "France national team football kit",
    href: "/search?q=France+national",
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

/** Category tile image wells — plain white */
const CATEGORY_TILE_STYLE: Record<(typeof HOMEPAGE_CATEGORIES)[number]["slug"], string> = {
  jersey: "bg-white",
  windbreaker: "bg-white",
  jackets: "bg-white",
  hoody: "bg-white",
  tracksuit: "bg-white",
  kids: "bg-white",
  "nba-nfl": "bg-white",
  f1: "bg-white",
  "retro-kits": "bg-white",
  "fan-made": "bg-white",
};

/** Pinned featured jerseys (exact DB product name / listing title). */
const FEATURED_EXACT_NAMES = {
  japan: "24/25 Japan Special Edition Fans 1:1 Quality Soccer Jersey",
  barcelona:
    "2008-2009 Retro Barcelona Home Champions League Long sleeve 1:1 Quality Soccer Jersey",
  france: "2006 France Away White Fans 1:1 Quality Retro Soccer Jersey",
} as const;

const FEATURED_KITS_COUNT = 10;

const SHOP_INTENT_LINKS = [
  { label: "All kits", href: "/league/jersey" },
  { label: "Retro kits", href: "/league/retro-kits" },
  { label: "New arrivals", href: "/search?q=kit&new=1" },
  { label: "National teams", href: "/league/international-teams" },
  { label: "Fan made", href: "/league/fan-made" },
  { label: "Kids", href: "/league/kids" },
  { label: "Tracksuits", href: "/league/tracksuit" },
  { label: "Search by club", href: "/search" },
] as const;

const LEAGUE_TAGLINES: Record<string, string> = {
  "premier-league": "Big clubs, current season & throwbacks",
  "la-liga": "Spanish giants and derby kits",
  "serie-a": "Calcio home, away & special editions",
  bundesliga: "Bundesliga staples and fan favourites",
  "ligue-1": "Ligue 1 clubs and limited looks",
  "super-lig": "Süper Lig clubs and Istanbul colours",
  "international-teams": "Country shirts & tournament editions",
  others: "European clubs outside the big five",
};

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

async function fetchHomepageFeaturedKits(): Promise<Product[]> {
  const [
    jExact,
    bExact,
    fExact,
    jpinkList,
    palList,
    flaList,
    brazilList,
    germanyList,
    argentinaList,
    madridList,
    milanList,
    spainList,
  ] = await Promise.all([
    fetchProductByExactName(FEATURED_EXACT_NAMES.japan),
    fetchProductByExactName(FEATURED_EXACT_NAMES.barcelona),
    fetchProductByExactName(FEATURED_EXACT_NAMES.france),
    searchProducts("japan pink", 80),
    searchProducts("palestine", 60),
    searchProducts("flamengo pink", 60),
    searchProducts("brazil", 50),
    searchProducts("germany", 50),
    searchProducts("argentina", 50),
    searchProducts("real madrid", 50),
    searchProducts("milan", 50),
    searchProducts("spain", 50),
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
  push(
    jpinkList.find((p) => isMensFootballJersey(p) && /japan/i.test(p.name) && /pink/i.test(p.name)) ??
      jpinkList.find((p) => isMensFootballJersey(p) && /pink/i.test(p.name))
  );
  push(bExact);
  push(palList.find((p) => isMensFootballJersey(p) && /palestine/i.test(p.name)));
  push(
    flaList.find(
      (p) => isMensFootballJersey(p) && /flamengo/i.test(p.name) && /(pink|pembe)/i.test(p.name)
    ) ?? flaList.find((p) => isMensFootballJersey(p) && /flamengo/i.test(p.name))
  );
  push(fExact);
  push(brazilList.find((p) => isMensFootballJersey(p) && /(brazil|brasil)/i.test(p.name)));
  push(germanyList.find((p) => isMensFootballJersey(p) && /(germany|deutschland)/i.test(p.name)));
  push(argentinaList.find((p) => isMensFootballJersey(p) && /argentina/i.test(p.name)));
  push(madridList.find((p) => isMensFootballJersey(p) && /real\s*madrid/i.test(p.name)));
  push(milanList.find((p) => isMensFootballJersey(p) && /(milan|inter)/i.test(p.name)));
  push(spainList.find((p) => isMensFootballJersey(p) && /\bspain\b|españa|espana/i.test(p.name)));

  if (out.length >= FEATURED_KITS_COUNT) return out.slice(0, FEATURED_KITS_COUNT);

  const pool = (
    await Promise.all([
      searchProducts("japan pink", 40),
      searchProducts("portugal", 40),
      searchProducts("netherlands", 40),
      searchProducts("napoli", 40),
      searchProducts("premier league", 24),
    ])
  )
    .flat()
    .filter(isMensFootballJersey);
  for (const p of pool) {
    push(p);
    if (out.length >= FEATURED_KITS_COUNT) break;
  }
  return out.slice(0, FEATURED_KITS_COUNT);
}

const HOME_LEAGUE_SLUGS = [
  "premier-league",
  "la-liga",
  "serie-a",
  "bundesliga",
  "ligue-1",
  "super-lig",
  "international-teams",
  "others",
] as const;

const WHY_FOOTXI = [
  {
    title: "Real product photos",
    body: "Listings use our own imagery where provided — so you know what the kit looks like before you buy.",
  },
  {
    title: "Clear version labels",
    body: "Fans, player, and retro are called out on every product. No guessing which edition you are getting.",
  },
  {
    title: "Worldwide tracked delivery",
    body: "Shipping options and timelines are shown at checkout, with tracked services where available.",
  },
  {
    title: "Support when you need it",
    body: "Questions on sizing, custom names, or your order? We aim to respond within 24 hours.",
  },
] as const;

export default function MarketplaceHomepage() {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [featuredKits, setFeaturedKits] = useState<Product[]>([]);
  const [justInKits, setJustInKits] = useState<Product[]>([]);
  const [leagueTotals, setLeagueTotals] = useState<Record<string, number>>({});

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
      const [homeFeatured, newestPack] = await Promise.all([
        fetchHomepageFeaturedKits(),
        fetchProducts(
          new URLSearchParams({ league: "jersey", page: "1", limit: "12", sort: "newest" })
        ),
      ]);
      setJustInKits(newestPack.items.filter(isMensFootballJersey).slice(0, 8));

      if (homeFeatured.length >= FEATURED_KITS_COUNT) {
        setFeaturedKits(homeFeatured.slice(0, FEATURED_KITS_COUNT));
        return;
      }

      const fallback = await fetchTrendingMix();
      const merged = [...homeFeatured];
      const seen = new Set(homeFeatured.map((p) => getProductId(p)));
      const seenCore = new Set(
        homeFeatured
          .map((p) => `${p.team} ${p.name}`.toLowerCase())
          .flatMap((txt) => [
            txt.includes("japan") && txt.includes("pink") ? "japan_pink" : "",
            txt.includes("japan") ? "japan" : "",
            txt.includes("barcelona") ? "barcelona" : "",
            txt.includes("palestine") ? "palestine" : "",
            txt.includes("flamengo") ? "flamengo" : "",
            txt.includes("france") ? "france" : "",
            txt.includes("brazil") || txt.includes("brasil") ? "brazil" : "",
            txt.includes("germany") || txt.includes("deutschland") ? "germany" : "",
            txt.includes("argentina") ? "argentina" : "",
            txt.includes("real madrid") ? "madrid" : "",
            /milan|inter/.test(txt) ? "milan" : "",
            txt.includes("spain") ? "spain" : "",
          ])
          .filter(Boolean)
      );
      for (const p of fallback) {
        const id = getProductId(p);
        const txt = `${p.team} ${p.name}`.toLowerCase();
        const key =
          txt.includes("japan") && txt.includes("pink")
            ? "japan_pink"
            : txt.includes("japan")
              ? "japan"
              : txt.includes("barcelona")
                ? "barcelona"
                : txt.includes("palestine")
                  ? "palestine"
                  : txt.includes("flamengo")
                    ? "flamengo"
                    : txt.includes("france")
                      ? "france"
                      : txt.includes("brazil") || txt.includes("brasil")
                        ? "brazil"
                        : txt.includes("germany") || txt.includes("deutschland")
                          ? "germany"
                          : txt.includes("argentina")
                            ? "argentina"
                            : txt.includes("real madrid")
                              ? "madrid"
                              : /milan|inter/.test(txt)
                                ? "milan"
                                : txt.includes("spain")
                                  ? "spain"
                                  : "";
        if (!seen.has(id)) {
          if (key && seenCore.has(key)) continue;
          seen.add(id);
          if (key) seenCore.add(key);
          merged.push(p);
        }
        if (merged.length >= FEATURED_KITS_COUNT) break;
      }
      setFeaturedKits(merged.slice(0, FEATURED_KITS_COUNT));
    }
    init();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        HOME_LEAGUE_SLUGS.map(async (slug) => {
          try {
            const r = await fetch(`/api/products?league=${slug}&page=1&limit=1`);
            const d = (await r.json()) as { total?: number };
            return [slug, typeof d.total === "number" ? d.total : 0] as const;
          } catch {
            return [slug, 0] as const;
          }
        })
      );
      if (!cancelled) setLeagueTotals(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const leagueCards = leagues.filter((l) => HOME_LEAGUE_SLUGS.includes(l.slug as (typeof HOME_LEAGUE_SLUGS)[number]));

  return (
    <div className="bg-[var(--background)]">
      {/* Hero — flush under fixed navbar (no cream strip above); text clears nav via inner padding */}
      <section className="relative -mt-[var(--site-header-height)] w-full min-h-[min(58vh,520px)] sm:min-h-[min(62vh,580px)] lg:min-h-[min(64vh,640px)] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-36 bg-gradient-to-t from-[#07080a] via-[#0c0e12]/95 to-transparent sm:h-40"
          aria-hidden
        />
        <Link href={HERO_SLIDES[bannerIndex].href} className="group block absolute inset-0 z-0">
          <div className="absolute inset-0 z-[1]">
            <Image
              key={HERO_SLIDES[bannerIndex].image}
              src={HERO_SLIDES[bannerIndex].image}
              alt={HERO_SLIDES[bannerIndex].imageAlt}
              fill
              sizes="100vw"
              quality={100}
              priority={bannerIndex === 0}
              unoptimized
              className={`object-cover scale-[1.02] transition-transform duration-[800ms] ease-out group-hover:scale-105 ${HERO_SLIDES[bannerIndex].imagePosition}`}
            />
          </div>
          <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/92 via-black/55 to-black/25 sm:from-black/85 sm:via-black/40 sm:to-transparent" />
          <div
            className="absolute inset-0 z-[2] opacity-40 mix-blend-overlay pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 20% 50%, rgba(47, 93, 64, 0.12) 0%, transparent 55%)",
            }}
            aria-hidden
          />
          <div className="relative z-10 min-h-[min(58vh,520px)] sm:min-h-[min(62vh,580px)] lg:min-h-[min(64vh,640px)] max-w-[1600px] mx-auto flex flex-col justify-center items-start px-4 pb-20 pt-[calc(var(--site-header-height)+2.5rem)] sm:px-8 sm:pb-24 sm:pt-[calc(var(--site-header-height)+3rem)] lg:px-12">
            <p className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-white/55 font-semibold">
              <span className="h-px w-6 bg-white/35" aria-hidden />
              {HERO_SLIDES[bannerIndex].eyebrow}
            </p>
            <h2 className="mt-5 max-w-[20rem] sm:max-w-2xl lg:max-w-3xl text-left text-[32px] sm:text-[44px] lg:text-[56px] leading-[1.02] font-display font-bold tracking-[-0.03em] text-gradient-hero">
              {HERO_SLIDES[bannerIndex].title}
            </h2>
            <p className="mt-5 max-w-md sm:max-w-xl text-[15px] sm:text-[17px] text-white/75 leading-relaxed border-l-2 border-white/20 pl-4 sm:pl-5">
              {HERO_SLIDES[bannerIndex].subtitle}
            </p>
            <span className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-green px-7 sm:px-9 py-3.5 text-[12px] sm:text-[13px] font-bold tracking-wide text-white shadow-glow-mint transition-opacity duration-200 group-hover:opacity-95">
              {HERO_SLIDES[bannerIndex].cta}
              <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} aria-hidden />
            </span>
          </div>
        </Link>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setBannerIndex(i);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${i === bannerIndex ? "w-10 bg-white/90" : "w-2 bg-white/35 hover:bg-white/55"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goPrevBanner}
          className="absolute left-3 sm:left-6 top-1/2 z-20 -translate-y-1/2 w-11 h-11 rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md hover:bg-black/65 flex items-center justify-center shadow-lg transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={goNextBanner}
          className="absolute right-3 sm:right-6 top-1/2 z-20 -translate-y-1/2 w-11 h-11 rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md hover:bg-black/65 flex items-center justify-center shadow-lg transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[12] h-[clamp(3.5rem,9vw,6rem)] bg-gradient-to-b from-[#050607] via-[#0c0e12] to-[#f4f3f0]"
          style={{ clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0 100%)" }}
          aria-hidden
        />
      </section>

      <div>
        <HomeTrustBand />

        {/* Shop by intent */}
        <section className="border-b border-[var(--store-border)] bg-[var(--store-bg)]">
          <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--store-text)] sm:text-3xl">Shop faster</h2>
            <p className="mt-2 max-w-xl text-[15px] text-[var(--store-text-secondary)]">
              Browse by type, league, or latest drops — one tap each.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {SHOP_INTENT_LINKS.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-[var(--store-border)] bg-[var(--store-surface)] px-5 py-3 text-[14px] font-semibold text-[var(--store-text)] shadow-[0_2px_12px_rgba(26,29,36,0.06)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_12px_32px_-8px_rgba(26,29,36,0.12)]"
                >
                  {link.label === "Search by club" ? <Search className="h-4 w-4 opacity-60" aria-hidden /> : null}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Best sellers */}
        <section className="bg-[var(--store-bg)]">
          <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--store-text-secondary)]">
                  Best sellers
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--store-text)] sm:text-3xl">
                  Popular right now
                </h2>
                <p className="mt-2 max-w-lg text-sm text-[var(--store-text-secondary)]">
                  Same quality story on every card — open any kit for full details and checkout.
                </p>
              </div>
              <Link
                href="/league/jersey"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--store-text)] underline-offset-4 hover:underline"
              >
                Shop all football kits
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            {featuredKits.length > 0 ? (
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {featuredKits.map((p) => (
                  <PremiumHomeProductCard key={getProductId(p)} product={p} />
                ))}
              </div>
            ) : (
              <p className="mt-10 rounded-[22px] border border-[var(--store-border)] bg-[var(--store-surface)] px-4 py-10 text-center text-sm text-[var(--store-text-secondary)]">
                Loading picks… browse by league below if this takes a moment.
              </p>
            )}
          </div>
        </section>

        {/* New arrivals — editorial split */}
        {justInKits.length > 0 ? (
          <section className="border-y border-[var(--store-border)] bg-[var(--store-surface)]">
            <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--store-accent-gold)]">
                    Latest additions
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--store-text)] sm:text-3xl">
                    New arrivals
                  </h2>
                  <p className="mt-2 text-sm text-[var(--store-text-secondary)]">Fresh football jerseys just added to the catalogue.</p>
                </div>
                <Link
                  href="/search?q=kit&new=1"
                  className="text-sm font-semibold text-[var(--store-text)] underline-offset-4 hover:underline"
                >
                  View all new →
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <div className="lg:min-h-0">
                  <PremiumHomeProductCard product={justInKits[0]} size="large" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {justInKits.slice(1, 5).map((p) => (
                    <PremiumHomeProductCard key={getProductId(p)} product={p} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Leagues */}
        <section className="bg-[var(--store-bg)]">
          <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--store-text)] sm:text-3xl">Shop by league</h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--store-text-secondary)]">
              Competition hubs with filters and the same premium cards as the rest of the store.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {leagueCards.map((league) => {
                const total = leagueTotals[league.slug];
                const line = LEAGUE_TAGLINES[league.slug] ?? "Club and national kits";
                return (
                  <Link
                    key={league.slug}
                    href={`/league/${league.slug}`}
                    className="group relative flex flex-col overflow-hidden rounded-[22px] border border-[var(--store-border)] bg-[var(--store-surface)] p-5 shadow-[0_4px_20px_rgba(26,29,36,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_-12px_rgba(26,29,36,0.1)]"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.07]"
                      style={{
                        backgroundImage: `radial-gradient(circle at 80% 20%, #1a1d24 0%, transparent 55%)`,
                      }}
                      aria-hidden
                    />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--store-border)] bg-[var(--store-muted-bg)] transition-transform duration-300 group-hover:scale-105">
                      {league.logo ? (
                        <img
                          src={league.logo}
                          alt=""
                          className={`max-h-[80%] max-w-[80%] object-contain ${league.slug === "international-teams" ? "scale-110" : ""}`}
                        />
                      ) : null}
                    </div>
                    <span className="relative mt-5 text-lg font-bold text-[var(--store-text)]">{league.name}</span>
                    <span className="relative mt-2 text-[13px] leading-snug text-[var(--store-text-secondary)]">{line}</span>
                    <span className="relative mt-3 text-[12px] font-medium tabular-nums text-[var(--store-text-secondary)]">
                      {typeof total === "number" && total > 0 ? `${total} kits` : "Browse collection"}
                    </span>
                    <span className="relative mt-4 text-[12px] font-semibold text-[var(--store-text)] underline-offset-2 group-hover:underline">
                      View collection →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-t border-[var(--store-border)] bg-[var(--store-surface)]">
          <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--store-text)] sm:text-3xl">Shop by category</h2>
            <p className="mt-2 text-sm text-[var(--store-text-secondary)]">Layers, kids, and crossover sports — each aisle has its own filter set.</p>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {HOMEPAGE_CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICONS[category.slug];
                const grad = CATEGORY_TILE_STYLE[category.slug];
                return (
                  <Link
                    key={category.slug}
                    href={`/league/${category.slug}`}
                    className="group flex flex-col overflow-hidden rounded-[22px] border border-[var(--store-border)] bg-[var(--store-surface)] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div
                      className={`relative flex aspect-[5/3] items-center justify-center ${grad} overflow-hidden`}
                    >
                      <Icon
                        className="h-14 w-14 text-[#1a1d24]/25 transition-transform duration-300 group-hover:scale-110"
                        strokeWidth={1.25}
                        aria-hidden
                      />
                    </div>
                    <div className="p-4 sm:p-5">
                      <span className="text-[15px] font-bold text-[var(--store-text)]">{category.label}</span>
                      <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[var(--store-text-secondary)]">{category.blurb}</p>
                      <span className="mt-4 inline-flex text-[12px] font-semibold text-[var(--store-text)]">
                        Explore {category.label.toLowerCase()} →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why FootXI */}
        <section className="border-t border-[var(--store-border)] bg-[var(--store-bg)]">
          <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
            <h2 className="text-center font-display text-2xl font-bold tracking-tight text-[var(--store-text)] sm:text-3xl">
              Why shop with FootXI
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm text-[var(--store-text-secondary)]">
              We are not a random listing wall — we are set up like a real football store.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {WHY_FOOTXI.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-[var(--store-border)] bg-[var(--store-surface)] p-6 shadow-[0_2px_16px_rgba(26,29,36,0.04)]"
                >
                  <CircleCheck className="h-6 w-6 text-[var(--store-text)]" strokeWidth={1.5} aria-hidden />
                  <h3 className="mt-4 text-[16px] font-bold text-[var(--store-text)]">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--store-text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <HomeFaqTeaser />

        {/* Search CTA */}
        <section className="border-t border-[var(--store-border)] bg-[var(--store-bg)] pb-16 pt-12 sm:pb-20">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="rounded-[24px] border border-[var(--store-border)] bg-[var(--store-surface)] px-6 py-12 text-center shadow-[0_8px_40px_-12px_rgba(26,29,36,0.08)] sm:px-12 sm:py-14">
              <h2 className="font-display text-xl font-bold text-[var(--store-text)] sm:text-2xl">Find your kit</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--store-text-secondary)]">
                Search by club, season, retro, or league — every word must appear in the product title.
              </p>
              <Link
                href="/search"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--store-cta)] px-10 py-4 text-sm font-semibold text-white transition hover:bg-[var(--store-cta-hover)]"
              >
                <Search className="h-4 w-4" aria-hidden />
                Open search
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
