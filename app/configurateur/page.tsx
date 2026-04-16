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
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Palette,
  ShoppingBag,
  Type,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

// import EmbroideryPreview from "@/components/configurator/EmbroideryPreview";
import EmbroideryZoneOverlay from "@/components/configurator/EmbroideryZoneOverlay"
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

interface EmbroideryZone {
  x: number; // Position X en pourcentage (0-100)
  y: number; // Position Y en pourcentage (0-100)
  maxWidth: number; // Largeur max en pourcentage (0-1)
  rotation: number; // Rotation en degrés
  fontSize: number; // Taille de police
  alignment: "center" | "left" | "right"; // Alignement du texte
}

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  weight: number; // Weight in grams
  icon: string;
  baseImage: string;
  maskImage: string;
  colorMaskImage?: string;
  embroideryZone: EmbroideryZone;
  sizes?: string[];
  defaultSize?: string | null;
}

interface Fabric {
  id: string;
  name: string;
  price: number;
  baseColor: string; // Used for fallback or cart display
  image: string; // Texture image path
  category?: string; // Explicit category relationship
}

interface FabricCategory {
  id: string; // prefix
  title: string;
  description: string;
  order: number;
}

interface Configuration {
  product: Product | null;
  fabric: Fabric | null;
  size: string | null;
  embroidery: string;
  embroideryColor: string;
  selectedColor: string | null;
}

interface SeeAllDialogProps {
  title: string;
  description: string;
  fabrics: Fabric[];
  configuration: Configuration;
  setConfiguration: Dispatch<SetStateAction<Configuration>>;
}

interface FabricCategoryProps {
  title: string;
  description: string;
  prefix: string; // "coton", "vichy", "jersey", etc.
  fabrics: Fabric[];
  configuration: Configuration;
  setConfiguration: Dispatch<SetStateAction<Configuration>>;
}

interface FabricGridItemProps {
  fabric: Fabric;
  isSelected: boolean;
  onSelect: () => void;
}

