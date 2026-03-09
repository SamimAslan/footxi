"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { leagues } from "@/data/products";

export default function MiniLeagueGrid() {
  const homepageLeagues = leagues.slice(0, 8);

  return (
    <section id="leagues" className="relative bg-[var(--background)]">
      <div className="relative pb-28 sm:pb-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-8 sm:mb-10 flex items-end justify-between gap-4">
            <h3 className="text-[11px] font-semibold tracking-[0.24em] text-[var(--muted)] uppercase">
              Browse by League
            </h3>
            <Link
              href="/league/premier-league"
              className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[var(--muted)] hover:text-gold transition-colors duration-300 uppercase"
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
                className="group flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-3.5 py-3 sm:px-4 sm:py-3.5 hover:border-gold/[0.35] hover:bg-gold/[0.04] transition-all duration-300"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center">
                  {league.logo ? (
                    <img
                      src={league.logo}
                      alt={`${league.name} logo`}
                      className="w-full h-full object-contain opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  ) : (
                    <span className="text-[10px] font-semibold text-[var(--muted)] tracking-wider">
                      {league.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-[12px] sm:text-[13px] text-[var(--foreground)]/85 group-hover:text-[var(--foreground)] transition-colors duration-300 truncate">
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
