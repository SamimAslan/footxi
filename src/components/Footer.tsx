"use client";

import Link from "next/link";
import { Mail, Truck, Shield, CreditCard } from "lucide-react";
import { leagues, PRICING } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";

export default function Footer() {
  const { formatPrice } = useCurrency();
  return (
    <footer className="bg-zinc-950 border-t border-white/5">
      {/* Trust Bar */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Worldwide Shipping
                </p>
                <p className="text-xs text-zinc-500">
                  Express & Standard delivery
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Quality Guaranteed
                </p>
                <p className="text-xs text-zinc-500">
                  Premium quality kits
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Secure Payment
                </p>
                <p className="text-xs text-zinc-500">
                  Safe & encrypted checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="FOOTXI" className="h-7 w-auto" />
            </Link>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
              Premium football kits from all major leagues. Fans version, player
              version, and retro kits available.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
              <Mail className="w-4 h-4" />
              <a
                href="mailto:support@footxi.com"
                className="hover:text-amber-400 transition-colors"
              >
                support@footxi.com
              </a>
            </div>
          </div>

          {/* Leagues */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Leagues</h3>
            <ul className="space-y-2.5">
              {leagues.slice(0, 6).map((league) => (
                <li key={league.slug}>
                  <Link
                    href={`/league/${league.slug}`}
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {league.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Pricing Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Pricing</h3>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              <li className="flex justify-between">
                <span>Fans Version</span>
                <span className="text-zinc-300">{formatPrice(PRICING.fans)}</span>
              </li>
              <li className="flex justify-between">
                <span>Player Version</span>
                <span className="text-zinc-300">{formatPrice(PRICING.player)}</span>
              </li>
              <li className="flex justify-between">
                <span>Retro Kit</span>
                <span className="text-zinc-300">{formatPrice(PRICING.retro)}</span>
              </li>
              <li className="flex justify-between">
                <span>Custom Name/No.</span>
                <span className="text-zinc-300">+{formatPrice(PRICING.customNameNumber)}</span>
              </li>
              <li className="flex justify-between">
                <span>Arm Badge</span>
                <span className="text-zinc-300">{formatPrice(PRICING.badgePrice)}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} FootXI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-zinc-600">
                3-6 kits: 5% off
              </span>
              <span className="text-xs text-zinc-600">
                7-15 kits: 10% off
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
