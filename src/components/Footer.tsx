"use client";

import Link from "next/link";
import { Mail, Truck, Shield, CreditCard } from "lucide-react";
import { leagues, PRICING } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";

export default function Footer() {
  const { formatPrice } = useCurrency();
  return (
    <footer className="bg-[#0A0C10] border-t border-white/[0.04]">
      {/* Trust Bar */}
      <div className="border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center border border-white/[0.06] bg-white/[0.02]">
                <Truck className="w-[18px] h-[18px] text-gold" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#F3F4F6]">
                  Worldwide Shipping
                </p>
                <p className="text-[11px] text-[#9CA3AF]/60">
                  Express & Standard delivery
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center border border-white/[0.06] bg-white/[0.02]">
                <Shield className="w-[18px] h-[18px] text-gold" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#F3F4F6]">
                  Quality Guaranteed
                </p>
                <p className="text-[11px] text-[#9CA3AF]/60">
                  Premium quality kits
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center border border-white/[0.06] bg-white/[0.02]">
                <CreditCard className="w-[18px] h-[18px] text-gold" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#F3F4F6]">
                  Secure Payment
                </p>
                <p className="text-[11px] text-[#9CA3AF]/60">
                  Safe & encrypted checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="FOOTXI" className="h-7 w-auto" />
            </Link>
            <p className="mt-4 text-[13px] text-[#9CA3AF]/60 leading-relaxed">
              Premium football kits from all major leagues. Fans version, player
              version, and retro kits available.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[13px] text-[#9CA3AF]/60">
              <Mail className="w-4 h-4" />
              <a
                href="mailto:support@footxi.com"
                className="hover:text-gold transition-colors duration-300"
              >
                support@footxi.com
              </a>
            </div>
          </div>

          {/* Leagues */}
          <div>
            <h3 className="text-[11px] font-semibold text-[#F3F4F6] mb-5 uppercase tracking-[0.2em]">
              Leagues
            </h3>
            <ul className="space-y-3">
              {leagues.slice(0, 6).map((league) => (
                <li key={league.slug}>
                  <Link
                    href={`/league/${league.slug}`}
                    className="text-[13px] text-[#9CA3AF]/50 hover:text-[#F3F4F6] transition-colors duration-300"
                  >
                    {league.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[11px] font-semibold text-[#F3F4F6] mb-5 uppercase tracking-[0.2em]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-[13px] text-[#9CA3AF]/50 hover:text-[#F3F4F6] transition-colors duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-[13px] text-[#9CA3AF]/50 hover:text-[#F3F4F6] transition-colors duration-300"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[13px] text-[#9CA3AF]/50 hover:text-[#F3F4F6] transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Pricing Info */}
          <div>
            <h3 className="text-[11px] font-semibold text-[#F3F4F6] mb-5 uppercase tracking-[0.2em]">
              Pricing
            </h3>
            <ul className="space-y-3 text-[13px]">
              <li className="flex justify-between">
                <span className="text-[#9CA3AF]/50">Fans Version</span>
                <span className="text-[#F3F4F6]">
                  {formatPrice(PRICING.fans)}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#9CA3AF]/50">Player Version</span>
                <span className="text-[#F3F4F6]">
                  {formatPrice(PRICING.player)}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#9CA3AF]/50">Retro Kit</span>
                <span className="text-[#F3F4F6]">
                  {formatPrice(PRICING.retro)}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#9CA3AF]/50">Custom Name/No.</span>
                <span className="text-[#F3F4F6]">
                  +{formatPrice(PRICING.customNameNumber)}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#9CA3AF]/50">Arm Badge</span>
                <span className="text-[#F3F4F6]">
                  {formatPrice(PRICING.badgePrice)}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-white/[0.04]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-[#9CA3AF]/30 tracking-wide">
              &copy; {new Date().getFullYear()} FootXI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[11px] text-[#9CA3AF]/30 tracking-wide">
                3-6 kits: 5% off
              </span>
              <span className="text-[11px] text-[#9CA3AF]/30 tracking-wide">
                7-15 kits: 10% off
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
