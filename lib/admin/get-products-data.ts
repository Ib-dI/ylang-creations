import { product } from "@/db/schema";
import { db } from "@/lib/db";
import { cents, centsToEuros } from "@/lib/currency";
import { desc } from "drizzle-orm";

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  category: string;
  subcategory: string | null;
  images: string[];
  stock: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  weight: number;
  sizes: string[];
  defaultSize: string | null;
  options: {
    features?: string[];
    longDescription?: string;
    customizable?: boolean;
    isNew?: boolean;
  };
  createdAt: Date;
}

export async function getProductsData(): Promise<AdminProduct[]> {
  const rows = await db.select().from(product).orderBy(desc(product.createdAt));

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: centsToEuros(cents(p.price)),
    compareAtPrice: p.compareAtPrice ? centsToEuros(cents(p.compareAtPrice)) : null,
    category: p.category,
    subcategory: p.subcategory,
    images: (p.images as string[] | null) ?? [],
    stock: p.stock,
    weight: p.weight,
    sku: p.sku,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    tags: (p.tags as string[] | null) ?? [],
    options: (p.options as AdminProduct["options"] | null) ?? {},
    sizes: (p.sizes as string[] | null) ?? [],
    defaultSize: p.defaultSize ?? null,
    createdAt: p.createdAt,
  }));
}
