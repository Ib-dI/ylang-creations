import { configuratorProduct } from "@/db/schema";
import { db } from "@/lib/db";
import { cents, centsToEuros } from "@/lib/currency";
import { normalizeEmbroideryZoneByFont } from "@/lib/configurator/normalize-embroidery-zone";
import type { EmbroideryZone } from "@/types/configurateur-page";

export interface ConfiguratorProductAdmin {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  weight: number;
  icon: string | null;
  baseImage: string;
  maskImage: string;
  colorMaskImage: string | null;
  embroideryZone: Record<string, EmbroideryZone>;
  sizes: string[] | null;
  defaultSize: string | null;
  isActive: boolean;
}

export async function getConfiguratorProductsData(): Promise<ConfiguratorProductAdmin[]> {
  const rows = await db.select().from(configuratorProduct);
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    basePrice: centsToEuros(cents(p.basePrice)),
    weight: p.weight,
    icon: p.icon,
    baseImage: p.baseImage,
    maskImage: p.maskImage,
    colorMaskImage: p.colorMaskImage,
    embroideryZone: normalizeEmbroideryZoneByFont(p.embroideryZone),
    sizes: p.sizes as string[] | null,
    defaultSize: p.defaultSize,
    isActive: p.isActive,
  }));
}
