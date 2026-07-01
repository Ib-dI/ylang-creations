import type { CartItem } from "@/types/cart";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_WEIGHT_GRAMS } from "@/lib/constants";
import { calculateShippingRate, FALLBACK_SHIPPING_EUR } from "@/lib/shipping";
import { euros, type Euros } from "@/lib/currency";

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
  refreshWeights: () => Promise<void>;

  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => Euros;
  getTotalWeight: () => number;
  isOverWeightLimit: () => boolean;
  getShipping: () => Euros;
  getFinalPrice: () => Euros;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      shippingFee: 0, // conservé pour compatibilité, non utilisé pour le calcul
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

      refreshWeights: async () => {
        const { items } = get();
        const staleItems = items.filter((i) => !i.weight || i.weight === 0);
        if (staleItems.length === 0) return;

        try {
          // Fetch from both standard and configurator products
          const [res, configRes] = await Promise.all([
            fetch("/api/products"),
            fetch("/api/configurator/products")
          ]);
          
          if (!res.ok && !configRes.ok) return;
          
          const productMap: Record<string, number> = {};
          
          if (res.ok) {
            const data = await res.json();
            for (const p of data.products ?? []) {
              if (p.weight > 0) productMap[p.id] = p.weight;
            }
          }
          
          if (configRes.ok) {
            const configData = await configRes.json();
            for (const p of configData.products ?? []) {
              if (p.weight > 0) productMap[p.id] = p.weight;
            }
          }

          set((state) => ({
            items: state.items.map((item) =>
              productMap[item.productId]
                ? { ...item, weight: productMap[item.productId] }
                : item,
            ),
          }));
        } catch {
          // silently fail
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return euros(
          get().items.reduce((total, item) => total + item.price * item.quantity, 0),
        );
      },

      getTotalWeight: () => {
        return get().items.reduce(
          (total, item) => total + (item.weight ?? 0) * item.quantity,
          0,
        );
      },

      isOverWeightLimit: () => {
        return get().getTotalWeight() > MAX_WEIGHT_GRAMS;
      },

      getShipping: () => {
        const total = get().getTotalPrice();
        const { freeShippingThreshold } = get();
        if (freeShippingThreshold > 0 && total >= freeShippingThreshold) {
          return euros(0);
        }
        const totalWeight = get().getTotalWeight();
        if (totalWeight === 0 && get().items.length > 0) {
          return FALLBACK_SHIPPING_EUR;
        }
        return calculateShippingRate(totalWeight);
      },

      getFinalPrice: () => {
        return euros(get().getTotalPrice() + get().getShipping());
      },
    }),
    {
      name: "ylang-cart-storage",
    },
  ),
);