function FabricCategorySection({
  title,
  description,
  prefix,
  fabrics,
  configuration,
  setConfiguration,
}: FabricCategoryProps) {
  const categoryFabrics = fabrics.filter((f) => f.category ? f.category === prefix : f.id.startsWith(prefix));
  const displayedFabrics = categoryFabrics.slice(0, 8);
  const hasMore = categoryFabrics.length > 8;

  return (
    <div className="bg-ylang-beige/70 rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-ylang-charcoal font-abramo-script text-5xl">
            {title}
          </h3>
          <p className="text-ylang-charcoal/60 text-sm font-medium">
            {description}
          </p>
        </div>

        {hasMore && (
          <SeeAllDialog
            title={title}
            description={`${title} • ${categoryFabrics.length} variantes`}
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
  const baseClasses =
    "group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-500 w-18";
  const selectedClasses =
    "border-ylang-rose bg-ylang-rose/5 ring-ylang-rose/10 scale-[0.98] shadow-lg ring-4";
  const normalClasses =
    "hover:border-ylang-rose/30 border-[#f5f1e8] bg-white hover:scale-[1.02] hover:shadow-xl";

  return (
    <button
      onClick={onSelect}
      className={`${baseClasses} ${isSelected ? selectedClasses : normalClasses}`}
    >
      <div
        className="aspect-square bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url('${fabric.image}')` }}
      />

      {isSelected && (
        <div className="bg-ylang-rose absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full shadow-lg ring-2 ring-white">
          <Check className="h-3 w-3 text-white" />
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
        <button className="text-ylang-rose hover:text-ylang-terracotta group flex items-center gap-1.5 text-sm font-bold transition-all">
          <span>Voir tout</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </DialogTrigger>

      <DialogContent className="z-50 max-h-[90vh] max-w-5xl overflow-hidden rounded-3xl border-none bg-white p-0 shadow-2xl">
        <div className="sticky top-0 z-20 border-b border-[#e8dcc8]/50 bg-white/80 px-8 py-6 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-ylang-charcoal text-3xl font-black">
              {title}
            </DialogTitle>
            <DialogDescription className="text-ylang-charcoal/60 text-lg font-medium">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className="overflow-y-auto px-8 py-8"
          style={{ maxHeight: "calc(90vh - 120px)" }}
        >
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {fabrics.map((fabric) => (
              <FabricGridItem
                key={fabric.id}
                fabric={fabric}
                isSelected={configuration.fabric?.id === fabric.id}
                onSelect={() =>
                  setConfiguration((prev) => ({ ...prev, fabric }))
                }
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const ProductConfigurator = () => {
  // --- Data Definitions ---

  const [products, setProducts] = useState<Product[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [categories, setCategories] = useState<FabricCategory[]>([]);
  const [productColors, setProductColors] = useState<{ name: string; hex: string }[]>([]);
  const [embroideryColors, setEmbroideryColors] = useState<{ name: string; hex: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- State ---

  const [activeTab, setActiveTab] = useState<
    "product" | "fabric" | "embroidery" | "summary"
  >("product");

  const [configuration, setConfiguration] = useState<Configuration>({
    product: null as unknown as Product, // Will be set after load
    fabric: null as unknown as Fabric, // Will be set after load
    size: null,
    embroidery: "",
    embroideryColor: "#D4AF37", // Sera écrasé après le chargement des couleurs
    selectedColor: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showColorBubble, setShowColorBubble] = useState(false);

  // Cart store
  const { addItem, openCart } = useCartStore();

  // Search params for initial product selection
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get("product");

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const productContainerRef = useRef<HTMLDivElement>(null);

  // Effect to load data and handle initial product selection from URL
  useEffect(() => {
    async function loadConfiguratorData() {
      try {
        const [prodRes, fabRes, catRes, productColorsRes, embroideryColorsRes] = await Promise.all([
          fetch("/api/configurator/products?active=true"),
          fetch("/api/configurator/fabrics?active=true"),
          fetch("/api/configurator/categories?active=true"),
          fetch("/api/configurator/colors?type=product&active=true"),
          fetch("/api/configurator/colors?type=embroidery&active=true"),
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

        setProducts(loadedProducts);
        setFabrics(loadedFabrics);
        setCategories(loadedCategories);
        setProductColors(loadedProductColors);
        setEmbroideryColors(loadedEmbroideryColors);

        let initialConfigProduct = loadedProducts[0];

        if (initialProductId && loadedProducts.length > 0) {
          const foundProduct = loadedProducts.find(
            (p: Product) =>
              p.id.toLowerCase() === initialProductId.toLowerCase() ||
              p.name.toLowerCase().includes(initialProductId.toLowerCase()),
          );
          if (foundProduct) {
            initialConfigProduct = foundProduct;
          }
        }

        if (loadedProducts.length > 0 && loadedFabrics.length > 0) {
          setConfiguration((prev) => ({
            ...prev,
            product: initialConfigProduct,
            fabric: loadedFabrics[0],
            size: initialConfigProduct?.defaultSize ?? initialConfigProduct?.sizes?.[0] ?? null,
            embroideryColor: loadedEmbroideryColors[0]?.hex ?? "#D4AF37",
            selectedColor: initialConfigProduct?.colorMaskImage && loadedProductColors[0]
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

  // --- Logic ---

  const totalPrice = () => {
    let total = configuration.product?.basePrice || 0;
    total += configuration.fabric?.price || 0;
    if (configuration.embroidery) total += 1500;
    return total;
  };

  // Tabs Navigation
  const tabs = [
    {
      id: "product" as const,
      label: configuration.product?.name ?? "Produit",
      icon: Package,
      complete: !!configuration.product,
    },
    {
      id: "fabric" as const,
      label: "Tissu",
      icon: Palette,
      complete: !!configuration.fabric,
    },
    {
      id: "embroidery" as const,
      label: "Broderie",
      icon: Type,
      complete: configuration.embroidery.length > 0,
    },
    {
      id: "summary" as const,
      label: "Résumé",
      icon: ShoppingBag,
      complete: false,
    },
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

  const goNext = () => {
    if (canGoNext) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  const goPrevious = () => {
    if (canGoPrevious) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  const handleAddToCart = () => {
    if (!configuration.product || !configuration.fabric) {
      alert("Veuillez sélectionner un produit et un tissu");
      return;
    }

    // Capturer l'image du canvas comme thumbnail, avec la broderie composite
    const canvas = canvasRef.current;
    let thumbnailDataUrl: string | undefined;
    if (canvas) {
      try {
        // Canvas composite : produit + broderie dessinée dessus
        const compositeCanvas = document.createElement("canvas");
        compositeCanvas.width = canvas.width;
        compositeCanvas.height = canvas.height;
        const compositeCtx = compositeCanvas.getContext("2d");

        if (compositeCtx) {
          compositeCtx.drawImage(canvas, 0, 0);

          // Superposer la broderie si présente
          if (
            configuration.embroidery &&
            configuration.product.embroideryZone &&
            productContainerRef.current
          ) {
            const container = productContainerRef.current;
            const allCanvases = container.querySelectorAll<HTMLCanvasElement>("canvas");
            // Premier canvas = produit, second = EmbroideryPreview
            const embCanvas = allCanvases.length > 1 ? allCanvases[1] : null;

            if (embCanvas) {
              const containerRect = container.getBoundingClientRect();
              const scaleX = canvas.width / containerRect.width;
              const scaleY = canvas.height / containerRect.height;

              const zone = configuration.product.embroideryZone;
              const centerX = zone.x * canvas.width;
              const centerY = zone.y * canvas.height;

              // Taille affichée de la broderie (après CSS scale), convertie en coords naturelles
              const embRect = embCanvas.getBoundingClientRect();
              const embNatW = embRect.width * scaleX;
              const embNatH = embRect.height * scaleY;

              compositeCtx.save();
              compositeCtx.translate(centerX, centerY);
              compositeCtx.rotate((zone.rotation * Math.PI) / 180);
              compositeCtx.drawImage(embCanvas, -embNatW / 2, -embNatH / 2, embNatW, embNatH);
              compositeCtx.restore();
            }
          }

          thumbnailDataUrl = compositeCanvas.toDataURL("image/png");
        }
      } catch (e) {
        console.warn("Impossible de capturer le thumbnail du canvas", e);
        try { thumbnailDataUrl = canvas.toDataURL("image/png"); } catch {}
      }
    }

    const uniqueId = `custom-${configuration.product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const cartItem = {
      id: uniqueId,
      productId: configuration.product.id,
      productName: configuration.product.name,
      configuration: {
        fabricName: configuration.fabric.name,
        fabricColor: configuration.fabric.baseColor,
        embroidery: configuration.embroidery || undefined,
        embroideryColor: configuration.embroidery ? configuration.embroideryColor : undefined,
        size: configuration.size || undefined,
        selectedColor: configuration.selectedColor || undefined,
        selectedColorName: configuration.selectedColor
          ? (productColors.find((c) => c.hex === configuration.selectedColor)?.name ?? undefined)
          : undefined,
      },
      price: totalPrice() / 100,
      weight: configuration.product.weight ?? 0,
      quantity: 1,
      thumbnail: thumbnailDataUrl,
    };

    addItem(cartItem);
    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
      openCart();
    }, 1500);
  };

  // --- Canvas 2D Logic ---

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    if (imageCache.current[src])
      return Promise.resolve(imageCache.current[src]);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageCache.current[src] = img;
        resolve(img);
      };
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
        try {
          maskImg = await loadImage(configuration.product.maskImage);
        } catch (e) {
          console.warn("No mask found", e);
        }
        const fabricImg = await loadImage(configuration.fabric.image);

        // Set dimensions
        canvas.width = baseImg.width;
        canvas.height = baseImg.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ÉTAPE 1: Dessiner l'image de base (contient les ombres et plis originaux)
        ctx.drawImage(baseImg, 0, 0);

        // ÉTAPE 2: Appliquer le tissu avec blend mode MULTIPLY pour préserver les ombres
        if (maskImg) {
          // Créer un canvas temporaire pour le masque
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext("2d");

          if (tempCtx) {
            // Dessiner le masque
            tempCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
            const maskData = tempCtx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );

            // Créer le canvas de texture avec pattern répété
            const textureCanvas = document.createElement("canvas");
            textureCanvas.width = canvas.width;
            textureCanvas.height = canvas.height;
            const textureCtx = textureCanvas.getContext("2d");

            if (textureCtx) {
              // Centrer l'image du tissu sans répétition
              const x = (canvas.width - fabricImg.naturalWidth) / 2;
              const y = (canvas.height - fabricImg.naturalHeight) / 2;

              textureCtx.drawImage(
                fabricImg,
                0,
                0,
                canvas.width,
                canvas.height,
              );

              const textureData = textureCtx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
              );

              // Récupérer les données
              // const textureData = textureCtx.getImageData(
              //   0,
              //   0,
              //   canvas.width,
              //   canvas.height,
              // );
              const baseData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
              );

              // MÉTHODE AMÉLIORÉE: Blend multiply + préservation des ombres
              for (let i = 0; i < maskData.data.length; i += 4) {
                const maskAlpha = maskData.data[i] / 255; // Utiliser le canal rouge comme alpha

                if (maskAlpha > 0.1) {
                  // Récupérer les couleurs de base et de texture
                  const baseR = baseData.data[i];
                  const baseG = baseData.data[i + 1];
                  const baseB = baseData.data[i + 2];

                  const texR = textureData.data[i];
                  const texG = textureData.data[i + 1];
                  const texB = textureData.data[i + 2];

                  // MULTIPLY BLEND MODE (préserve les ombres et plis)
                  // Formule: (base * texture) / 255
                  let finalR = (baseR * texR) / 255;
                  let finalG = (baseG * texG) / 255;
                  let finalB = (baseB * texB) / 255;

                  // Augmenter légèrement la luminosité pour éviter un résultat trop sombre
                  const brightnessFactor = 1.15;
                  finalR = Math.min(255, finalR * brightnessFactor);
                  finalG = Math.min(255, finalG * brightnessFactor);
                  finalB = Math.min(255, finalB * brightnessFactor);

                  // Appliquer avec l'alpha du masque pour un mélange progressif
                  baseData.data[i] =
                    finalR * maskAlpha + baseR * (1 - maskAlpha);
                  baseData.data[i + 1] =
                    finalG * maskAlpha + baseG * (1 - maskAlpha);
                  baseData.data[i + 2] =
                    finalB * maskAlpha + baseB * (1 - maskAlpha);
                }
              }

              ctx.putImageData(baseData, 0, 0);
            }
          }
        }

        // ÉTAPE 3: Appliquer le colorMask si disponible et une couleur est sélectionnée
        if (
          configuration.product.colorMaskImage &&
          configuration.selectedColor
        ) {
          try {
            const colorMaskImg = await loadImage(
              configuration.product.colorMaskImage,
            );

            // Créer un canvas temporaire pour le color mask
            const colorMaskCanvas = document.createElement("canvas");
            colorMaskCanvas.width = canvas.width;
            colorMaskCanvas.height = canvas.height;
            const colorMaskCtx = colorMaskCanvas.getContext("2d");

            if (colorMaskCtx) {
              // Dessiner le color mask
              colorMaskCtx.drawImage(
                colorMaskImg,
                0,
                0,
                canvas.width,
                canvas.height,
              );
              const colorMaskData = colorMaskCtx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
              );

              // Récupérer les données actuelles du canvas principal
              const currentData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
              );

              // Parser la couleur sélectionnée
              const selectedColorHex = configuration.selectedColor;
              const colorR = parseInt(selectedColorHex.slice(1, 3), 16);
              const colorG = parseInt(selectedColorHex.slice(3, 5), 16);
              const colorB = parseInt(selectedColorHex.slice(5, 7), 16);

              // Appliquer la couleur avec blend mode multiply sur les zones du color mask
              for (let i = 0; i < colorMaskData.data.length; i += 4) {
                const maskAlpha = colorMaskData.data[i] / 255; // Canal rouge comme alpha

                if (maskAlpha > 0.1) {
                  const baseR = currentData.data[i];
                  const baseG = currentData.data[i + 1];
                  const baseB = currentData.data[i + 2];

                  // Multiply blend avec la couleur sélectionnée
                  let finalR = (baseR * colorR) / 255;
                  let finalG = (baseG * colorG) / 255;
                  let finalB = (baseB * colorB) / 255;

                  // Augmenter la luminosité
                  const brightnessFactor = 1.4;
                  finalR = Math.min(255, finalR * brightnessFactor);
                  finalG = Math.min(255, finalG * brightnessFactor);
                  finalB = Math.min(255, finalB * brightnessFactor);

                  // Appliquer avec l'alpha du masque
                  currentData.data[i] =
                    finalR * maskAlpha + baseR * (1 - maskAlpha);
                  currentData.data[i + 1] =
                    finalG * maskAlpha + baseG * (1 - maskAlpha);
                  currentData.data[i + 2] =
                    finalB * maskAlpha + baseB * (1 - maskAlpha);
                }
              }

              ctx.putImageData(currentData, 0, 0);
            }
          } catch (e) {
            console.warn("Erreur lors de l'application du color mask", e);
          }
        }

        // ÉTAPE 4: Ajouter un léger overlay pour plus de profondeur (optionnel)
        // L'overlay broderie est maintenant rendu par EmbroideryPreview au-dessus du canvas
      } catch (err) {
        console.error("Canvas rendering error", err);
      } finally {
        setIsProcessing(false);
      }
    };

    renderCanvas();
  }, [
    configuration.product,
    configuration.fabric,
    configuration.embroidery,
    configuration.embroideryColor,
    configuration.selectedColor,
  ]);

  // const downloadImage = () => {
  //   const canvas = canvasRef.current;
  //   if (!canvas || !configuration.product || !configuration.fabric) return;
  //   const link = document.createElement("a");
  //   link.download = `creation-${configuration.product.name}.png`;
  //   link.href = canvas.toDataURL("image/png");
  //   link.click();
  // };

  // --- Render ---

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-ylang-beige to-[#f5f1e8]">
        <div className="border-ylang-rose h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!configuration.product || !configuration.fabric) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-ylang-beige to-[#f5f1e8]">
        <div className="text-ylang-charcoal text-xl font-medium">Aucun produit ou tissu n'est disponible pour le moment.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ylang-terracotta/40">
      <div
        className="flex min-h-screen flex-col lg:flex-row bg-ylang-terracotta/30"
        style={{ marginTop: "90px" }}
      >
        {/* LEFT: Preview (Sticky) */}
        <div className="bg-ylang-terracotta/70 relative flex h-[50vh] flex-col items-center justify-center p-4 sm:p-6 lg:p-8 lg:sticky lg:top-[90px] lg:h-[calc(100vh-90px)] lg:w-1/2">
          <div ref={productContainerRef}
            className={`bg-ylang-beige/35 relative w-full max-w-lg overflow-hidden rounded-4xl shadow-md transition-opacity duration-300 backdrop-blur-sm ${isProcessing ? "opacity-50" : "opacity-100"}`}
          >
            <canvas ref={canvasRef} className="h-auto w-full" />

            {configuration.embroidery &&
              configuration.product?.embroideryZone && (
                <div
                  className="pointer-events-none absolute flex items-center justify-center"
                  style={{
                    left: `${configuration.product.embroideryZone.x * 100}%`,
                    top: `${configuration.product.embroideryZone.y * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${configuration.product.embroideryZone.rotation}deg)`,
                    overflow: "visible",
                  }}
                >
                  {configuration.embroidery && configuration.product?.embroideryZone && (
                      <EmbroideryZoneOverlay
                        text={configuration.embroidery}
                        threadColor={configuration.embroideryColor}
                        zone={configuration.product.embroideryZone}
                        containerRef={productContainerRef}
                      />
                    )}
                </div>
              )}

            {isProcessing && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="border-ylang-rose h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Controls overlay */}
          {/* <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-xl backdrop-blur-md">
            <button
              onClick={downloadImage}
              className="text-ylang-rose hover:text-ylang-terracotta flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </button>
          </div> */}

          {/* Info produit — desktop uniquement (overlay sur la preview) */}
          {configuration.product && configuration.fabric && (
            <div className="bg-ylang-beige/30 absolute top-6 left-6 hidden rounded-2xl px-5 py-3 shadow-lg backdrop-blur-xl lg:block">
              <p className="text-ylang-charcoal/60 mb-1 text-xs">
                Votre création
              </p>
              <p className="text-ylang-charcoal text-sm font-bold">
                {configuration.product.name}
              </p>
              <p className="text-ylang-rose text-xs font-medium">
                <span className="text-ylang-charcoal/60">Tissu : </span>
                <span>{configuration.fabric.name}</span>
              </p>
            </div>
          )}

          {/* Prix en mobile */}
          <div className="absolute top-6 right-6 rounded-2xl bg-white/95 px-5 py-3 shadow-lg backdrop-blur-md lg:hidden">
            <p className="text-ylang-charcoal/60 text-xs">Total</p>
            <p className="text-ylang-rose text-2xl font-bold">
              {totalPrice() / 100}€
            </p>
          </div>
        </div>

        {/* RIGHT: Options (Scrollable content with sticky footer) */}
        <div className="bg-ylang-terracotta/30 flex flex-col lg:h-[calc(100vh-90px)] lg:w-1/2">
          <div className="flex-1 overflow-y-auto p-6 lg:p-4">
            {/* Info produit — mobile uniquement (dans la colonne options) */}
            {configuration.product && configuration.fabric && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md lg:hidden">
                <div className="bg-ylang-rose/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                  <Package className="text-ylang-rose h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-ylang-charcoal truncate text-sm font-bold">
                    {configuration.product.name}
                  </p>
                  <p className="text-ylang-charcoal/50 truncate text-xs">
                    Tissu : <span className="text-ylang-rose font-medium">{configuration.fabric.name}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Progress bar and Header */}
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-ylang-charcoal/30 text-xs font-semibold tracking-widest uppercase">
                    Étape {currentTabIndex + 1} / {tabs.length}
                  </p>
                  <h3 className="text-ylang-charcoal text-xs font-bold">
                    {tabs[currentTabIndex].label}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ylang-rose bg-ylang-rose/10 rounded-md px-2 py-0.5 text-sm font-black">
                    {Math.round(((currentTabIndex + 1) / tabs.length) * 100)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f5f1e8]">
                <div
                  className="from-ylang-rose to-ylang-terracotta h-full bg-linear-to-r shadow-[0_0_10px_rgba(232,180,184,0.4)] transition-all duration-700 ease-out"
                  style={{
                    width: `${((currentTabIndex + 1) / tabs.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Tabs navigation */}
            <div className="scrollbar-hide -mx-4 mb-4 flex w-full gap-2 px-4 py-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isPast = index < currentTabIndex;
                const isLocked =
                  index > currentTabIndex + 1 ||
                  (index === currentTabIndex + 1 && !canGoNext);

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (!isLocked) {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`group relative flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-sm font-bold whitespace-nowrap transition-all duration-500 sm:gap-2.5 sm:px-5 ${
                      isActive
                        ? "from-ylang-rose to-ylang-terracotta scale-105 bg-linear-to-r text-white shadow-[0_5px_5px_-5px_rgba(232,180,184,0.5)]"
                        : isPast
                          ? "border-ylang-rose/20 bg-ylang-rose/10 text-ylang-rose hover:bg-ylang-rose/20"
                          : isLocked
                            ? "text-ylang-charcoal/20 cursor-not-allowed border-[#f5f1e8] bg-white"
                            : "text-ylang-charcoal/60 hover:border-ylang-rose/30 hover:text-ylang-charcoal border-[#f5f1e8] bg-white"
                    } border-2`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform duration-500 ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                    />
                    <span className={isActive ? "inline" : "hidden sm:inline"}>{tab.label}</span>
                    {isPast && (
                      <div className="bg-ylang-rose absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full shadow-sm">
                        <Check className="h-2.5 w-2.5 stroke-[3px] text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
              {/* Step 1: Product */}
              {activeTab === "product" && (
                <>
                  <div>
                    <h2 className="text-ylang-charcoal/90 mb-2 text-2xl font-bold">
                      Choisissez votre produit
                    </h2>
                    <p className="text-ylang-charcoal/60 text-sm">
                      Sélectionnez le produit à personnaliser
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => {
                      const isSelected = configuration.product?.id === product.id;
                      return (
                        <button
                          key={product.id}
                          onClick={() => {
                            const isNewProduct = configuration.product?.id !== product.id;
                            setConfiguration((prev) => ({
                              ...prev,
                              product,
                              size: isNewProduct
                                ? (product.defaultSize ?? product.sizes?.[0] ?? null)
                                : prev.size,
                              selectedColor: product.colorMaskImage
                                ? isNewProduct ? productColors[0].hex : prev.selectedColor
                                : null,
                            }));
                            if (product.colorMaskImage) setShowColorBubble(true);
                          }}
                          className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-500 ${
                            isSelected
                              ? "border-ylang-rose bg-ylang-rose/10 scale-[0.98] shadow-[0_10px_30px_-10px_rgba(232,180,184,0.4)]"
                              : "hover:border-ylang-rose/40 border-[#e8dcc8] bg-white hover:scale-[1.02] hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-ylang-charcoal font-abramo-script mb-1 text-3xl">
                                {product.name}
                              </h3>
                              <p className="text-ylang-charcoal/60 line-clamp-2 text-sm font-medium">
                                {product.description}
                              </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f1e8] text-2xl transition-colors">
                              {product.icon}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-ylang-charcoal/40 text-[10px] font-bold tracking-wider uppercase">
                                À partir de
                              </span>
                              <p className="text-ylang-rose text-2xl font-black">
                                {product.basePrice / 100}€
                              </p>
                            </div>
                            {isSelected ? (
                              <div className="bg-ylang-rose ring-ylang-rose/10 flex h-8 w-8 items-center justify-center rounded-full shadow-lg ring-4">
                                <Check className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <div className="group-hover:border-ylang-rose/50 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#e8dcc8] transition-colors">
                                <ChevronRight className="group-hover:text-ylang-rose h-4 w-4 text-[#e8dcc8]" />
                              </div>
                            )}
                          </div>

                          {/* Chip "Changer la couleur" sur la carte sélectionnée */}
                          {isSelected && product.colorMaskImage && configuration.selectedColor && (
                            <div
                              onClick={(e) => { e.stopPropagation(); setShowColorBubble(true); }}
                              className="border-ylang-rose/20 mt-3 flex w-full items-center gap-2 rounded-xl border bg-white/60 px-3 py-2 text-xs font-bold transition-all hover:bg-white"
                            >
                              <div
                                className="h-4 w-4 shrink-0 rounded-full border border-white shadow-sm"
                                style={{ backgroundColor: configuration.selectedColor }}
                              />
                              <span className="text-ylang-charcoal/70">
                                {productColors.find((c) => c.hex === configuration.selectedColor)?.name}
                              </span>
                              <span className="text-ylang-rose ml-auto">Changer</span>
                            </div>
                          )}

                          {/* Decorative element */}
                          <div
                            className={`bg-ylang-rose/5 absolute -right-4 -bottom-4 h-24 w-24 rounded-full blur-2xl transition-opacity duration-500 ${isSelected ? "opacity-100" : "opacity-0"}`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Sélecteur de taille — affiché si le produit sélectionné a des tailles */}
                  {configuration.product?.sizes && configuration.product.sizes.length > 0 && (
                    <div className="rounded-2xl bg-white/70 p-5 backdrop-blur-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-ylang-charcoal/60 text-xs font-semibold tracking-widest uppercase">
                          Taille
                        </span>
                        {configuration.size && (
                          <span className="text-ylang-rose text-sm font-semibold">
                            {configuration.size}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {configuration.product.sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              setConfiguration((prev) => ({ ...prev, size }))
                            }
                            className={`min-w-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ylang-rose/50 ${
                              configuration.size === size
                                ? "border-ylang-rose bg-ylang-rose/10 text-ylang-rose"
                                : "border-[#e8dcc8] text-ylang-charcoal hover:border-ylang-rose/40 hover:text-ylang-rose"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      {productNeedsSize && !configuration.size && (
                        <p className="text-ylang-rose mt-2 text-xs font-medium">
                          Veuillez sélectionner une taille pour continuer
                        </p>
                      )}
                    </div>
                  )}

                  {/* Bulle flottante de sélection de couleur */}
                  {showColorBubble && configuration.product?.colorMaskImage && (
                    <>
                      {/* Backdrop léger */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowColorBubble(false)}
                      />
                      {/* Bulle */}
                      <div className="animate-in fade-in slide-in-from-bottom-4 fixed bottom-24 left-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] duration-200">
                        <div className="from-ylang-rose/10 to-ylang-rose/5 flex items-center justify-between bg-linear-to-r px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Palette className="text-ylang-rose h-5 w-5" />
                            <span className="text-ylang-charcoal text-sm font-bold">
                              Couleur de l&apos;élément
                            </span>
                          </div>
                          <button
                            onClick={() => setShowColorBubble(false)}
                            className="text-ylang-charcoal/40 hover:text-ylang-charcoal transition-colors"
                          >
                            ✕
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
                                className={`relative h-10 w-10 rounded-full border-2 transition-all duration-300 ${
                                  configuration.selectedColor === color.hex
                                    ? "ring-ylang-rose scale-110 border-white shadow-lg ring-2 ring-offset-2"
                                    : "border-white/50 hover:scale-110 hover:shadow-md"
                                }`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              >
                                {configuration.selectedColor === color.hex && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Check className="h-5 w-5 text-white drop-shadow-md" />
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

              {/* Step 2: Fabric */}
              {activeTab === "fabric" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-ylang-charcoal/90 mb-2 text-2xl font-bold">
                      Choisissez votre tissu
                    </h2>
                    <p className="text-ylang-charcoal/70 text-sm">
                      Visible en temps réel sur le modèle • Collection premium
                    </p>
                  </div>

                  <div className="space-y-4">
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

              {/* Step 3: Embroidery */}
              {activeTab === "embroidery" && (
                <>
                  <div>
                    <h2 className="text-ylang-charcoal/90 mb-2 text-2xl font-bold">
                      Broderie personnalisée
                    </h2>
                    <p className="text-ylang-charcoal/60 text-sm">
                      +15€ • Aperçu immédiat sur le produit
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#f5f1e8] bg-ylang-beige/50 p-6">
                      <label className="text-ylang-charcoal mb-3 block text-base font-bold">
                        Texte à broder
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={configuration.embroidery}
                          onChange={(e) =>
                            setConfiguration((prev) => ({
                              ...prev,
                              embroidery: e.target.value.slice(0, 15),
                            }))
                          }
                          placeholder="Ex: Zoé, Mon Bébé..."
                          className="focus:border-ylang-rose focus:ring-ylang-rose/10 placeholder:text-ylang-charcoal/20 w-full rounded-2xl border-2 border-[#e8dcc8] bg-white px-5 py-2 text-lg font-medium transition-all focus:ring-4 focus:outline-none"
                          maxLength={15}
                        />
                        <div className="absolute top-1/2 right-5 -translate-y-1/2">
                          <span
                            className={`text-sm font-bold ${configuration.embroidery.length >= 12 ? "text-ylang-rose" : "text-ylang-charcoal/30"}`}
                          >
                            {configuration.embroidery.length}
                            <span className="text-ylang-charcoal/10 mx-0.5">
                              /
                            </span>
                            15
                          </span>
                        </div>
                      </div>
                      <p className="text-ylang-charcoal/50 mt-3 flex items-center gap-2 text-sm font-medium">
                        <span className="bg-ylang-rose/20 text-ylang-rose flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                          i
                        </span>
                        Aperçu en temps réel sur l'image ci-dessus
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#f5f1e8] bg-ylang-beige/50 p-6 transition-all">
                      <div className="mb-4 flex items-center justify-between">
                        <label className="text-ylang-charcoal text-base font-bold">
                          Couleur du fil
                        </label>
                        {configuration.embroideryColor && (
                          <span className="text-ylang-rose bg-ylang-rose/5 rounded-full px-3 py-1 text-sm font-bold">
                            {
                              embroideryColors.find(
                                (c) => c.hex === configuration.embroideryColor,
                              )?.name
                            }
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-6 gap-4 sm:grid-cols-8 md:grid-cols-10">
                        {embroideryColors.map((color) => {
                          const isSelected =
                            configuration.embroideryColor === color.hex;
                          return (
                            <button
                              key={color.hex}
                              onClick={() =>
                                setConfiguration((prev) => ({
                                  ...prev,
                                  embroideryColor: color.hex,
                                }))
                              }
                              className={`group relative h-10 w-10 shrink-0 cursor-pointer rounded-full transition-all duration-300 ${
                                isSelected
                                  ? "ring-ylang-rose/20 scale-110 shadow-lg ring-4"
                                  : "hover:scale-115 hover:shadow-md"
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            >
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-white">
                                  <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Summary */}
              {activeTab === "summary" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-5"
                >
                  {/* En-tête */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 22 }}
                      className="bg-ylang-rose mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full shadow-[0_6px_20px_rgba(183,110,121,0.4)]"
                    >
                      <Check className="h-6 w-6 text-white" strokeWidth={3} />
                    </motion.div>
                    <h2 className="font-abramo-script text-ylang-charcoal text-4xl leading-none">
                      Votre création
                    </h2>
                    <p className="text-ylang-charcoal/45 mt-1 text-xs font-medium tracking-wide">
                      Vérifiez avant d'ajouter au panier
                    </p>
                  </div>

                  {/* Carte de configuration */}
                  <div className="overflow-hidden rounded-2xl border border-[#ede8df] bg-white shadow-sm">

                    {/* Produit */}
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 }}
                      className="flex items-start justify-between border-b border-[#f5f1e8] px-5 py-4"
                    >
                      <div>
                        <p className="text-ylang-charcoal/35 mb-1 text-[9px] font-black tracking-[0.12em] uppercase">Produit</p>
                        <p className="text-ylang-charcoal font-semibold">{configuration.product?.name}</p>
                        {configuration.size && (
                          <p className="text-ylang-charcoal/50 mt-0.5 text-xs">Taille {configuration.size}</p>
                        )}
                      </div>
                      <span className="text-ylang-charcoal mt-0.5 text-sm font-bold">
                        {(configuration.product?.basePrice ?? 0) / 100}€
                      </span>
                    </motion.div>

                    {/* Tissu */}
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 }}
                      className="flex items-center justify-between border-b border-[#f5f1e8] px-5 py-4"
                    >
                      <div>
                        <p className="text-ylang-charcoal/35 mb-2 text-[9px] font-black tracking-[0.12em] uppercase">Tissu</p>
                        <div className="flex items-center gap-2.5">
                          {configuration.fabric?.image && (
                            <div
                              className="h-8 w-8 shrink-0 rounded-lg border border-[#ede8df] bg-cover bg-center shadow-inner"
                              style={{ backgroundImage: `url('${configuration.fabric.image}')` }}
                            />
                          )}
                          <span className="text-ylang-charcoal font-semibold">{configuration.fabric?.name}</span>
                        </div>
                      </div>
                      {(configuration.fabric?.price ?? 0) > 0 ? (
                        <span className="text-ylang-charcoal text-sm font-bold">+{configuration.fabric!.price / 100}€</span>
                      ) : (
                        <span className="text-ylang-charcoal/30 text-xs font-semibold">Inclus</span>
                      )}
                    </motion.div>

                    {/* Couleur produit */}
                    {configuration.selectedColor && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.22 }}
                        className="flex items-center justify-between border-b border-[#f5f1e8] px-5 py-4"
                      >
                        <div>
                          <p className="text-ylang-charcoal/35 mb-2 text-[9px] font-black tracking-[0.12em] uppercase">Couleur</p>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-7 w-7 shrink-0 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                              style={{ backgroundColor: configuration.selectedColor }}
                            />
                            <span className="text-ylang-charcoal font-semibold">
                              {productColors.find((c) => c.hex === configuration.selectedColor)?.name ?? configuration.selectedColor}
                            </span>
                          </div>
                        </div>
                        <span className="text-ylang-charcoal/30 text-xs font-semibold">Inclus</span>
                      </motion.div>
                    )}

                    {/* Broderie */}
                    {configuration.embroidery ? (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.26 }}
                        className="flex items-center justify-between px-5 py-4"
                      >
                        <div>
                          <p className="text-ylang-charcoal/35 mb-2 text-[9px] font-black tracking-[0.12em] uppercase">Broderie</p>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-7 w-7 shrink-0 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                              style={{ backgroundColor: configuration.embroideryColor }}
                            />
                            <div>
                              <p className="font-abramo-script text-ylang-charcoal text-xl leading-tight">
                                {configuration.embroidery}
                              </p>
                              <p className="text-ylang-charcoal/40 text-xs">
                                {embroideryColors.find((c) => c.hex === configuration.embroideryColor)?.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <span className="text-ylang-charcoal text-sm font-bold">+15€</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.26 }}
                        className="px-5 py-4"
                      >
                        <p className="text-ylang-charcoal/35 mb-1 text-[9px] font-black tracking-[0.12em] uppercase">Broderie</p>
                        <p className="text-ylang-charcoal/30 text-xs italic">Aucune broderie</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Total */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className="flex items-center justify-between rounded-2xl bg-linear-to-r from-[#fdf0f1] to-[#fdf5f0] px-6 py-5 ring-1 ring-[#edd8d8]"
                  >
                    <div>
                      <p className="text-ylang-charcoal/40 text-[9px] font-black tracking-[0.12em] uppercase">Total</p>
                      <p className="text-ylang-charcoal/50 mt-0.5 text-xs">Livraison calculée au checkout</p>
                    </div>
                    <span className="text-ylang-rose text-[2rem] font-black tracking-tight leading-none">
                      {totalPrice() / 100}€
                    </span>
                  </motion.div>

                  {/* Badges de confiance */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {[
                      { label: "Fait main" },
                      { label: "Tissu certifié" },
                      { label: "Expédié sous 7j" },
                    ].map((badge) => (
                      <div
                        key={badge.label}
                        className="rounded-xl bg-[#fdfaf6] py-2.5 text-center text-[11px] font-semibold text-ylang-charcoal/50"
                      >
                        <span className="text-ylang-rose mb-0.5 block text-[9px]">✦</span>
                        {badge.label}
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer Navigation - Sticky */}
          <div className="sticky bottom-0 border-t border-[#f5f1e8] bg-ylang-white/80 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl lg:px-8">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-6">
              <button
                onClick={goPrevious}
                disabled={!canGoPrevious}
                className={`group flex items-center gap-2 rounded-xl px-6 py-3 font-bold transition-all duration-300 ${
                  canGoPrevious
                    ? "text-ylang-charcoal bg-ylang-beige hover:scale-102 hover:bg-[#f5f1e8]"
                    : "text-ylang-charcoal cursor-not-allowed bg-ylang-beige opacity-30"
                }`}
              >
                <ChevronLeft
                  className={`h-5 w-5 transition-transform bg-ylang-beige/20 duration-300 ${canGoPrevious ? "group-hover:-translate-x-1" : ""}`}
                />
                <span className="hidden sm:inline">Précédent</span>
              </button>

              <div className="flex flex-col items-center lg:items-start">
                <span className="text-ylang-charcoal/30 items-center text-[10px] font-black tracking-widest uppercase">
                  Prix Total
                </span>
                <span className="text-ylang-charcoal text-xl font-black sm:text-2xl">
                  {totalPrice() / 100}€
                </span>
              </div>

              {activeTab === "summary" ? (
                <button
                  onClick={handleAddToCart}
                  disabled={!configuration.product || !configuration.fabric}
                  className={`group flex items-center gap-3 rounded-xl px-6 py-3 font-black text-white shadow-[0_10px_20px_-5px_rgba(232,180,184,0.5)] transition-all duration-500 ${
                    configuration.product && configuration.fabric
                      ? "from-ylang-rose to-ylang-terracotta bg-linear-to-r hover:scale-102 hover:shadow-[0_15px_30px_-5px_rgba(232,180,184,0.6)]"
                      : "text-ylang-charcoal/20 cursor-not-allowed bg-[#f5f1e8]"
                  }`}
                >
                  <ShoppingBag className="h-5 w-5 shrink-0 transition-transform group-hover:rotate-12" />
                  <span className="hidden sm:inline">Ajouter au panier</span>
                  <span className="sm:hidden">Panier</span>
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!canGoNext}
                  className={`group flex items-center gap-3 rounded-xl px-8 py-3 font-black transition-all duration-500 ${
                    canGoNext
                      ? "from-ylang-rose to-ylang-terracotta bg-linear-to-r text-white shadow-[0_10px_20px_-5px_rgba(232,180,184,0.5)] hover:scale-[1.05] hover:shadow-[0_15px_30px_-5px_rgba(232,180,184,0.6)] active:scale-95"
                      : "text-ylang-charcoal/20 cursor-not-allowed bg-[#f5f1e8]"
                  }`}
                >
                  <span>Suivant</span>
                  <ChevronRight
                    className={`h-5 w-5 transition-transform duration-300 ${canGoNext ? "group-hover:translate-x-1" : ""}`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ DESCRIPTION & PRODUITS SIMILAIRES ══════════════════════════════════ */}
      {configuration.product && (
        <div className="bg-ylang-terracotta/30 px-6 py-16 sm:px-12 lg:px-20">
          <div className="mx-auto max-w-6xl">

            {/* Description détaillée */}
            <div className="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-2">
              {/* Visuel */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-sm overflow-hidden rounded-4xl bg-[#f5f1e8] shadow-xl">
                  <img
                    src={configuration.product.baseImage}
                    alt={configuration.product.name}
                    className="h-auto w-full object-contain"
                  />
                  {/* Badge personnalisable */}
                  <div className="from-ylang-rose to-ylang-terracotta absolute top-5 left-5 rounded-2xl bg-linear-to-r px-4 py-2 text-xs font-black text-white shadow-lg">
                    100% Personnalisable
                  </div>
                </div>
              </div>

              {/* Texte */}
              <div className="flex flex-col justify-center">
                <p className="text-ylang-rose mb-2 text-sm font-semibold uppercase tracking-widest">Création artisanale</p>
                <h2 className="font-abramo-script text-ylang-charcoal mb-4 text-4xl leading-tight">
                  {configuration.product.name}
                </h2>

                {configuration.product.description && (
                  <p className="text-ylang-charcoal/70 mb-8 leading-relaxed">
                    {configuration.product.description}
                  </p>
                )}

                {/* Specs */}
                <div className="mb-8 grid grid-cols-2 gap-4">
                  <div className="bg-ylang-beige/50 rounded-2xl p-4">
                    <p className="text-ylang-charcoal/50 mb-1 text-xs font-semibold uppercase tracking-wider">Prix de base</p>
                    <p className="text-ylang-rose text-2xl font-black">{(configuration.product.basePrice / 100).toFixed(2)}€</p>
                  </div>
                  {configuration.product.weight > 0 && (
                    <div className="bg-ylang-beige/50 rounded-2xl p-4">
                      <p className="text-ylang-charcoal/50 mb-1 text-xs font-semibold uppercase tracking-wider">Poids</p>
                      <p className="text-ylang-charcoal text-2xl font-black">{configuration.product.weight}g</p>
                    </div>
                  )}
                </div>

                {/* Points clés */}
                <ul className="space-y-3">
                  {[
                    "Fabriqué à la main avec soin",
                    "Tissu de votre choix parmi notre collection",
                    "Broderie personnalisée optionnelle",
                    "Livraison soignée dans un emballage cadeau",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="from-ylang-rose to-ylang-terracotta mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[10px] font-black text-white">✓</span>
                      <span className="text-ylang-charcoal/70 text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Produits similaires */}
            {products.filter(p => p.id !== configuration.product!.id).length > 0 && (
              <div>
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <p className="text-ylang-rose mb-1 text-sm font-semibold uppercase tracking-widest">Découvrir aussi</p>
                    <h3 className="font-abramo-script text-ylang-charcoal text-3xl">Produits similaires</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {products
                    .filter(p => p.id !== configuration.product!.id)
                    .map(product => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setConfiguration(prev => ({ ...prev, product }));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group text-left"
                      >
                        <div className="mb-3 overflow-hidden rounded-3xl bg-[#f5f1e8] shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                          <div className="aspect-square w-full">
                            <img
                              src={product.baseImage}
                              alt={product.name}
                              className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        </div>
                        <p className="text-ylang-charcoal mb-1 text-2xl font-abramo-script">{product.name}</p>
                        <p className="text-ylang-rose text-sm font-black">
                          À partir de {(product.basePrice / 100).toFixed(2)}€
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast de confirmation */}
      {addedToCart && (
        <div className="animate-fade-in-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e8dcc8] bg-white px-6 py-4 shadow-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-ylang-charcoal font-bold">
                Ajouté au panier !
              </p>
              <p className="text-ylang-charcoal/60 text-sm">
                {configuration.product?.name} - {configuration.fabric?.name}
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
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Package className="text-ylang-rose h-8 w-8 animate-pulse" />
        </div>
      }
    >
      <ProductConfigurator />
    </Suspense>
  );
};

export default ConfiguratorPage;
