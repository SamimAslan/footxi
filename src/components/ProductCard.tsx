"use client";

import Link from "next/link";
import { Product, getBasePrice, getProductId } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { ArrowUpRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = getBasePrice(product.kitType);
  const { formatPrice } = useCurrency();
  const productId = getProductId(product);

  return (
    <Link
      href={`/product/${productId}`}
      className="group block bg-zinc-900/30 border border-white/[0.04] overflow-hidden hover:border-amber-400/20 transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-b from-zinc-900/50 to-zinc-950 overflow-hidden">
        {product.image && product.image.startsWith("http") ? (
          <>
            {/* Front image - visible by default, hidden on hover if back exists */}
            <img
              src={product.image}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                product.backImage ? "group-hover:opacity-0" : "group-hover:scale-105 transition-transform"
              }`}
            />
            {/* Back image - hidden by default, shown on hover */}
            {product.backImage && (
              <img
                src={product.backImage}
                alt={`${product.name} back`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 120 150" className="w-24 h-32 opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500">
              <path
                d="M30,10 L10,30 L10,50 L25,45 L25,140 L95,140 L95,45 L110,50 L110,30 L90,10 L75,20 L45,20 Z"
                className={`${
                  product.type === "home"
                    ? "fill-zinc-700"
                    : product.type === "away"
                    ? "fill-zinc-600"
                    : product.type === "third"
                    ? "fill-zinc-800"
                    : "fill-zinc-700/80"
                } group-hover:fill-zinc-600 transition-colors duration-500`}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
              <text
                x="60"
                y="90"
                textAnchor="middle"
                className="fill-white/10 text-[10px] font-bold"
              >
                {product.team.substring(0, 3).toUpperCase()}
              </text>
            </svg>
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-400 text-black tracking-wider">
              NEW
            </span>
          )}
          {product.kitType === "player" && (
            <span className="px-2 py-0.5 text-[9px] font-bold bg-white/5 text-zinc-400 backdrop-blur-sm tracking-wider">
              PLAYER
            </span>
          )}
          {product.kitType === "retro" && (
            <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-400/10 text-amber-400 backdrop-blur-sm tracking-wider">
              RETRO
            </span>
          )}
        </div>

        {/* Hover arrow */}
        <div className="absolute bottom-3 right-3 w-8 h-8 border border-white/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-amber-400/5 transition-all duration-300">
          <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* Top accent on hover */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-bold tracking-[0.15em] text-amber-400/70 uppercase">
            {product.league}
          </span>
        </div>
        <h3 className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors duration-300 tracking-tight">
          {product.team}
        </h3>
        <p className="text-[10px] text-zinc-700 mt-0.5 tracking-wide">
          {product.kitType === "fans"
            ? "FANS"
            : product.kitType === "player"
            ? "PLAYER"
            : "RETRO"}{" "}
          &middot; {product.type.toUpperCase()}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-black text-white">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
