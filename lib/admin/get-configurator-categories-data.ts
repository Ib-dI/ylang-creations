import { configuratorFabricCategory } from "@/db/schema";
import { db } from "@/lib/db";

export interface ConfiguratorFabricCategoryAdmin {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isActive: boolean;
}

export async function getConfiguratorCategoriesData(): Promise<ConfiguratorFabricCategoryAdmin[]> {
  const rows = await db
    .select()
    .from(configuratorFabricCategory)
    .orderBy(configuratorFabricCategory.order);
  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    order: c.order,
    isActive: c.isActive,
  }));
}
