"use client";

import Link from "next/link";
import { Product, getBasePrice, getProductId } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";

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
      className="group block bg-[#141721]/40 border border-white/[0.04] overflow-hidden hover:border-gold/[0.15] hover:shadow-[0_8px_40px_rgba(245,184,0,0.06)] transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-b from-[#141721] to-[#0D0F14] overflow-hidden">
        {product.image && product.image.startsWith("http") ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center p-7">
              <img
                src={product.image}
                alt={product.name}
                className={`max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-[1.05] ${
                  product.backImage ? "group-hover:opacity-0" : ""
                }`}
              />
            </div>
            {product.backImage && (
              <div className="absolute inset-0 flex items-center justify-center p-7">
                <img
                  src={product.backImage}
                  alt={`${product.name} back`}
                  className="max-w-full max-h-full object-contain opacity-0 group-hover:opacity-100 group-hover:scale-[1.05] transition-all duration-700"
                />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl font-bold text-white/[0.04]">
              {product.team.substring(0, 3).toUpperCase()}
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="px-2.5 py-1 text-[9px] font-bold bg-gold text-[#0D0F14] tracking-[0.1em]">
              NEW
            </span>
          )}
          {product.kitType === "player" && (
            <span className="px-2.5 py-1 text-[9px] font-bold bg-white/[0.06] text-[#BFC3C9] backdrop-blur-sm tracking-[0.1em]">
              PLAYER
            </span>
          )}
          {product.kitType === "retro" && (
            <span className="px-2.5 py-1 text-[9px] font-bold bg-gold/[0.1] text-gold backdrop-blur-sm tracking-[0.1em]">
              RETRO
            </span>
          )}
        </div>

        {/* Hover glow border */}
        <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/[0.08] transition-all duration-700 pointer-events-none" />

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-display text-[15px] font-semibold text-[#9CA3AF] group-hover:text-[#F3F4F6] transition-colors duration-300 tracking-tight">
          {product.team}
        </h3>
        <p className="text-[10px] text-[#9CA3AF]/40 mt-1 tracking-[0.15em] uppercase">
          {product.type} Kit
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-[#F3F4F6]">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
