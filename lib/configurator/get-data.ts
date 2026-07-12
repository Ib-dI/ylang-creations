import { db } from "@/lib/db";
import {
  configuratorColor,
  configuratorEmbroideryFont,
  configuratorFabric,
  configuratorFabricCategory,
  configuratorProduct,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { normalizeEmbroideryZoneByFont } from "@/lib/configurator/normalize-embroidery-zone";
import type {
  ConfigurateurEmbroideryFont,
  ConfigurateurFabric,
  ConfigurateurFabricCategory,
  ConfigurateurProduct,
} from "@/types/configurateur-page";

export interface ConfiguratorData {
  products: ConfigurateurProduct[];
  fabrics: ConfigurateurFabric[];
  categories: ConfigurateurFabricCategory[];
  productColors: { name: string; hex: string }[];
  embroideryColors: { name: string; hex: string }[];
  embroideryFonts: ConfigurateurEmbroideryFont[];
}

export async function getConfiguratorData(): Promise<ConfiguratorData> {
  "use cache";
  cacheLife("minutes");
  cacheTag("configurator");

  const [productRows, fabricRows, categoryRows, productColorRows, embroideryColorRows, fontRows] =
    await Promise.all([
      db.select().from(configuratorProduct).where(eq(configuratorProduct.isActive, true)),
      db.select().from(configuratorFabric).where(eq(configuratorFabric.isActive, true)),
      db
        .select()
        .from(configuratorFabricCategory)
        .where(eq(configuratorFabricCategory.isActive, true))
        .orderBy(configuratorFabricCategory.order),
      db
        .select()
        .from(configuratorColor)
        .where(and(eq(configuratorColor.isActive, true), eq(configuratorColor.type, "product")))
        .orderBy(configuratorColor.order, configuratorColor.createdAt),
      db
        .select()
        .from(configuratorColor)
        .where(and(eq(configuratorColor.isActive, true), eq(configuratorColor.type, "embroidery")))
        .orderBy(configuratorColor.order, configuratorColor.createdAt),
      db
        .select()
        .from(configuratorEmbroideryFont)
        .where(eq(configuratorEmbroideryFont.isActive, true))
        .orderBy(configuratorEmbroideryFont.order, configuratorEmbroideryFont.createdAt),
    ]);

  const products: ConfigurateurProduct[] = productRows.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    basePrice: p.basePrice,
    weight: p.weight,
    icon: p.icon ?? "",
    baseImage: p.baseImage,
    maskImage: p.maskImage,
    colorMaskImage: p.colorMaskImage ?? undefined,
    embroideryZone: normalizeEmbroideryZoneByFont(p.embroideryZone),
    sizes: (p.sizes as string[] | null) ?? undefined,
    defaultSize: p.defaultSize,
  }));

  const fabrics: ConfigurateurFabric[] = fabricRows.map((f) => ({
    id: f.id,
    name: f.name,
    price: f.price,
    baseColor: f.baseColor,
    image: f.image,
    category: f.category,
  }));

  const categories: ConfigurateurFabricCategory[] = categoryRows.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description ?? "",
    order: c.order,
  }));

  const embroideryFonts: ConfigurateurEmbroideryFont[] = fontRows.map((f) => ({
    id: f.id,
    name: f.name,
    folder: f.folder,
    format: f.format as "exp" | "pes",
    price: f.price,
    order: f.order,
    supportsThreadColor: f.supportsThreadColor,
  }));

  return {
    products,
    fabrics,
    categories,
    productColors: productColorRows.map((c) => ({ name: c.name, hex: c.hex })),
    embroideryColors: embroideryColorRows.map((c) => ({ name: c.name, hex: c.hex })),
    embroideryFonts,
  };
}
