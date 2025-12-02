import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Configuration, Product, Fabric, ConfiguratorStep } from '@/types/configurator'

interface ConfiguratorStore {
  // État
  currentStep: ConfiguratorStep
  configuration: Configuration
  
  // Actions
  setStep: (step: ConfiguratorStep) => void
  nextStep: () => void
  prevStep: () => void
  
  setProduct: (product: Product) => void
  setFabric: (fabric: Fabric) => void
  setSize: (size: string) => void
  setEmbroidery: (embroidery: Configuration['embroidery']) => void
  addAccessory: (accessory: string) => void
  removeAccessory: (accessory: string) => void
  setCustomOption: (key: string, value: any) => void
  
  getTotalPrice: () => number
  resetConfiguration: () => void
  canGoNext: () => boolean
}

const initialConfiguration: Configuration = {
  product: null,
  fabric: null,
  size: undefined,
  embroidery: undefined,
  accessories: [],
  customOptions: {}
}

export const useConfiguratorStore = create<ConfiguratorStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      configuration: initialConfiguration,
      
      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set((state) => ({
        currentStep: Math.min(5, state.currentStep + 1) as ConfiguratorStep
      })),
      
      prevStep: () => set((state) => ({
        currentStep: Math.max(1, state.currentStep - 1) as ConfiguratorStep
      })),
      
      setProduct: (product) => set((state) => ({
        configuration: { ...state.configuration, product }
      })),
      
      setFabric: (fabric) => set((state) => ({
        configuration: { ...state.configuration, fabric }
      })),
      
      setSize: (size) => set((state) => ({
        configuration: { ...state.configuration, size }
      })),
      
      setEmbroidery: (embroidery) => set((state) => ({
        configuration: { ...state.configuration, embroidery }
      })),
      
      addAccessory: (accessory) => set((state) => ({
        configuration: {
          ...state.configuration,
          accessories: [...state.configuration.accessories, accessory]
        }
      })),
      
      removeAccessory: (accessory) => set((state) => ({
        configuration: {
          ...state.configuration,
          accessories: state.configuration.accessories.filter(a => a !== accessory)
        }
      })),
      
      setCustomOption: (key, value) => set((state) => ({
        configuration: {
          ...state.configuration,
          customOptions: { ...state.configuration.customOptions, [key]: value }
        }
      })),
      
      getTotalPrice: () => {
        const { configuration } = get()
        let total = 0
        
        if (configuration.product) {
          total += configuration.product.basePrice
        }
        
        if (configuration.fabric) {
          total += configuration.fabric.price
        }
        
        if (configuration.embroidery) {
          total += 15 // Prix broderie
        }
        
        total += configuration.accessories.length * 10 // Prix par accessoire
        
        return total
      },
      
      resetConfiguration: () => set({
        currentStep: 1,
        configuration: initialConfiguration
      }),
      
      canGoNext: () => {
        const { currentStep, configuration } = get()
        
        switch (currentStep) {
          case 1:
            return configuration.product !== null
          case 2:
            return configuration.fabric !== null
          case 3:
            return true // Preview, toujours possible
          case 4:
            return true // Options, toujours possible
          case 5:
            return true // Summary, toujours possible
          default:
            return false
        }
      }
    }),
    {
      name: 'ylang-configurator-storage'
    }
  )
)
