"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCartStore } from "@/lib/store/cart-store";
import { Check, ChevronLeft, ChevronRight, Palette, ShoppingBag, X } from "lucide-react";
import { cents, centsToEuros } from "@/lib/currency";
import { normalizeForFont } from "@/lib/embroidery/normalize";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

import EmbroideryPreview from "@/components/configurator/EmbroideryPreview";
import EmbroideryZoneOverlay from "@/components/configurator/EmbroideryZoneOverlay";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  ConfigurateurConfiguration,
  ConfigurateurEmbroideryFont,
  ConfigurateurFabric,
  ConfigurateurFabricCategory,
  ConfigurateurProduct,
} from "@/types/configurateur-page";

interface SeeAllDialogProps {
  title: string;
  description: string;
  fabrics: ConfigurateurFabric[];
  configuration: ConfigurateurConfiguration;
  setConfiguration: Dispatch<SetStateAction<ConfigurateurConfiguration>>;
}

interface FabricCategoryProps {
  title: string;
  description: string;
  prefix: string;
  fabrics: ConfigurateurFabric[];
  configuration: ConfigurateurConfiguration;
  setConfiguration: Dispatch<SetStateAction<ConfigurateurConfiguration>>;
}

interface FabricGridItemProps {
  fabric: ConfigurateurFabric;
  isSelected: boolean;
  onSelect: () => void;
}

// Police de secours utilisée uniquement si la table des polices de broderie
// ne renvoie aucune ligne active (ex. avant tout paramétrage via l'admin).
// Reproduit le comportement historique (Moonlight, 15 €) au lieu de rendre
// la broderie invisible et gratuite.
const FALLBACK_EMBROIDERY_FONT: ConfigurateurEmbroideryFont = {
  id: "moonlight",
  name: "Moonlight",
  folder: "moonlight",
  format: "exp",
  price: 1500,
  order: 0,
};

function FabricCategorySection({
  title,
  description,
  prefix,
  fabrics,
  configuration,
  setConfiguration,
}: FabricCategoryProps) {
  const categoryFabrics = fabrics.filter((f) =>
    f.category ? f.category === prefix : f.id.startsWith(prefix),
  );
  const displayedFabrics = categoryFabrics.slice(0, 8);
  const hasMore = categoryFabrics.length > 8;

  return (
    <div className="py-6" style={{ borderTop: "var(--rule-soft)" }}>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "1.125rem",
              color: "var(--color-ink)",
            }}
          >
            {title}
          </h3>
          <p className="font-body mt-1 text-xs" style={{ color: "var(--color-ink-3)" }}>
            {description}
          </p>
        </div>
        {hasMore && (
          <SeeAllDialog
            title={title}
            description={`${title} · ${categoryFabrics.length} variantes`}
            fabrics={categoryFabrics}
            configuration={configuration}
            setConfiguration={setConfiguration}
          />
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 lg:grid-cols-8">
        {displayedFabrics.map((fabric) => (
          <FabricGridItem
            key={fabric.id}
            fabric={fabric}
            isSelected={configuration.fabric?.id === fabric.id}
            onSelect={() => setConfiguration((prev) => ({ ...prev, fabric }))}
          />
        ))}
      </div>
    </div>
  );
}

