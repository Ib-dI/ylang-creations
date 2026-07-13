import { ConfiguratorClient } from "@/components/admin/configurator-client";
import { getConfiguratorFabricsData } from "@/lib/admin/get-configurator-fabrics-data";
import { getConfiguratorCategoriesData } from "@/lib/admin/get-configurator-categories-data";
import { getConfiguratorColorsData } from "@/lib/admin/get-configurator-colors-data";
import { getConfiguratorProductsData } from "@/lib/admin/get-configurator-products-data";
import { getConfiguratorEmbroideryFontsData } from "@/lib/admin/get-configurator-embroidery-fonts-data";

export default async function ConfiguratorPage() {
  const [fabrics, categories, colors, products, embroideryFonts] = await Promise.all([
    getConfiguratorFabricsData(),
    getConfiguratorCategoriesData(),
    getConfiguratorColorsData(),
    getConfiguratorProductsData(),
    getConfiguratorEmbroideryFontsData(),
  ]);

  return (
    <ConfiguratorClient
      initialFabrics={fabrics}
      initialProducts={products}
      initialCategories={categories}
      initialColors={colors}
      initialEmbroideryFonts={embroideryFonts}
    />
  );
}
