import type { CartItem } from "@/types/cart";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  shippingFee: number;
  freeShippingThreshold: number;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setShippingConfig: (fee: number, threshold: number) => void;

  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getShipping: () => number;
  getFinalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      shippingFee: 9.9,
      freeShippingThreshold: 150,

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i,
          ),
        })),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setShippingConfig: (fee, threshold) =>
        set({ shippingFee: fee, freeShippingThreshold: threshold }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      getShipping: () => {
        const total = get().getTotalPrice();
        const { shippingFee, freeShippingThreshold } = get();
        return total >= freeShippingThreshold ? 0 : shippingFee;
      },

      getFinalPrice: () => {
        return get().getTotalPrice() + get().getShipping();
      },
    }),
    {
      name: "ylang-cart-storage",
    },
  ),
);
