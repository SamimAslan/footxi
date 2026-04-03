"use client";

import Link from "next/link";
import { Mail, ShieldCheck, Truck, LifeBuoy } from "lucide-react";
import { leagues, PRICING } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";

const MAIN_LEAGUES = leagues.filter((l) =>
  ["premier-league", "la-liga", "serie-a", "bundesliga", "ligue-1", "super-lig", "international-teams"].includes(
    l.slug
  )
);

export default function Footer() {
  const { formatPrice } = useCurrency();
  return (
    <footer className="mt-auto border-t border-zinc-200/90 bg-[#f0efec] text-[#1a1d24]">
      <div className="border-b border-zinc-200/80 bg-white/80">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4 text-[12px] font-medium text-[#5c6370] sm:justify-between sm:px-8">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#1a1d24]" aria-hidden />
            Secure payment
          </span>
          <span className="inline-flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#1a1d24]" aria-hidden />
            Tracked shipping options
          </span>
          <span className="inline-flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-[#1a1d24]" aria-hidden />
            Product support
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="FootXI" className="h-8 w-auto opacity-90" />
            </Link>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[#5c6370]">
              Boutique-style football kits — clear listings, real photos, and straightforward checkout. Built for fans
              who want a serious shop, not a random listing wall.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="https://www.instagram.com/footxi.official/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[12px] font-medium text-[#1a1d24] transition hover:border-zinc-300"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@footxi"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[12px] font-medium text-[#1a1d24] transition hover:border-zinc-300"
              >
                TikTok
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1a1d24]">Shop</h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link href="/league/jersey" className="text-[13px] text-[#5c6370] transition hover:text-[#1a1d24]">
                    All kits
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="text-[13px] text-[#5c6370] transition hover:text-[#1a1d24]">
                    Search
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="text-[13px] text-[#5c6370] transition hover:text-[#1a1d24]">
                    Cart
                  </Link>
                </li>
                <li>
                  <Link href="/league/retro-kits" className="text-[13px] text-[#5c6370] transition hover:text-[#1a1d24]">
                    Retro
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1a1d24]">Leagues</h3>
              <ul className="mt-4 space-y-2.5">
                {MAIN_LEAGUES.map((league) => (
                  <li key={league.slug}>
                    <Link
                      href={`/league/${league.slug}`}
                      className="text-[13px] text-[#5c6370] transition hover:text-[#1a1d24]"
                    >
                      {league.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1a1d24]">Help & policies</h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link href="/contact" className="text-[13px] text-[#5c6370] transition hover:text-[#1a1d24]">
                    Contact & support
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[13px] text-[#5c6370] transition hover:text-[#1a1d24]">
                    Shipping & returns info
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[13px] text-[#5c6370] transition hover:text-[#1a1d24]">
                    Privacy & terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1a1d24]">From price guide</p>
            <ul className="mt-4 space-y-2 text-[13px]">
              <li className="flex justify-between gap-4">
                <span className="text-[#5c6370]">Fans</span>
                <span className="font-semibold tabular-nums text-[#1a1d24]">{formatPrice(PRICING.fans)}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-[#5c6370]">Player</span>
                <span className="font-semibold tabular-nums text-[#1a1d24]">{formatPrice(PRICING.player)}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-[#5c6370]">Retro</span>
                <span className="font-semibold tabular-nums text-[#1a1d24]">{formatPrice(PRICING.retro)}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-[#5c6370]">Name / number</span>
                <span className="font-semibold tabular-nums text-[#1a1d24]">+{formatPrice(PRICING.customNameNumber)}</span>
              </li>
            </ul>
            <p className="mt-4 text-[11px] leading-relaxed text-[#5c6370]">
              Bulk: 3–6 kits 5% off · 7–15 kits 10% off — applied in cart.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-100 pt-5">
              {["Visa", "MC", "Amex"].map((x) => (
                <span key={x} className="rounded border border-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-[#5c6370]">
                  {x}
                </span>
              ))}
            </div>
            <a
              href="mailto:support@footxi.com"
              className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-[#1a1d24] hover:underline"
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              support@footxi.com
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-[11px] text-[#5c6370]">&copy; {new Date().getFullYear()} FootXI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
