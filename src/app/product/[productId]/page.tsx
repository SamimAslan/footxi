"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getBasePrice, Badge, PRICING, Product, getProductId } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { useCurrency } from "@/context/CurrencyContext";
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
  const [selectedKitType, setSelectedKitType] = useState<"fans" | "player" | "retro">("fans");
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

  useEffect(() => {
    if (!product) return;
    if (product.type === "retro") {
      setSelectedKitType("retro");
    } else if (selectedKitType === "retro") {
      setSelectedKitType("fans");
    }
  }, [product, selectedKitType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Product not found
          </h1>
          <Link href="/" className="text-amber-400 text-sm hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const sizes = product.sizes || ["S", "M", "L", "XL", "XXL"];
  const availableKitTypes =
    product.type === "retro"
      ? (["retro"] as const)
      : (["fans", "player"] as const);
  const basePrice = getBasePrice(selectedKitType);

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
      selectedKitType,
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

  return (
    <div className="min-h-screen bg-black">
      {/* Breadcrumb */}
      <div className="bg-zinc-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
            <Link href="/" className="hover:text-zinc-300 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link
              href={`/league/${product.leagueSlug}`}
              className="hover:text-zinc-300 transition-colors"
            >
              {product.league}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-300">{product.team}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
              {hasRealImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              ) : (
                <svg viewBox="0 0 120 150" className="w-56 h-72 opacity-80">
                  <path
                    d="M30,10 L10,30 L10,50 L25,45 L25,140 L95,140 L95,45 L110,50 L110,30 L90,10 L75,20 L45,20 Z"
                    className="fill-zinc-700"
                    stroke="rgba(251,191,36,0.15)"
                    strokeWidth="1.5"
                  />
                  <text
                    x="60"
                    y="75"
                    textAnchor="middle"
                    className="fill-white/15 text-[8px]"
                  >
                    {product.team.toUpperCase()}
                  </text>
                  <text
                    x="60"
                    y="100"
                    textAnchor="middle"
                    className="fill-white/10 text-[7px]"
                  >
                    {product.type.toUpperCase()}
                  </text>
                </svg>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {selectedKitType === "retro" && (
                  <span className="px-3 py-1 text-xs font-semibold bg-amber-400/20 text-amber-400 rounded-full backdrop-blur-sm">
                    RETRO
                  </span>
                )}
                {selectedKitType === "player" && (
                  <span className="px-3 py-1 text-xs font-semibold bg-white/10 text-white rounded-full backdrop-blur-sm">
                    PLAYER VERSION
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="px-3 py-1 text-xs font-semibold bg-amber-400 text-black rounded-full">
                    NEW
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail strip: front + back */}
            {hasRealImage && hasBackImage && (
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setShowBack(false)}
                  className={`w-20 h-20 rounded-lg border overflow-hidden transition-all ${
                    !showBack
                      ? "border-amber-400 ring-1 ring-amber-400/30"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <img
                    src={product.image}
                    alt="Front"
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  onClick={() => setShowBack(true)}
                  className={`w-20 h-20 rounded-lg border overflow-hidden transition-all ${
                    showBack
                      ? "border-amber-400 ring-1 ring-amber-400/30"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <img
                    src={product.backImage}
                    alt="Back"
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                  {product.league}
                </span>
                <span className="text-zinc-700">&bull;</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  {product.type} kit
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {product.name}
              </h1>
              <p className="mt-1 text-zinc-500">
                {selectedKitType === "fans"
                  ? "Fans Version"
                  : selectedKitType === "player"
                  ? "Player Version"
                  : "Retro Kit"}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white">
                {formatPrice(totalPrice())}
              </span>
              {(hasCustom || selectedBadges.length > 0 || quantity > 1) && (
                <span className="text-sm text-zinc-500">
                  (base {formatPrice(basePrice)}/kit)
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Kit Version */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Version</h3>
              <div className="flex gap-2">
                {availableKitTypes.map((kitType) => (
                  <button
                    key={kitType}
                    onClick={() => setSelectedKitType(kitType)}
                    className={`px-4 h-11 rounded-lg text-sm font-medium transition-all ${
                      selectedKitType === kitType
                        ? "bg-amber-400 text-black"
                        : "bg-zinc-900 text-zinc-400 border border-white/5 hover:border-white/20"
                    }`}
                  >
                    {kitType === "fans"
                      ? `Fans (${formatPrice(PRICING.fans)})`
                      : kitType === "player"
                      ? `Player (${formatPrice(PRICING.player)})`
                      : `Retro (${formatPrice(PRICING.retro)})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Size</h3>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg text-sm font-medium transition-all ${
                      selectedSize === size
                        ? "bg-amber-400 text-black"
                        : "bg-zinc-900 text-zinc-400 border border-white/5 hover:border-white/20"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-white font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Arm Badges */}
            {product.badges && product.badges.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-white mb-3">
                  Arm Badges{" "}
                  <span className="text-zinc-500 font-normal">
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
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm transition-all ${
                          isSelected
                            ? "bg-amber-400/10 border border-amber-400/30 text-white"
                            : "bg-zinc-900 border border-white/5 text-zinc-400 hover:border-white/10"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isSelected && (
                            <Check className="w-4 h-4 text-amber-400" />
                          )}
                          {badge.name}
                        </span>
                        <span className={isSelected ? "text-amber-400" : ""}>
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
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm transition-all ${
                  hasCustom
                    ? "bg-amber-400/10 border border-amber-400/30 text-white"
                    : "bg-zinc-900 border border-white/5 text-zinc-400 hover:border-white/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  {hasCustom && <Check className="w-4 h-4 text-amber-400" />}
                  Custom Name & Number
                </span>
                <span className={hasCustom ? "text-amber-400" : ""}>
                  +{formatPrice(PRICING.customNameNumber)}
                </span>
              </button>

              {hasCustom && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. MESSI"
                      className="w-full px-3 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">
                      Number
                    </label>
                    <input
                      type="text"
                      value={customNumber}
                      onChange={(e) => setCustomNumber(e.target.value)}
                      placeholder="e.g. 10"
                      maxLength={3}
                      className="w-full px-3 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/50 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-amber-400 text-black hover:bg-amber-300"
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
                onClick={() => router.push("/cart")}
                className="w-full py-3 rounded-xl font-medium text-sm border border-white/10 text-white hover:bg-white/5 transition-colors"
              >
                View Cart
              </button>
            )}

            {/* Trust signals */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Truck className="w-4 h-4 text-amber-400/60" />
                Worldwide shipping
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Shield className="w-4 h-4 text-amber-400/60" />
                Quality guaranteed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
