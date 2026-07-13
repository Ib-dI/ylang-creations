import { ProductsClient } from "@/components/admin/products-client";
import { getProductsData } from "@/lib/admin/get-products-data";

export default async function ProductsPage() {
  const products = await getProductsData();

  return <ProductsClient initialProducts={products} />;
}
