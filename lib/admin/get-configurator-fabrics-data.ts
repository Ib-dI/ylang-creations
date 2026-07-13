import { configuratorFabric } from "@/db/schema";
import { db } from "@/lib/db";
import { cents, centsToEuros } from "@/lib/currency";

export interface ConfiguratorFabricAdmin {
  id: string;
  name: string;
  price: number;
  baseColor: string;
  image: string;
  category: string;
  isActive: boolean;
}

export async function getConfiguratorFabricsData(): Promise<ConfiguratorFabricAdmin[]> {
  const rows = await db.select().from(configuratorFabric);
  return rows.map((f) => ({
    id: f.id,
    name: f.name,
    price: centsToEuros(cents(f.price)),
    baseColor: f.baseColor,
    image: f.image,
    category: f.category,
    isActive: f.isActive,
  }));
}
