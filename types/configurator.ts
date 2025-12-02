export interface Product {
  id: string
  name: string
  category: string
  basePrice: number
  description: string
  image: string
  sizes?: string[]
  defaultSize?: string
}

export interface Fabric {
  id: string
  name: string
  category: string
  color: string
  pattern: string
  material: string
  price: number
  image: string
  inStock: boolean
  composition: string
  care: string
}

export interface Embroidery {
  text: string
  font: string
  color: string
  position: string
}

export interface Configuration {
  product: Product | null
  fabric: Fabric | null
  size?: string
  embroidery?: Embroidery
  accessories: string[]
  customOptions: Record<string, any>
}

export type ConfiguratorStep = 1 | 2 | 3 | 4 | 5