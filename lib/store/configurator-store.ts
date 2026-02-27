import type {
  Configuration,
  ConfiguratorStep,
  Fabric,
  Product,
} from "@/types/configurator";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfiguratorStore {
  // État
  currentStep: ConfiguratorStep;
  configuration: Configuration;

  // Actions
  setStep: (step: ConfiguratorStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  setProduct: (product: Product) => void;
  setFabric: (fabric: Fabric) => void;
  setSize: (size: string) => void;
  setEmbroidery: (embroidery: Configuration["embroidery"]) => void;
  setCustomOption: (key: string, value: any) => void;

  getTotalPrice: () => number;
  resetConfiguration: () => void;
  canGoNext: () => boolean;
}

const initialConfiguration: Configuration = {
  product: null,
  fabric: null,
  size: undefined,
  embroidery: undefined,
  customOptions: {},
};

export const useConfiguratorStore = create<ConfiguratorStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      configuration: initialConfiguration,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(5, state.currentStep + 1) as ConfiguratorStep,
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(1, state.currentStep - 1) as ConfiguratorStep,
        })),

      setProduct: (product) =>
        set((state) => ({
          configuration: { ...state.configuration, product },
        })),

      setFabric: (fabric) =>
        set((state) => ({
          configuration: { ...state.configuration, fabric },
        })),

      setSize: (size) =>
        set((state) => ({
          configuration: { ...state.configuration, size },
        })),

      setEmbroidery: (embroidery) =>
        set((state) => ({
          configuration: { ...state.configuration, embroidery },
        })),

      setCustomOption: (key, value) =>
        set((state) => ({
          configuration: {
            ...state.configuration,
            customOptions: {
              ...state.configuration.customOptions,
              [key]: value,
            },
          },
        })),

      getTotalPrice: () => {
        const { configuration } = get();
        let total = 0;

        if (configuration.product) {
          total += configuration.product.basePrice;
        }

        if (configuration.fabric) {
          total += configuration.fabric.price;
        }

        if (configuration.embroidery) {
          total += 15; // Prix broderie
        }

        return total;
      },

      resetConfiguration: () =>
        set({
          currentStep: 1,
          configuration: initialConfiguration,
        }),

      canGoNext: () => {
        const { currentStep, configuration } = get();

        switch (currentStep) {
          case 1:
            return configuration.product !== null;
          case 2:
            return configuration.fabric !== null;
          case 3:
            return true; // Preview, toujours possible
          case 4:
            return true; // Options, toujours possible
          case 5:
            return true; // Summary, toujours possible
          default:
            return false;
        }
      },
    }),
    {
      name: "ylang-configurator-storage",
    },
  ),
);
