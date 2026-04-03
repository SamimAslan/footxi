"use client";

import { Truck, Lock, Camera, Shirt, Headphones, PackageCheck } from "lucide-react";

const ITEMS = [
  { icon: Truck, title: "Worldwide shipping", sub: "Tracked options at checkout" },
  { icon: Lock, title: "Secure checkout", sub: "Encrypted payments" },
  { icon: Camera, title: "Real product photos", sub: "Listing images match stock" },
  { icon: Shirt, title: "Custom name & number", sub: "On eligible kits before cart" },
  { icon: Headphones, title: "Fast support", sub: "We aim to reply within 24h" },
  { icon: PackageCheck, title: "Clear product details", sub: "Fans, player & retro labeled" },
] as const;

export default function HomeTrustBand() {
  return (
    <div className="border-b border-[var(--store-border)] bg-[var(--store-surface)] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:flex lg:items-stretch lg:justify-between lg:gap-0 lg:px-10 lg:py-8">
        <div className="flex gap-4 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] lg:flex-1 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-0 gap-0 lg:min-w-0 lg:flex-1 lg:divide-x lg:divide-[var(--store-border)]">
            {ITEMS.map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex min-w-[200px] shrink-0 gap-3 px-3 first:pl-0 last:pr-3 sm:min-w-[220px] lg:min-w-0 lg:flex-1 lg:shrink lg:px-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--store-border)] bg-[var(--store-muted-bg)] text-[var(--store-text)]">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-tight text-[var(--store-text)]">{title}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-[var(--store-text-secondary)]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-[var(--store-border)] pt-5 lg:mt-0 lg:w-[200px] lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 xl:w-[220px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--store-text-secondary)]">
            We accept
          </p>
          <div className="flex flex-wrap gap-2">
            {["Visa", "Mastercard", "Amex", "Apple Pay"].map((label) => (
              <span
                key={label}
                className="rounded-md border border-[var(--store-border)] bg-[var(--store-muted-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--store-text-secondary)]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
