"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { ChevronDown } from "lucide-react";

const currencyList: { code: CurrencyCode; flag: string }[] = [
  { code: "CHF", flag: "🇨🇭" },
  { code: "EUR", flag: "🇪🇺" },
  { code: "USD", flag: "🇺🇸" },
  { code: "GBP", flag: "🇬🇧" },
  { code: "TRY", flag: "🇹🇷" },
];

export default function CurrencySelector() {
  const { currencyCode, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = currencyList.find((c) => c.code === currencyCode) || currencyList[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-zinc-400 hover:text-white border border-white/[0.06] rounded-md hover:border-white/[0.12] transition-all bg-white/[0.02]"
      >
        <span className="text-sm leading-none" aria-hidden="true">{current.flag}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-36 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl py-1 z-50">
          {currencyList.map((item) => {
            const info = CURRENCIES[item.code];
            const isActive = item.code === currencyCode;
            return (
              <button
                key={item.code}
                onClick={() => {
                  setCurrency(item.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? "text-amber-400 bg-amber-400/5"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-sm leading-none" aria-hidden="true">{item.flag}</span>
                <span className="font-medium">{info.name}</span>
                <span className="text-zinc-600 ml-auto">{info.symbol}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
