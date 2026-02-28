"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[86vh] sm:min-h-[88vh] flex items-end overflow-hidden bg-[#0D0F14]">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/hero-entry-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-[68%_center] lg:object-[72%_center] opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0F14]/96 via-[#0D0F14]/78 to-[#0D0F14]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14] via-transparent to-[#0D0F14]/40" />
        <div className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-[#0D0F14] to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-end py-14 sm:py-16 lg:py-20">
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">
              FOOTXI · Global Football Store
            </p>

            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.02] tracking-[-0.03em] text-[#F3F4F6] max-w-2xl">
                The #1 Store for
                <br />
                Premium Football Jerseys
              </h1>
              <p className="text-sm sm:text-base text-[#BFC3C9] max-w-xl leading-relaxed">
                Official style kits from top leagues. Fans and Player versions,
                fast worldwide delivery, and premium quality guaranteed.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                "Delivery within 7 to 15 working days",
                "Satisfied or refunded (return within 30 days)",
                "Protection & replacement in case of delivery incident",
              ].map((line) => (
                <div key={line} className="flex items-start gap-2.5 text-sm text-[#D5D7DB]">
                  <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                  <span>{line}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link
                href="/league/premier-league"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gold text-[#0D0F14] font-semibold text-sm tracking-[0.08em] uppercase hover:bg-gold-light transition-all duration-300"
              >
                Shop Football Shirts
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/account"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-white/[0.12] text-[#D1D5DB] font-semibold text-sm tracking-[0.08em] uppercase hover:border-white/30 hover:text-white hover:bg-white/[0.03] transition-all duration-300"
              >
                Track My Order
              </Link>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5" />
        </div>
      </div>
    </section>
  );
}
