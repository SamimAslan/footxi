"use client";

import Link from "next/link";
import { Mail, Truck, Shield, CreditCard } from "lucide-react";
import { leagues, PRICING } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";

export default function Footer() {
  const { formatPrice } = useCurrency();
  return (
    <footer className="bg-[var(--surface)] border-t border-[color:var(--border)] mt-auto">
      <div className="border-b border-[color:var(--border)] bg-[var(--surface-muted)]/60">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-[color:var(--border)] bg-[var(--surface)] shrink-0">
                <Truck className="w-[18px] h-[18px] text-brand-green" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--foreground)]">Worldwide shipping</p>
                <p className="text-[12px] text-[var(--muted)] mt-0.5 leading-snug">
                  Express and standard delivery options at checkout.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-[color:var(--border)] bg-[var(--surface)] shrink-0">
                <Shield className="w-[18px] h-[18px] text-brand-green" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--foreground)]">Quality focused</p>
                <p className="text-[12px] text-[var(--muted)] mt-0.5 leading-snug">
                  Carefully sourced kits and clear product details.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-[color:var(--border)] bg-[var(--surface)] shrink-0">
                <CreditCard className="w-[18px] h-[18px] text-brand-green" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--foreground)]">Secure payment</p>
                <p className="text-[12px] text-[var(--muted)] mt-0.5 leading-snug">
                  Encrypted checkout with trusted providers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="FOOTXI" className="h-7 w-auto" />
            </Link>
            <p className="mt-4 text-[13px] text-[var(--muted)] leading-relaxed max-w-sm">
              Premium football kits from major leagues. Fans, player, and retro kits — built for supporters who want a
              clear, simple shop experience.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[13px] text-[var(--muted)]">
              <Mail className="w-4 h-4 shrink-0" />
              <a href="mailto:support@footxi.com" className="hover:text-brand-green transition-colors">
                support@footxi.com
              </a>
            </div>
            <div className="mt-5">
              <p className="text-[11px] font-semibold text-[var(--foreground)] uppercase tracking-[0.16em]">Follow</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href="https://www.instagram.com/footxi.official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[color:var(--border)] text-[12px] text-[var(--muted)] hover:text-brand-green hover:border-brand-green/35 transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://www.tiktok.com/@footxi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[color:var(--border)] text-[12px] text-[var(--muted)] hover:text-brand-green hover:border-brand-green/35 transition-colors"
                >
                  TikTok
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-brand-green mb-4 uppercase tracking-[0.16em]">
              Leagues
            </h3>
            <ul className="space-y-2.5">
              {leagues.slice(0, 6).map((league) => (
                <li key={league.slug}>
                  <Link
                    href={`/league/${league.slug}`}
                    className="text-[13px] text-[var(--muted)] hover:text-brand-green transition-colors"
                  >
                    {league.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-brand-green mb-4 uppercase tracking-[0.16em]">
              Shop
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-[13px] text-[var(--muted)] hover:text-brand-green transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-[13px] text-[var(--muted)] hover:text-brand-green transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-[13px] text-[var(--muted)] hover:text-brand-green transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[13px] text-[var(--muted)] hover:text-brand-green transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-brand-green mb-4 uppercase tracking-[0.16em]">
              From price guide
            </h3>
            <ul className="space-y-2.5 text-[13px]">
              <li className="flex justify-between gap-4">
                <span className="text-[var(--muted)]">Fans version</span>
                <span className="font-medium text-[var(--foreground)] tabular-nums">{formatPrice(PRICING.fans)}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-[var(--muted)]">Player version</span>
                <span className="font-medium text-[var(--foreground)] tabular-nums">{formatPrice(PRICING.player)}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-[var(--muted)]">Retro kit</span>
                <span className="font-medium text-[var(--foreground)] tabular-nums">{formatPrice(PRICING.retro)}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-[var(--muted)]">Custom name/no.</span>
                <span className="font-medium text-[var(--foreground)] tabular-nums">+{formatPrice(PRICING.customNameNumber)}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-[var(--muted)]">Arm badge</span>
                <span className="font-medium text-[var(--foreground)] tabular-nums">{formatPrice(PRICING.badgePrice)}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[color:var(--border)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-[var(--muted)]">&copy; {new Date().getFullYear()} FootXI. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] text-[var(--muted)]">
              <span>Bulk: 3–6 kits 5% off</span>
              <span>7–15 kits 10% off</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
