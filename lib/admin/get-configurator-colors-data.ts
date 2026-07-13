import { configuratorColor } from "@/db/schema";
import { db } from "@/lib/db";

export interface ConfiguratorColorAdmin {
  id: string;
  name: string;
  hex: string;
  type: "product" | "embroidery";
  order: number;
  isActive: boolean;
}

export async function getConfiguratorColorsData(): Promise<ConfiguratorColorAdmin[]> {
  const rows = await db
    .select()
    .from(configuratorColor)
    .orderBy(configuratorColor.order, configuratorColor.createdAt);
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    type: c.type as "product" | "embroidery",
    order: c.order,
    isActive: c.isActive,
  }));
}
