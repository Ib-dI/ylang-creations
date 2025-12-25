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
  Download,
  Package,
  Palette,
  Plus,
  ShoppingBag,
  Sparkles,
  Type,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string;
  baseImage: string;
  maskImage: string;
}

interface Fabric {
  id: string;
  name: string;
  price: number;
  baseColor: string; // Used for fallback or cart display
  image: string; // Texture image path
}

interface Accessory {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

interface Configuration {
  product: Product | null;
  fabric: Fabric | null;
  embroidery: string;
  embroideryColor: string;
  accessories: string[];
}

const ProductConfigurator = () => {
  // --- Data Definitions ---

  const products: Product[] = [
    {
      id: "bib",
      name: "Bavoir",
      description: "Bavoir naissance ergonomique",
      basePrice: 25,
      icon: "👶",
      baseImage: "/images/produits/bavoir-base.png",
      maskImage: "/images/produits/bavoir-mask.png",
    },
    {
      id: "pacifier",
      name: "Attache-tétine",
      description: "Attache-tétine sécurisée en tissu",
      basePrice: 18,
      icon: "🍼",
      baseImage: "/images/produits/attache-tetine-base.png",
      maskImage: "/images/produits/attache-tetine-mask.png",
    },
    {
      id: "bag",
      name: "Sac à langer",
      description: "Grand sac pratique et élégant",
      basePrice: 85,
      icon: "👜",
      baseImage: "/images/produits/sac-base.png",
      maskImage: "/images/produits/sac-mask.png",
    },
  ];

  // Dynamically populated from previous step findings + prices added
  const fabrics: Fabric[] = [
    {
      id: "coton-1",
      name: "Coton 1",
      price: 0,
      baseColor: "#e5e7eb",
      image: "/Tissu/Coton-1.png",
    },
    {
      id: "coton-2",
      name: "Coton 2",
      price: 0,
      baseColor: "#d1d5db",
      image: "/Tissu/Coton-2.png",
    },
    {
      id: "coton-3",
      name: "Coton 3",
      price: 0,
      baseColor: "#9ca3af",
      image: "/Tissu/Coton-3.png",
    },
    {
      id: "coton-4",
      name: "Coton 4",
      price: 0,
      baseColor: "#fcd34d",
      image: "/Tissu/Coton-4.png",
    },
    {
      id: "coton-5",
      name: "Coton 5",
      price: 0,
      baseColor: "#fbbf24",
      image: "/Tissu/Coton-5.png",
    },
    {
      id: "coton-6",
      name: "Coton 6",
      price: 0,
      baseColor: "#f59e0b",
      image: "/Tissu/Coton-6.png",
    },
    {
      id: "coton-7",
      name: "Coton 7",
      price: 0,
      baseColor: "#f59e0b",
      image: "/Tissu/Coton-7.png",
    },
    {
      id: "coton-8",
      name: "Coton 8",
      price: 0,
      baseColor: "#f59e0b",
      image: "/Tissu/Coton-8.png",
    },
    {
      id: "coton-9",
      name: "Coton 9",
      price: 0,
      baseColor: "#f59e0b",
      image: "/Tissu/Coton-9.png",
    },
    {
      id: "coton-10",
      name: "Coton 10",
      price: 0,
      baseColor: "#f59e0b",
      image: "/Tissu/Coton-10.png",
    },
    {
      id: "jersey-1",
      name: "Jersey Coton 1",
      price: 0,
      baseColor: "#e5e7eb",
      image: "/Tissu/Jersey coton-1.png",
    },
    {
      id: "jersey-2",
      name: "Jersey Coton 2",
      price: 0,
      baseColor: "#e5e7eb",
      image: "/Tissu/Jersey coton-2.png",
    },
    {
      id: "jersey-3",
      name: "Jersey Coton 3",
      price: 0,
      baseColor: "#e5e7eb",
      image: "/Tissu/Jersey coton-3.png",
    },
    {
      id: "jersey-4",
      name: "Jersey Coton 4",
      price: 0,
      baseColor: "#e5e7eb",
      image: "/Tissu/Jersey coton-4.png",
    },
    {
      id: "toile-1",
      name: "Toile de Jouy 1",
      price: 0,
      baseColor: "#fee2e2",
      image: "/Tissu/Toile de Jouy-1.png",
    },
    {
      id: "toile-2",
      name: "Toile de Jouy 2",
      price: 0,
      baseColor: "#fee2e2",
      image: "/Tissu/Toile de jouy-2.png",
    },
    {
      id: "vichy-1",
      name: "Vichy 1",
      price: 5,
      baseColor: "#fce7f3",
      image: "/Tissu/Vichy-1.png",
    },
    {
      id: "vichy-2",
      name: "Vichy 2",
      price: 0,
      baseColor: "#fce7f3",
      image: "/Tissu/Vichy-2.png",
    },
    {
      id: "vichy-3",
      name: "Vichy 3",
      price: 0,
      baseColor: "#fce7f3",
      image: "/Tissu/Vichy-3.png",
    },
    {
      id: "vichy-4",
      name: "Vichy 4",
      price: 0,
      baseColor: "#fce7f3",
      image: "/Tissu/Vichy-4.png",
    },
    {
      id: "vichy-5",
      name: "Vichy 5",
      price: 0,
      baseColor: "#fce7f3",
      image: "/Tissu/Vichy-5.png",
    },
    {
      id: "vichy-6",
      name: "Vichy 6",
      price: 0,
      baseColor: "#fce7f3",
      image: "/Tissu/Vichy-6.png",
    },
    {
      id: "vichy-7",
      name: "Vichy 7",
      price: 0,
      baseColor: "#fce7f3",
      image: "/Tissu/Vichy-7.png",
    },
  ];

  const embroideryColors = [
    { name: "Doré", hex: "#D4AF37" },
    { name: "Argent", hex: "#C0C0C0" },
    { name: "Rose", hex: "#FFB6C1" },
    { name: "Bleu", hex: "#87CEEB" },
    { name: "Terra Cotta", hex: "#E2725B" },
    { name: "Blanc", hex: "#FFFFFF" },
    { name: "Gris Anthracite", hex: "#36454F" },
  ];

  const accessories: Accessory[] = [
    { id: "bow", name: "Noeud décoratif", price: 5, emoji: "🎀" },
    { id: "lace", name: "Finition dentelle", price: 8, emoji: "🕸️" },
    { id: "pompom", name: "Pompons", price: 6, emoji: "🧶" },
  ];

  // --- State ---

  const [activeTab, setActiveTab] = useState<
    "product" | "fabric" | "embroidery" | "accessories" | "summary"
  >("product");

  const [configuration, setConfiguration] = useState<Configuration>({
    product: products[0], // Default to Bib
    fabric: fabrics[0], // Default to first fabric
    embroidery: "",
    embroideryColor: embroideryColors[0].hex,
    accessories: [],
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Cart store
  const { addItem, openCart } = useCartStore();

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});

  // --- Logic ---

  const totalPrice = () => {
    let total = configuration.product?.basePrice || 0;
    total += configuration.fabric?.price || 0;
    if (configuration.embroidery) total += 15;
    configuration.accessories.forEach((accId) => {
      const acc = accessories.find((a) => a.id === accId);
      if (acc) total += acc.price;
    });
    return total;
  };

  const toggleAccessory = (id: string) => {
    setConfiguration((prev) => ({
      ...prev,
      accessories: prev.accessories.includes(id)
        ? prev.accessories.filter((a) => a !== id)
        : [...prev.accessories, id],
    }));
  };

  // Tabs Navigation
  const tabs = [
    {
      id: "product" as const,
      label: "Produit",
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
      id: "accessories" as const,
      label: "Accessoires",
      icon: Sparkles,
      complete: configuration.accessories.length > 0,
    },
    {
      id: "summary" as const,
      label: "Résumé",
      icon: ShoppingBag,
      complete: false,
    },
  ];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);
  const canGoNext =
    currentTabIndex < tabs.length - 1 &&
    (activeTab === "product"
      ? !!configuration.product
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

    const uniqueId = `custom-${configuration.product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const cartItem = {
      id: uniqueId,
      productId: configuration.product.id,
      productName: configuration.product.name,
      configuration: {
        fabricName: configuration.fabric.name,
        fabricColor: configuration.fabric.baseColor,
        embroidery: configuration.embroidery || undefined,
        accessories: configuration.accessories,
      },
      price: totalPrice(),
      quantity: 1,
      // thumbnail: ... (could save canvas dataURL here if needed)
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
              // Créer le pattern de texture
              const pattern = textureCtx.createPattern(fabricImg, "repeat");
              if (pattern) {
                textureCtx.fillStyle = pattern;
                textureCtx.fillRect(0, 0, canvas.width, canvas.height);
              }

              // Récupérer les données
              const textureData = textureCtx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
              );
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

        // ÉTAPE 3: Ajouter un léger overlay pour plus de profondeur (optionnel)
        if (maskImg) {
          ctx.globalCompositeOperation = "overlay";
          ctx.globalAlpha = 0.15; // Très subtil
          ctx.drawImage(baseImg, 0, 0);
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 1.0;
        }

        // ÉTAPE 4: Dessiner la broderie
        if (configuration.embroidery) {
          ctx.save();

          // Position selon le produit
          let embX = canvas.width / 2;
          let embY = canvas.height / 2;

          // Ajustements spécifiques par produit
          if (configuration.product.id === "bib") {
            embY = canvas.height * 0.55;
          } else if (configuration.product.id === "pacifier") {
            embY = canvas.height * 0.45;
          } else if (configuration.product.id === "bag") {
            embY = canvas.height * 0.4;
          }

          ctx.translate(embX, embY);

          // Style de broderie réaliste
          ctx.fillStyle = configuration.embroideryColor;
          ctx.font = "bold 48px 'Georgia', serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Ombre pour effet 3D de broderie
          ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          // Contour pour effet "fil" brodé
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
          ctx.strokeText(configuration.embroidery, 0, 0);

          // Texte principal
          ctx.fillText(configuration.embroidery, 0, 0);

          // Double couche pour effet "épais" de broderie
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0.5;
          ctx.shadowOffsetY = 0.5;
          ctx.fillText(configuration.embroidery, 0, 0);

          ctx.restore();
        }
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

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf9f6] to-[#f5f1e8]">
      <div
        className="flex min-h-screen flex-col lg:flex-row"
        style={{ marginTop: "90px" }}
      >
        {/* LEFT: Preview (Sticky) */}
        <div className="relative flex h-[50vh] flex-col items-center justify-center bg-linear-to-br from-[#faf9f6] to-[#f5f1e8] p-8 lg:sticky lg:top-[90px] lg:h-[calc(100vh-90px)] lg:w-1/2">
          <div
            className={`relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-opacity duration-300 ${isProcessing ? "opacity-50" : "opacity-100"}`}
          >
            <canvas ref={canvasRef} className="h-auto w-full" />
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center">
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

          {/* Info produit */}
          {configuration.product && configuration.fabric && (
            <div className="absolute top-6 left-6 rounded-2xl bg-white/95 px-5 py-3 shadow-lg backdrop-blur-md">
              <p className="mb-1 text-xs text-[#1a1a1a]/60">Votre création</p>
              <p className="text-sm font-bold text-[#1a1a1a]">
                {configuration.product.name}
              </p>
              <p className="text-ylang-rose text-xs font-medium">
                {configuration.fabric.name}
              </p>
            </div>
          )}

          {/* Prix en mobile */}
          <div className="absolute top-6 right-6 rounded-2xl bg-white/95 px-5 py-3 shadow-lg backdrop-blur-md lg:hidden">
            <p className="text-xs text-[#1a1a1a]/60">Total</p>
            <p className="text-ylang-rose text-2xl font-bold">
              {totalPrice()}€
            </p>
          </div>
        </div>

        {/* RIGHT: Options (Scrollable) */}
        <div className="flex h-1/2 flex-col overflow-y-auto bg-white lg:h-full lg:w-1/2">
          <div className="flex-1 p-6 lg:p-4">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#1a1a1a]/60">
                  Étape {currentTabIndex + 1} sur {tabs.length}
                </h3>
                <span className="text-sm text-[#1a1a1a]/60">
                  {Math.round(((currentTabIndex + 1) / tabs.length) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8dcc8]">
                <div
                  className="from-ylang-rose to-ylang-terracotta h-full bg-linear-to-r transition-all duration-300"
                  style={{
                    width: `${((currentTabIndex + 1) / tabs.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Tabs navigation */}
            <div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isPast = index < currentTabIndex;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      // Allow clicking past or current tabs, or next if complete
                      if (
                        isPast ||
                        isActive ||
                        (index === currentTabIndex + 1 && canGoNext)
                      ) {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? "from-ylang-rose to-ylang-terracotta bg-linear-to-r text-white shadow-lg"
                        : isPast
                          ? "bg-ylang-rose/10 text-ylang-rose"
                          : "bg-[#f5f1e8] text-[#1a1a1a]/60 hover:bg-[#e8dcc8]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.complete && !isActive && <Check className="h-3 w-3" />}
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
                    <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                      Choisissez votre produit
                    </h2>
                    <p className="text-sm text-[#1a1a1a]/60">
                      Sélectionnez le produit à personnaliser
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {products.map((product) => {
                      const isSelected =
                        configuration.product?.id === product.id;
                      return (
                        <button
                          key={product.id}
                          onClick={() =>
                            setConfiguration((prev) => ({ ...prev, product }))
                          }
                          className={`relative w-60 rounded-xl border-2 p-3 text-left transition-all duration-300 ${
                            isSelected
                              ? "border-ylang-rose bg-ylang-rose/5 scale-103 shadow-lg"
                              : "hover:border-ylang-rose/50 border-[#e8dcc8] hover:shadow-md"
                          }`}
                        >
                          <h3 className="mb-1 font-bold">{product.name}</h3>
                          <p className="text-xs text-[#1a1a1a]/60">
                            {product.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="text-2xl">{product.icon}</div>
                            {isSelected && (
                              <div className="bg-ylang-rose absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <p className="text-ylang-rose text-xl font-bold">
                              {product.basePrice}€
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Step 2: Fabric */}
              {activeTab === "fabric" && (
                <>
                  <div className="mb-6">
                    <h2 className="mb-2 text-3xl font-bold text-[#1a1a1a]">
                      Choisissez votre tissu
                    </h2>
                    <p className="text-base text-[#1a1a1a]/70">
                      Visible en temps réel sur le modèle • Collection premium
                    </p>
                  </div>

                  {/* Aperçu rapide: 4 tissus de chaque type */}
                  <div className="space-y-8">
                    {/* Cotons */}
                    <div className="rounded-2xl bg-linear-to-br from-[#faf9f6] to-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[#1a1a1a]">
                            Cotons Unis
                          </h3>
                          <p className="text-sm text-[#1a1a1a]/60">
                            Doux et respirants
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-ylang-rose hover:text-ylang-terracotta flex items-center gap-1 text-sm font-semibold transition-colors">
                              Voir tout
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent
                            className="z-50 max-h-[85vh] max-w-5xl overflow-hidden bg-white p-0"
                            showCloseButton={true}
                          >
                            <div className="sticky top-0 z-20 border-b border-[#e8dcc8] bg-white px-6 py-5">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">
                                  Cotons Unis
                                </DialogTitle>
                                <DialogDescription className="text-base">
                                  Tous nos cotons unis de qualité premium •{" "}
                                  {
                                    fabrics.filter((f) =>
                                      f.id.startsWith("coton"),
                                    ).length
                                  }{" "}
                                  motifs
                                </DialogDescription>
                              </DialogHeader>
                            </div>
                            <div
                              className="overflow-y-auto px-6 py-6"
                              style={{ maxHeight: "calc(85vh - 100px)" }}
                            >
                              <div className="grid grid-cols-3 gap-5 sm:grid-cols-4 md:grid-cols-5">
                                {fabrics
                                  .filter((f) => f.id.startsWith("coton"))
                                  .map((fabric) => {
                                    const isSelected =
                                      configuration.fabric?.id === fabric.id;
                                    return (
                                      <button
                                        key={fabric.id}
                                        onClick={() => {
                                          setConfiguration((prev) => ({
                                            ...prev,
                                            fabric,
                                          }));
                                        }}
                                        className={`group relative flex flex-col overflow-hidden border-2 transition-all duration-300 ${
                                          isSelected
                                            ? "border-ylang-rose ring-ylang-rose scale-95"
                                            : "hover:border-ylang-rose/30 border-gray-100 hover:scale-105"
                                        }`}
                                      >
                                        <div
                                          className="h-24 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                          style={{
                                            backgroundImage: `url('${fabric.image}')`,
                                          }}
                                        />
                                        <div className="bg-white p-3">
                                          <h4 className="mb-1 truncate text-xs font-semibold text-[#1a1a1a]">
                                            {fabric.name}
                                          </h4>
                                          {/* <p className="text-ylang-rose text-sm font-bold">
                                            {fabric.price === 0
                                              ? "Inclus"
                                              : `+${fabric.price}€`}
                                          </p> */}
                                        </div>
                                        {isSelected && (
                                          <div className="bg-ylang-rose absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-lg">
                                            <Check className="h-3 w-3 text-white" />
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                        {fabrics
                          .filter((f) => f.id.startsWith("coton"))
                          .slice(0, 5)
                          .map((fabric) => {
                            const isSelected =
                              configuration.fabric?.id === fabric.id;
                            return (
                              <button
                                key={fabric.id}
                                onClick={() =>
                                  setConfiguration((prev) => ({
                                    ...prev,
                                    fabric,
                                  }))
                                }
                                className={`group relative flex flex-col overflow-hidden border-2 transition-all duration-300 ${
                                  isSelected
                                    ? "border-ylang-rose ring-ylang-rose scale-[0.98]"
                                    : "hover:border-ylang-rose/30 border-gray-100 hover:scale-[1.02]"
                                }`}
                              >
                                <div
                                  className="h-24 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                  style={{
                                    backgroundImage: `url('${fabric.image}')`,
                                  }}
                                />
                                <div className="bg-white p-2">
                                  <h4 className="mb-1 truncate text-sm font-semibold text-[#1a1a1a]">
                                    {fabric.name}
                                  </h4>
                                  {/* <p className="text-ylang-rose text-base font-bold">
                                    {fabric.price === 0
                                      ? "Inclus"
                                      : `+${fabric.price}€`}
                                  </p> */}
                                </div>
                                {isSelected && (
                                  <div className="bg-ylang-rose absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-lg">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* Jersey */}
                    <div className="bg-linaer-to-br rounded-2xl from-[#faf9f6] to-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[#1a1a1a]">
                            Jersey Coton
                          </h3>
                          <p className="text-sm text-[#1a1a1a]/60">
                            Extensible et confortable
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-ylang-rose hover:text-ylang-terracotta flex items-center gap-1 text-sm font-semibold transition-colors">
                              Voir tout
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent
                            className="z-50 max-h-[85vh] max-w-5xl overflow-hidden bg-white p-0"
                            showCloseButton={true}
                          >
                            <div className="sticky top-0 z-20 border-b border-[#e8dcc8] bg-white px-6 py-5">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">
                                  Jersey Coton
                                </DialogTitle>
                                <DialogDescription className="text-base">
                                  Tous nos tissus jersey doux et extensibles •{" "}
                                  {
                                    fabrics.filter((f) =>
                                      f.id.startsWith("jersey"),
                                    ).length
                                  }{" "}
                                  motifs
                                </DialogDescription>
                              </DialogHeader>
                            </div>
                            <div
                              className="overflow-y-auto px-6 py-6"
                              style={{ maxHeight: "calc(85vh - 100px)" }}
                            >
                              <div className="grid grid-cols-3 gap-5 sm:grid-cols-4 md:grid-cols-5">
                                {fabrics
                                  .filter((f) => f.id.startsWith("jersey"))
                                  .map((fabric) => {
                                    const isSelected =
                                      configuration.fabric?.id === fabric.id;
                                    return (
                                      <button
                                        key={fabric.id}
                                        onClick={() => {
                                          setConfiguration((prev) => ({
                                            ...prev,
                                            fabric,
                                          }));
                                        }}
                                        className={`group relative flex flex-col overflow-hidden border-2 transition-all duration-300 ${
                                          isSelected
                                            ? "border-ylang-rose ring-ylang-rose scale-95"
                                            : "hover:border-ylang-rose/30 border-gray-100 hover:scale-105"
                                        }`}
                                      >
                                        <div
                                          className="h-24 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                          style={{
                                            backgroundImage: `url('${fabric.image}')`,
                                          }}
                                        />
                                        <div className="bg-white p-3">
                                          <h4 className="mb-1 truncate text-xs font-semibold text-[#1a1a1a]">
                                            {fabric.name}
                                          </h4>
                                          {/* <p className="text-ylang-rose text-sm font-bold">
                                            {fabric.price === 0
                                              ? "Inclus"
                                              : `+${fabric.price}€`}
                                          </p> */}
                                        </div>
                                        {isSelected && (
                                          <div className="bg-ylang-rose absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-lg">
                                            <Check className="h-3 w-3 text-white" />
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                        {fabrics
                          .filter((f) => f.id.startsWith("jersey"))
                          .slice(0, 5)
                          .map((fabric) => {
                            const isSelected =
                              configuration.fabric?.id === fabric.id;
                            return (
                              <button
                                key={fabric.id}
                                onClick={() =>
                                  setConfiguration((prev) => ({
                                    ...prev,
                                    fabric,
                                  }))
                                }
                                className={`group relative flex flex-col overflow-hidden border-2 transition-all duration-300 ${
                                  isSelected
                                    ? "border-ylang-rose ring-ylang-rose scale-[0.98]"
                                    : "hover:border-ylang-rose/30 border-gray-100 hover:scale-[1.02]"
                                }`}
                              >
                                <div
                                  className="h-24 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                  style={{
                                    backgroundImage: `url('${fabric.image}')`,
                                  }}
                                />
                                <div className="bg-white p-2">
                                  <h4 className="mb-1 truncate text-sm font-semibold text-[#1a1a1a]">
                                    {fabric.name}
                                  </h4>
                                  {/* <p className="text-ylang-rose text-base font-bold">
                                    {fabric.price === 0
                                      ? "Inclus"
                                      : `+${fabric.price}€`}
                                  </p> */}
                                </div>
                                {isSelected && (
                                  <div className="bg-ylang-rose absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-lg">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* Toile de Jouy */}
                    <div className="rounded-2xl bg-linear-to-br from-[#faf9f6] to-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[#1a1a1a]">
                            Toile de Jouy
                          </h3>
                          <p className="text-sm text-[#1a1a1a]/60">
                            Motifs classiques élégants
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-ylang-rose hover:text-ylang-terracotta flex items-center gap-1 text-sm font-semibold transition-colors">
                              Voir tout
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent
                            className="z-50 max-h-[85vh] max-w-5xl overflow-hidden bg-white p-0"
                            showCloseButton={true}
                          >
                            <div className="sticky top-0 z-20 border-b border-[#e8dcc8] bg-white px-6 py-5">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">
                                  Toile de Jouy
                                </DialogTitle>
                                <DialogDescription className="text-base">
                                  Motifs classiques et élégants •{" "}
                                  {
                                    fabrics.filter((f) =>
                                      f.id.startsWith("toile"),
                                    ).length
                                  }{" "}
                                  motifs
                                </DialogDescription>
                              </DialogHeader>
                            </div>
                            <div
                              className="overflow-y-auto px-6 py-6"
                              style={{ maxHeight: "calc(85vh - 100px)" }}
                            >
                              <div className="grid grid-cols-3 gap-5 sm:grid-cols-4 md:grid-cols-5">
                                {fabrics
                                  .filter((f) => f.id.startsWith("toile"))
                                  .map((fabric) => {
                                    const isSelected =
                                      configuration.fabric?.id === fabric.id;
                                    return (
                                      <button
                                        key={fabric.id}
                                        onClick={() => {
                                          setConfiguration((prev) => ({
                                            ...prev,
                                            fabric,
                                          }));
                                        }}
                                        className={`group relative flex flex-col overflow-hidden border-2 transition-all duration-300 ${
                                          isSelected
                                            ? "border-ylang-rose scale-95"
                                            : "hover:border-ylang-rose/30 border-gray-100 hover:scale-105"
                                        }`}
                                      >
                                        <div
                                          className="h-24 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                          style={{
                                            backgroundImage: `url('${fabric.image}')`,
                                          }}
                                        />
                                        <div className="bg-white p-3">
                                          <h4 className="mb-1 truncate text-xs font-bold text-[#1a1a1a]">
                                            {fabric.name}
                                          </h4>
                                          {/* <p className="text-ylang-rose text-sm font-bold">
                                            {fabric.price === 0
                                              ? "Inclus"
                                              : `+${fabric.price}€`}
                                          </p> */}
                                        </div>
                                        {isSelected && (
                                          <div className="bg-ylang-rose absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-lg">
                                            <Check className="h-3 w-3 text-white" />
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                        {fabrics
                          .filter((f) => f.id.startsWith("toile"))
                          .slice(0, 5)
                          .map((fabric) => {
                            const isSelected =
                              configuration.fabric?.id === fabric.id;
                            return (
                              <button
                                key={fabric.id}
                                onClick={() =>
                                  setConfiguration((prev) => ({
                                    ...prev,
                                    fabric,
                                  }))
                                }
                                className={`group relative flex flex-col overflow-hidden border-2 transition-all duration-300 ${
                                  isSelected
                                    ? "border-ylang-rose ring-ylang-rose scale-[0.98]"
                                    : "hover:border-ylang-rose/30 border-gray-100 hover:scale-[1.02]"
                                }`}
                              >
                                <div
                                  className="h-24 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                  style={{
                                    backgroundImage: `url('${fabric.image}')`,
                                  }}
                                />
                                <div className="bg-white p-2">
                                  <h4 className="mb-1 truncate text-sm font-semibold text-[#1a1a1a]">
                                    {fabric.name}
                                  </h4>
                                  {/* <p className="text-ylang-rose text-base font-bold">
                                    {fabric.price === 0
                                      ? "Inclus"
                                      : `+${fabric.price}€`}
                                  </p> */}
                                </div>
                                {isSelected && (
                                  <div className="bg-ylang-rose absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-lg">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* Vichy */}
                    <div className="rounded-2xl bg-linear-to-br from-[#faf9f6] to-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[#1a1a1a]">
                            Vichy
                          </h3>
                          <p className="text-sm text-[#1a1a1a]/60">
                            Carreaux intemporels
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-ylang-rose hover:text-ylang-terracotta flex items-center gap-1 text-sm font-semibold transition-colors">
                              Voir tout
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent
                            className="w-70vw z-50 max-h-[85vh] overflow-hidden bg-white p-0"
                            showCloseButton={true}
                          >
                            <div className="sticky top-0 z-20 border-b border-[#e8dcc8] bg-white px-6 py-5">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">
                                  Vichy
                                </DialogTitle>
                                <DialogDescription className="text-base">
                                  Carreaux classiques intemporels •{" "}
                                  {
                                    fabrics.filter((f) =>
                                      f.id.startsWith("vichy"),
                                    ).length
                                  }{" "}
                                  motifs
                                </DialogDescription>
                              </DialogHeader>
                            </div>
                            <div
                              className="overflow-y-auto px-6 py-6"
                              style={{ maxHeight: "calc(85vh - 100px)" }}
                            >
                              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                                {fabrics
                                  .filter((f) => f.id.startsWith("vichy"))
                                  .map((fabric) => {
                                    const isSelected =
                                      configuration.fabric?.id === fabric.id;
                                    return (
                                      <button
                                        key={fabric.id}
                                        onClick={() => {
                                          setConfiguration((prev) => ({
                                            ...prev,
                                            fabric,
                                          }));
                                        }}
                                        className={`group relative flex flex-col overflow-hidden border-2 transition-all duration-300 ${
                                          isSelected
                                            ? "border-ylang-rose ring-ylang-rose scale-[0.98] shadow-md"
                                            : "hover:border-ylang-rose/30 border-gray-100 hover:scale-[1.02]"
                                        }`}
                                      >
                                        <div
                                          className="h-24 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                          style={{
                                            backgroundImage: `url('${fabric.image}')`,
                                          }}
                                        />
                                        <div className="bg-white p-3">
                                          <h4 className="mb-1 truncate text-xs font-bold text-[#1a1a1a]">
                                            {fabric.name}
                                          </h4>
                                          {/* <p className="text-ylang-rose text-sm font-bold">
                                            {fabric.price === 0
                                              ? "Inclus"
                                              : `+${fabric.price}€`}
                                          </p> */}
                                        </div>
                                        {isSelected && (
                                          <div className="bg-ylang-rose absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-lg">
                                            <Check className="h-3 w-3 text-white" />
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        {fabrics
                          .filter((f) => f.id.startsWith("vichy"))
                          .slice(0, 5)
                          .map((fabric) => {
                            const isSelected =
                              configuration.fabric?.id === fabric.id;
                            return (
                              <button
                                key={fabric.id}
                                onClick={() =>
                                  setConfiguration((prev) => ({
                                    ...prev,
                                    fabric,
                                  }))
                                }
                                className={`group relative flex flex-col overflow-hidden border-2 transition-all duration-300 ${
                                  isSelected
                                    ? "border-ylang-rose ring-ylang-rose scale-[0.98] shadow-md"
                                    : "hover:border-ylang-rose/30 border-gray-100 hover:scale-[1.02]"
                                }`}
                              >
                                <div
                                  className="h-24 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                  style={{
                                    backgroundImage: `url('${fabric.image}')`,
                                  }}
                                />
                                <div className="bg-white p-2">
                                  <h4 className="mb-1 truncate text-sm font-semibold text-[#1a1a1a]">
                                    {fabric.name}
                                  </h4>
                                  {/* <p className="text-ylang-rose text-base font-bold">
                                    {fabric.price === 0
                                      ? "Inclus"
                                      : `+${fabric.price}€`}
                                  </p> */}
                                </div>
                                {isSelected && (
                                  <div className="bg-ylang-rose absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-lg">
                                    <Check className="h-3 w-3 text-white" />
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

              {/* Step 3: Embroidery */}
              {activeTab === "embroidery" && (
                <>
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                      Broderie personnalisée
                    </h2>
                    <p className="text-sm text-[#1a1a1a]/60">
                      +15€ • Aperçu immédiat sur le produit
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Texte (max 15 caractères)
                      </label>
                      <input
                        type="text"
                        value={configuration.embroidery}
                        onChange={(e) =>
                          setConfiguration((prev) => ({
                            ...prev,
                            embroidery: e.target.value.slice(0, 15),
                          }))
                        }
                        placeholder="Prénom..."
                        className="focus:border-ylang-rose w-full rounded-xl border-2 border-[#e8dcc8] px-4 py-3 transition-colors focus:outline-none"
                        maxLength={15}
                      />
                      <p className="mt-1 text-xs text-[#1a1a1a]/40">
                        {configuration.embroidery.length}/15 caractères
                      </p>
                    </div>

                    {configuration.embroidery && (
                      <div>
                        <label className="mb-3 block text-sm font-medium">
                          Couleur du fil
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {embroideryColors.map((color) => (
                            <button
                              key={color.hex}
                              onClick={() =>
                                setConfiguration((prev) => ({
                                  ...prev,
                                  embroideryColor: color.hex,
                                }))
                              }
                              className={`h-8 w-8 rounded-full border border-gray-200 transition-all ${
                                configuration.embroideryColor === color.hex
                                  ? "ring-ylang-rose scale-110 ring-2 ring-offset-2"
                                  : "hover:scale-110"
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 4: Accessories */}
              {activeTab === "accessories" && (
                <>
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                      Accessoires décoratifs
                    </h2>
                    <p className="text-sm text-[#1a1a1a]/60">
                      Ajoutez une touche finale
                    </p>
                  </div>
                  <div className="space-y-3">
                    {accessories.map((acc) => {
                      const isSelected = configuration.accessories.includes(
                        acc.id,
                      );
                      return (
                        <button
                          key={acc.id}
                          onClick={() => toggleAccessory(acc.id)}
                          className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 transition-all duration-300 ${
                            isSelected
                              ? "border-ylang-rose bg-ylang-rose/5 shadow-lg"
                              : "hover:border-ylang-rose/50 border-[#e8dcc8]"
                          }`}
                        >
                          <span className="text-2xl">{acc.emoji}</span>
                          <div className="flex-1 text-left">
                            <h4 className="font-bold">{acc.name}</h4>
                            <p className="text-ylang-rose text-sm font-bold">
                              +{acc.price}€
                            </p>
                          </div>
                          {isSelected && (
                            <div className="bg-ylang-rose flex h-6 w-6 items-center justify-center rounded-full">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Step 5: Summary */}
              {activeTab === "summary" && (
                <>
                  <div className="text-center">
                    <div className="bg-ylang-rose mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold">
                      Création terminée !
                    </h2>
                    <p className="text-sm text-[#1a1a1a]/60">
                      Vérifiez votre configuration
                    </p>
                  </div>

                  <div className="space-y-2 rounded-xl bg-[#f5f1e8] p-4">
                    {configuration.product && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#1a1a1a]/70">
                          {configuration.product.name}
                        </span>
                        <span className="font-bold">
                          {configuration.product.basePrice}€
                        </span>
                      </div>
                    )}
                    {configuration.fabric && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#1a1a1a]/70">
                          {configuration.fabric.name}
                        </span>
                        <span className="font-bold">
                          +{configuration.fabric.price}€
                        </span>
                      </div>
                    )}
                    {configuration.embroidery && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#1a1a1a]/70">
                          Broderie "{configuration.embroidery}"
                        </span>
                        <span className="font-bold">+15€</span>
                      </div>
                    )}
                    {configuration.accessories.map((accId) => {
                      const acc = accessories.find((a) => a.id === accId);
                      return acc ? (
                        <div
                          key={accId}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-[#1a1a1a]/70">{acc.name}</span>
                          <span className="font-bold">+{acc.price}€</span>
                        </div>
                      ) : null;
                    })}
                  </div>

                  <div className="from-ylang-rose/10 to-ylang-terracotta/10 flex items-center justify-between rounded-xl bg-linear-to-r p-4">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-ylang-rose text-3xl font-bold">
                      {totalPrice()}€
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-[#e8dcc8] bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={goPrevious}
                disabled={!canGoPrevious}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all ${
                  canGoPrevious
                    ? "bg-[#f5f1e8] text-[#1a1a1a] hover:bg-[#e8dcc8]"
                    : "cursor-not-allowed bg-[#f5f1e8]/50 text-[#1a1a1a]/30"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Précédent</span>
              </button>

              <div className="hidden text-center lg:block">
                <p className="text-xs tracking-wider text-[#1a1a1a]/60 uppercase">
                  Prix total
                </p>
                <p className="text-ylang-rose text-3xl font-bold">
                  {totalPrice()}€
                </p>
              </div>

              {activeTab === "summary" ? (
                <button
                  onClick={handleAddToCart}
                  disabled={!configuration.product || !configuration.fabric}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white transition-all ${
                    configuration.product && configuration.fabric
                      ? "from-ylang-rose to-ylang-terracotta bg-linear-to-r hover:scale-105 hover:shadow-lg"
                      : "cursor-not-allowed bg-gray-300"
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  Ajouter au panier
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!canGoNext}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all ${
                    canGoNext
                      ? "from-ylang-rose to-ylang-terracotta bg-linear-to-r text-white hover:scale-105 hover:shadow-lg"
                      : "cursor-not-allowed bg-gray-300 text-white"
                  }`}
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <span className="sm:hidden">Suivant</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast de confirmation */}
      {addedToCart && (
        <div className="animate-fade-in-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e8dcc8] bg-white px-6 py-4 shadow-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-[#1a1a1a]">Ajouté au panier !</p>
              <p className="text-sm text-[#1a1a1a]/60">
                {configuration.product?.name} - {configuration.fabric?.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductConfigurator;
