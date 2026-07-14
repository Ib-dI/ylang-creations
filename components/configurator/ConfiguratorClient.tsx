"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useNavigationStore } from "@/lib/store/navigation-store";
import { cents, centsToEuros } from "@/lib/currency";
import { normalizeForFont } from "@/lib/embroidery/normalize";
import { FALLBACK_EMBROIDERY_FONT } from "@/lib/configurator/constants";

import ProductPreviewPanel, { type ProductPreviewPanelHandle } from "@/components/configurator/ProductPreviewPanel";
import ProductMarketingSection from "@/components/configurator/ProductMarketingSection";
import ProductStep from "@/components/configurator/steps/ProductStep";
import FabricStep from "@/components/configurator/steps/FabricStep";
import EmbroideryStep from "@/components/configurator/steps/EmbroideryStep";
import SummaryStep from "@/components/configurator/steps/SummaryStep";

import type {
  ConfigurateurConfiguration,
  ConfigurateurEmbroideryFont,
  ConfigurateurFabric,
  ConfigurateurFabricCategory,
  ConfigurateurProduct,
} from "@/types/configurateur-page";

export interface ConfiguratorClientProps {
  products: ConfigurateurProduct[];
  fabrics: ConfigurateurFabric[];
  categories: ConfigurateurFabricCategory[];
  productColors: { name: string; hex: string }[];
  embroideryColors: { name: string; hex: string }[];
  embroideryFonts: ConfigurateurEmbroideryFont[];
  initialProductId: string | null;
}

