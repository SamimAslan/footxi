"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { leagues } from "@/data/products";

const leagueAccents: Record<string, string> = {
  "la-liga": "group-hover:border-red-500/30",
  "premier-league": "group-hover:border-purple-500/30",
  "serie-a": "group-hover:border-blue-500/30",
  "bundesliga": "group-hover:border-red-600/30",
  "ligue-1": "group-hover:border-blue-400/30",
  "super-lig": "group-hover:border-red-500/30",
  "primeira-liga": "group-hover:border-green-500/30",
  "eredivisie": "group-hover:border-orange-500/30",
};

const leagueNumbers: Record<string, string> = {
  "la-liga": "01",
  "premier-league": "02",
  "serie-a": "03",
  "bundesliga": "04",
  "ligue-1": "05",
  "super-lig": "06",
  "primeira-liga": "07",
  "eredivisie": "08",
};

export default function LeagueSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Top gradient from marquee */}
      <div className="h-24 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-950" />

      <div className="py-24 bg-zinc-950 relative">
      {/* Background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.01] whitespace-nowrap select-none pointer-events-none">
        LEAGUES
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-amber-400" />
            <span className="text-[10px] font-semibold tracking-[0.3em] text-amber-400 uppercase">
              Explore
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            BROWSE BY
            <br />
            <span className="text-zinc-600">LEAGUE</span>
          </h2>
        </div>

        {/* League list - editorial style */}
        <div className="space-y-0">
          {leagues.map((league, i) => (
            <Link
              key={league.slug}
              href={`/league/${league.slug}`}
              className={`group flex items-center justify-between py-6 sm:py-8 border-b border-white/[0.04] hover:border-amber-400/20 transition-all duration-300 ${
                i === 0 ? "border-t" : ""
              }`}
            >
              <div className="flex items-center gap-6 sm:gap-10">
                {/* Number */}
                <span className="text-xs font-mono text-zinc-700 hidden sm:block w-8">
                  {leagueNumbers[league.slug]}
                </span>

                {/* League name */}
                <div>
                  <h3 className="text-xl sm:text-3xl font-black text-zinc-400 group-hover:text-white transition-colors duration-300 tracking-tight">
                    {league.name.toUpperCase()}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-700">
                      {league.country}
                    </span>
                    <span className="text-zinc-800">&bull;</span>
                    <span className="text-xs text-zinc-700">
                      {league.teams.length} teams
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Team names peek */}
                <div className="hidden lg:flex items-center gap-2">
                  {league.teams.slice(0, 3).map((team) => (
                    <span
                      key={team}
                      className="px-2.5 py-1 text-[10px] bg-white/[0.02] text-zinc-600 group-hover:text-zinc-400 group-hover:bg-white/[0.04] transition-all"
                    >
                      {team}
                    </span>
                  ))}
                  {league.teams.length > 3 && (
                    <span className="text-[10px] text-zinc-700">
                      +{league.teams.length - 3}
                    </span>
                  )}
                </div>

                {/* Arrow */}
                <div className={`w-10 h-10 border border-white/[0.06] ${leagueAccents[league.slug]} flex items-center justify-center group-hover:bg-amber-400/5 transition-all duration-300`}>
                  <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-amber-400 transition-colors duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      </div>

      {/* Bottom gradient transition into Featured Kits */}
      <div className="h-32 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-black" />
    </section>
  );
}
