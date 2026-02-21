"use client";

const ITEMS = [
  "BARCELONA",
  "REAL MADRID",
  "MANCHESTER UNITED",
  "LIVERPOOL",
  "AC MILAN",
  "BAYERN MUNICH",
  "PARIS SAINT-GERMAIN",
  "JUVENTUS",
  "ARSENAL",
  "INTER MILAN",
  "GALATASARAY",
  "CHELSEA",
  "BORUSSIA DORTMUND",
  "NAPOLI",
  "FENERBAHCE",
  "BENFICA",
  "AJAX",
  "PORTO",
  "TOTTENHAM",
  "BESIKTAS",
];

export default function Marquee() {
  return (
    <div className="relative py-6 bg-zinc-950 border-y border-white/[0.03] overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

      <div className="flex animate-[marquee_40s_linear_infinite]">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <div key={i} className="flex items-center flex-shrink-0 mx-6">
            <span className="text-[11px] font-bold tracking-[0.25em] text-zinc-700 hover:text-amber-400/60 transition-colors duration-300 cursor-default whitespace-nowrap">
              {item}
            </span>
            <span className="ml-6 text-amber-400/20 text-lg">&bull;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
