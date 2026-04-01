import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Product,
  Badge,
  PRICING,
  getProductBasePrice,
  getEffectiveKitType,
} from "@/data/products";

export interface CartItem {
  product: Product;
  selectedKitType: "fans" | "player" | "retro";
  quantity: number;
  selectedBadges: Badge[];
  customName: string;
  customNumber: string;
  hasCustomNameNumber: boolean;
  size: string;
}

interface CartStore {
  items: CartItem[];
  shippingMethod: "standard" | "express";
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  setShippingMethod: (method: "standard" | "express") => void;
  clearCart: () => void;
  getItemPrice: (item: CartItem) => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getShippingCost: () => number;
  getTotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      shippingMethod: "standard",

      addItem: (item) => {
        const normalized: CartItem = {
          ...item,
          selectedKitType: getEffectiveKitType(item.product),
        };
        set((state) => ({ items: [...state.items, normalized] }));
      },

      removeItem: (index) => {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        }));
      },

      updateQuantity: (index, quantity) => {
        set((state) => ({
          items: state.items.map((item, i) =>
            i === index ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },

      setShippingMethod: (method) => {
        set({ shippingMethod: method });
      },

      clearCart: () => {
        set({ items: [], shippingMethod: "standard" });
      },

      getItemPrice: (item) => {
        let price = getProductBasePrice(item.product);
        if (item.hasCustomNameNumber) {
          price += PRICING.customNameNumber;
        }
        for (const badge of item.selectedBadges) {
          price += badge.price;
        }
        return price * item.quantity;
      },

      getSubtotal: () => {
        const { items, getItemPrice } = get();
        return items.reduce((sum, item) => sum + getItemPrice(item), 0);
      },

      getDiscount: () => {
        const { items } = get();
        const totalKits = items.reduce((sum, item) => sum + item.quantity, 0);
        if (totalKits >= PRICING.discount.tier2.min) {
          return PRICING.discount.tier2.percent;
        }
        if (totalKits >= PRICING.discount.tier1.min) {
          return PRICING.discount.tier1.percent;
        }
        return 0;
      },

      getShippingCost: () => {
        const { items, shippingMethod } = get();
        const totalKits = items.reduce((sum, item) => sum + item.quantity, 0);
        if (totalKits === 0) return 0;
        const baseCost =
          shippingMethod === "express"
            ? PRICING.cargo.express.price
            : PRICING.cargo.standard.price;
        const additionalCost =
          totalKits > 1 ? (totalKits - 1) * PRICING.additionalItem : 0;
        return baseCost + additionalCost;
      },

      getTotal: () => {
        const { getSubtotal, getDiscount, getShippingCost } = get();
        const subtotal = getSubtotal();
        const discount = getDiscount();
        const shipping = getShippingCost();
        const discountAmount = (subtotal * discount) / 100;
        return subtotal - discountAmount + shipping;
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "footxi-cart",
    }
  )
);
