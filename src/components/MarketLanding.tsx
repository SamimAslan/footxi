"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Flame,
  Sparkles,
  Truck,
  ShieldCheck,
  Percent,
} from "lucide-react";

const QUICK_CATEGORIES = [
  { label: "New In", href: "/league/fan-made" },
  { label: "Best Seller", href: "/league/premier-league" },
  { label: "Retro", href: "/league/serie-a" },
  { label: "Player Version", href: "/league/la-liga" },
  { label: "Budget Picks", href: "/league/others" },
];

export default function MarketLanding() {
  return (
    <section className="relative bg-[var(--background)] border-b border-[color:var(--border)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-10 sm:pt-12 pb-10 sm:pb-12">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5 sm:p-7 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-56 h-56 rounded-full bg-black/[0.03] blur-3xl pointer-events-none" />

          <div className="relative flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase rounded-full border border-gold/25 bg-gold/10 text-gold">
              <Flame className="w-3.5 h-3.5" />
              Hot Deals
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase rounded-full border border-[color:var(--border)] bg-[var(--surface-muted)] text-[var(--muted)]">
              <BadgePercent className="w-3.5 h-3.5" />
              3-6 Kits: 5% OFF
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase rounded-full border border-[color:var(--border)] bg-[var(--surface-muted)] text-[var(--muted)]">
              <Sparkles className="w-3.5 h-3.5" />
              Weekly Drops
            </span>
          </div>

          <div className="relative grid lg:grid-cols-12 gap-6 mb-6">
            <div className="lg:col-span-8">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
                FootXI Market
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[var(--muted)] max-w-2xl">
                Shop football kits like a real marketplace: new arrivals, best sellers,
                retro finds, and special drops in one place.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-muted)] border border-[color:var(--border)] text-xs text-[var(--foreground)]">
                  <Truck className="w-3.5 h-3.5 text-gold" />
                  Fast shipping
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-muted)] border border-[color:var(--border)] text-xs text-[var(--foreground)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                  Protected checkout
                </span>
              </div>
            </div>
            <div className="lg:col-span-4 grid grid-cols-2 gap-2.5 h-fit">
              <div className="col-span-2 rounded-xl border border-gold/25 bg-gold/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold font-semibold">
                  Today Offer
                </p>
                <p className="text-lg font-display font-bold text-[var(--foreground)] mt-1">
                  Extra 10% OFF
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  7-15 kits in one order
                </p>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Drop</p>
                <p className="text-sm font-semibold text-[var(--foreground)] mt-1">Weekly</p>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Saving</p>
                <p className="text-sm font-semibold text-[var(--foreground)] mt-1">Up to 10%</p>
              </div>
            </div>
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2.5">
              {QUICK_CATEGORIES.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-[var(--foreground)] border border-[color:var(--border)] bg-[var(--surface-muted)] hover:border-gold/35 hover:bg-gold/[0.08] transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link
              href="/league/fan-made"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gold text-[#0D0F14] text-sm font-semibold tracking-[0.08em] uppercase hover:bg-gold-light transition-colors"
            >
              <Percent className="w-4 h-4" />
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
