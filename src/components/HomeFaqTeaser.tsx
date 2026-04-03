"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "Shipping times",
    a: "Standard delivery is typically shown as a date range at checkout (often around 15–30 days depending on destination). Express options may be faster where available.",
  },
  {
    q: "Custom name & number",
    a: "On supported listings you can add name and number before adding to cart. Customisation is applied to the same kit you order — details are shown on the product page.",
  },
  {
    q: "Sizing help",
    a: "Each product page includes sizing guidance. If you are between sizes, we recommend checking the chart and comparing to a jersey you already own.",
  },
  {
    q: "Payment & checkout",
    a: "Checkout is secured with encryption. We accept major cards and common digital wallets where Stripe supports them. You will see the final total before you pay.",
  },
] as const;

export default function HomeFaqTeaser() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-[var(--store-border)] bg-[var(--store-muted-bg)]">
      <div className="mx-auto max-w-[800px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-[var(--store-text)] sm:text-3xl">
          Questions before you order?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-[var(--store-text-secondary)]">
          Quick answers below — or reach our team anytime.
        </p>
        <ul className="mt-10 space-y-2">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q} className="overflow-hidden rounded-2xl border border-[var(--store-border)] bg-[var(--store-surface)]">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-[var(--store-text)] transition hover:bg-[var(--store-muted-bg)]"
                  aria-expanded={isOpen}
                >
                  {item.q}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[var(--store-text-secondary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {isOpen ? (
                  <div className="border-t border-[var(--store-border)] px-5 py-4 text-[13px] leading-relaxed text-[var(--store-text-secondary)]">
                    {item.a}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-center">
          <Link
            href="/contact"
            className="text-sm font-semibold text-[var(--store-text)] underline-offset-4 hover:underline"
          >
            Contact & full support →
          </Link>
        </p>
      </div>
    </section>
  );
}
