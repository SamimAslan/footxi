"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { leagues } from "@/data/products";

export default function MiniLeagueGrid() {
  const homepageLeagues = leagues.slice(0, 8);

  return (
    <section id="leagues" className="relative bg-[#0D0F14]">
      <div className="relative pb-28 sm:pb-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-8 sm:mb-10 flex items-end justify-between gap-4">
            <h3 className="text-[11px] font-semibold tracking-[0.24em] text-[#9CA3AF]/65 uppercase">
              Browse by League
            </h3>
            <Link
              href="/league/premier-league"
              className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#9CA3AF] hover:text-gold transition-colors duration-300 uppercase"
            >
              Browse all leagues
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
            {homepageLeagues.map((league) => (
              <Link
                key={league.slug}
                href={`/league/${league.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.01] px-3.5 py-3 sm:px-4 sm:py-3.5 hover:border-gold/[0.25] hover:bg-gold/[0.03] transition-all duration-300"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center">
                  {league.logo ? (
                    <img
                      src={league.logo}
                      alt={`${league.name} logo`}
                      className="w-full h-full object-contain opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  ) : (
                    <span className="text-[10px] font-semibold text-[#9CA3AF]/70 tracking-wider">
                      {league.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-[12px] sm:text-[13px] text-[#D1D5DB]/85 group-hover:text-[#F3F4F6] transition-colors duration-300 truncate">
                  {league.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