const ConfiguratorClient = ({
  products,
  fabrics,
  categories,
  productColors,
  embroideryColors,
  embroideryFonts,
  initialProductId,
}: ConfiguratorClientProps) => {
  // Mémorise cette page comme point de retour pour "Continuer mes achats" / états vides
  const pathname = usePathname();
  const setLastBrowse = useNavigationStore((state) => state.setLastBrowse);
  useEffect(() => {
    const path = initialProductId ? `${pathname}?product=${initialProductId}` : pathname;
    setLastBrowse(path, "Reprendre ma personnalisation");
  }, [pathname, initialProductId, setLastBrowse]);

  const [activeTab, setActiveTab] = useState<"product" | "fabric" | "embroidery" | "summary">("product");

  const [configuration, setConfiguration] = useState<ConfigurateurConfiguration>(() => {
    if (products.length === 0 || fabrics.length === 0) {
      return {
        product: null,
        fabric: null,
        size: null,
        embroideries: [""],
        embroideryColor: "#D4AF37",
        embroideryFont: null,
        selectedColor: null,
      };
    }

    let initialConfigProduct = products[0];
    if (initialProductId) {
      const found = products.find(
        (p) =>
          p.id.toLowerCase() === initialProductId.toLowerCase() ||
          p.name.toLowerCase().includes(initialProductId.toLowerCase()),
      );
      if (found) initialConfigProduct = found;
    }

    return {
      product: initialConfigProduct,
      fabric: fabrics[0],
      size: initialConfigProduct?.defaultSize ?? initialConfigProduct?.sizes?.[0] ?? null,
      embroideries: [""],
      embroideryColor: embroideryColors[0]?.hex ?? "#D4AF37",
      embroideryFont: embroideryFonts[0] ?? FALLBACK_EMBROIDERY_FONT,
      selectedColor:
        initialConfigProduct?.colorMaskImage && productColors[0] ? productColors[0].hex : null,
    };
  });

  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem, openCart } = useCartStore();
  const previewRef = useRef<ProductPreviewPanelHandle>(null);

  const totalPrice = () => {
    let total = configuration.product?.basePrice || 0;
    total += configuration.fabric?.price || 0;
    if (configuration.embroideries.some((e) => e.length > 0)) {
      total += configuration.embroideryFont?.price ?? 0;
    }
    return total;
  };

  const tabs = [
    { id: "product" as const, label: "Produit", complete: !!configuration.product },
    { id: "fabric" as const, label: "Tissu", complete: !!configuration.fabric },
    { id: "embroidery" as const, label: "Broderie", complete: configuration.embroideries.some((e) => e.length > 0) },
    { id: "summary" as const, label: "Résumé", complete: false },
  ];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);
  const productNeedsSize = !!(configuration.product?.sizes?.length);
  const canGoNext =
    currentTabIndex < tabs.length - 1 &&
    (activeTab === "product"
      ? !!configuration.product && (!productNeedsSize || !!configuration.size)
      : activeTab === "fabric"
        ? !!configuration.fabric
        : true);
  const canGoPrevious = currentTabIndex > 0;

  const goNext = () => { if (canGoNext) setActiveTab(tabs[currentTabIndex + 1].id); };
  const goPrevious = () => { if (canGoPrevious) setActiveTab(tabs[currentTabIndex - 1].id); };

  // Selecting a product resets size/color to its defaults, but only when it's
  // actually a different product — re-picking the current one (e.g. from the
  // color-bubble "Modifier" affordance) must not wipe the customer's choices.
  // Shared by both ProductStep and the "produits similaires" picker below.
  const handleSelectProduct = (product: ConfigurateurProduct) => {
    setConfiguration((prev) => {
      const isNew = prev.product?.id !== product.id;
      return {
        ...prev,
        product,
        size: isNew ? (product.defaultSize ?? product.sizes?.[0] ?? null) : prev.size,
        selectedColor: product.colorMaskImage
          ? isNew
            ? productColors[0]?.hex
            : prev.selectedColor
          : null,
      };
    });
  };

  const handleSelectSize = (size: string) => setConfiguration((prev) => ({ ...prev, size }));
  const handleSelectProductColor = (hex: string) => setConfiguration((prev) => ({ ...prev, selectedColor: hex }));
  const handleSelectFabric = (fabric: ConfigurateurFabric) => setConfiguration((prev) => ({ ...prev, fabric }));

  const handleTextChange = (index: number, value: string) => {
    setConfiguration((prev) => {
      const next = [...prev.embroideries];
      next[index] = value;
      return { ...prev, embroideries: next };
    });
  };
  const handleAddText = () =>
    setConfiguration((prev) => ({ ...prev, embroideries: [...prev.embroideries, ""] }));
  const handleRemoveText = (index: number) =>
    setConfiguration((prev) => ({ ...prev, embroideries: prev.embroideries.filter((_, i) => i !== index) }));
  const handleSelectEmbroideryColor = (hex: string) =>
    setConfiguration((prev) => ({ ...prev, embroideryColor: hex }));
  const handleSelectFont = (font: ConfigurateurEmbroideryFont) =>
    setConfiguration((prev) => ({ ...prev, embroideryFont: font }));

  const handleAddToCart = async () => {
    if (!configuration.product || !configuration.fabric) return;

    const thumbnailDataUrl = await previewRef.current?.captureThumbnail();

    addItem({
      id: `custom-${configuration.product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      productId: configuration.product.id,
      productName: configuration.product.name,
      configuration: {
        fabricName: configuration.fabric.name,
        fabricColor: configuration.fabric.baseColor,
        embroidery: configuration.embroideryFont
          ? configuration.embroideries.filter(Boolean).map((t) => normalizeForFont(t, configuration.embroideryFont!.id)).join(", ") || undefined
          : configuration.embroideries.filter(Boolean).join(", ") || undefined,
        embroideryColor:
          configuration.embroideries.some((e) => e) && configuration.embroideryFont?.supportsThreadColor !== false
            ? configuration.embroideryColor
            : undefined,
        embroideryColorName:
          configuration.embroideries.some((e) => e) && configuration.embroideryFont?.supportsThreadColor !== false
            ? (embroideryColors.find((c) => c.hex === configuration.embroideryColor)?.name ?? undefined)
            : undefined,
        embroideryFont: configuration.embroideries.some((e) => e) ? (configuration.embroideryFont?.name ?? undefined) : undefined,
        size: configuration.size || undefined,
        selectedColor: configuration.selectedColor || undefined,
        selectedColorName: configuration.selectedColor
          ? (productColors.find((c) => c.hex === configuration.selectedColor)?.name ?? undefined)
          : undefined,
      },
      price: centsToEuros(cents(totalPrice())),
      weight: configuration.product.weight ?? 0,
      quantity: 1,
      thumbnail: thumbnailDataUrl,
    });
    setAddedToCart(true);
    setTimeout(() => { setAddedToCart(false); openCart(); }, 1500);
  };

  // --- Render ---

  if (!configuration.product || !configuration.fabric) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-paper)" }}>
        <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
          Aucun produit ou tissu disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-paper)" }}>
      <div className="flex min-h-screen flex-col lg:flex-row" style={{ marginTop: "90px" }}>
        <ProductPreviewPanel
          ref={previewRef}
          product={configuration.product}
          fabric={configuration.fabric}
          embroideries={configuration.embroideries}
          embroideryColor={configuration.embroideryColor}
          embroideryFont={configuration.embroideryFont}
          selectedColor={configuration.selectedColor}
          totalPriceCents={totalPrice()}
        />

        {/* RIGHT: Options */}
        <div className="flex flex-col lg:h-[calc(100vh-90px)] lg:w-1/2" style={{ background: "var(--color-paper)" }}>
          <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">

            {/* Mobile product summary */}
            <div className="mb-6 flex items-center justify-between py-3 lg:hidden" style={{ borderBottom: "var(--rule-soft)" }}>
              <div>
                <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                  {configuration.product.name}
                </p>
                <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                  {configuration.fabric.name}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="type-overline" style={{ color: "var(--color-accent)" }}>
                  Étape {currentTabIndex + 1} / {tabs.length}
                </p>
                <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                  {tabs[currentTabIndex].label}
                </p>
              </div>
              <div className="h-px w-full" style={{ background: "var(--color-paper-2)" }}>
                <div
                  className="h-px transition-all duration-700 ease-out"
                  style={{ width: `${((currentTabIndex + 1) / tabs.length) * 100}%`, background: "var(--color-accent)" }}
                />
              </div>
            </div>

            {/* Tabs navigation — numbered */}
            <div className="mb-8 flex items-end gap-6 overflow-x-auto" style={{ borderBottom: "var(--rule-soft)" }}>
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                const isPast = index < currentTabIndex;
                const isLocked = index > currentTabIndex + 1 || (index === currentTabIndex + 1 && !canGoNext);
                return (
                  <button
                    key={tab.id}
                    onClick={() => { if (!isLocked) setActiveTab(tab.id); }}
                    disabled={isLocked}
                    className="shrink-0 pb-3 transition-all duration-200"
                    style={{
                      borderBottom: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
                      marginBottom: "-1px",
                      color: isActive ? "var(--color-accent)" : isPast ? "var(--color-ink)" : "var(--color-ink-3)",
                      opacity: isLocked ? 0.25 : 1,
                      cursor: isLocked ? "not-allowed" : "pointer",
                    }}
                  >
                    <span className="font-body text-xs" style={{ opacity: 0.6 }}>0{index + 1}</span>
                    <span className="font-body ml-1.5 text-sm hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="space-y-6">
              {activeTab === "product" && (
                <ProductStep
                  products={products}
                  productColors={productColors}
                  selectedProduct={configuration.product}
                  selectedSize={configuration.size}
                  selectedColor={configuration.selectedColor}
                  onSelectProduct={handleSelectProduct}
                  onSelectSize={handleSelectSize}
                  onSelectColor={handleSelectProductColor}
                />
              )}

              {activeTab === "fabric" && (
                <FabricStep
                  categories={categories}
                  fabrics={fabrics}
                  selectedFabricId={configuration.fabric?.id}
                  onSelectFabric={handleSelectFabric}
                />
              )}

              {activeTab === "embroidery" && (
                <EmbroideryStep
                  product={configuration.product}
                  texts={configuration.embroideries}
                  color={configuration.embroideryColor}
                  font={configuration.embroideryFont}
                  embroideryColors={embroideryColors}
                  embroideryFonts={embroideryFonts}
                  onTextChange={handleTextChange}
                  onAddText={handleAddText}
                  onRemoveText={handleRemoveText}
                  onSelectColor={handleSelectEmbroideryColor}
                  onSelectFont={handleSelectFont}
                />
              )}

              {activeTab === "summary" && (
                <SummaryStep
                  product={configuration.product}
                  fabric={configuration.fabric}
                  size={configuration.size}
                  selectedColor={configuration.selectedColor}
                  productColors={productColors}
                  embroideries={configuration.embroideries}
                  embroideryColor={configuration.embroideryColor}
                  embroideryColors={embroideryColors}
                  embroideryFont={configuration.embroideryFont}
                  totalPriceCents={totalPrice()}
                />
              )}
            </div>
          </div>

          {/* Footer sticky */}
          <div className="sticky bottom-0 px-6 py-4 lg:px-8" style={{ background: "var(--color-paper)", borderTop: "var(--rule-hair)" }}>
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={goPrevious}
                disabled={!canGoPrevious}
                className="flex items-center gap-2 font-body text-sm transition-opacity hover:opacity-60 disabled:opacity-20"
                style={{ color: "var(--color-ink)" }}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Précédent</span>
              </button>

              <div className="text-center">
                <p className="type-overline" style={{ color: "var(--color-ink-3)" }}>Total</p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "var(--text-title)", color: "var(--color-ink)" }}>
                  {totalPrice() / 100} €
                </p>
              </div>

              {activeTab === "summary" ? (
                <button
                  onClick={handleAddToCart}
                  disabled={!configuration.product || !configuration.fabric}
                  className="flex items-center gap-2 px-6 py-3.5 font-body text-sm tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-20"
                  style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
                >
                  <ShoppingBag className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Ajouter au panier</span>
                  <span className="sm:hidden">Panier</span>
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!canGoNext}
                  className="flex items-center gap-2 px-6 py-3.5 font-body text-sm tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-20"
                  style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
                >
                  <span>Suivant</span>
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProductMarketingSection
        product={configuration.product}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Toast confirmation */}
      {addedToCart && (
        <div className="animate-fade-in-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div
            className="flex items-center gap-4 px-6 py-4"
            style={{ background: "var(--color-paper)", border: "var(--rule-hair)", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center" style={{ background: "var(--color-accent)" }}>
              <Check className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                Ajouté au panier
              </p>
              <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                {configuration.product?.name} · {configuration.fabric?.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguratorClient;
