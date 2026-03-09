"use client";

import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Truck, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[82vh] sm:min-h-[86vh] flex items-end overflow-hidden bg-[var(--background)]">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/hero-entry-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-[68%_center] lg:object-[72%_center] opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-[var(--background)]/40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-end py-14 sm:py-16 lg:py-20">
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[color:var(--border)] bg-[var(--surface)]/80">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <p className="text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
                New Season Drops Weekly
              </p>
            </div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
              FOOTXI · Global Football Store
            </p>

            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.02] tracking-[-0.03em] text-[var(--foreground)] max-w-2xl">
                Shop Pro-Level
                <br />Football Fits Online
              </h1>
              <p className="text-sm sm:text-base text-[var(--muted)] max-w-xl leading-relaxed">
                A cleaner, faster football shopping experience. Fans, Player, Retro,
                streetwear, and special editions in one storefront.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-2.5">
              {[
                { icon: Truck, text: "7-15 day delivery" },
                { icon: ShieldCheck, text: "Secure checkout" },
                { icon: Check, text: "Easy returns" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5 text-xs sm:text-sm text-[var(--foreground)]/80 bg-[var(--surface)]/80 border border-[color:var(--border)] px-3 py-2 rounded-lg">
                  <item.icon className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link
                href="/league/fan-made"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gold text-[#0D0F14] font-semibold text-sm tracking-[0.08em] uppercase hover:bg-gold-light transition-all duration-300"
              >
                Shop New Arrivals
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/league/premier-league"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[color:var(--border)] text-[var(--foreground)] font-semibold text-sm tracking-[0.08em] uppercase hover:border-gold/40 hover:bg-gold/[0.05] transition-all duration-300"
              >
                Browse League Kits
              </Link>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5" />
        </div>
      </div>
    </section>
  );
}
