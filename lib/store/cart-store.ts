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
  refreshWeights: () => Promise<void>;

  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalWeight: () => number;
  isOverWeightLimit: () => boolean;
  getShipping: () => number;
  getFinalPrice: () => number;
}

export const MAX_WEIGHT_GRAMS = 30000;

/**
 * Calcule les frais de livraison Colissimo à domicile 2026
 * en fonction du poids total du colis (en grammes).
 */
function calculateColissimoHomeRate(weightGrams: number): number {
  if (weightGrams <= 250) return 5.49;
  if (weightGrams <= 500) return 7.59;
  if (weightGrams <= 750) return 9.29;
  if (weightGrams <= 1000) return 9.59;
  if (weightGrams <= 2000) return 11.19;
  if (weightGrams <= 5000) return 17.39;
  if (weightGrams <= 10000) return 25.29;
  return 39.59; // jusqu'à 30 kg
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
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
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
        // Livraison offerte si le seuil de montant est atteint
        if (freeShippingThreshold > 0 && total >= freeShippingThreshold) {
          return 0;
        }
        // Sinon calculer selon le poids Colissimo
        const totalWeight = get().getTotalWeight();
        // Si aucun poids n'est défini (anciens articles), fallback sur 9.59 €
        if (totalWeight === 0 && get().items.length > 0) {
          return 9.59;
        }
        return calculateColissimoHomeRate(totalWeight);
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