function FabricGridItem({ fabric, isSelected, onSelect }: FabricGridItemProps) {
  return (
    <button
      onClick={onSelect}
      className="group relative flex flex-col overflow-hidden transition-all duration-300"
      style={{
        border: isSelected ? "2px solid var(--color-accent)" : "2px solid transparent",
        outline: "none",
      }}
    >
      <div
        className="aspect-square w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url('${fabric.image}')` }}
      />
      {isSelected && (
        <div
          className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center"
          style={{ background: "var(--color-accent)" }}
        >
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
}

function SeeAllDialog({
  title,
  description,
  fabrics,
  configuration,
  setConfiguration,
}: SeeAllDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="font-body text-xs transition-opacity hover:opacity-70"
          style={{ color: "var(--color-ink-3)", borderBottom: "1px solid var(--color-accent)" }}
        >
          Voir tout →
        </button>
      </DialogTrigger>

      <DialogContent
        className="z-50 max-h-[90vh] max-w-5xl overflow-hidden p-0"
        style={{ background: "var(--color-paper)", border: "var(--rule-hair)" }}
      >
        <div
          className="sticky top-0 z-20 px-8 py-6"
          style={{ background: "var(--color-paper)", borderBottom: "var(--rule-hair)" }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "var(--text-title)",
                color: "var(--color-ink)",
              }}
            >
              {title}
            </DialogTitle>
            <DialogDescription className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto px-8 py-8" style={{ maxHeight: "calc(90vh - 120px)" }}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {fabrics.map((fabric) => (
              <FabricGridItem
                key={fabric.id}
                fabric={fabric}
                isSelected={configuration.fabric?.id === fabric.id}
                onSelect={() => setConfiguration((prev) => ({ ...prev, fabric }))}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const ProductConfigurator = () => {
  const [products, setProducts] = useState<ConfigurateurProduct[]>([]);
  const [fabrics, setFabrics] = useState<ConfigurateurFabric[]>([]);
  const [categories, setCategories] = useState<ConfigurateurFabricCategory[]>([]);
  const [productColors, setProductColors] = useState<{ name: string; hex: string }[]>([]);
  const [embroideryColors, setEmbroideryColors] = useState<{ name: string; hex: string }[]>([]);
  const [embroideryFonts, setEmbroideryFonts] = useState<ConfigurateurEmbroideryFont[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"product" | "fabric" | "embroidery" | "summary">("product");

  const [configuration, setConfiguration] = useState<ConfigurateurConfiguration>({
    product: null,
    fabric: null,
    size: null,
    embroideries: [""],
    embroideryColor: "#D4AF37",
    embroideryFont: null,
    selectedColor: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showColorBubble, setShowColorBubble] = useState(false);

  const { addItem, openCart } = useCartStore();
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get("product");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const productContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadConfiguratorData() {
      try {
        const [prodRes, fabRes, catRes, productColorsRes, embroideryColorsRes, embroideryFontsRes] = await Promise.all([
          fetch("/api/configurator/products?active=true"),
          fetch("/api/configurator/fabrics?active=true"),
          fetch("/api/configurator/categories?active=true"),
          fetch("/api/configurator/colors?type=product&active=true"),
          fetch("/api/configurator/colors?type=embroidery&active=true"),
          fetch("/api/configurator/embroidery-fonts?active=true"),
        ]);
        const prodData = await prodRes.json();
        const fabData = await fabRes.json();
        const catData = await catRes.json();
        const productColorsData = await productColorsRes.json();
        const embroideryColorsData = await embroideryColorsRes.json();

        const loadedProducts = prodData.products || [];
        const loadedFabrics = fabData.fabrics || [];
        const loadedCategories = catData.categories || [];
        const loadedProductColors: { name: string; hex: string }[] = productColorsData.colors || [];
        const loadedEmbroideryColors: { name: string; hex: string }[] = embroideryColorsData.colors || [];
        const embroideryFontsData = await embroideryFontsRes.json();
        const loadedEmbroideryFonts: ConfigurateurEmbroideryFont[] = embroideryFontsData.fonts || [];
        setEmbroideryFonts(loadedEmbroideryFonts);

        setProducts(loadedProducts);
        setFabrics(loadedFabrics);
        setCategories(loadedCategories);
        setProductColors(loadedProductColors);
        setEmbroideryColors(loadedEmbroideryColors);

        let initialConfigProduct = loadedProducts[0];
        if (initialProductId && loadedProducts.length > 0) {
          const found = loadedProducts.find(
            (p: ConfigurateurProduct) =>
              p.id.toLowerCase() === initialProductId.toLowerCase() ||
              p.name.toLowerCase().includes(initialProductId.toLowerCase()),
          );
          if (found) initialConfigProduct = found;
        }

        if (loadedProducts.length > 0 && loadedFabrics.length > 0) {
          setConfiguration((prev) => ({
            ...prev,
            product: initialConfigProduct,
            fabric: loadedFabrics[0],
            size: initialConfigProduct?.defaultSize ?? initialConfigProduct?.sizes?.[0] ?? null,
            embroideryColor: loadedEmbroideryColors[0]?.hex ?? "#D4AF37",
            embroideryFont: loadedEmbroideryFonts[0] ?? FALLBACK_EMBROIDERY_FONT,
            selectedColor:
              initialConfigProduct?.colorMaskImage && loadedProductColors[0]
                ? loadedProductColors[0].hex
                : null,
          }));
        }
      } catch (e) {
        console.error("Erreur de chargement des données", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfiguratorData();
  }, [initialProductId]);

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

  const handleAddToCart = () => {
    if (!configuration.product || !configuration.fabric) return;

    const canvas = canvasRef.current;
    let thumbnailDataUrl: string | undefined;
    if (canvas) {
      try {
        const compositeCanvas = document.createElement("canvas");
        compositeCanvas.width = canvas.width;
        compositeCanvas.height = canvas.height;
        const compositeCtx = compositeCanvas.getContext("2d");
        if (compositeCtx) {
          compositeCtx.drawImage(canvas, 0, 0);
          if (
            configuration.embroideries.some((e) => e) &&
            configuration.product.embroideryZone &&
            productContainerRef.current
          ) {
            const container = productContainerRef.current;
            const allCanvases = container.querySelectorAll<HTMLCanvasElement>("canvas");
            const embCanvases = allCanvases.length > 1 ? Array.from(allCanvases).slice(1) : [];
            if (embCanvases.length > 0) {
              const containerRect = container.getBoundingClientRect();
              const scaleX = canvas.width / containerRect.width;
              const scaleY = canvas.height / containerRect.height;
              for (const embCanvas of embCanvases) {
                const embRect = embCanvas.getBoundingClientRect();
                compositeCtx.drawImage(
                  embCanvas,
                  (embRect.left - containerRect.left) * scaleX,
                  (embRect.top - containerRect.top) * scaleY,
                  embRect.width * scaleX,
                  embRect.height * scaleY,
                );
              }
            }
          }
          thumbnailDataUrl = compositeCanvas.toDataURL("image/png");
        }
      } catch (e) {
        console.warn("Impossible de capturer le thumbnail", e);
        try { thumbnailDataUrl = canvas.toDataURL("image/png"); } catch {}
      }
    }

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
        embroideryColor: configuration.embroideries.some((e) => e) ? configuration.embroideryColor : undefined,
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

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    if (imageCache.current[src]) return Promise.resolve(imageCache.current[src]);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => { imageCache.current[src] = img; resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  };

  useEffect(() => {
    const renderCanvas = async () => {
      if (!configuration.product || !configuration.fabric) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      setIsProcessing(true);
      try {
        const baseImg = await loadImage(configuration.product.baseImage);
        let maskImg = null;
        try { maskImg = await loadImage(configuration.product.maskImage); } catch (e) { console.warn("No mask", e); }
        const fabricImg = await loadImage(configuration.fabric.image);

        canvas.width = baseImg.width;
        canvas.height = baseImg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseImg, 0, 0);

        if (maskImg) {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
            const maskData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
            const textureCanvas = document.createElement("canvas");
            textureCanvas.width = canvas.width;
            textureCanvas.height = canvas.height;
            const textureCtx = textureCanvas.getContext("2d");
            if (textureCtx) {
              textureCtx.drawImage(fabricImg, 0, 0, canvas.width, canvas.height);
              const textureData = textureCtx.getImageData(0, 0, canvas.width, canvas.height);
              const baseData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              for (let i = 0; i < maskData.data.length; i += 4) {
                const maskAlpha = maskData.data[i] / 255;
                if (maskAlpha > 0.1) {
                  const baseR = baseData.data[i], baseG = baseData.data[i + 1], baseB = baseData.data[i + 2];
                  const texR = textureData.data[i], texG = textureData.data[i + 1], texB = textureData.data[i + 2];
                  const bf = 1.15;
                  const fR = Math.min(255, (baseR * texR / 255) * bf);
                  const fG = Math.min(255, (baseG * texG / 255) * bf);
                  const fB = Math.min(255, (baseB * texB / 255) * bf);
                  baseData.data[i] = fR * maskAlpha + baseR * (1 - maskAlpha);
                  baseData.data[i + 1] = fG * maskAlpha + baseG * (1 - maskAlpha);
                  baseData.data[i + 2] = fB * maskAlpha + baseB * (1 - maskAlpha);
                }
              }
              ctx.putImageData(baseData, 0, 0);
            }
          }
        }

        if (configuration.product.colorMaskImage && configuration.selectedColor) {
          try {
            const colorMaskImg = await loadImage(configuration.product.colorMaskImage);
            const colorMaskCanvas = document.createElement("canvas");
            colorMaskCanvas.width = canvas.width;
            colorMaskCanvas.height = canvas.height;
            const colorMaskCtx = colorMaskCanvas.getContext("2d");
            if (colorMaskCtx) {
              colorMaskCtx.drawImage(colorMaskImg, 0, 0, canvas.width, canvas.height);
              const colorMaskData = colorMaskCtx.getImageData(0, 0, canvas.width, canvas.height);
              const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const hex = configuration.selectedColor;
              const colorR = parseInt(hex.slice(1, 3), 16);
              const colorG = parseInt(hex.slice(3, 5), 16);
              const colorB = parseInt(hex.slice(5, 7), 16);
              for (let i = 0; i < colorMaskData.data.length; i += 4) {
                const maskAlpha = colorMaskData.data[i] / 255;
                if (maskAlpha > 0.1) {
                  const baseR = currentData.data[i], baseG = currentData.data[i + 1], baseB = currentData.data[i + 2];
                  const bf = 1.4;
                  const fR = Math.min(255, (baseR * colorR / 255) * bf);
                  const fG = Math.min(255, (baseG * colorG / 255) * bf);
                  const fB = Math.min(255, (baseB * colorB / 255) * bf);
                  currentData.data[i] = fR * maskAlpha + baseR * (1 - maskAlpha);
                  currentData.data[i + 1] = fG * maskAlpha + baseG * (1 - maskAlpha);
                  currentData.data[i + 2] = fB * maskAlpha + baseB * (1 - maskAlpha);
                }
              }
              ctx.putImageData(currentData, 0, 0);
            }
          } catch (e) { console.warn("Color mask error", e); }
        }
      } catch (err) {
        console.error("Canvas error", err);
      } finally {
        setIsProcessing(false);
      }
    };
    renderCanvas();
  }, [
    configuration.product,
    configuration.fabric,
    configuration.embroideries,
    configuration.embroideryColor,
    configuration.selectedColor,
  ]);

  // --- Render ---

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-paper)" }}>
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

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
      <div
        className="flex min-h-screen flex-col lg:flex-row"
        style={{ marginTop: "90px" }}
      >
        {/* LEFT: Preview sticky */}
        <div
          className="relative flex h-[50vh] flex-col items-center justify-center p-4 sm:p-6 lg:sticky lg:top-[90px] lg:h-[calc(100vh-90px)] lg:w-1/2 lg:p-8"
          style={{ background: "var(--color-paper-3)" }}
        >
          <div
            className="w-full max-w-lg p-6 lg:p-8"
            style={{
              background: "var(--color-paper)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
            }}
          >
          <div
            ref={productContainerRef}
            className={`relative w-full overflow-hidden transition-opacity duration-300 ${isProcessing ? "opacity-50" : "opacity-100"}`}
          >
            <canvas ref={canvasRef} className="h-auto w-full" />
            {configuration.embroideries.some((e) => e) && configuration.product?.embroideryZone && configuration.embroideryFont && (
              <EmbroideryZoneOverlay
                texts={configuration.embroideries.filter(Boolean).map((t) => normalizeForFont(t, configuration.embroideryFont!.id))}
                threadColor={configuration.embroideryColor}
                zone={configuration.product.embroideryZone}
                containerRef={productContainerRef}
                fontId={configuration.embroideryFont.id}
                fontFolder={`/fonts/${configuration.embroideryFont.folder}`}
                fontFormat={configuration.embroideryFont.format}
              />
            )}
            {isProcessing && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
                />
              </div>
            )}
          </div>
          </div>

          {/* Info overlay — desktop */}
          {configuration.product && configuration.fabric && (
            <div
              className="absolute top-6 left-6 hidden px-4 py-3 lg:block"
              style={{ background: "var(--color-paper)", border: "var(--rule-hair)" }}
            >
              <p className="type-overline mb-1" style={{ color: "var(--color-ink-3)" }}>
                Votre création
              </p>
              <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                {configuration.product.name}
              </p>
              <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                {configuration.fabric.name}
              </p>
            </div>
          )}

          {/* Prix — mobile */}
          <div
            className="absolute top-6 right-6 px-4 py-3 lg:hidden"
            style={{ background: "var(--color-paper)", border: "var(--rule-hair)" }}
          >
            <p className="type-overline mb-0.5" style={{ color: "var(--color-ink-3)" }}>Total</p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "var(--text-title)",
                color: "var(--color-accent)",
              }}
            >
              {totalPrice() / 100} €
            </p>
          </div>
        </div>

        {/* RIGHT: Options */}
        <div
          className="flex flex-col lg:h-[calc(100vh-90px)] lg:w-1/2"
          style={{ background: "var(--color-paper)" }}
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">

            {/* Mobile product summary */}
            {configuration.product && configuration.fabric && (
              <div
                className="mb-6 flex items-center justify-between py-3 lg:hidden"
                style={{ borderBottom: "var(--rule-soft)" }}
              >
                <div>
                  <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                    {configuration.product.name}
                  </p>
                  <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                    {configuration.fabric.name}
                  </p>
                </div>
              </div>
            )}

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
                  style={{
                    width: `${((currentTabIndex + 1) / tabs.length) * 100}%`,
                    background: "var(--color-accent)",
                  }}
                />
              </div>
            </div>

            {/* Tabs navigation — numbered */}
            <div
              className="mb-8 flex items-end gap-6 overflow-x-auto"
              style={{ borderBottom: "var(--rule-soft)" }}
            >
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
                      color: isActive
                        ? "var(--color-accent)"
                        : isPast
                          ? "var(--color-ink)"
                          : "var(--color-ink-3)",
                      opacity: isLocked ? 0.25 : 1,
                      cursor: isLocked ? "not-allowed" : "pointer",
                    }}
                  >
                    <span className="font-body text-xs" style={{ opacity: 0.6 }}>
                      0{index + 1}
                    </span>
                    <span className="font-body ml-1.5 text-sm hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="space-y-6">

              {/* Step 1 — Produit */}
              {activeTab === "product" && (
                <>
                  <div>
                    <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>
                      Étape 01
                    </p>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "1.75rem",
                        color: "var(--color-ink)",
                      }}
                    >
                      Choisissez votre produit
                    </h2>
                    <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
                      Sélectionnez le produit à personnaliser
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {products.map((product) => {
                      const isSelected = configuration.product?.id === product.id;
                      return (
                        <button
                          key={product.id}
                          onClick={() => {
                            const isNew = configuration.product?.id !== product.id;
                            setConfiguration((prev) => ({
                              ...prev,
                              product,
                              size: isNew
                                ? (product.defaultSize ?? product.sizes?.[0] ?? null)
                                : prev.size,
                              selectedColor: product.colorMaskImage
                                ? isNew ? productColors[0]?.hex : prev.selectedColor
                                : null,
                            }));
                            if (product.colorMaskImage) setShowColorBubble(true);
                          }}
                          className="w-full text-left transition-all duration-200"
                          style={{
                            border: isSelected
                              ? "2px solid var(--color-accent)"
                              : "var(--rule-soft)",
                            background: isSelected ? "var(--color-paper-2)" : "var(--color-paper)",
                          }}
                        >
                          {/* Ligne principale */}
                          <div className="flex items-center gap-3 px-4 py-3.5">
                            <span className="shrink-0 text-lg leading-none">{product.icon}</span>
                            <div className="min-w-0 flex-1">
                              <p
                                style={{
                                  fontFamily: "var(--font-display)",
                                  fontWeight: 400,
                                  fontSize: "1rem",
                                  color: "var(--color-ink)",
                                  lineHeight: 1.2,
                                }}
                              >
                                {product.name}
                              </p>
                              <p
                                style={{
                                  fontFamily: "var(--font-display)",
                                  fontWeight: 400,
                                  fontSize: "var(--text-caption)",
                                  color: "var(--color-accent)",
                                  marginTop: "0.125rem",
                                }}
                              >
                                {product.basePrice / 100} €
                              </p>
                            </div>
                            {isSelected ? (
                              <div
                                className="flex h-5 w-5 shrink-0 items-center justify-center"
                                style={{ background: "var(--color-accent)" }}
                              >
                                <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                              </div>
                            ) : (
                              <ChevronRight
                                className="h-4 w-4 shrink-0"
                                style={{ color: "var(--color-ink-3)" }}
                                strokeWidth={1.5}
                              />
                            )}
                          </div>

                          {/* Couleur — apparaît uniquement si sélectionné et colorMask */}
                          {isSelected && product.colorMaskImage && configuration.selectedColor && (
                            <div
                              onClick={(e) => { e.stopPropagation(); setShowColorBubble(true); }}
                              className="flex items-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-70"
                              style={{ borderTop: "var(--rule-soft)" }}
                            >
                              <div
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: configuration.selectedColor }}
                              />
                              <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                                {productColors.find((c) => c.hex === configuration.selectedColor)?.name}
                              </span>
                              <span
                                className="ml-auto font-body text-xs"
                                style={{ color: "var(--color-accent)", borderBottom: "1px solid var(--color-accent)" }}
                              >
                                Modifier
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Taille */}
                  {configuration.product?.sizes && configuration.product.sizes.length > 0 && (
                    <div className="p-5" style={{ background: "var(--color-paper-2)" }}>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
                          Taille
                        </span>
                        {configuration.size && (
                          <span className="font-body text-sm" style={{ color: "var(--color-accent)" }}>
                            {configuration.size}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {configuration.product.sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setConfiguration((prev) => ({ ...prev, size }))}
                            className="font-body px-4 py-2 text-sm transition-opacity hover:opacity-70"
                            style={{
                              border: configuration.size === size
                                ? "2px solid var(--color-accent)"
                                : "var(--rule-soft)",
                              color: configuration.size === size
                                ? "var(--color-accent)"
                                : "var(--color-ink)",
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      {productNeedsSize && !configuration.size && (
                        <p className="font-body mt-2 text-xs" style={{ color: "var(--color-accent)" }}>
                          Veuillez sélectionner une taille pour continuer
                        </p>
                      )}
                    </div>
                  )}

                  {/* Bulle couleur produit */}
                  {showColorBubble && configuration.product?.colorMaskImage && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowColorBubble(false)} />
                      <div
                        className="fixed bottom-24 left-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden"
                        style={{
                          background: "var(--color-paper)",
                          border: "var(--rule-hair)",
                          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
                        }}
                      >
                        <div
                          className="flex items-center justify-between px-5 py-4"
                          style={{ background: "var(--color-paper-2)", borderBottom: "var(--rule-hair)" }}
                        >
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                            <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
                              Couleur de l&apos;élément
                            </span>
                          </div>
                          <button
                            onClick={() => setShowColorBubble(false)}
                            className="transition-opacity hover:opacity-50"
                            style={{ color: "var(--color-ink-3)" }}
                          >
                            <X className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        <div className="p-5">
                          <div className="flex flex-wrap gap-3">
                            {productColors.map((color) => (
                              <button
                                key={color.hex}
                                onClick={() => {
                                  setConfiguration((prev) => ({ ...prev, selectedColor: color.hex }));
                                  setShowColorBubble(false);
                                }}
                                className={`relative h-10 w-10 rounded-full border-2 border-white transition-all duration-200 ${
                                  configuration.selectedColor === color.hex ? "scale-110 shadow-md" : "hover:scale-105"
                                }`}
                                style={{
                                  backgroundColor: color.hex,
                                  outline: configuration.selectedColor === color.hex
                                    ? "2px solid var(--color-accent)"
                                    : "none",
                                  outlineOffset: "2px",
                                }}
                                title={color.name}
                              >
                                {configuration.selectedColor === color.hex && (
                                  <div className="absolute inset-0 flex items-center justify-center rounded-full">
                                    <Check className="h-4 w-4 text-white drop-shadow-sm" strokeWidth={2.5} />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Step 2 — Tissu */}
              {activeTab === "fabric" && (
                <>
                  <div>
                    <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>
                      Étape 02
                    </p>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "1.75rem",
                        color: "var(--color-ink)",
                      }}
                    >
                      Choisissez votre tissu
                    </h2>
                    <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
                      Visible en temps réel · Collection premium
                    </p>
                  </div>

                  <div>
                    {categories.map((category) => (
                      <FabricCategorySection
                        key={category.id}
                        title={category.title}
                        description={category.description}
                        prefix={category.id}
                        fabrics={fabrics}
                        configuration={configuration}
                        setConfiguration={setConfiguration}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Step 3 — Broderie */}
              {activeTab === "embroidery" && (
                <>
                  <div>
                    <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>
                      Étape 03
                    </p>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "1.75rem",
                        color: "var(--color-ink)",
                      }}
                    >
                      Broderie personnalisée
                    </h2>
                    <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
                      +{((configuration.embroideryFont?.price ?? 0) / 100).toFixed(2)} € · Aperçu immédiat sur le produit
                    </p>
                  </div>

                  {/* Noms à broder */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
                        Noms à broder
                      </span>
                      {configuration.product?.embroideryZone?.multiNameEnabled !== false && (
                        <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                          {configuration.embroideries.length} / 3
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      {configuration.embroideries.map((name, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="relative flex-1" style={{ borderBottom: "var(--rule-soft)" }}>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => {
                                const next = [...configuration.embroideries];
                                next[index] = e.target.value.slice(0, 15);
                                setConfiguration((prev) => ({ ...prev, embroideries: next }));
                              }}
                              placeholder={
                                index === 0 ? "Ex : Zoé" : index === 1 ? "Ex : Mon Bébé" : "Ex : Chéri(e)"
                              }
                              className="w-full bg-transparent py-3 font-body text-base outline-none placeholder:opacity-30"
                              style={{ color: "var(--color-ink)", caretColor: "var(--color-accent)" }}
                              maxLength={15}
                            />
                            <span
                              className="absolute top-1/2 right-0 -translate-y-1/2 font-body text-xs opacity-50"
                              style={{
                                color: name.length >= 12 ? "var(--color-accent)" : "var(--color-ink-3)",
                              }}
                            >
                              {name.length}/15
                            </span>
                          </div>
                          {configuration.embroideries.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = configuration.embroideries.filter((_, i) => i !== index);
                                setConfiguration((prev) => ({ ...prev, embroideries: next }));
                              }}
                              className="transition-opacity hover:opacity-50"
                              style={{ color: "var(--color-ink-3)" }}
                              aria-label="Supprimer ce nom"
                            >
                              <X className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {configuration.product?.embroideryZone?.multiNameEnabled !== false &&
                      configuration.embroideries.length < 3 &&
                      configuration.embroideries[configuration.embroideries.length - 1].length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfiguration((prev) => ({
                              ...prev,
                              embroideries: [...prev.embroideries, ""],
                            }))
                          }
                          className="mt-4 font-body text-sm transition-opacity hover:opacity-70"
                          style={{
                            color: "var(--color-ink-3)",
                            borderBottom: "1px solid var(--color-accent)",
                          }}
                        >
                          + Ajouter un nom
                        </button>
                      )}

                    <p className="mt-4 font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                      Aperçu en temps réel sur l'image ci-dessus
                    </p>
                  </div>

                  {/* Couleur du fil */}
                  <div style={{ borderTop: "var(--rule-soft)", paddingTop: "1.5rem" }}>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
                        Couleur du fil
                      </span>
                      {configuration.embroideryColor && (
                        <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                          {embroideryColors.find((c) => c.hex === configuration.embroideryColor)?.name}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-6 gap-4 sm:grid-cols-8 md:grid-cols-10">
                      {embroideryColors.map((color) => {
                        const isSelected = configuration.embroideryColor === color.hex;
                        return (
                          <button
                            key={color.hex}
                            onClick={() =>
                              setConfiguration((prev) => ({ ...prev, embroideryColor: color.hex }))
                            }
                            className={`relative h-10 w-10 shrink-0 rounded-full transition-all duration-200 ${
                              isSelected ? "scale-110" : "hover:scale-105"
                            }`}
                            style={{
                              backgroundColor: color.hex,
                              outline: isSelected ? "2px solid var(--color-accent)" : "none",
                              outlineOffset: "2px",
                            }}
                            title={color.name}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-white">
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Police de broderie */}
                  {embroideryFonts.length > 1 && (
                    <div style={{ borderTop: "var(--rule-soft)", paddingTop: "1.5rem" }}>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
                          Police de broderie
                        </span>
                        {configuration.embroideryFont && (
                          <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                            {configuration.embroideryFont.name}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {embroideryFonts.map((font) => {
                          const isSelected = configuration.embroideryFont?.id === font.id;
                          const sampleText = normalizeForFont("Ylang", font.id);
                          return (
                            <button
                              key={font.id}
                              type="button"
                              onClick={() => setConfiguration((prev) => ({ ...prev, embroideryFont: font }))}
                              className="flex flex-col items-center gap-2 p-4 transition-all"
                              style={{
                                border: isSelected ? "2px solid var(--color-accent)" : "var(--rule-soft)",
                                background: isSelected ? "var(--color-paper-2)" : "var(--color-paper)",
                              }}
                            >
                              <EmbroideryPreview
                                text={sampleText}
                                threadColor={configuration.embroideryColor}
                                targetHeight={48}
                                fontId={font.id}
                                fontFolder={`/fonts/${font.folder}`}
                                fontFormat={font.format}
                              />
                              <span className="font-body text-xs" style={{ color: "var(--color-ink)" }}>
                                {font.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step 4 — Résumé */}
              {activeTab === "summary" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-5"
                >
                  <div>
                    <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>
                      Étape 04
                    </p>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "1.75rem",
                        color: "var(--color-ink)",
                      }}
                    >
                      Votre création
                    </h2>
                    <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
                      Vérifiez avant d'ajouter au panier
                    </p>
                  </div>

                  {/* Carte de configuration */}
                  <div style={{ border: "var(--rule-soft)" }}>
                    {/* Produit */}
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 }}
                      className="flex items-start justify-between px-5 py-4"
                      style={{ borderBottom: "var(--rule-soft)" }}
                    >
                      <div>
                        <p className="type-overline mb-1" style={{ color: "var(--color-ink-3)" }}>Produit</p>
                        <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                          {configuration.product?.name}
                        </p>
                        {configuration.size && (
                          <p className="font-body mt-0.5 text-xs" style={{ color: "var(--color-ink-3)" }}>
                            Taille {configuration.size}
                          </p>
                        )}
                      </div>
                      <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
                        {(configuration.product?.basePrice ?? 0) / 100} €
                      </span>
                    </motion.div>

                    {/* Tissu */}
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.14 }}
                      className="flex items-center justify-between px-5 py-4"
                      style={{ borderBottom: "var(--rule-soft)" }}
                    >
                      <div>
                        <p className="type-overline mb-2" style={{ color: "var(--color-ink-3)" }}>Tissu</p>
                        <div className="flex items-center gap-2.5">
                          {configuration.fabric?.image && (
                            <div
                              className="h-8 w-8 shrink-0 bg-cover bg-center"
                              style={{
                                backgroundImage: `url('${configuration.fabric.image}')`,
                                border: "var(--rule-soft)",
                              }}
                            />
                          )}
                          <span className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                            {configuration.fabric?.name}
                          </span>
                        </div>
                      </div>
                      {(configuration.fabric?.price ?? 0) > 0 ? (
                        <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
                          +{configuration.fabric!.price / 100} €
                        </span>
                      ) : (
                        <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>Inclus</span>
                      )}
                    </motion.div>

                    {/* Couleur produit */}
                    {configuration.selectedColor && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.18 }}
                        className="flex items-center justify-between px-5 py-4"
                        style={{ borderBottom: "var(--rule-soft)" }}
                      >
                        <div>
                          <p className="type-overline mb-2" style={{ color: "var(--color-ink-3)" }}>Couleur</p>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-6 w-6 shrink-0 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: configuration.selectedColor }}
                            />
                            <span className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                              {productColors.find((c) => c.hex === configuration.selectedColor)?.name ?? configuration.selectedColor}
                            </span>
                          </div>
                        </div>
                        <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>Inclus</span>
                      </motion.div>
                    )}

                    {/* Broderie */}
                    {configuration.embroideries.some((e) => e) ? (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.22 }}
                        className="flex items-center justify-between px-5 py-4"
                      >
                        <div>
                          <p className="type-overline mb-2" style={{ color: "var(--color-ink-3)" }}>Broderie</p>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-6 w-6 shrink-0 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: configuration.embroideryColor }}
                            />
                            <div>
                              {configuration.embroideries.filter(Boolean).map((name, i) => (
                                <p
                                  key={i}
                                  className="leading-tight"
                                  style={{
                                    fontFamily: "var(--font-display)",
                                    fontWeight: 400,
                                    fontSize: "1.5rem",
                                    color: "var(--color-ink)",
                                  }}
                                >
                                  {name}
                                </p>
                              ))}
                              <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                                {embroideryColors.find((c) => c.hex === configuration.embroideryColor)?.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
                          +{((configuration.embroideryFont?.price ?? 0) / 100).toFixed(2)} €
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.22 }}
                        className="px-5 py-4"
                      >
                        <p className="type-overline mb-1" style={{ color: "var(--color-ink-3)" }}>Broderie</p>
                        <p className="font-body text-xs italic" style={{ color: "var(--color-ink-3)", opacity: 0.5 }}>
                          Aucune broderie
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Total */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    className="flex items-center justify-between px-6 py-5"
                    style={{
                      background: "var(--color-paper-2)",
                      border: "var(--rule-hair)",
                    }}
                  >
                    <div>
                      <p className="type-overline mb-0.5" style={{ color: "var(--color-ink-3)" }}>Total</p>
                      <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                        Livraison calculée au checkout
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "var(--text-headline)",
                        color: "var(--color-accent)",
                        lineHeight: 1,
                      }}
                    >
                      {totalPrice() / 100} €
                    </span>
                  </motion.div>

                  {/* Badges */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.36 }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {["Fait main", "Tissu certifié", "Expédié sous 7j"].map((badge) => (
                      <div
                        key={badge}
                        className="py-3 text-center"
                        style={{ border: "var(--rule-soft)" }}
                      >
                        <span className="type-overline block mb-0.5" style={{ color: "var(--color-accent)" }}>✦</span>
                        <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                          {badge}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer sticky */}
          <div
            className="sticky bottom-0 px-6 py-4 lg:px-8"
            style={{ background: "var(--color-paper)", borderTop: "var(--rule-hair)" }}
          >
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
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "var(--text-title)",
                    color: "var(--color-ink)",
                  }}
                >
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

      {/* Description & Produits similaires */}
      {configuration.product && (
        <div className="px-6 py-20 sm:px-12 lg:px-20" style={{ background: "var(--color-ink-2)" }}>
          <div className="mx-auto max-w-6xl">

            {/* Description */}
            <div className="mb-24 grid grid-cols-1 gap-16 lg:grid-cols-2">

              {/* Visuel */}
              <div className="flex items-center justify-center">
                <div
                  className="relative w-full max-w-sm overflow-hidden"
                  style={{ background: "var(--color-paper)" }}
                >
                  <img
                    src={configuration.product.baseImage}
                    alt={configuration.product.name}
                    className="h-auto w-full object-contain"
                  />
                  <div
                    className="absolute top-5 left-5 px-3 py-1.5"
                    style={{ background: "var(--color-ink-2)", border: "var(--rule-hair)" }}
                  >
                    <p className="type-overline" style={{ color: "var(--color-accent)" }}>
                      100% Personnalisable
                    </p>
                  </div>
                </div>
              </div>

              {/* Texte */}
              <div className="flex flex-col justify-center">
                <p className="type-overline mb-3" style={{ color: "var(--color-accent)" }}>
                  Création artisanale
                </p>
                <h2
                  className="mb-4"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "var(--text-headline)",
                    color: "var(--color-ink)",
                  }}
                >
                  {configuration.product.name}
                </h2>

                {configuration.product.description && (
                  <p className="font-body mb-10 leading-relaxed text-sm" style={{ color: "var(--color-ink-3)" }}>
                    {configuration.product.description}
                  </p>
                )}

                {/* Specs */}
                <div className="mb-10 grid grid-cols-2 gap-3">
                  <div className="p-4" style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }}>
                    <p className="type-overline mb-1" style={{ color: "var(--color-ink-3)" }}>Prix de base</p>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "var(--text-title)",
                        color: "var(--color-accent)",
                      }}
                    >
                      {(configuration.product.basePrice / 100).toFixed(2)} €
                    </p>
                  </div>
                  {configuration.product.weight > 0 && (
                    <div className="p-4" style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }}>
                      <p className="type-overline mb-1" style={{ color: "var(--color-ink-3)" }}>Poids</p>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 400,
                          fontSize: "var(--text-title)",
                          color: "var(--color-ink)",
                        }}
                      >
                        {configuration.product.weight} g
                      </p>
                    </div>
                  )}
                </div>

                {/* Points clés */}
                <ul className="space-y-3.5">
                  {[
                    "Fabriqué à la main avec soin",
                    "Tissu de votre choix parmi notre collection",
                    "Broderie personnalisée optionnelle",
                    "Livraison soignée dans un emballage cadeau",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="font-body mt-0.5 shrink-0 text-sm" style={{ color: "var(--color-accent)" }}>
                        ✓
                      </span>
                      <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Produits similaires */}
            {products.filter((p) => p.id !== configuration.product!.id).length > 0 && (
              <div style={{ borderTop: "var(--rule-soft)", paddingTop: "4rem" }}>
                <div className="mb-10">
                  <p className="type-overline mb-3" style={{ color: "var(--color-accent)" }}>
                    Découvrir aussi
                  </p>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: "var(--text-title)",
                      color: "var(--color-ink)",
                    }}
                  >
                    Produits similaires
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {products
                    .filter((p) => p.id !== configuration.product!.id)
                    .map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setConfiguration((prev) => ({ ...prev, product }));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group text-left transition-opacity hover:opacity-70"
                      >
                        <div
                          className="mb-3 aspect-square w-full overflow-hidden"
                          style={{ background: "var(--color-paper)" }}
                        >
                          <img
                            src={product.baseImage}
                            alt={product.name}
                            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <p
                          className="mb-0.5"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 400,
                            fontSize: "1.125rem",
                            color: "var(--color-ink)",
                          }}
                        >
                          {product.name}
                        </p>
                        <p className="font-body text-xs" style={{ color: "var(--color-accent)" }}>
                          À partir de {(product.basePrice / 100).toFixed(2)} €
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast confirmation */}
      {addedToCart && (
        <div className="animate-fade-in-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div
            className="flex items-center gap-4 px-6 py-4"
            style={{ background: "var(--color-paper)", border: "var(--rule-hair)", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center"
              style={{ background: "var(--color-accent)" }}
            >
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

const ConfiguratorPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-paper)" }}>
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
          />
        </div>
      }
    >
      <ProductConfigurator />
    </Suspense>
  );
};

export default ConfiguratorPage;
