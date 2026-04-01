"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getProductBasePrice,
  getEffectiveKitType,
  getKitVersionDisplayLabel,
  Badge,
  PRICING,
  Product,
  getProductId,
} from "@/data/products";
import { useCartStore } from "@/store/cart";
import { useCurrency } from "@/context/CurrencyContext";
import { getDisplayTeamName } from "@/lib/productDisplay";
import Link from "next/link";
import {
  ChevronRight,
  ShoppingBag,
  Check,
  Truck,
  Shield,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const addItem = useCartStore((s) => s.addItem);
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [selectedBadges, setSelectedBadges] = useState<Badge[]>([]);
  const [hasCustom, setHasCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [added, setAdded] = useState(false);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Product not found
          </h1>
          <Link href="/" className="text-sm font-semibold text-brand-green hover:text-brand-green-dark hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const sizes = product.sizes || ["S", "M", "L", "XL", "XXL"];
  const effectiveKitType = getEffectiveKitType(product);
  const basePrice = getProductBasePrice(product);

  const toggleBadge = (badge: Badge) => {
    setSelectedBadges((prev) => {
      const exists = prev.find((b) => b.name === badge.name);
      if (exists) return prev.filter((b) => b.name !== badge.name);
      return [...prev, badge];
    });
  };

  const totalPrice = () => {
    let price = basePrice;
    if (hasCustom) price += PRICING.customNameNumber;
    for (const badge of selectedBadges) {
      price += badge.price;
    }
    return price * quantity;
  };

  const handleAddToCart = () => {
    addItem({
      product,
      selectedKitType: effectiveKitType,
      quantity,
      selectedBadges,
      customName: hasCustom ? customName : "",
      customNumber: hasCustom ? customNumber : "",
      hasCustomNameNumber: hasCustom,
      size: selectedSize,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const hasRealImage = product.image && product.image.startsWith("http");
  const hasBackImage = product.backImage && product.backImage.startsWith("http");
  const currentImage = showBack && hasBackImage ? product.backImage : product.image;
  const displayTeam = getDisplayTeamName(product);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Breadcrumb */}
      <div className="bg-[var(--surface-muted)]/80 border-b border-[color:var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[var(--muted)] flex-wrap uppercase tracking-[0.06em] font-medium">
            <Link href="/" className="hover:text-brand-green transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
            <Link
              href={`/league/${product.leagueSlug}`}
              className="hover:text-brand-green transition-colors"
            >
              {product.league}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
            <span className="text-[var(--foreground)] font-semibold normal-case tracking-normal">
              {displayTeam}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-white rounded-xl border border-[color:var(--border)] shadow-sm overflow-hidden flex items-center justify-center">
              {hasRealImage ? (
                <div className="w-full h-full p-8 sm:p-10 flex items-center justify-center">
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain transition-all duration-300 scale-95"
                  />
                </div>
              ) : (
                <svg viewBox="0 0 120 150" className="w-56 h-72 opacity-90">
                  <path
                    d="M30,10 L10,30 L10,50 L25,45 L25,140 L95,140 L95,45 L110,50 L110,30 L90,10 L75,20 L45,20 Z"
                    className="fill-slate-200"
                    stroke="rgba(34, 86, 45, 0.12)"
                    strokeWidth="1.5"
                  />
                  <text
                    x="60"
                    y="75"
                    textAnchor="middle"
                    className="fill-black/20 text-[8px]"
                  >
                    {product.team.toUpperCase()}
                  </text>
                  <text
                    x="60"
                    y="100"
                    textAnchor="middle"
                    className="fill-black/20 text-[7px]"
                  >
                    {product.type.toUpperCase()}
                  </text>
                </svg>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {effectiveKitType === "retro" && (
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-green/12 text-brand-green rounded-md">
                    Retro
                  </span>
                )}
                {effectiveKitType === "player" && (
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-muted)] text-[var(--foreground)] border border-[color:var(--border)] rounded-md">
                    Player
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-green text-white rounded-md">
                    New
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail strip: front + back */}
            {hasRealImage && hasBackImage && (
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setShowBack(false)}
                  className={`w-16 h-16 rounded-lg border overflow-hidden transition-all ${
                    !showBack
                      ? "border-brand-green ring-2 ring-brand-green/20"
                      : "border-[color:var(--border)] hover:border-brand-green/40"
                  }`}
                >
                  <img
                    src={product.image}
                    alt="Front"
                    className="w-full h-full object-contain p-1 bg-white"
                  />
                </button>
                <button
                  onClick={() => setShowBack(true)}
                  className={`w-16 h-16 rounded-lg border overflow-hidden transition-all ${
                    showBack
                      ? "border-brand-green ring-2 ring-brand-green/20"
                      : "border-[color:var(--border)] hover:border-brand-green/40"
                  }`}
                >
                  <img
                    src={product.backImage}
                    alt="Back"
                    className="w-full h-full object-contain p-1 bg-white"
                  />
                </button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[11px] font-bold text-brand-green uppercase tracking-[0.12em]">
                  {product.league}
                </span>
                <span className="text-[var(--muted)]">&bull;</span>
                <span className="text-[11px] text-[var(--muted)] uppercase tracking-[0.1em] font-semibold">
                  {product.type} kit
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-[var(--foreground)] leading-tight tracking-tight">
                {product.name}
              </h1>
              <p className="mt-1 text-[var(--muted)]">
                {getKitVersionDisplayLabel(product)}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-brand-green">
                {formatPrice(totalPrice())}
              </span>
              {(hasCustom || selectedBadges.length > 0 || quantity > 1) && (
                <span className="text-sm text-[var(--muted)]">
                  (base {formatPrice(basePrice)}/kit)
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[color:var(--border)]" />

            {/* Size */}
            <div>
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-[0.1em] mb-3">
                Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-full text-sm font-bold transition-all ${
                      selectedSize === size
                        ? "bg-brand-green text-white shadow-sm"
                        : "bg-[var(--surface)] text-[var(--muted)] border border-[color:var(--border)] hover:border-brand-green/40 hover:text-brand-green"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-[0.1em] mb-3">
                Quantity
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[color:var(--border)] flex items-center justify-center text-[var(--muted)] hover:border-brand-green/40 hover:text-brand-green transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-[var(--foreground)] font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[color:var(--border)] flex items-center justify-center text-[var(--muted)] hover:border-brand-green/40 hover:text-brand-green transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Arm Badges */}
            {product.badges && product.badges.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-[0.1em] mb-3">
                  Arm badges{" "}
                  <span className="text-[var(--muted)] font-semibold normal-case tracking-normal">
                    ({formatPrice(PRICING.badgePrice)} each)
                  </span>
                </h3>
                <div className="space-y-2">
                  {product.badges.map((badge) => {
                    const isSelected = selectedBadges.some(
                      (b) => b.name === badge.name
                    );
                    return (
                      <button
                        key={badge.name}
                        onClick={() => toggleBadge(badge)}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition-all ${
                          isSelected
                            ? "bg-brand-green/8 border border-brand-green/35 text-[var(--foreground)]"
                            : "bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:border-brand-green/35"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isSelected && (
                            <Check className="w-4 h-4 text-brand-green shrink-0" />
                          )}
                          {badge.name}
                        </span>
                        <span className={isSelected ? "text-brand-green font-semibold" : ""}>
                          +{formatPrice(badge.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Name & Number */}
            <div>
              <button
                onClick={() => setHasCustom(!hasCustom)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition-all ${
                  hasCustom
                    ? "bg-brand-green/8 border border-brand-green/35 text-[var(--foreground)]"
                    : "bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:border-brand-green/35"
                }`}
              >
                <span className="flex items-center gap-2">
                  {hasCustom && <Check className="w-4 h-4 text-brand-green shrink-0" />}
                  Custom name & number
                </span>
                <span className={hasCustom ? "text-brand-green font-semibold" : ""}>
                  +{formatPrice(PRICING.customNameNumber)}
                </span>
              </button>

              {hasCustom && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. MESSI"
                      className="w-full px-3 py-2.5 bg-[var(--surface)] border border-[color:var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1.5">
                      Number
                    </label>
                    <input
                      type="text"
                      value={customNumber}
                      onChange={(e) => setCustomNumber(e.target.value)}
                      placeholder="e.g. 10"
                      maxLength={3}
                      className="w-full px-3 py-2.5 bg-[var(--surface)] border border-[color:var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/20 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-full font-bold text-xs uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 shadow-sm ${
                added
                  ? "bg-brand-green text-white"
                  : "bg-brand-green text-white hover:bg-brand-green-dark active:scale-[0.99]"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart &mdash; {formatPrice(totalPrice())}
                </>
              )}
            </button>

            {/* Go to cart link */}
            {added && (
              <button
                type="button"
                onClick={() => router.push("/cart")}
                className="w-full py-3 rounded-full font-semibold text-sm border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-colors"
              >
                View cart
              </button>
            )}

            {/* Trust signals */}
            <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)]/50 px-4 py-3 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                <Truck className="w-4 h-4 text-brand-green shrink-0" />
                Worldwide shipping
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                <Shield className="w-4 h-4 text-brand-green shrink-0" />
                Quality guaranteed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
