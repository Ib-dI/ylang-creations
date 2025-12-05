import type { WishlistItem } from "@/types/wishlist";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: WishlistItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => void;
  clearWishlist: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;

  // Getters
  isInWishlist: (productId: string) => boolean;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          // Vérifie si le produit existe déjà
          const exists = state.items.some(
            (i) => i.productId === item.productId,
          );
          if (exists) return state;

          return {
            items: [...state.items, { ...item, addedAt: new Date() }],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      toggleItem: (item) => {
        const state = get();
        const exists = state.items.some((i) => i.productId === item.productId);

        if (exists) {
          set({
            items: state.items.filter((i) => i.productId !== item.productId),
          });
        } else {
          set({
            items: [...state.items, { ...item, addedAt: new Date() }],
          });
        }
      },

      clearWishlist: () => set({ items: [] }),

      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      getTotalItems: () => {
        return get().items.length;
      },
    }),
    {
      name: "ylang-wishlist-storage",
    },
  ),
);
