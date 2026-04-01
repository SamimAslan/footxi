"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { ChevronDown } from "lucide-react";

const currencyList: { code: CurrencyCode; flagUrl: string }[] = [
  { code: "CHF", flagUrl: "https://flagcdn.com/w40/ch.png" },
  { code: "EUR", flagUrl: "https://flagcdn.com/w40/eu.png" },
  { code: "USD", flagUrl: "https://flagcdn.com/w40/us.png" },
  { code: "GBP", flagUrl: "https://flagcdn.com/w40/gb.png" },
  { code: "TRY", flagUrl: "https://flagcdn.com/w40/tr.png" },
];

type Variant = "default" | "onDark";

export default function CurrencySelector({ variant = "default" }: { variant?: Variant }) {
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

  const isDark = variant === "onDark";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={
          isDark
            ? "flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-white/95 border border-white/25 rounded-md hover:bg-white/10 transition-colors"
            : "flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[var(--foreground)] border border-[color:var(--border)] rounded-md hover:bg-[var(--surface-muted)] transition-all bg-[var(--surface)]"
        }
      >
        <img
          src={current.flagUrl}
          alt={currencyCode}
          className="w-4 h-3 object-cover rounded-[2px]"
          loading="lazy"
        />
        <span className="font-medium">{currencyCode}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`absolute top-full right-0 mt-1.5 w-44 border rounded-lg shadow-[0_10px_26px_rgba(0,0,0,0.14)] py-1 z-[60] ${
            isDark ? "bg-[var(--surface)] border-[color:var(--border)]" : "bg-[var(--surface)] border-[color:var(--border)]"
          }`}
        >
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
                  isActive ? "text-[var(--foreground)] bg-brand-green/10" : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                <img
                  src={item.flagUrl}
                  alt={item.code}
                  className="w-4 h-3 object-cover rounded-[2px]"
                  loading="lazy"
                />
                <span className="font-medium">{item.code}</span>
                <span className="text-[var(--muted)] ml-auto">{info.symbol}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
