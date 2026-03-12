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
  icon: string;
  baseImage: string;
  maskImage: string;
  colorMaskImage?: string;
  embroideryZone: EmbroideryZone; // NOUVELLE PROPRIÉTÉ
}

interface Fabric {
  id: string;
  name: string;
  price: number;
  baseColor: string; // Used for fallback or cart display
  image: string; // Texture image path
}

interface Configuration {
  product: Product | null;
  fabric: Fabric | null;
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
  const categoryFabrics = fabrics.filter((f) => f.id.startsWith(prefix));
  const displayedFabrics = categoryFabrics.slice(0, 5);
  const hasMore = categoryFabrics.length > 5;

  return (
    <div className="bg-ylang-beige/70 rounded-2xl p-6 shadow-sm">
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

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-8">
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

  const products: Product[] = [
    {
      id: "bib",
      name: "Bavoir",
      description: "Bavoir naissance ergonomique",
      basePrice: 13,
      icon: "👶",
      baseImage: "/images/produits/bavoir-base.png",
      maskImage: "/images/produits/bavoir-mask.png",
      embroideryZone: {
        x: 0.52, // Centre horizontal
        y: 0.48, // Légèrement en bas du centre
        maxWidth: 0.5,
        rotation: -15,
        fontSize: 80,
        alignment: "center",
      },
    },
    {
      id: "pacifier",
      name: "Attache-tétine",
      description: "Attache-tétine sécurisée en tissu",
      basePrice: 18,
      icon: "🍼",
      baseImage: "/images/produits/attache-tetine-base.png",
      maskImage: "/images/produits/attache-tetine-mask.png",
      embroideryZone: {
        x: 0.51,
        y: 0.5,
        maxWidth: 0.5,
        rotation: 30,
        fontSize: 70,
        alignment: "center",
      },
    },
    {
      id: "bag",
      name: "Sac",
      description: "Sac écolier",
      basePrice: 25,
      icon: "👜",
      baseImage: "/images/produits/sac-base.png",
      maskImage: "/images/produits/sac-mask.png",
      embroideryZone: {
        x: 0.48,
        y: 0.35,
        maxWidth: 0.5,
        rotation: 0,
        fontSize: 75,
        alignment: "center",
      },
    },
    {
      id: "bag2",
      name: "Sac à langer",
      description: "Grand sac voyage",
      basePrice: 40,
      icon: "👜",
      baseImage: "/images/produits/sac-a-langer-base.png",
      maskImage: "/images/produits/sac-a-langer-mask.png",
      embroideryZone: {
        x: 0.7,
        y: 0.4,
        maxWidth: 0.5,
        rotation: -10,
        fontSize: 80,
        alignment: "center",
      },
    },
    {
      id: "gigo",
      name: "Gigoteuse",
      description: "Gigoteuse raffinée",
      basePrice: 19,
      icon: "👗",
      baseImage: "/images/produits/gigoteuse-base.png",
      maskImage: "/images/produits/gigoteuse-mask.png",
      colorMaskImage: "/images/produits/gigoteuse-color-mask.png",
      embroideryZone: {
        x: 0.6,
        y: 0.33,
        maxWidth: 1,
        rotation: 13,
        fontSize: 50,
        alignment: "center",
      },
    },
  ];

  // Dynamically populated from previous step findings + prices added
  const fabrics: Fabric[] = [
    {
      id: "test-1",
      name: "Test 1",
      price: 0,
      baseColor: "#fce7f3",
      image: "/Tissu/tissu-jardin-des-reves.webp",
    },
    {
      id: "test-2",
      name: "Test 2",
      price: 0,
      baseColor: "#fce7f3",
      image: "/Tissu/tissu-vallarta.webp",
    },
    {
      id: "test-3",
      name: "Test 3",
      price: 0,
      baseColor: "#fce7f3",
      image: "/Tissu/tissu-japoneries.webp",
    },
    {
      id: "test-4",
      name: "Test 4",
      price: 0,
      baseColor: "#fce7f3",
      image: "/Tissu/tissu-jardin-exoachic.webp",
    },
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
    { name: "Noir", hex: "#000000" },
    { name: "Jaune Citron", hex: "#FFFF00" },
    { name: "Rouge Vif", hex: "#FF0000" },
    { name: "Bleu Roi", hex: "#0000FF" },
    { name: "Vert Pré", hex: "#00FF00" },
    { name: "Magenta", hex: "#FF00FF" },
    { name: "Cyan", hex: "#00FFFF" },
    { name: "Orange", hex: "#FF8000" },
    { name: "Violet", hex: "#8000FF" },
    { name: "Azur", hex: "#0080FF" },
    { name: "Framboise", hex: "#FF0080" },
    { name: "Chocolat", hex: "#804000" },
    { name: "Vert Sapin", hex: "#008040" },
    { name: "Indigo", hex: "#400080" },
    { name: "Corail Vif", hex: "#FF4040" },
    { name: "Vert Menthe", hex: "#40FF40" },
    { name: "Bleu Indigo", hex: "#4040FF" },
    { name: "Saumon", hex: "#FF8080" },
    { name: "Menthe à l'eau", hex: "#80FF80" },
    { name: "Lavande", hex: "#8080FF" },
    { name: "Ambre", hex: "#FFCC00" },
    { name: "Mauve Électrique", hex: "#CC00FF" },
    { name: "Turquoise", hex: "#00FFCC" },
  ];

  const fabricCategories = [
    {
      prefix: "test",
      title: "Tissu test resolution (666 x 666)",
      description: "Tissu temporaires",
    },
    {
      prefix: "coton",
      title: "Cotons Unis",
      description: "Douceur et respirabilité premium",
    },
    {
      prefix: "jersey",
      title: "Jersey Coton",
      description: "Extensible, doux et confortable",
    },
    {
      prefix: "toile",
      title: "Toile de Jouy",
      description: "Motifs classiques et élégance intemporelle",
    },
    {
      prefix: "vichy",
      title: "Vichy",
      description: "Carreaux iconiques et charme rétro",
    },
  ] as const;

  // Palette de couleurs pour les éléments avec color mask
  const productColors = [
    { name: "Rose Poudré", hex: "#E8B4B8" },
    { name: "Terracotta", hex: "#C4756C" },
    { name: "Bleu Ciel", hex: "#89CFF0" },
    { name: "Vert Sauge", hex: "#9DC183" },
    { name: "Jaune Miel", hex: "#F5D76E" },
    { name: "Lilas", hex: "#C8A2C8" },
    { name: "Corail", hex: "#FF8A80" },
    { name: "Beige", hex: "#D4C4A8" },
    { name: "Menthe", hex: "#98FF98" },
    { name: "Pêche", hex: "#FFCBA4" },
  ];

  // --- State ---

  const [activeTab, setActiveTab] = useState<
    "product" | "fabric" | "embroidery" | "summary"
  >("product");

  const [configuration, setConfiguration] = useState<Configuration>({
    product: products[0], // Default to Bib
    fabric: fabrics[0], // Default to first fabric
    embroidery: "",
    embroideryColor: embroideryColors[0].hex,
    selectedColor: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Cart store
  const { addItem, openCart } = useCartStore();

  // Search params for initial product selection
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get("product");

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const productContainerRef = useRef<HTMLDivElement>(null);

  // Effect to handle initial product selection from URL
  useEffect(() => {
    if (initialProductId) {
      const product = products.find(
        (p) =>
          p.id.toLowerCase() === initialProductId.toLowerCase() ||
          p.name.toLowerCase().includes(initialProductId.toLowerCase()),
      );
      if (product) {
        setConfiguration((prev) => ({
          ...prev,
          product,
        }));
      }
    }
  }, [initialProductId]);

  // --- Logic ---

  const totalPrice = () => {
    let total = configuration.product?.basePrice || 0;
    total += configuration.fabric?.price || 0;
    if (configuration.embroidery) total += 15;
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

    // Capturer l'image du canvas comme thumbnail
    const canvas = canvasRef.current;
    let thumbnailDataUrl: string | undefined;
    if (canvas) {
      try {
        thumbnailDataUrl = canvas.toDataURL("image/png");
      } catch (e) {
        console.warn("Impossible de capturer le thumbnail du canvas", e);
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
      },
      price: totalPrice(),
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

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf9f6] to-[#f5f1e8]">
      <div
        className="flex min-h-screen flex-col lg:flex-row"
        style={{ marginTop: "90px" }}
      >
        {/* LEFT: Preview (Sticky) */}
        <div className="from-ylang-terracotta/30 to-ylang-rose/10 relative flex h-[50vh] flex-col items-center justify-center bg-linear-to-br p-8 lg:sticky lg:top-[90px] lg:h-[calc(100vh-90px)] lg:w-1/2">
          <div ref={productContainerRef}
            className={`bg-ylang-beige/35 relative w-full max-w-lg overflow-hidden rounded-4xl shadow-xl transition-opacity duration-300 ${isProcessing ? "opacity-50" : "opacity-100"}`}
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

          {/* Info produit */}
          {configuration.product && configuration.fabric && (
            <div className="bg-ylang-beige/30 absolute top-6 left-6 rounded-2xl px-5 py-3 shadow-lg backdrop-blur-md">
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
              {totalPrice()}€
            </p>
          </div>
        </div>

        {/* RIGHT: Options (Scrollable content with sticky footer) */}
        <div className="bg-ylang-terracotta/30 flex flex-col lg:h-[calc(100vh-90px)] lg:w-1/2">
          <div className="flex-1 overflow-y-auto p-6 lg:p-4">
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
                    className={`group relative flex flex-1 items-center justify-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold whitespace-nowrap transition-all duration-500 ${
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
                      className={`h-4 w-4 transition-transform duration-500 ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                    />
                    <span>{tab.label}</span>
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
                      const isSelected =
                        configuration.product?.id === product.id;
                      return (
                        <button
                          key={product.id}
                          onClick={() =>
                            setConfiguration((prev) => ({ ...prev, product }))
                          }
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
                                {product.basePrice}€
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

                          {/* Decorative element */}
                          <div
                            className={`bg-ylang-rose/5 absolute -right-4 -bottom-4 h-24 w-24 rounded-full blur-2xl transition-opacity duration-500 ${isSelected ? "opacity-100" : "opacity-0"}`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Color Selection - uniquement si le produit a un colorMaskImage */}
                  {configuration.product?.colorMaskImage && (
                    <div className="mt-6 rounded-2xl border-2 border-dashed border-[#e8dcc8] bg-[#faf9f6] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Palette className="text-ylang-rose h-5 w-5" />
                        <h3 className="text-ylang-charcoal text-lg font-bold">
                          Personnalisez la couleur
                        </h3>
                      </div>
                      <p className="text-ylang-charcoal/60 mb-4 text-sm">
                        Ce produit dispose d'éléments personnalisables en
                        couleur
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {productColors.map((color) => (
                          <button
                            key={color.hex}
                            onClick={() =>
                              setConfiguration((prev) => ({
                                ...prev,
                                selectedColor:
                                  prev.selectedColor === color.hex
                                    ? null
                                    : color.hex,
                              }))
                            }
                            className={`group relative h-10 w-10 rounded-full border-2 transition-all duration-300 ${
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
                      {configuration.selectedColor && (
                        <div className="mt-3 flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full border border-[#e8dcc8]"
                            style={{
                              backgroundColor: configuration.selectedColor,
                            }}
                          />
                          <span className="text-ylang-charcoal/70 text-sm font-medium">
                            {productColors.find(
                              (c) => c.hex === configuration.selectedColor,
                            )?.name || "Couleur sélectionnée"}
                          </span>
                          <button
                            onClick={() =>
                              setConfiguration((prev) => ({
                                ...prev,
                                selectedColor: null,
                              }))
                            }
                            className="text-ylang-rose ml-auto text-xs hover:underline"
                          >
                            Réinitialiser
                          </button>
                        </div>
                      )}
                    </div>
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
                    <p className="text-ylang-charcoal/70 text-base">
                      Visible en temps réel sur le modèle • Collection premium
                    </p>
                  </div>

                  <div className="space-y-4">
                    {fabricCategories.map((category) => (
                      <FabricCategorySection
                        key={category.prefix}
                        title={category.title}
                        description={category.description}
                        prefix={category.prefix}
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
                    <div className="rounded-2xl border border-[#f5f1e8] bg-[#faf9f6]/50 p-6 shadow-sm">
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
                          className="focus:border-ylang-rose focus:ring-ylang-rose/10 placeholder:text-ylang-charcoal/20 w-full rounded-2xl border-2 border-[#e8dcc8] bg-white px-5 py-3 text-lg font-medium transition-all focus:ring-4 focus:outline-none"
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
                        <span className="bg-ylang-rose/10 text-ylang-rose flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                          i
                        </span>
                        Aperçu en temps réel sur l'image ci-dessus
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#f5f1e8] bg-white p-6 shadow-sm transition-all">
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
                    <p className="text-ylang-charcoal/60 text-sm">
                      Vérifiez votre configuration
                    </p>
                  </div>

                  <div className="space-y-2 rounded-xl bg-[#f5f1e8] p-4">
                    {configuration.product && (
                      <div className="flex justify-between text-sm">
                        <span className="text-ylang-charcoal/70">
                          {configuration.product.name}
                        </span>
                        <span className="font-bold">
                          {configuration.product.basePrice}€
                        </span>
                      </div>
                    )}
                    {configuration.fabric && (
                      <div className="flex justify-between text-sm">
                        <span className="text-ylang-charcoal/70">
                          {configuration.fabric.name}
                        </span>
                        <span className="font-bold">
                          +{configuration.fabric.price}€
                        </span>
                      </div>
                    )}
                    {configuration.embroidery && (
                      <div className="flex justify-between text-sm">
                        <span className="text-ylang-charcoal/70">
                          Broderie "{configuration.embroidery}"
                        </span>
                        <span className="font-bold">+15€</span>
                      </div>
                    )}
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

          {/* Footer Navigation - Sticky */}
          <div className="sticky bottom-0 border-t border-[#f5f1e8] bg-white/80 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl lg:px-8">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-6">
              <button
                onClick={goPrevious}
                disabled={!canGoPrevious}
                className={`group flex items-center gap-2 rounded-xl px-6 py-3 font-bold transition-all duration-300 ${
                  canGoPrevious
                    ? "text-ylang-charcoal bg-[#faf9f6] hover:scale-102 hover:bg-[#f5f1e8]"
                    : "text-ylang-charcoal cursor-not-allowed bg-[#faf9f6] opacity-30"
                }`}
              >
                <ChevronLeft
                  className={`h-5 w-5 transition-transform duration-300 ${canGoPrevious ? "group-hover:-translate-x-1" : ""}`}
                />
                <span className="hidden sm:inline">Précédent</span>
              </button>

              <div className="flex flex-col items-center lg:items-start">
                <span className="text-ylang-charcoal/30 items-center text-[10px] font-black tracking-widest uppercase">
                  Prix Total
                </span>
                <span className="text-ylang-charcoal text-xl font-black sm:text-2xl">
                  {totalPrice()}€
                </span>
              </div>

              {activeTab === "summary" ? (
                <button
                  onClick={handleAddToCart}
                  disabled={!configuration.product || !configuration.fabric}
                  className={`group flex items-center gap-3 rounded-2xl px-6 py-4 font-black text-white shadow-[0_10px_20px_-5px_rgba(232,180,184,0.5)] transition-all duration-500 ${
                    configuration.product && configuration.fabric
                      ? "from-ylang-rose to-ylang-terracotta bg-linear-to-r hover:scale-102 hover:shadow-[0_15px_30px_-5px_rgba(232,180,184,0.6)]"
                      : "text-ylang-charcoal/20 cursor-not-allowed bg-[#f5f1e8]"
                  }`}
                >
                  <ShoppingBag className="h-5 w-5 transition-transform group-hover:rotate-12" />
                  <span>Ajouter au panier</span>
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
