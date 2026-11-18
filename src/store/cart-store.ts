"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSize, Temperature } from "@prisma/client";

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  gradient: string;
  unitPrice: number;
  basePrice: number;
  quantity: number;
  size: ProductSize;
  temperature: Temperature;
  sugarLevel: number;
  iceLevel: number;
  extraShot: boolean;
  extraMilk: boolean;
  addons: string[];
  note?: string;
};

const SIZE_ADJUST: Record<ProductSize, number> = { SMALL: -4000, MEDIUM: 0, LARGE: 6000 };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, "key" | "unitPrice"> & { unitPrice?: number }) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

function priceOf(item: Omit<CartItem, "key" | "unitPrice">) {
  return Math.max(1000, item.basePrice + SIZE_ADJUST[item.size] + (item.extraShot ? 8000 : 0) + (item.extraMilk ? 5000 : 0) + item.addons.length * 5000);
}

export function itemKey(item: Omit<CartItem, "key" | "unitPrice">) {
  return [item.productId, item.size, item.temperature, item.sugarLevel, item.iceLevel, item.extraShot, item.extraMilk, [...item.addons].sort().join(","), item.note ?? ""].join("|");
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item) => {
        const key = itemKey(item);
        const { unitPrice: override, ...base } = item;
        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return { items: state.items.map((i) => (i.key === key ? { ...i, quantity: Math.min(99, i.quantity + item.quantity) } : i)), isOpen: true };
          }
          return { items: [...state.items, { ...base, key, unitPrice: override ?? priceOf(base) }], isOpen: true };
        });
      },
      remove: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.key !== key)
            : state.items.map((i) => (i.key === key ? { ...i, quantity: Math.min(99, quantity) } : i)),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "abc-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const cartSubtotal = (items: CartItem[]) => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
export const cartCount = (items: CartItem[]) => items.reduce((sum, i) => sum + i.quantity, 0);
