import ConfiguratorClient from "@/components/configurator/ConfiguratorClient";
import { getConfiguratorData } from "@/lib/configurator/get-data";

interface ConfigurateurPageProps {
  searchParams: Promise<{ product?: string }>;
}

const ConfigurateurPage = async ({ searchParams }: ConfigurateurPageProps) => {
  const [{ product: initialProductId }, data] = await Promise.all([
    searchParams,
    getConfiguratorData(),
  ]);

  return (
    <ConfiguratorClient
      products={data.products}
      fabrics={data.fabrics}
      categories={data.categories}
      productColors={data.productColors}
      embroideryColors={data.embroideryColors}
      embroideryFonts={data.embroideryFonts}
      initialProductId={initialProductId ?? null}
    />
  );
};

export default ConfigurateurPage;
