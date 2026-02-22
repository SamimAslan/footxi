"use client";

import { Globe, Users, Truck, Award } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Globe,
    label: "8+ Major Leagues",
    sublabel: "Worldwide Coverage",
  },
  {
    icon: Users,
    label: "40+ Teams",
    sublabel: "All Top Clubs",
  },
  {
    icon: Truck,
    label: "Worldwide Shipping",
    sublabel: "Express & Standard",
  },
  {
    icon: Award,
    label: "Premium Quality",
    sublabel: "Embroidered Badges",
  },
];

export default function Marquee() {
  return (
    <section className="relative py-10 sm:py-14 bg-[#0D0F14] border-y border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 ${
                i > 0 ? "lg:border-l lg:border-white/[0.04] lg:pl-8" : ""
              }`}
            >
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-white/[0.06] bg-white/[0.02]">
                <item.icon className="w-[18px] h-[18px] text-gold" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#F3F4F6] tracking-wide">
                  {item.label}
                </p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                  {item.sublabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
