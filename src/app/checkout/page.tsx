"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { getBasePrice, PRICING } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  CreditCard,
  ShoppingBag,
  Lock,
} from "lucide-react";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    items,
    shippingMethod,
    getSubtotal,
    getDiscount,
    getShippingCost,
    getTotal,
    getTotalItems,
  } = useCartStore();

  const [address, setAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    country: "",
    zip: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { formatPrice, currency, rate } = useCurrency();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShippingCost();
  const total = getTotal();
  const totalItems = getTotalItems();
  const discountAmount = (subtotal * discount) / 100;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/login?callbackUrl=/checkout");
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-zinc-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Cart is empty</h1>
          <p className="text-zinc-500 mb-6">Add some kits before checkout</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-black font-semibold hover:bg-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Kits
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (
      !address.fullName ||
      !address.address ||
      !address.city ||
      !address.country ||
      !address.zip
    ) {
      setError("Please fill in all required address fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderItems = items.map((item) => {
        let unitPrice = getBasePrice(item.product.kitType);
        if (item.hasCustomNameNumber) unitPrice += PRICING.customNameNumber;
        for (const badge of item.selectedBadges) {
          unitPrice += badge.price;
        }

        return {
          productId: item.product._id || item.product.id,
          name: item.product.name,
          team: item.product.team,
          league: item.product.league,
          image: item.product.image || "",
          kitType: item.product.kitType,
          type: item.product.type,
          size: item.size,
          quantity: item.quantity,
          badges: item.selectedBadges.map((b) => ({
            name: b.name,
            price: b.price,
          })),
          customName: item.customName,
          customNumber: item.customNumber,
          hasCustomNameNumber: item.hasCustomNameNumber,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
        };
      });

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: address,
          shippingMethod,
          subtotal,
          discountPercent: discount,
          discountAmount,
          shippingCost: shipping,
          total,
          currency: currency.stripeCode,
          exchangeRate: rate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Checkout failed");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/cart"
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Checkout
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Logged in as {session?.user?.email}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Shipping Address Form */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-400 text-black flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Shipping Address
              </h2>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={address.fullName}
                  onChange={(e) =>
                    setAddress({ ...address, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/30 transition-colors"
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={address.address}
                  onChange={(e) =>
                    setAddress({ ...address, address: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/30 transition-colors"
                  placeholder="12 Rue de la Paix, Apt 3"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/30 transition-colors"
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={address.country}
                  onChange={(e) =>
                    setAddress({ ...address, country: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/30 transition-colors"
                  placeholder="France"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  ZIP / Postal Code *
                </label>
                <input
                  type="text"
                  value={address.zip}
                  onChange={(e) =>
                    setAddress({ ...address, zip: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/30 transition-colors"
                  placeholder="75001"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={(e) =>
                    setAddress({ ...address, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/30 transition-colors"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>

            {/* Pay button */}
            <div className="mt-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-400 text-black flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Payment
                </h2>
              </div>
              <p className="text-sm text-zinc-500 mb-4">
                You&apos;ll be redirected to Stripe&apos;s secure payment page.
              </p>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formatPrice(total)}
                  </>
                )}
              </button>
              <p className="text-[10px] text-zinc-600 text-center mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Secured by Stripe. Your payment info is never stored on our
                servers.
              </p>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border border-white/5 p-6 sticky top-24">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0"
                  >
                    <div className="w-10 h-10 flex-shrink-0 bg-zinc-800 rounded overflow-hidden">
                      {item.product.image && item.product.image.startsWith("http") ? (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 120 150" className="w-6 h-7 opacity-40">
                            <path d="M30,10 L10,30 L10,50 L25,45 L25,140 L95,140 L95,45 L110,50 L110,30 L90,10 L75,20 L45,20 Z" className="fill-zinc-700" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {item.product.team}
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        {item.product.kitType.toUpperCase()} &middot; Size{" "}
                        {item.size} &middot; x{item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}
                    )
                  </span>
                  <span className="text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({discount}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping ({shippingMethod})</span>
                  <span className="text-white">
                    {formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-white/5 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-white">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
