"use client";

import { useCartStore } from "@/store/cart";
import { PRICING } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import Link from "next/link";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Tag,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    shippingMethod,
    removeItem,
    updateQuantity,
    setShippingMethod,
    getItemPrice,
    getSubtotal,
    getDiscount,
    getShippingCost,
    getTotal,
    getTotalItems,
  } = useCartStore();

  const { formatPrice } = useCurrency();
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShippingCost();
  const total = getTotal();
  const totalItems = getTotalItems();
  const discountAmount = (subtotal * discount) / 100;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-zinc-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Your cart is empty
          </h1>
          <p className="text-zinc-500 mb-6">
            Start by adding some kits to your cart
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-black font-semibold rounded-lg hover:bg-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Kits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Shopping Cart
            </h1>
            <p className="text-zinc-500 mt-1">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 sm:p-6"
              >
                <div className="flex gap-4">
                  {/* Mini image */}
                  <div className="w-20 h-20 flex-shrink-0 bg-zinc-800 rounded-lg overflow-hidden">
                    {item.product.image && item.product.image.startsWith("http") ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg viewBox="0 0 120 150" className="w-12 h-14 opacity-60">
                          <path d="M30,10 L10,30 L10,50 L25,45 L25,140 L95,140 L95,45 L110,50 L110,30 L90,10 L75,20 L45,20 Z" className="fill-zinc-700" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-medium text-white truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {item.product.kitType === "fans"
                            ? "Fans Version"
                            : item.product.kitType === "player"
                            ? "Player Version"
                            : "Retro Kit"}{" "}
                          &middot; Size {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.selectedBadges.map((badge) => (
                        <span
                          key={badge.name}
                          className="px-2 py-0.5 text-[10px] bg-amber-400/10 text-amber-400 rounded-full"
                        >
                          {badge.name}
                        </span>
                      ))}
                      {item.hasCustomNameNumber && (
                        <span className="px-2 py-0.5 text-[10px] bg-white/5 text-zinc-400 rounded-full">
                          {item.customName} #{item.customNumber}
                        </span>
                      )}
                    </div>

                    {/* Quantity & Price */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity - 1)
                          }
                          className="w-7 h-7 rounded bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity + 1)
                          }
                          className="w-7 h-7 rounded bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-white">
                        {formatPrice(getItemPrice(item))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-6">
                Order Summary
              </h2>

              {/* Shipping Method */}
              <div className="mb-6">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                  <Truck className="w-3.5 h-3.5 inline mr-1" />
                  Shipping Method
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShippingMethod("standard")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all ${
                      shippingMethod === "standard"
                        ? "bg-amber-400/10 border border-amber-400/30 text-white"
                        : "bg-zinc-800/50 border border-white/5 text-zinc-400"
                    }`}
                  >
                    <span>
                      Standard ({PRICING.cargo.standard.days} days)
                    </span>
                    <span>{formatPrice(PRICING.cargo.standard.price)}</span>
                  </button>
                  <button
                    onClick={() => setShippingMethod("express")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all ${
                      shippingMethod === "express"
                        ? "bg-amber-400/10 border border-amber-400/30 text-white"
                        : "bg-zinc-800/50 border border-white/5 text-zinc-400"
                    }`}
                  >
                    <span>
                      Express ({PRICING.cargo.express.days} days)
                    </span>
                    <span>{formatPrice(PRICING.cargo.express.price)}</span>
                  </button>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Bulk discount ({discount}%)
                    </span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span className="text-white">{formatPrice(shipping)}</span>
                </div>
                {totalItems > 1 && (
                  <p className="text-[10px] text-zinc-600">
                    Includes +{formatPrice(PRICING.additionalItem)} for each additional
                    item
                  </p>
                )}

                <div className="border-t border-white/5 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-white">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Discount info */}
              {discount === 0 && totalItems < PRICING.discount.tier1.min && (
                <div className="mt-4 p-3 bg-amber-400/5 border border-amber-400/10 rounded-lg">
                  <p className="text-xs text-amber-400/80">
                    Add {PRICING.discount.tier1.min - totalItems} more{" "}
                    {PRICING.discount.tier1.min - totalItems === 1
                      ? "kit"
                      : "kits"}{" "}
                    to get {PRICING.discount.tier1.percent}% off!
                  </p>
                </div>
              )}

              {/* Checkout */}
              <Link
                href="/checkout"
                className="block w-full mt-6 py-4 bg-amber-400 text-black font-semibold rounded-xl hover:bg-amber-300 transition-colors text-center"
              >
                Proceed to Checkout
              </Link>

              <p className="mt-4 text-center text-[10px] text-zinc-600">
                Contact us at{" "}
                <a
                  href="mailto:support@footxi.com"
                  className="text-amber-400/60 hover:text-amber-400"
                >
                  support@footxi.com
                </a>{" "}
                for any questions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
