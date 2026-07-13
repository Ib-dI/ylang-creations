import { configuratorEmbroideryFont } from "@/db/schema";
import { db } from "@/lib/db";

export interface ConfiguratorEmbroideryFontAdmin {
  id: string;
  name: string;
  folder: string;
  format: "exp" | "pes";
  price: number;
  order: number;
  isActive: boolean;
  supportsThreadColor: boolean;
}

export async function getConfiguratorEmbroideryFontsData(): Promise<ConfiguratorEmbroideryFontAdmin[]> {
  const rows = await db.select().from(configuratorEmbroideryFont);
  return rows.map((f) => ({
    id: f.id,
    name: f.name,
    folder: f.folder,
    format: f.format as "exp" | "pes",
    price: f.price,
    order: f.order,
    isActive: f.isActive,
    supportsThreadColor: f.supportsThreadColor,
  }));
}
