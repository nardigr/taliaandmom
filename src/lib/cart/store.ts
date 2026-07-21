"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  CART_STORAGE_KEY,
  getCartItemCount,
  getCartLineId,
  getCartSubtotalCents,
  type AddToCartInput,
  type CartItem,
} from "@/lib/cart/types";

type CartState = {
  items: CartItem[];
  drawerOpen: boolean;
  lastAddedItem: CartItem | null;
  addItem: (input: AddToCartInput, quantity: number) => void;
  removeItem: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  closeDrawer: () => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotalCents: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      lastAddedItem: null,

      addItem: (input, quantity) => {
        const lineId = getCartLineId(input.productId, input.size, input.color);
        const existing = get().items.find((item) => item.lineId === lineId);

        let nextItem: CartItem;
        let nextItems: CartItem[];

        if (existing) {
          nextItem = { ...existing, quantity: existing.quantity + quantity };
          nextItems = get().items.map((item) =>
            item.lineId === lineId ? nextItem : item,
          );
        } else {
          nextItem = { lineId, ...input, quantity };
          nextItems = [...get().items, nextItem];
        }

        set({
          items: nextItems,
          drawerOpen: true,
          lastAddedItem: nextItem,
        });
      },

      removeItem: (lineId) => {
        set({ items: get().items.filter((item) => item.lineId !== lineId) });
      },

      setQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.lineId === lineId ? { ...item, quantity } : item,
          ),
        });
      },

      closeDrawer: () => set({ drawerOpen: false }),

      clearCart: () => set({ items: [], lastAddedItem: null }),

      itemCount: () => getCartItemCount(get().items),

      subtotalCents: () => getCartSubtotalCents(get().items),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
