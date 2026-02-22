"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { leagues } from "@/data/products";

const leagueColors: Record<string, { bg: string; text: string }> = {
  "la-liga": { bg: "group-hover:bg-red-500/[0.03]", text: "text-red-400/60" },
  "premier-league": {
    bg: "group-hover:bg-purple-500/[0.03]",
    text: "text-purple-400/60",
  },
  "serie-a": {
    bg: "group-hover:bg-blue-500/[0.03]",
    text: "text-blue-400/60",
  },
  bundesliga: {
    bg: "group-hover:bg-red-600/[0.03]",
    text: "text-red-400/60",
  },
  "ligue-1": {
    bg: "group-hover:bg-blue-400/[0.03]",
    text: "text-blue-400/60",
  },
  "super-lig": {
    bg: "group-hover:bg-red-500/[0.03]",
    text: "text-red-400/60",
  },
  "primeira-liga": {
    bg: "group-hover:bg-green-500/[0.03]",
    text: "text-green-400/60",
  },
  eredivisie: {
    bg: "group-hover:bg-orange-500/[0.03]",
    text: "text-orange-400/60",
  },
};

export default function LeagueSection() {
  return (
    <section id="leagues" className="relative overflow-hidden bg-[#0D0F14]">
      <div className="py-28 sm:py-36 relative">
        {/* Giant background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-display font-bold text-white/[0.015] whitespace-nowrap select-none pointer-events-none tracking-[-0.04em]">
          LEAGUES
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-14 bg-gold" />
              <span className="text-[11px] font-semibold tracking-[0.3em] text-gold uppercase">
                Explore
              </span>
            </div>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-[#F3F4F6] tracking-[-0.03em] leading-[0.9]">
              Browse by
              <br />
              <span className="text-[#9CA3AF]/40">League</span>
            </h2>
          </div>

          {/* League rows */}
          <div className="space-y-0">
            {leagues.map((league, i) => {
              const colors = leagueColors[league.slug] || {
                bg: "group-hover:bg-white/[0.01]",
                text: "text-white/30",
              };

              return (
                <Link
                  key={league.slug}
                  href={`/league/${league.slug}`}
                  className={`group relative flex items-center justify-between py-7 sm:py-9 border-b border-white/[0.04] hover:border-gold/[0.15] transition-all duration-500 ${
                    i === 0 ? "border-t" : ""
                  } ${colors.bg}`}
                >
                  {/* Background league name */}
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden">
                    <span
                      className={`font-display text-[5vw] sm:text-[4vw] font-bold ${colors.text} opacity-0 group-hover:opacity-[0.15] translate-x-4 group-hover:translate-x-0 transition-all duration-700 ease-out tracking-[-0.02em] block`}
                    >
                      {league.name.toUpperCase()}
                    </span>
                  </div>

                  {/* Gold underline slide-in */}
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-gold/40 via-gold/20 to-transparent transition-all duration-700 ease-out" />

                  <div className="flex items-center gap-8 sm:gap-12 relative z-10 group-hover:translate-x-2.5 transition-transform duration-500 ease-out">
                    {/* Number */}
                    <span className="text-[11px] font-mono text-[#9CA3AF]/30 hidden sm:block w-6 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* League info */}
                    <div>
                      <h3 className="font-display text-2xl sm:text-4xl font-bold text-[#9CA3AF] group-hover:text-[#F3F4F6] transition-colors duration-500 tracking-[-0.02em]">
                        {league.name.toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[11px] text-[#9CA3AF]/50 tracking-wide">
                          {league.country}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/[0.1]" />
                        <span className="text-[11px] text-[#9CA3AF]/50 tracking-wide">
                          {league.teams.length} teams
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right - Arrow only */}
                  <div className="relative z-10">
                    <div className="w-10 h-10 border border-white/[0.06] flex items-center justify-center group-hover:border-gold/20 group-hover:bg-gold/[0.04] transition-all duration-500">
                      <ArrowRight className="w-4 h-4 text-[#9CA3AF]/40 group-hover:text-gold group-hover:translate-x-1 transition-all duration-500" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
