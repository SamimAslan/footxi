"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
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
  Truck,
  Shield,
  Sparkles,
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

/** Pinned featured jerseys (exact DB product name / listing title). */
const FEATURED_EXACT_NAMES = {
  japan: "24/25 Japan Special Edition Fans 1:1 Quality Soccer Jersey",
  barcelona:
    "2008-2009 Retro Barcelona Home Champions League Long sleeve 1:1 Quality Soccer Jersey",
  france: "2006 France Away White Fans 1:1 Quality Retro Soccer Jersey",
} as const;

const FEATURED_KITS_COUNT = 10;

const FEATURED_SIDEBAR_SHORTCUTS = [
  { label: "Retro kits", href: "/league/retro-kits", hint: "Throwbacks & classics" },
  { label: "National teams", href: "/league/international-teams", hint: "Country shirts" },
  { label: "Japan & specials", href: "/search?q=japan", hint: "Limited looks" },
  { label: "New arrivals", href: "/search?q=jersey&new=1", hint: "Recently listed" },
  { label: "Fan-made drops", href: "/league/fan-made", hint: "Supporter editions" },
] as const;

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

function ProductTile({
  product,
  badge,
  onAdd,
  variant = "default",
}: {
  product: Product;
  badge?: string;
  onAdd: (p: Product) => void;
  variant?: "default" | "spotlight";
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

  const spotlight = variant === "spotlight";

  return (
    <Link
      href={`/product/${getProductId(product)}`}
      className="group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--brand-green)_35%,transparent)] hover:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
    >
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-b from-[#161b22] via-[var(--surface)] to-[var(--background)] ${
          spotlight
            ? "h-[clamp(200px,42vw,300px)] sm:h-[clamp(220px,38vw,320px)] lg:h-[clamp(240px,32vw,340px)]"
            : "h-[clamp(150px,38vw,200px)] sm:h-[clamp(160px,34vw,220px)] lg:h-[200px]"
        }`}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03] ${
              spotlight ? "p-1.5 sm:p-2" : "p-1 sm:p-1.5"
            }`}
          />
        ) : null}
        {badge ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-green text-white shadow-glow-mint">
            {badge}
          </span>
        ) : null}
      </div>
      <div className={`flex min-h-0 flex-1 flex-col space-y-1.5 ${spotlight ? "p-3 sm:p-4" : "p-2.5 sm:p-3"}`}>
        <p
          className={`font-bold text-white line-clamp-2 ${spotlight ? "font-display text-base sm:text-lg leading-snug" : "text-[13px] sm:text-[14px] line-clamp-1"}`}
        >
          {displayTeam}
        </p>
        <p className="text-[10px] tracking-[0.14em] text-[var(--muted)]">
          {getKitVersionDisplayLabel(product)}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p
            className={`font-bold font-display text-[var(--foreground)] tabular-nums ${spotlight ? "text-lg sm:text-xl" : "text-[16px] sm:text-[17px]"}`}
          >
            {formatPrice(price)}
          </p>
          <div className={`inline-flex shrink-0 items-center gap-1 text-[var(--muted)] ${spotlight ? "text-[11px]" : "text-[11px]"}`}>
            <Star className={`text-white fill-white/90 ${spotlight ? "h-3.5 w-3.5" : "h-3.5 w-3.5"}`} />
            {rating}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAdd(product);
            setJustAdded(true);
          }}
          className={`mt-auto w-full rounded-full font-bold uppercase tracking-wide transition-all duration-200 active:scale-[0.98] ${spotlight ? "h-10 text-[11px] sm:h-11 sm:text-xs" : "h-9 text-[11px]"} ${
            justAdded
              ? "bg-brand-green text-white shadow-glow-mint"
              : "bg-brand-green text-white hover:bg-brand-green-dark shadow-glow-mint"
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
  const [featuredKits, setFeaturedKits] = useState<Product[]>([]);

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
      const homeFeatured = await fetchHomepageFeaturedKits();
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
      {/* Hero — muted accents */}
      <section className="relative w-full min-h-[min(58vh,520px)] sm:min-h-[min(62vh,580px)] lg:min-h-[min(64vh,640px)] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-24 bg-gradient-to-t from-[var(--background)] to-transparent"
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
          <div className="relative z-10 min-h-[min(58vh,520px)] sm:min-h-[min(62vh,580px)] lg:min-h-[min(64vh,640px)] max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col justify-center items-start py-20 sm:py-24">
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
            <p className="mt-4 text-[11px] sm:text-[12px] text-white/45 max-w-sm">
              Tap anywhere on the hero — same destination as the button.
            </p>
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
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[12] h-[clamp(3rem,8vw,5rem)] bg-[var(--background)]"
          style={{ clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0 100%)" }}
          aria-hidden
        />
      </section>

      {/* ——— Below hero: editorial layout (not a flat product grid) ——— */}
      <div className="pb-14 sm:pb-20">
        {/* Featured — magazine block + bento */}
        <section className="relative border-y border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_35%,var(--background))] py-12 sm:py-16 lg:py-20">
          <span
            className="pointer-events-none absolute right-2 top-6 select-none font-display text-[clamp(5rem,18vw,12rem)] font-bold leading-none text-white/[0.04] sm:right-8 lg:top-10"
            aria-hidden
          >
            01
          </span>
          <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <header className="mb-10 max-w-2xl lg:mb-14">
              <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-[var(--muted)]">
                Curated picks
              </p>
              <h2 className="mt-3 font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-bold leading-[0.98] tracking-tight text-white">
                Featured kits
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                One lead piece, then a tight pair and the rest in a clean row — same stock, less “catalog wall”.
              </p>
              <Link
                href="/search"
                className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80 transition hover:text-white"
              >
                Browse everything
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              </Link>
            </header>

            {featuredKits.length > 0 ? (
              <div className="space-y-8 lg:space-y-10">
                {featuredKits.length === 1 ? (
                  <div className="mx-auto max-w-lg lg:max-w-2xl">
                    <ProductTile product={featuredKits[0]} onAdd={addQuick} variant="spotlight" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12 lg:gap-6">
                      <div className="lg:col-span-5">
                        <ProductTile product={featuredKits[0]} onAdd={addQuick} variant="spotlight" />
                      </div>
                      <div className="flex flex-col gap-4 lg:col-span-3 lg:gap-6">
                        {featuredKits.slice(1, 3).map((p) => (
                          <ProductTile key={getProductId(p)} product={p} onAdd={addQuick} />
                        ))}
                      </div>
                      <aside className="relative hidden h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-gradient-to-b from-[var(--surface-muted)]/55 via-[var(--surface)] to-[var(--background)] p-6 sm:p-7 lg:col-span-4 lg:flex">
                        <div
                          className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 font-display text-[8rem] font-bold leading-none text-white/[0.04] sm:text-[9rem]"
                          aria-hidden
                        >
                          FX
                        </div>

                        <div className="relative">
                          <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-green)]">
                            <Sparkles className="h-3.5 w-3.5 opacity-80" aria-hidden />
                            From the edit
                          </p>
                          <p className="mt-4 font-display text-lg leading-snug text-white sm:text-xl">
                            Retro grails, national drops, and club staples — we rotate this row as new lines land.
                          </p>
                          <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">
                            Use the shortcuts below to skip straight into the aisles that match how you browse.
                          </p>
                        </div>

                        <nav
                          className="relative mt-8 flex flex-1 flex-col border-t border-[color:var(--border)] pt-6 min-h-[200px]"
                          aria-label="Quick shop links"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                            Shortcuts
                          </p>
                          <ul className="mt-4 flex flex-1 flex-col gap-1">
                            {FEATURED_SIDEBAR_SHORTCUTS.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  className="group flex items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-[color:var(--border)] hover:bg-[var(--background)]/60"
                                >
                                  <span>
                                    <span className="block text-[13px] font-semibold text-white group-hover:text-white">
                                      {item.label}
                                    </span>
                                    <span className="mt-0.5 block text-[11px] text-[var(--muted)]">{item.hint}</span>
                                  </span>
                                  <ChevronRight
                                    className="h-4 w-4 shrink-0 text-[var(--muted)] opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-white"
                                    aria-hidden
                                  />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </nav>

                        <div className="relative mt-6 space-y-3 border-t border-[color:var(--border)] pt-6">
                          <div className="flex gap-3 text-[12px] leading-snug text-[var(--muted)]">
                            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-green)]/80" aria-hidden />
                            <span>Worldwide shipping — rates and times at checkout.</span>
                          </div>
                          <div className="flex gap-3 text-[12px] leading-snug text-[var(--muted)]">
                            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-green)]/80" aria-hidden />
                            <span>Clear listings: fans, player, and retro called out on each product.</span>
                          </div>
                        </div>

                        <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-[color:var(--border)] pt-6">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                            FootXI edit
                          </p>
                          <Link
                            href="/search"
                            className="text-[11px] font-semibold text-white/70 underline-offset-4 transition hover:text-white hover:underline"
                          >
                            Full catalogue
                          </Link>
                        </div>
                      </aside>
                    </div>
                    {featuredKits.length > 3 ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                        {featuredKits.slice(3).map((p) => (
                          <ProductTile key={getProductId(p)} product={p} onAdd={addQuick} />
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
          </div>
        </section>

        {/* Leagues — horizontal filmstrip */}
        <section className="mx-auto max-w-[1600px] px-4 pt-12 sm:px-6 sm:pt-16 lg:px-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">Competitions</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Browse by league
              </h2>
            </div>
            <span className="hidden text-[10px] font-medium uppercase tracking-widest text-[var(--muted)] sm:block">
              Scroll →
            </span>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 pt-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
            {leagueCards.map((league) => (
              <Link
                key={league.slug}
                href={`/league/${league.slug}`}
                className="snap-start shrink-0 w-[108px] sm:w-[120px] flex flex-col items-center gap-3 rounded-3xl border border-[color:var(--border)] bg-[var(--surface)] px-3 py-5 text-center shadow-sm transition hover:border-white/12 hover:bg-[var(--surface-muted)]"
              >
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[color:var(--border)] bg-[var(--background)] p-2">
                  {league.logo ? (
                    <img
                      src={league.logo}
                      alt=""
                      className={`max-h-full max-w-full object-contain ${
                        league.slug === "international-teams" ? "scale-110" : ""
                      }`}
                    />
                  ) : null}
                </div>
                <span className="text-[10px] font-semibold leading-tight text-white/90 line-clamp-2 min-h-[2.5em]">
                  {league.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories — sticky editorial column + staggered grid */}
        <section className="mt-14 border-t border-[color:var(--border)] pt-14 sm:mt-16 sm:pt-16">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="xl:grid xl:grid-cols-12 xl:items-start xl:gap-14">
              <div className="xl:sticky xl:top-[calc(var(--site-header-height)+1.25rem)] xl:col-span-4 xl:self-start">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">Directory</p>
                <h2 className="mt-3 max-w-xs font-display text-[clamp(2rem,4vw,2.75rem)] font-bold leading-[1.05] tracking-tight text-white">
                  Shop by category
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
                  Same departments as the nav — jerseys, layers, kids, and crossover sports — laid out so you can scan in one pass.
                </p>
                <Link
                  href="/league/jersey"
                  className="group mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/85 transition hover:text-white"
                >
                  All jerseys
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:col-span-8 xl:mt-0">
                {HOMEPAGE_CATEGORIES.map((category, index) => {
                  const Icon = CATEGORY_ICONS[category.slug];
                  const stagger = index % 2 === 1;
                  return (
                    <Link
                      key={category.slug}
                      href={`/league/${category.slug}`}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-gradient-to-br from-[var(--surface-muted)]/70 via-[var(--surface)] to-[#0a0c10] p-5 text-left shadow-md transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--brand-green)_30%,transparent)] hover:shadow-lg sm:min-h-[148px] ${stagger ? "sm:mt-8 xl:mt-10" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--brand-green)_10%,transparent)] text-[var(--muted)] ring-1 ring-[color:var(--border)] transition duration-300 group-hover:bg-[var(--brand-green)] group-hover:text-white group-hover:ring-transparent">
                          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                        </div>
                        <span
                          className="font-display text-3xl font-bold tabular-nums text-white/[0.07] transition group-hover:text-white/[0.11]"
                          aria-hidden
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--foreground)] group-hover:text-white">
                        {category.label}
                      </h3>
                      <p className="mt-2 text-[12px] leading-relaxed text-[var(--muted)] line-clamp-2 sm:line-clamp-3">
                        {category.blurb}
                      </p>
                      <span className="mt-auto pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-white/60">
                        Enter →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
