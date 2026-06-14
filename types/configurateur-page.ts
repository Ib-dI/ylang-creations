// types/configurateur-page.ts

export interface EmbroideryZone {
  x: number;
  y: number;
  maxWidth: number;
  rotation: number;
  fontSize: number;
  alignment: "center" | "left" | "right";
  nameSpacing?: number;
  multiNameEnabled?: boolean;
}

export interface ConfigurateurProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  weight: number;
  icon: string;
  baseImage: string;
  maskImage: string;
  colorMaskImage?: string;
  embroideryZone: EmbroideryZone;
  sizes?: string[];
  defaultSize?: string | null;
}

export interface ConfigurateurFabric {
  id: string;
  name: string;
  price: number;
  baseColor: string;
  image: string;
  category?: string;
}

export interface ConfigurateurFabricCategory {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface ConfigurateurConfiguration {
  product: ConfigurateurProduct | null;
  fabric: ConfigurateurFabric | null;
  size: string | null;
  embroideries: string[];
  embroideryColor: string;
  selectedColor: string | null;
}
