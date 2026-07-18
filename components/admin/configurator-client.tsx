"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrashBin } from "@gravity-ui/icons";
import { AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/image-upload";
import type { ConfiguratorFabricAdmin } from "@/lib/admin/get-configurator-fabrics-data";
import type { ConfiguratorFabricCategoryAdmin } from "@/lib/admin/get-configurator-categories-data";
import type { ConfiguratorColorAdmin } from "@/lib/admin/get-configurator-colors-data";
import type { ConfiguratorProductAdmin } from "@/lib/admin/get-configurator-products-data";
import type { ConfiguratorEmbroideryFontAdmin } from "@/lib/admin/get-configurator-embroidery-fonts-data";
import { replaceAdminImage } from "@/lib/admin/image-storage";
import type { EmbroideryZone } from "@/types/configurateur-page";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Palette,
  Crosshair,
  RotateCcw,
  Type,
  Maximize2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import EmbroideryZoneOverlay from "@/components/configurator/EmbroideryZoneOverlay";
import EmbroideryFontsPanel from "@/components/admin/configurator/embroidery-fonts-panel";

interface ConfiguratorClientProps {
  initialFabrics: ConfiguratorFabricAdmin[];
  initialProducts: ConfiguratorProductAdmin[];
  initialCategories: ConfiguratorFabricCategoryAdmin[];
  initialColors: ConfiguratorColorAdmin[];
  initialEmbroideryFonts: ConfiguratorEmbroideryFontAdmin[];
}

export function ConfiguratorClient({
  initialFabrics,
  initialProducts,
  initialCategories,
  initialColors,
  initialEmbroideryFonts,
}: ConfiguratorClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    "fabrics" | "products" | "broderie" | "palettes" | "polices"
  >("fabrics");
  const fabrics = initialFabrics;
  const products = initialProducts;
  const categories = initialCategories;

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fabric modal
  const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<
    | (Omit<Partial<ConfiguratorFabricAdmin>, "image"> & {
        image?: string | File;
      })
    | null
  >(null);
  const [isSavingFabric, setIsSavingFabric] = useState(false);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Partial<ConfiguratorProductAdmin> | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [newSizeInput, setNewSizeInput] = useState("");
  const [productImages, setProductImages] = useState<{
    baseImage: string | File;
    maskImage: string | File;
    colorMaskImage: string | File | null;
  }>({ baseImage: "", maskImage: "", colorMaskImage: null });

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Partial<ConfiguratorFabricCategoryAdmin> | null>(null);

  // Palettes tab
  const colors = initialColors;
  const embroideryFonts = initialEmbroideryFonts;
  const [colorSubTab, setColorSubTab] = useState<"product" | "embroidery">(
    "product",
  );
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] =
    useState<Partial<ConfiguratorColorAdmin> | null>(null);
  const [isSavingColor, setIsSavingColor] = useState(false);

  // Broderie tab
  const [embroideryProduct, setEmbroideryProduct] =
    useState<ConfiguratorProductAdmin | null>(null);
  const DEFAULT_EMBROIDERY_ZONE: EmbroideryZone = {
    x: 0.5,
    y: 0.3,
    maxWidth: 0.5,
    rotation: 0,
    fontSize: 28,
    alignment: "center",
    multiNameEnabled: true,
    nameSpacing: -36,
  };
  const [embroideryZone, setEmbroideryZone] = useState<EmbroideryZone>(
    DEFAULT_EMBROIDERY_ZONE,
  );
  const [previewText, setPreviewText] = useState("Ylang");
  const [previewFontId, setPreviewFontId] = useState<string>("moonlight");
  const [isSavingEmbroidery, setIsSavingEmbroidery] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const openEmbroideryEditor = useCallback(
    (product: ConfiguratorProductAdmin) => {
      setEmbroideryProduct(product);
    },
    [],
  );

  useEffect(() => {
    if (!embroideryProduct) return;
    // Même repli que le client (getEmbroideryZoneForFont) : une police sans
    // zone calibrée pour ce produit hérite de moonlight plutôt que de
    // retomber sur un défaut générique sans rapport avec le produit.
    const zones = embroideryProduct.embroideryZone ?? {};
    const zone =
      zones[previewFontId] ??
      zones.moonlight ??
      Object.values(zones)[0] ??
      DEFAULT_EMBROIDERY_ZONE;
    setEmbroideryZone(zone);
  }, [embroideryProduct, previewFontId]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100) / 100;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100) / 100;
    setEmbroideryZone((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    }));
  };

  const handleSaveEmbroidery = async () => {
    if (!embroideryProduct) return;
    setIsSavingEmbroidery(true);
    try {
      const updatedZoneMap = {
        ...(embroideryProduct.embroideryZone ?? {}),
        [previewFontId]: embroideryZone,
      };
      const res = await fetch(
        `/api/admin/configurator/products?id=${embroideryProduct.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embroideryZone: updatedZoneMap }),
        },
      );
      if (res.ok) {
        toast.success("Zone de broderie sauvegardée");
        // embroideryProduct is local "currently editing" state, not derived
        // from props — patch it with the exact value just saved so the
        // editor keeps showing correct data while router.refresh() below
        // re-fetches the `products` list (used elsewhere: product picker's
        // "Calibré" badge, Products tab, etc.).
        setEmbroideryProduct((prev) =>
          prev ? { ...prev, embroideryZone: updatedZoneMap } : prev,
        );
        startTransition(() => router.refresh());
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSavingEmbroidery(false);
    }
  };

  // Delete confirmation modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: "fabric" | "category" | "product" | "color";
    id: string | null;
    name: string;
  }>({ isOpen: false, type: "fabric", id: null, name: "" });

  const openDeleteModal = (
    type: "fabric" | "category" | "product" | "color",
    id: string,
    name: string,
  ) => {
    setDeleteConfirmation({ isOpen: true, type, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    try {
      const url =
        deleteConfirmation.type === "fabric"
          ? `/api/admin/configurator/fabrics?id=${deleteConfirmation.id}`
          : deleteConfirmation.type === "category"
            ? `/api/admin/configurator/categories?id=${deleteConfirmation.id}`
            : deleteConfirmation.type === "color"
              ? `/api/admin/configurator/colors?id=${deleteConfirmation.id}`
              : `/api/admin/configurator/products?id=${deleteConfirmation.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        toast.success(
          deleteConfirmation.type === "fabric"
            ? "Tissu supprimé"
            : deleteConfirmation.type === "category"
              ? "Catégorie supprimée"
              : deleteConfirmation.type === "color"
                ? "Couleur supprimée"
                : "Produit supprimé",
        );
        setDeleteConfirmation({
          isOpen: false,
          type: "fabric",
          id: null,
          name: "",
        });
        startTransition(() => router.refresh());
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  // ─── Color CRUD ───────────────────────────────────────────────────────────────
  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingColor?.id ||
      !editingColor?.name ||
      !editingColor?.hex ||
      !editingColor?.type
    ) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setIsSavingColor(true);
    const isExisting = colors.some((c) => c.id === editingColor.id);
    const method = isExisting ? "PUT" : "POST";
    const url = isExisting
      ? `/api/admin/configurator/colors?id=${editingColor.id}`
      : "/api/admin/configurator/colors";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingColor),
      });
      if (res.ok) {
        toast.success(isExisting ? "Couleur mise à jour" : "Couleur ajoutée");
        setIsColorModalOpen(false);
        setEditingColor(null);
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSavingColor(false);
    }
  };

  const toggleColorActive = async (color: ConfiguratorColorAdmin) => {
    try {
      const res = await fetch(`/api/admin/configurator/colors?id=${color.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !color.isActive }),
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  // Derived categories from existing fabrics
  const uniqueFabricCategories = Array.from(
    new Set(fabrics.map((f) => f.category)),
  ).filter(Boolean);

  // Filtered lists
  const filteredFabrics = fabrics.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = !selectedCategory || f.category === selectedCategory;
    const matchActive = !showActiveOnly || f.isActive;
    return matchSearch && matchCategory && matchActive;
  });

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchActive = !showActiveOnly || p.isActive;
    return matchSearch && matchActive;
  });

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategorySelection =
      !selectedCategory || c.id === selectedCategory;
    const matchActive = !showActiveOnly || c.isActive;
    const categoryMatches =
      matchSearch && matchCategorySelection && matchActive;

    const hasMatchingFabrics = filteredFabrics.some((f) => f.category === c.id);

    return categoryMatches || hasMatchingFabrics;
  });

  // ─── Category CRUD ────────────────────────────────────────────────────────────
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.id || !editingCategory?.title) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    const isExisting = categories.some((c) => c.id === editingCategory.id);
    const method = isExisting ? "PUT" : "POST";
    const url = isExisting
      ? `/api/admin/configurator/categories?id=${editingCategory.id}`
      : "/api/admin/configurator/categories";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });
      if (res.ok) {
        toast.success(isExisting ? "Catégorie mise à jour" : "Catégorie créée");
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error(
          "Erreur serveur : " + (err.error || "Une erreur est survenue"),
        );
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const toggleCategoryActive = async (
    category: ConfiguratorFabricCategoryAdmin,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/admin/configurator/categories?id=${category.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !category.isActive }),
        },
      );
      if (res.ok) {
        toast.success(
          category.isActive ? "Catégorie désactivée" : "Catégorie activée",
        );
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const deleteCategory = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openDeleteModal("category", id, name);
  };

  // ─── Fabric CRUD ──────────────────────────────────────────────────────────────
  const handleFabricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingFabric?.id ||
      !editingFabric?.name ||
      !editingFabric?.baseColor ||
      !editingFabric?.image ||
      !editingFabric?.category
    ) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    setIsSavingFabric(true);

    const isExisting = fabrics.some((f) => f.id === editingFabric.id);
    let finalImageUrl = editingFabric.image as string;

    if (editingFabric.image instanceof File) {
      try {
        const previousImage = isExisting
          ? (fabrics.find((f) => f.id === editingFabric.id)?.image ?? null)
          : null;
        const folderId =
          globalThis.crypto?.randomUUID?.() || Date.now().toString();
        finalImageUrl =
          (await replaceAdminImage(previousImage, editingFabric.image, {
            scope: "configurator-fabric",
            folderId,
          })) ?? "";
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de l'upload de l'image",
        );
        setIsSavingFabric(false);
        return;
      }
    }

    const method = isExisting ? "PUT" : "POST";
    const url = isExisting
      ? `/api/admin/configurator/fabrics?id=${editingFabric.id}`
      : "/api/admin/configurator/fabrics";
    const payload = isExisting
      ? {
          name: editingFabric.name,
          price: Math.round((editingFabric.price ?? 0) * 100),
          baseColor: editingFabric.baseColor,
          image: finalImageUrl,
          category: editingFabric.category,
          isActive: editingFabric.isActive,
        }
      : {
          ...editingFabric,
          image: finalImageUrl,
          price: Math.round((editingFabric.price ?? 0) * 100),
        };
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(isExisting ? "Tissu mis à jour" : "Tissu créé");
        setIsFabricModalOpen(false);
        setEditingFabric(null);
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error(
          "Erreur serveur : " + (err.error || "Une erreur est survenue"),
        );
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSavingFabric(false);
    }
  };

  const toggleFabricActive = async (
    fabric: ConfiguratorFabricAdmin,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/admin/configurator/fabrics?id=${fabric.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !fabric.isActive }),
        },
      );
      if (res.ok) {
        toast.success(fabric.isActive ? "Tissu désactivé" : "Tissu activé");
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const deleteFabric = (id: string, name: string) => {
    openDeleteModal("fabric", id, name);
  };

  // ─── Product CRUD ─────────────────────────────────────────────────────────────
  const handleOpenProductModal = (product?: ConfiguratorProductAdmin) => {
    if (product) {
      setEditingProduct(product);
      setProductImages({
        baseImage: product.baseImage,
        maskImage: product.maskImage,
        colorMaskImage: product.colorMaskImage || null,
      });
    } else {
      setEditingProduct({ sizes: null, defaultSize: null });
      setProductImages({ baseImage: "", maskImage: "", colorMaskImage: null });
    }
    setNewSizeInput("");
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    const isExisting = products.some((p) => p.id === editingProduct.id);
    if (!isExisting && !editingProduct.id) {
      toast.error("L'ID du produit est requis");
      return;
    }

    setIsSavingProduct(true);

    try {
      const productId = editingProduct.id as string;
      const previousProduct = isExisting
        ? products.find((p) => p.id === productId)
        : undefined;

      const baseImageUrl = await replaceAdminImage(
        previousProduct?.baseImage ?? null,
        productImages.baseImage,
        { scope: "configurator-product", productId, layer: "base" },
      );
      const maskImageUrl = await replaceAdminImage(
        previousProduct?.maskImage ?? null,
        productImages.maskImage,
        { scope: "configurator-product", productId, layer: "mask" },
      );
      const colorMaskUrl = await replaceAdminImage(
        previousProduct?.colorMaskImage ?? null,
        productImages.colorMaskImage,
        { scope: "configurator-product", productId, layer: "color-mask" },
      );

      if (!baseImageUrl || !maskImageUrl) {
        toast.error("Les images Base et Masque sont requises");
        setIsSavingProduct(false);
        return;
      }

      const payload = {
        name: editingProduct.name,
        description: editingProduct.description || "",
        basePrice: Math.round((editingProduct.basePrice ?? 0) * 100),
        weight: editingProduct.weight ?? 0,
        icon: editingProduct.icon || null,
        baseImage: baseImageUrl,
        maskImage: maskImageUrl,
        colorMaskImage: colorMaskUrl,
        sizes:
          editingProduct.sizes && editingProduct.sizes.length > 0
            ? editingProduct.sizes
            : null,
        defaultSize: editingProduct.defaultSize || null,
      };

      const url = isExisting
        ? `/api/admin/configurator/products?id=${editingProduct.id}`
        : "/api/admin/configurator/products";
      const method = isExisting ? "PUT" : "POST";

      // Pour POST, inclure l'id dans le payload
      const fullPayload = isExisting
        ? payload
        : { ...payload, id: editingProduct.id };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload),
      });

      if (res.ok) {
        toast.success(isExisting ? "Produit mis à jour" : "Produit créé");
        setIsProductModalOpen(false);
        setEditingProduct(null);
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Une erreur est survenue"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const toggleProductActive = async (product: ConfiguratorProductAdmin) => {
    try {
      const res = await fetch(
        `/api/admin/configurator/products?id=${product.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !product.isActive }),
        },
      );
      if (res.ok) {
        toast.success(
          product.isActive ? "Produit désactivé" : "Produit activé",
        );
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  return (
    <div>
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="type-overline mb-2"
            style={{ color: "var(--color-accent)" }}
          >
            Administration
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "1.75rem",
              color: "var(--color-ink)",
            }}
          >
            Configurateur
          </h1>
          <p
            className="font-body mt-1 text-sm"
            style={{ color: "var(--color-ink-3)" }}
          >
            Tissus · Produits · Broderie · Palettes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: `${fabrics.length} tissus` },
            { label: `${fabrics.filter((f) => f.isActive).length} actifs` },
            { label: `${products.length} produits` },
            { label: `${colors.length} couleurs` },
          ].map(({ label }) => (
            <span
              key={label}
              className="font-body inline-flex items-center gap-1.5 px-2.5 py-1 text-xs"
              style={{
                border: "var(--rule-soft)",
                color: "var(--color-ink-3)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div
        className="mb-6 flex overflow-x-auto"
        style={{ borderBottom: "var(--rule-soft)" }}
      >
        {(
          [
            { id: "fabrics", label: "Tissus & Catégories", count: null },
            { id: "products", label: "Produits", count: products.length },
            { id: "broderie", label: "Broderie", count: null },
            { id: "palettes", label: "Palettes", count: colors.length },
            { id: "polices", label: "Polices", count: null },
          ] as const
        ).map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              setSearchQuery("");
              setSelectedCategory(null);
            }}
            className="font-body relative flex shrink-0 items-center gap-1.5 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              color:
                activeTab === id ? "var(--color-ink)" : "var(--color-ink-3)",
              borderBottom:
                activeTab === id
                  ? "2px solid var(--color-ink)"
                  : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {label}
            {count !== null && (
              <span
                className="font-body text-[10px]"
                style={{
                  color:
                    activeTab === id
                      ? "var(--color-ink-3)"
                      : "var(--color-ink-3)",
                  opacity: 0.6,
                }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Action bar ────────────────────────────────────────── */}
      {activeTab !== "broderie" &&
        activeTab !== "palettes" &&
        activeTab !== "polices" && (
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex gap-2 lg:flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
                  style={{ color: "var(--color-ink-3)" }}
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  placeholder={
                    activeTab === "fabrics"
                      ? "Rechercher un tissu ou une catégorie…"
                      : "Rechercher un produit…"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="font-body h-11 w-full pr-4 pl-10 text-sm outline-none"
                  style={{
                    border: "var(--rule-soft)",
                    background: "var(--color-paper)",
                    color: "var(--color-ink)",
                  }}
                />
              </div>
              {/* Grid / List toggle */}
              <div
                className="flex items-center p-1"
                style={{
                  border: "var(--rule-soft)",
                  background: "var(--color-paper)",
                }}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className="p-1.5 transition-colors"
                  style={{
                    background:
                      viewMode === "grid" ? "var(--color-ink)" : "transparent",
                    color:
                      viewMode === "grid"
                        ? "var(--color-paper)"
                        : "var(--color-ink-3)",
                  }}
                >
                  <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className="p-1.5 transition-colors"
                  style={{
                    background:
                      viewMode === "list" ? "var(--color-ink)" : "transparent",
                    color:
                      viewMode === "list"
                        ? "var(--color-paper)"
                        : "var(--color-ink-3)",
                  }}
                >
                  <List className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category filter */}
              {activeTab === "fabrics" && uniqueFabricCategories.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value || null)
                    }
                    className="font-body h-11 cursor-pointer appearance-none pr-8 pl-3 text-sm outline-none"
                    style={{
                      border: "var(--rule-soft)",
                      background: "var(--color-paper)",
                      color: "var(--color-ink)",
                    }}
                  >
                    <option value="">Toutes catégories</option>
                    {uniqueFabricCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "var(--color-ink-3)" }}
                    strokeWidth={1.5}
                  />
                </div>
              )}

              {/* Active-only toggle */}
              <label
                className="flex h-11 cursor-pointer items-center gap-2.5 px-3.5 select-none"
                style={{
                  border: "var(--rule-soft)",
                  background: "var(--color-paper)",
                }}
              >
                <span
                  className="font-body text-sm whitespace-nowrap"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  Actifs seulement
                </span>
                <div
                  onClick={() => setShowActiveOnly((prev) => !prev)}
                  className="relative h-5 w-9 rounded-full transition-colors"
                  style={{
                    background: showActiveOnly
                      ? "var(--color-ink)"
                      : "var(--color-paper-3)",
                  }}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[var(--ease-out)] ${showActiveOnly ? "translate-x-3.5" : "translate-x-0"}`}
                  />
                </div>
              </label>

              {/* Add buttons */}
              {activeTab === "fabrics" && (
                <>
                  <button
                    onClick={() => {
                      setEditingCategory({ isActive: true, order: 0 });
                      setIsCategoryModalOpen(true);
                    }}
                    className="font-body flex h-11 items-center gap-1.5 px-4 text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-70"
                    style={{
                      border: "var(--rule-soft)",
                      color: "var(--color-ink-3)",
                      background: "var(--color-paper)",
                    }}
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    Catégorie
                  </button>
                  <button
                    onClick={() => {
                      setEditingFabric({ isActive: true, price: 0 });
                      setIsFabricModalOpen(true);
                    }}
                    className="font-body flex h-11 items-center gap-1.5 px-4 text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-80"
                    style={{
                      background: "var(--color-ink)",
                      color: "var(--color-paper)",
                    }}
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    Nouveau Tissu
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      {/* ═══ FABRICS & CATEGORIES TAB ═══════════════════════════════════════════════════════ */}
      {activeTab === "fabrics" && (
        <div className="space-y-12">
          {filteredCategories.length === 0 && filteredFabrics.length === 0 ? (
            <div className="font-body py-20 text-center text-sm text-gray-400">
              Aucun tissu ou catégorie trouvé
            </div>
          ) : (
            filteredCategories.map((category) => {
              const categoryFabrics = filteredFabrics.filter(
                (f) => f.category === category.id,
              );

              return (
                <div
                  key={category.id}
                  className={`overflow-hidden bg-white transition-opacity ${category.isActive ? "" : "border-dashed border-gray-200 opacity-70"}`}
                  style={{
                    border: category.isActive ? "var(--rule-hair)" : undefined,
                  }}
                >
                  {/* Category header */}
                  <div
                    className="flex flex-col justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center"
                    style={{
                      borderBottom: "var(--rule-soft)",
                      background: "var(--color-paper-2)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${category.isActive ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" : "bg-gray-300"}`}
                      />
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2
                            className="text-2xl"
                            style={{
                              fontFamily: "var(--font-display)",
                              color: "var(--color-ink)",
                            }}
                          >
                            {category.title}
                          </h2>
                          <span
                            className="type-overline px-2 py-0.5 text-gray-400"
                            style={{ border: "var(--rule-soft)" }}
                          >
                            {category.id}
                          </span>
                        </div>
                        {category.description && (
                          <p className="font-body mt-0.5 text-sm text-gray-400">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingFabric({
                            isActive: true,
                            price: 0,
                            category: category.id,
                          });
                          setIsFabricModalOpen(true);
                        }}
                        className="font-body flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                        style={{
                          background: "var(--color-ink)",
                          color: "var(--color-paper)",
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Tissu
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setIsCategoryModalOpen(true);
                        }}
                        className="flex h-8 w-8 items-center justify-center bg-white text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                        style={{ border: "var(--rule-soft)" }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => toggleCategoryActive(category, e)}
                        className="flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-60"
                        style={{
                          border: "var(--rule-soft)",
                          color: "var(--color-ink-3)",
                          background: "var(--color-paper)",
                        }}
                      >
                        {category.isActive ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) =>
                          deleteCategory(category.id, category.title, e)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-red-400 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {categoryFabrics.length === 0 ? (
                      <div className="font-body py-12 text-center text-sm text-gray-400">
                        <p className="font-medium">
                          Aucun tissu dans cette catégorie
                        </p>
                        <button
                          onClick={() => {
                            setEditingFabric({
                              isActive: true,
                              price: 0,
                              category: category.id,
                            });
                            setIsFabricModalOpen(true);
                          }}
                          className="font-body mt-2 text-xs font-medium text-gray-500 underline-offset-2 hover:underline"
                        >
                          + Ajouter le premier tissu
                        </button>
                      </div>
                    ) : viewMode === "grid" ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {categoryFabrics.map((fabric) => (
                          <div
                            key={fabric.id}
                            className={`group relative overflow-hidden transition-[opacity,box-shadow] hover:shadow-sm ${fabric.isActive ? "" : "border-dashed border-gray-200 opacity-55"}`}
                            style={
                              fabric.isActive
                                ? { border: "var(--rule-soft)" }
                                : undefined
                            }
                          >
                            {/* Texture image */}
                            <div
                              className="aspect-square w-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${fabric.image})`,
                                backgroundColor: fabric.baseColor,
                              }}
                            />
                            {/* Hover overlay actions */}
                            <div className="absolute inset-0 flex items-end justify-center gap-1.5 bg-black/20 p-3 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                              <button
                                onClick={(e) => toggleFabricActive(fabric, e)}
                                title={
                                  fabric.isActive ? "Désactiver" : "Activer"
                                }
                                className="flex h-8 w-8 items-center justify-center bg-white/90 shadow transition-opacity hover:opacity-70"
                                style={{ color: "var(--color-ink)" }}
                              >
                                {fabric.isActive ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingFabric(fabric);
                                  setIsFabricModalOpen(true);
                                }}
                                className="flex h-8 w-8 items-center justify-center bg-white/90 shadow transition-opacity hover:opacity-70"
                                style={{ color: "var(--color-ink)" }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteFabric(fabric.id, fabric.name)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/90 text-white shadow transition-colors hover:bg-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {/* Info bar */}
                            <div
                              className="bg-white px-2.5 py-2"
                              style={{ borderTop: "var(--rule-soft)" }}
                            >
                              <h3 className="truncate text-xs font-medium text-gray-800">
                                {fabric.name}
                              </h3>
                              <div className="mt-0.5 flex items-center gap-1.5">
                                <div
                                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                                  style={{ backgroundColor: fabric.baseColor }}
                                />
                                <span className="text-caption font-mono font-semibold text-gray-600">
                                  {fabric.price.toFixed(2)}€
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="overflow-hidden"
                        style={{ border: "var(--rule-hair)" }}
                      >
                        <div
                          className="grid grid-cols-[48px_1fr_100px_80px_140px] items-center gap-4 px-5 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase"
                          style={{
                            borderBottom: "var(--rule-soft)",
                            background: "var(--color-paper-2)",
                          }}
                        >
                          <div>Aperçu</div>
                          <div>Nom</div>
                          <div>Prix</div>
                          <div>Statut</div>
                          <div className="text-right">Actions</div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {categoryFabrics.map((fabric) => (
                            <div
                              key={fabric.id}
                              className={`grid grid-cols-[48px_1fr_100px_80px_140px] items-center gap-4 px-5 py-2.5 transition-colors hover:bg-gray-50/50 ${!fabric.isActive ? "opacity-60" : ""}`}
                            >
                              <div
                                className="h-10 w-10 rounded-sm bg-cover bg-center"
                                style={{
                                  backgroundImage: `url(${fabric.image})`,
                                  backgroundColor: fabric.baseColor,
                                  border: "var(--rule-soft)",
                                }}
                              />
                              <div className="truncate font-medium text-gray-800">
                                {fabric.name}
                              </div>
                              <div className="font-mono text-sm font-medium text-gray-600">
                                {fabric.price.toFixed(2)}€
                              </div>
                              <div>
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium"
                                  style={{
                                    border: "var(--rule-soft)",
                                    color: "var(--color-ink-3)",
                                  }}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${fabric.isActive ? "bg-green-400" : "bg-gray-300"}`}
                                  />
                                  {fabric.isActive ? "Actif" : "Inactif"}
                                </span>
                              </div>
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={(e) => toggleFabricActive(fabric, e)}
                                  className="p-1.5 transition-opacity hover:opacity-60"
                                  style={{
                                    border: "var(--rule-soft)",
                                    color: "var(--color-ink-3)",
                                    background: "var(--color-paper)",
                                  }}
                                  title={
                                    fabric.isActive ? "Désactiver" : "Activer"
                                  }
                                >
                                  {fabric.isActive ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingFabric(fabric);
                                    setIsFabricModalOpen(true);
                                  }}
                                  className="p-1.5 transition-opacity hover:opacity-60"
                                  style={{
                                    border: "var(--rule-soft)",
                                    color: "var(--color-ink-3)",
                                    background: "var(--color-paper)",
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    deleteFabric(fabric.id, fabric.name)
                                  }
                                  className="p-1.5 transition-opacity hover:opacity-60"
                                  style={{
                                    border: "var(--rule-soft)",
                                    color: "var(--color-accent)",
                                    background: "var(--color-paper)",
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* /p-6 */}
                </div>
              );
            })
          )}

          {/* Uncategorized / Others */}
          {(() => {
            const uncategorized = filteredFabrics.filter(
              (f) => !categories.some((c) => c.id === f.category),
            );
            if (uncategorized.length === 0) return null;
            return (
              <div
                className="p-6 opacity-80"
                style={{
                  border: "var(--rule-soft)",
                  borderStyle: "dashed",
                  background: "var(--color-paper-2)",
                }}
              >
                <p
                  className="type-overline mb-4"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  Tissus hors catégories (ou ID de catégorie invalide)
                </p>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {uncategorized.map((fabric) => (
                      <div
                        key={fabric.id}
                        className={`overflow-hidden bg-white transition-[opacity,box-shadow] hover:shadow-sm ${fabric.isActive ? "" : "border border-gray-200 opacity-60"}`}
                        style={
                          fabric.isActive
                            ? { border: "var(--rule-soft)" }
                            : undefined
                        }
                      >
                        <div
                          className="aspect-square w-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${fabric.image})`,
                            backgroundColor: fabric.baseColor,
                          }}
                        />
                        <div className="p-2.5">
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              <h3 className="font-body truncate text-sm font-medium text-gray-800">
                                {fabric.name}
                              </h3>
                              <span className="font-mono text-[10px] font-semibold text-gray-600">
                                {fabric.price.toFixed(2)}€
                              </span>
                            </div>
                          </div>
                          <p className="mt-1 truncate text-[10px] text-gray-600">
                            Cat: {fabric.category}
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            <button
                              onClick={(e) => toggleFabricActive(fabric, e)}
                              title={fabric.isActive ? "Désactiver" : "Activer"}
                              className="flex h-7 w-7 items-center justify-center p-1 transition-opacity hover:opacity-60"
                              style={{
                                border: "var(--rule-soft)",
                                color: "var(--color-ink-3)",
                                background: "var(--color-paper)",
                              }}
                            >
                              {fabric.isActive ? (
                                <Eye className="h-3.5 w-3.5" />
                              ) : (
                                <EyeOff className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditingFabric(fabric);
                                setIsFabricModalOpen(true);
                              }}
                              className="flex h-7 w-7 items-center justify-center p-1 transition-opacity hover:opacity-60"
                              style={{
                                border: "var(--rule-soft)",
                                color: "var(--color-ink-3)",
                                background: "var(--color-paper)",
                              }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                deleteFabric(fabric.id, fabric.name)
                              }
                              className="flex h-7 w-7 items-center justify-center p-1 transition-opacity hover:opacity-60"
                              style={{
                                border: "var(--rule-soft)",
                                color: "var(--color-accent)",
                                background: "var(--color-paper)",
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="overflow-hidden"
                    style={{ border: "var(--rule-hair)" }}
                  >
                    <div
                      className="grid grid-cols-[48px_1fr_120px_100px_80px_140px] items-center gap-4 px-5 py-2 text-xs font-semibold tracking-wider uppercase"
                      style={{
                        borderBottom: "var(--rule-soft)",
                        background: "var(--color-paper-2)",
                        color: "var(--color-ink-3)",
                      }}
                    >
                      <div>Aperçu</div>
                      <div>Nom</div>
                      <div>Catégorie</div>
                      <div>Prix</div>
                      <div>Statut</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {uncategorized.map((fabric) => (
                        <div
                          key={fabric.id}
                          className={`grid grid-cols-[48px_1fr_120px_100px_80px_140px] items-center gap-4 bg-white px-5 py-2.5 transition-colors hover:bg-gray-50/50 ${!fabric.isActive ? "opacity-60" : ""}`}
                        >
                          <div
                            className="h-10 w-10 rounded-lg border border-gray-200 bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${fabric.image})`,
                              backgroundColor: fabric.baseColor,
                            }}
                          />
                          <div className="truncate font-medium text-gray-800">
                            {fabric.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {fabric.category}
                          </div>
                          <div className="text-sm font-bold text-gray-700">
                            {fabric.price.toFixed(2)}€
                          </div>
                          <div>
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                border: "var(--rule-soft)",
                                color: "var(--color-ink-3)",
                              }}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${fabric.isActive ? "bg-green-400" : "bg-gray-300"}`}
                              />
                              {fabric.isActive ? "Actif" : "Inactif"}
                            </span>
                          </div>
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={(e) => toggleFabricActive(fabric, e)}
                              className="p-1.5 transition-opacity hover:opacity-60"
                              style={{
                                border: "var(--rule-soft)",
                                color: "var(--color-ink-3)",
                                background: "var(--color-paper)",
                              }}
                              title={fabric.isActive ? "Désactiver" : "Activer"}
                            >
                              {fabric.isActive ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditingFabric(fabric);
                                setIsFabricModalOpen(true);
                              }}
                              className="p-1.5 transition-opacity hover:opacity-60"
                              style={{
                                border: "var(--rule-soft)",
                                color: "var(--color-ink-3)",
                                background: "var(--color-paper)",
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                deleteFabric(fabric.id, fabric.name)
                              }
                              className="p-1.5 transition-opacity hover:opacity-60"
                              style={{
                                border: "var(--rule-soft)",
                                color: "var(--color-accent)",
                                background: "var(--color-paper)",
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ═══ PRODUCTS TAB ══════════════════════════════════════════════════════ */}
      {activeTab === "products" && (
        <div>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">
              {filteredProducts.length} produit
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => handleOpenProductModal()}
              className="font-body flex h-10 items-center gap-1.5 px-4 text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-ink)",
                color: "var(--color-paper)",
              }}
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Nouveau Produit
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredProducts.map((product) => {
              const layerCount = [
                product.baseImage,
                product.maskImage,
                product.colorMaskImage,
              ].filter(Boolean).length;
              return (
                <div
                  key={product.id}
                  className={`group relative overflow-hidden bg-white transition-[opacity,box-shadow] hover:shadow-sm ${product.isActive ? "" : "border-dashed border-gray-200 opacity-65"}`}
                  style={
                    product.isActive
                      ? { border: "var(--rule-soft)" }
                      : undefined
                  }
                >
                  {/* Status accent stripe */}
                  <div
                    className={`absolute top-0 left-0 h-full w-1 rounded-l-2xl ${product.isActive ? "bg-green-400" : "bg-gray-300"}`}
                  />

                  <div className="flex flex-col gap-4 p-5 pl-6 sm:flex-row sm:items-center">
                    {/* Aperçu */}
                    <div
                      className="relative h-20 w-20 shrink-0 overflow-hidden"
                      style={{
                        background: "var(--color-paper-2)",
                        border: "var(--rule-soft)",
                      }}
                    >
                      {product.baseImage ? (
                        <img
                          src={product.baseImage}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-3xl">
                          {product.icon || "?"}
                        </span>
                      )}
                      {/* Layer count badge */}
                      <div className="absolute right-1 bottom-1 bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {layerCount}L
                      </div>
                    </div>

                    {/* Infos */}
                    <div className="grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">
                          {product.name}
                        </h3>
                        {product.icon && (
                          <span className="text-lg leading-none">
                            {product.icon}
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <p className="mt-0.5 line-clamp-1 text-sm text-gray-400">
                          {product.description}
                        </p>
                      )}
                      <p className="mt-1 font-mono text-sm font-semibold text-gray-600">
                        {product.basePrice.toFixed(2)} €
                      </p>

                      {/* Calques badges */}
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            border: "var(--rule-soft)",
                            color: "var(--color-ink-3)",
                          }}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${product.baseImage ? "bg-green-400" : "bg-red-400"}`}
                          />{" "}
                          Base
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            border: "var(--rule-soft)",
                            color: "var(--color-ink-3)",
                          }}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${product.maskImage ? "bg-green-400" : "bg-red-400"}`}
                          />{" "}
                          Masque
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            border: "var(--rule-soft)",
                            color: "var(--color-ink-3)",
                          }}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${product.colorMaskImage ? "bg-green-400" : "bg-gray-300"}`}
                          />{" "}
                          Couleur
                        </span>
                        {product.embroideryZone &&
                          Object.keys(product.embroideryZone).length > 0 && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium"
                              style={{
                                border: "var(--rule-soft)",
                                color: "var(--color-ink-3)",
                              }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />{" "}
                              Broderie
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Miniatures calques */}
                    {(product.baseImage ||
                      product.maskImage ||
                      product.colorMaskImage) && (
                      <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
                        {product.baseImage && (
                          <div className="group/thumb relative">
                            <img
                              src={product.baseImage}
                              alt="Base"
                              className="h-12 w-12 object-cover"
                              style={{
                                border: "var(--rule-soft)",
                                background: "var(--color-paper-2)",
                              }}
                            />
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-white opacity-0 transition-opacity group-hover/thumb:opacity-100">
                              Base
                            </span>
                          </div>
                        )}
                        {product.maskImage && (
                          <div className="group/thumb relative">
                            <img
                              src={product.maskImage}
                              alt="Masque"
                              className="h-12 w-12 bg-gray-100 object-cover"
                              style={{ border: "var(--rule-soft)" }}
                            />
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-white opacity-0 transition-opacity group-hover/thumb:opacity-100">
                              Masque
                            </span>
                          </div>
                        )}
                        {product.colorMaskImage && (
                          <div className="group/thumb relative">
                            <img
                              src={product.colorMaskImage}
                              alt="Couleur"
                              className="h-12 w-12 object-cover"
                              style={{
                                border: "var(--rule-soft)",
                                background: "var(--color-paper-2)",
                              }}
                            />
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-white opacity-0 transition-opacity group-hover/thumb:opacity-100">
                              Couleur
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5 border-t pt-3 sm:border-none sm:pt-0">
                      <button
                        onClick={() => handleOpenProductModal(product)}
                        className="flex h-9 items-center gap-1.5 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        style={{ border: "var(--rule-soft)" }}
                      >
                        <Edit className="h-3.5 w-3.5" /> Modifier
                      </button>
                      <button
                        onClick={() => toggleProductActive(product)}
                        className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
                        style={{
                          border: "var(--rule-soft)",
                          color: "var(--color-ink-3)",
                          background: "var(--color-paper)",
                        }}
                      >
                        {product.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          openDeleteModal("product", product.id, product.name)
                        }
                        className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
                        style={{
                          border: "var(--rule-soft)",
                          color: "var(--color-accent)",
                          background: "var(--color-paper)",
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ BRODERIE TAB ════════════════════════════════════════════════════════ */}
      {activeTab === "broderie" && (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* ── Liste des produits ── */}
          <div className="w-full shrink-0 space-y-1.5 lg:w-72">
            <p
              className="type-overline mb-3"
              style={{ color: "var(--color-ink-3)" }}
            >
              Sélectionner un produit
            </p>
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => openEmbroideryEditor(product)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-[border-color,background-color,box-shadow] ${
                  embroideryProduct?.id === product.id
                    ? "border-ylang-charcoal bg-gray-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm"
                }`}
              >
                <div
                  className="h-11 w-11 shrink-0 overflow-hidden"
                  style={{
                    background: "var(--color-paper-2)",
                    border: "var(--rule-soft)",
                  }}
                >
                  {product.baseImage ? (
                    <img
                      src={product.baseImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xl">
                      {product.icon}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body truncate text-sm font-medium text-gray-800">
                    {product.name}
                  </p>
                  {product.embroideryZone &&
                  Object.keys(product.embroideryZone).length > 0 ? (
                    <p className="mt-0.5 text-[10px] font-semibold text-green-600">
                      ✓ Calibré ({Object.keys(product.embroideryZone).length}{" "}
                      police
                      {Object.keys(product.embroideryZone).length > 1
                        ? "s"
                        : ""}
                      )
                    </p>
                  ) : (
                    <p className="font-body mt-0.5 text-[10px] text-gray-400">
                      Non configuré
                    </p>
                  )}
                </div>
                {embroideryProduct?.id === product.id && (
                  <div className="bg-ylang-charcoal h-2 w-2 shrink-0 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* ── Éditeur ── */}
          {!embroideryProduct ? (
            <div className="flex flex-1 flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-white py-24">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center"
                style={{ background: "var(--color-paper-2)" }}
              >
                <Crosshair className="h-8 w-8 text-gray-300" />
              </div>
              <p className="font-body font-medium text-gray-400">
                Sélectionnez un produit
              </p>
              <p className="font-body mt-1 text-sm text-gray-300">
                pour calibrer sa zone de broderie
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-6 lg:flex-row">
              {/* Image interactive */}
              <div className="flex-1">
                <p
                  className="type-overline mb-2"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  Cliquez sur l&apos;image pour positionner la broderie
                </p>
                <div
                  ref={imageContainerRef}
                  className="relative cursor-crosshair overflow-hidden bg-[#f5f1e8] select-none"
                  style={{ border: "var(--rule-soft)" }}
                  onClick={handleImageClick}
                >
                  <img
                    src={embroideryProduct.baseImage}
                    alt={embroideryProduct.name}
                    className="pointer-events-none w-full object-contain"
                    draggable={false}
                  />

                  {/* Crosshair marker */}
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      left: `${embroideryZone.x * 100}%`,
                      top: `${embroideryZone.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className="relative h-8 w-8">
                      <div className="bg-ylang-charcoal/60 absolute top-1/2 left-0 h-px w-full" />
                      <div className="bg-ylang-charcoal/60 absolute top-0 left-1/2 h-full w-px" />
                      <div className="bg-ylang-charcoal absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow ring-2 ring-white" />
                    </div>
                  </div>

                  {/* Aperçu broderie — rendu identique au configurateur client */}
                  {previewText && (
                    <EmbroideryZoneOverlay
                      texts={
                        (embroideryZone.multiNameEnabled ?? true)
                          ? [previewText, previewText]
                          : [previewText]
                      }
                      threadColor="#E91E8C"
                      zone={embroideryZone}
                      containerRef={imageContainerRef}
                      fontId={
                        embroideryFonts.find((f) => f.id === previewFontId)
                          ?.id ?? "moonlight"
                      }
                      fontFolder={`/fonts/${embroideryFonts.find((f) => f.id === previewFontId)?.folder ?? "moonlight"}`}
                      fontFormat={
                        embroideryFonts.find((f) => f.id === previewFontId)
                          ?.format ?? "exp"
                      }
                      supportsThreadColor={
                        embroideryFonts.find((f) => f.id === previewFontId)
                          ?.supportsThreadColor ?? true
                      }
                    />
                  )}

                  {/* Zone max-width indicator */}
                  <div
                    className="border-ylang-charcoal/20 pointer-events-none absolute border border-dashed"
                    style={{
                      left: `${(embroideryZone.x - embroideryZone.maxWidth / 2) * 100}%`,
                      top: `${embroideryZone.y * 100}%`,
                      width: `${embroideryZone.maxWidth * 100}%`,
                      height: "1px",
                      transform: `translateY(-50%) rotate(${embroideryZone.rotation}deg)`,
                      transformOrigin: "center",
                    }}
                  />
                </div>
              </div>

              {/* Contrôles */}
              <div className="flex w-full flex-col gap-4 lg:w-72">
                <div
                  className="bg-white p-5"
                  style={{ border: "var(--rule-soft)" }}
                >
                  <h3 className="mb-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Paramètres
                  </h3>

                  {/* Texte de prévisualisation */}
                  <div className="mb-4">
                    <label className="font-body mb-1 block text-xs font-medium text-gray-500">
                      Texte de prévisualisation
                    </label>
                    <input
                      type="text"
                      value={previewText}
                      onChange={(e) =>
                        setPreviewText(e.target.value.slice(0, 15))
                      }
                      placeholder="Ylang"
                      className="font-body w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-gray-400"
                    />
                  </div>

                  {/* Police de prévisualisation */}
                  <div className="mb-4">
                    <label className="font-body mb-1 block text-xs font-medium text-gray-500">
                      Police de prévisualisation
                    </label>
                    <select
                      value={previewFontId}
                      onChange={(e) => setPreviewFontId(e.target.value)}
                      className="font-body w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-gray-400"
                    >
                      {embroideryFonts.length === 0 ? (
                        <option value="moonlight">Moonlight</option>
                      ) : (
                        embroideryFonts.map((font) => (
                          <option key={font.id} value={font.id}>
                            {font.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Position X */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="font-body text-xs font-medium text-gray-500">
                        Position X
                      </label>
                      <span className="font-mono text-xs font-semibold text-gray-600">
                        {Math.round(embroideryZone.x * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={Math.round(embroideryZone.x * 100)}
                      onChange={(e) =>
                        setEmbroideryZone((prev) => ({
                          ...prev,
                          x: Number(e.target.value) / 100,
                        }))
                      }
                      className="accent-ylang-charcoal w-full"
                    />
                  </div>

                  {/* Position Y */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="font-body text-xs font-medium text-gray-500">
                        Position Y
                      </label>
                      <span className="font-mono text-xs font-semibold text-gray-600">
                        {Math.round(embroideryZone.y * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={Math.round(embroideryZone.y * 100)}
                      onChange={(e) =>
                        setEmbroideryZone((prev) => ({
                          ...prev,
                          y: Number(e.target.value) / 100,
                        }))
                      }
                      className="accent-ylang-charcoal w-full"
                    />
                  </div>

                  {/* Rotation */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="font-body flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <RotateCcw className="h-3 w-3" /> Rotation
                      </label>
                      <span className="font-mono text-xs font-semibold text-gray-600">
                        {embroideryZone.rotation}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      step="1"
                      value={embroideryZone.rotation}
                      onChange={(e) =>
                        setEmbroideryZone((prev) => ({
                          ...prev,
                          rotation: Number(e.target.value),
                        }))
                      }
                      className="accent-ylang-charcoal w-full"
                    />
                  </div>

                  {/* Taille de police */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="font-body flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Type className="h-3 w-3" /> Taille police
                      </label>
                      <span className="font-mono text-xs font-semibold text-gray-600">
                        {embroideryZone.fontSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="1"
                      value={embroideryZone.fontSize}
                      onChange={(e) =>
                        setEmbroideryZone((prev) => ({
                          ...prev,
                          fontSize: Number(e.target.value),
                        }))
                      }
                      className="accent-ylang-charcoal w-full"
                    />
                  </div>

                  {/* Largeur max */}
                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="font-body flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Maximize2 className="h-3 w-3" /> Largeur max
                      </label>
                      <span className="font-mono text-xs font-semibold text-gray-600">
                        {Math.round(embroideryZone.maxWidth * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="1"
                      value={Math.round(embroideryZone.maxWidth * 100)}
                      onChange={(e) =>
                        setEmbroideryZone((prev) => ({
                          ...prev,
                          maxWidth: Number(e.target.value) / 100,
                        }))
                      }
                      className="accent-ylang-charcoal w-full"
                    />
                  </div>

                  {/* Alignement */}
                  <div className="mb-4">
                    <label className="font-body mb-2 block text-xs font-medium text-gray-500">
                      Alignement
                    </label>
                    <div className="flex gap-2">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() =>
                            setEmbroideryZone((prev) => ({
                              ...prev,
                              alignment: align,
                            }))
                          }
                          className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition-colors ${
                            embroideryZone.alignment === align
                              ? "border-ylang-charcoal bg-ylang-charcoal text-white"
                              : "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
                          }`}
                        >
                          {align === "left"
                            ? "◀"
                            : align === "center"
                              ? "◉"
                              : "▶"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className="mb-3 pt-4"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <h4
                      className="type-overline mb-3"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      Plusieurs noms
                    </h4>

                    {/* Multi-noms actif/inactif */}
                    <div className="mb-3">
                      <label className="font-body mb-2 block text-xs font-medium text-gray-500">
                        Fonctionnalité multi-noms
                      </label>
                      <div className="flex gap-2">
                        {([true, false] as const).map((val) => (
                          <button
                            key={String(val)}
                            onClick={() =>
                              setEmbroideryZone((prev) => ({
                                ...prev,
                                multiNameEnabled: val,
                              }))
                            }
                            className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition-colors ${
                              (embroideryZone.multiNameEnabled ?? true) === val
                                ? "border-ylang-charcoal bg-ylang-charcoal text-white"
                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
                            }`}
                          >
                            {val ? "Activé" : "Désactivé"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Espacement des noms */}
                    {(embroideryZone.multiNameEnabled ?? true) && (
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <label className="font-body text-xs font-medium text-gray-500">
                            Espacement des noms
                          </label>
                          <span className="font-mono text-xs font-semibold text-gray-600">
                            {embroideryZone.nameSpacing ?? -36}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-60"
                          max="20"
                          step="1"
                          value={embroideryZone.nameSpacing ?? -36}
                          onChange={(e) =>
                            setEmbroideryZone((prev) => ({
                              ...prev,
                              nameSpacing: Number(e.target.value),
                            }))
                          }
                          className="accent-ylang-charcoal w-full"
                        />
                        <div className="mt-0.5 flex justify-between text-[9px] text-gray-400">
                          <span>Serré</span>
                          <span>Espacé</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Valeurs JSON */}
                <div
                  className="px-4 py-3 font-mono text-[9px] text-gray-400"
                  style={{
                    border: "var(--rule-soft)",
                    background: "var(--color-paper-2)",
                  }}
                >
                  <pre>{JSON.stringify(embroideryZone, null, 2)}</pre>
                </div>

                <button
                  onClick={handleSaveEmbroidery}
                  disabled={isSavingEmbroidery || isPending}
                  className="font-body flex items-center justify-center gap-2 py-3.5 font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{
                    background: "var(--color-ink)",
                    color: "var(--color-paper)",
                  }}
                >
                  {isSavingEmbroidery && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isSavingEmbroidery ? "Sauvegarde…" : "Sauvegarder la zone"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ PALETTES TAB ════════════════════════════════════════════════════════ */}
      {activeTab === "palettes" && (
        <div className="space-y-5">
          {/* Sub-tabs + CTA */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex gap-1 self-start bg-white p-1"
              style={{ border: "var(--rule-soft)" }}
            >
              {(["product", "embroidery"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setColorSubTab(type)}
                  className={`font-body px-5 py-2 text-sm font-medium transition-colors ${
                    colorSubTab === type
                      ? "text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={
                    colorSubTab === type
                      ? { background: "var(--color-ink)" }
                      : undefined
                  }
                >
                  {type === "product" ? "Couleurs Produit" : "Fils Broderie"}
                  <span
                    className="ml-2 px-1.5 py-0.5 text-[10px]"
                    style={{ opacity: 0.6 }}
                  >
                    {colors.filter((c) => c.type === type).length}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setEditingColor({
                  type: colorSubTab,
                  isActive: true,
                  order: colors.filter((c) => c.type === colorSubTab).length,
                });
                setIsColorModalOpen(true);
              }}
              className="font-body flex h-10 items-center gap-2 self-start px-4 text-sm font-medium transition-opacity hover:opacity-80 sm:self-auto"
              style={{
                background: "var(--color-ink)",
                color: "var(--color-paper)",
              }}
            >
              <Plus className="h-4 w-4" />
              Ajouter une couleur
            </button>
          </div>

          {/* Description */}
          <p className="font-body text-sm text-gray-400">
            {colorSubTab === "product"
              ? "Couleurs proposées pour personnaliser les zones colorées des produits (masque couleur)."
              : "Couleurs de fil proposées pour la broderie personnalisée."}
          </p>

          {/* Color grid */}
          {colors.filter((c) => c.type === colorSubTab).length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              style={{
                border: "var(--rule-soft)",
                borderStyle: "dashed",
                background: "var(--color-paper)",
              }}
            >
              <Palette
                className="mb-3 h-10 w-10"
                style={{ color: "var(--color-ink-3)", opacity: 0.4 }}
              />
              <p className="font-body text-sm font-medium text-gray-400">
                Aucune couleur pour l&apos;instant
              </p>
              <button
                onClick={() => {
                  setEditingColor({
                    type: colorSubTab,
                    isActive: true,
                    order: 0,
                  });
                  setIsColorModalOpen(true);
                }}
                className="font-body mt-3 text-xs font-medium text-gray-500 underline-offset-2 hover:underline"
              >
                + Ajouter la première couleur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {colors
                .filter((c) => c.type === colorSubTab)
                .sort((a, b) => a.order - b.order)
                .map((color) => (
                  <div
                    key={color.id}
                    className={`group flex flex-col items-center gap-2 p-3 transition-[opacity,box-shadow,border-color] hover:shadow-sm ${!color.isActive ? "opacity-55" : ""}`}
                    style={{
                      border: color.isActive
                        ? "var(--rule-soft)"
                        : "1px dashed var(--color-paper-3)",
                      background: "var(--color-paper)",
                    }}
                  >
                    {/* Swatch avec fond damier pour couleurs claires */}
                    <div
                      className="h-12 w-12 rounded-full border-4 border-white shadow-lg ring-1 ring-black/10"
                      style={{
                        backgroundColor: color.hex,
                        backgroundImage:
                          color.hex?.toLowerCase() === "#ffffff" ||
                          color.hex?.toLowerCase() === "#fff"
                            ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='4' height='4' fill='%23ccc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23ccc'/%3E%3C/svg%3E\")"
                            : undefined,
                      }}
                    />
                    <p className="font-body text-overline max-w-full truncate text-center leading-tight font-medium text-gray-800">
                      {color.name}
                    </p>
                    <p className="font-mono text-[9px] text-gray-400 uppercase">
                      {color.hex}
                    </p>

                    {/* Actions on hover */}
                    <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => toggleColorActive(color)}
                        className="p-1 transition-opacity hover:opacity-60"
                        style={{ color: "var(--color-ink-3)" }}
                      >
                        {color.isActive ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingColor(color);
                          setIsColorModalOpen(true);
                        }}
                        className="p-1 transition-opacity hover:opacity-60"
                        style={{ color: "var(--color-ink-3)" }}
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() =>
                          openDeleteModal("color", color.id, color.name)
                        }
                        className="p-1 transition-opacity hover:opacity-60"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "polices" && (
        <div>
          <EmbroideryFontsPanel />
        </div>
      )}

      {/* ═══ FABRIC MODAL ══════════════════════════════════════════════════════ */}
      <Dialog open={isFabricModalOpen} onOpenChange={setIsFabricModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "1.125rem",
                color: "var(--color-ink)",
              }}
            >
              {editingFabric?.id &&
              fabrics.some((f) => f.id === editingFabric.id)
                ? "Modifier le tissu"
                : "Nouveau tissu"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFabricSubmit} className="mt-4 space-y-4">
            {!fabrics.some((f) => f.id === editingFabric?.id) && (
              <div>
                <label className="font-body mb-2 block text-sm font-medium text-gray-600">
                  ID unique (ex: coton-15)
                </label>
                <input
                  type="text"
                  value={editingFabric?.id || ""}
                  onChange={(e) =>
                    setEditingFabric((prev) => ({
                      ...prev!,
                      id: e.target.value,
                    }))
                  }
                  className="font-body w-full px-4 py-2 text-sm outline-none"
                  style={{
                    border: "var(--rule-soft)",
                    background: "var(--color-paper)",
                    color: "var(--color-ink)",
                  }}
                  required
                />
              </div>
            )}
            <div>
              <label className="font-body mb-2 block text-sm font-medium text-gray-600">
                Nom
              </label>
              <input
                type="text"
                value={editingFabric?.name || ""}
                onChange={(e) =>
                  setEditingFabric((prev) => ({
                    ...prev!,
                    name: e.target.value,
                  }))
                }
                className="font-body w-full px-4 py-2 text-sm outline-none"
                style={{
                  border: "var(--rule-soft)",
                  background: "var(--color-paper)",
                  color: "var(--color-ink)",
                }}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-body mb-2 block text-sm font-medium text-gray-600">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={editingFabric?.category || ""}
                  onChange={(e) =>
                    setEditingFabric((prev) => ({
                      ...prev!,
                      category: e.target.value,
                    }))
                  }
                  placeholder="coton, vichy..."
                  className="font-body w-full px-4 py-2 text-sm outline-none"
                  style={{
                    border: "var(--rule-soft)",
                    background: "var(--color-paper)",
                    color: "var(--color-ink)",
                  }}
                  required
                />
              </div>
              <div>
                <label className="font-body mb-2 block text-sm font-medium text-gray-600">
                  Prix (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingFabric?.price ?? 0}
                    onChange={(e) =>
                      setEditingFabric((prev) => ({
                        ...prev!,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="font-body w-full bg-white py-2 pr-8 pl-4 outline-none"
                    style={{ border: "var(--rule-soft)" }}
                    required
                  />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-400">
                    €
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="font-body mb-2 block text-sm font-medium text-gray-600">
                Couleur de base
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={editingFabric?.baseColor || "#ffffff"}
                  onChange={(e) =>
                    setEditingFabric((prev) => ({
                      ...prev!,
                      baseColor: e.target.value,
                    }))
                  }
                  className="h-10 w-10 shrink-0 cursor-pointer rounded border p-1"
                />
                <input
                  type="text"
                  value={editingFabric?.baseColor || ""}
                  onChange={(e) =>
                    setEditingFabric((prev) => ({
                      ...prev!,
                      baseColor: e.target.value,
                    }))
                  }
                  className="font-body w-full grow bg-white px-4 py-2 outline-none"
                  style={{ border: "var(--rule-soft)" }}
                  required
                />
              </div>
            </div>
            <div>
              <label className="font-body mb-2 block text-sm font-medium text-gray-600">
                Image (Texture)
              </label>
              <ImageUpload
                value={editingFabric?.image ? [editingFabric.image] : []}
                onChange={(urls) =>
                  setEditingFabric((prev) => ({
                    ...prev!,
                    image: urls[0] || "",
                  }))
                }
                onRemove={() =>
                  setEditingFabric((prev) => ({ ...prev!, image: "" }))
                }
                showPreview={true}
              />
            </div>
            <button
              type="submit"
              disabled={isSavingFabric || isPending}
              className="font-body mt-4 flex w-full items-center justify-center gap-2 py-3 font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                background: "var(--color-ink)",
                color: "var(--color-paper)",
              }}
            >
              {isSavingFabric && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSavingFabric ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ PRODUCT MODAL ═════════════════════════════════════════════════════ */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-[1080px]">
          {/* ── Header ── */}
          <div className="sticky top-0 z-10 border-b border-[#ede8df] bg-white px-7 py-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center"
                style={{
                  background: "var(--color-paper-2)",
                  border: "var(--rule-soft)",
                }}
              >
                <Package
                  className="h-4 w-4"
                  style={{ color: "var(--color-ink-3)" }}
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <DialogTitle
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "1rem",
                    color: "var(--color-ink)",
                    lineHeight: 1.2,
                  }}
                >
                  {editingProduct?.id &&
                  products.some((p) => p.id === editingProduct.id)
                    ? "Modifier le produit"
                    : "Nouveau produit configurateur"}
                </DialogTitle>
                <p
                  className="font-body text-overline mt-0.5 font-medium"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  {editingProduct?.id &&
                  products.some((p) => p.id === editingProduct.id)
                    ? `ID : ${editingProduct.id}`
                    : "Remplissez les informations du nouveau produit"}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleProductSubmit}
            className="divide-y divide-[#f0ebe0]"
          >
            {/* ── Section 1 : Identité ── */}
            <div className="space-y-4 px-7 py-6">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: "var(--color-ink)" }}
                >
                  1
                </span>
                <h3
                  className="type-overline"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  Identité
                </h3>
              </div>

              {/* ID — création uniquement */}
              {!products.some((p) => p.id === editingProduct?.id) && (
                <div>
                  <label className="font-body mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    Identifiant unique
                    <span className="text-gray-400">*</span>
                    <span className="ml-auto text-[10px] font-normal text-gray-400">
                      slug sans espaces
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editingProduct?.id || ""}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev!,
                        id: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      }))
                    }
                    placeholder="gigoteuse-4-saisons"
                    className="font-body w-full px-4 py-2.5 font-mono text-sm text-gray-800 outline-none placeholder:text-gray-300"
                    style={{
                      border: "var(--rule-soft)",
                      background: "var(--color-paper)",
                    }}
                    required
                  />
                </div>
              )}

              {/* Nom + Icône sur la même ligne */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="font-body mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-600">
                    Nom du produit <span className="text-gray-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingProduct?.name || ""}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev!,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Gigoteuse 4 saisons"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-300"
                    required
                  />
                </div>
                <div className="w-24 shrink-0">
                  <label className="font-body mb-1.5 block text-xs font-medium text-gray-600">
                    Icône
                  </label>
                  <input
                    type="text"
                    value={editingProduct?.icon || ""}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev!,
                        icon: e.target.value,
                      }))
                    }
                    placeholder="🧸"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-center text-lg outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-body mb-1.5 block text-xs font-medium text-gray-600">
                  Description
                </label>
                <textarea
                  value={editingProduct?.description || ""}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({
                      ...prev!,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Description courte visible sur la page configurateur…"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* ── Section 2 : Tarification ── */}
            <div className="space-y-4 px-7 py-6">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: "var(--color-ink)" }}
                >
                  2
                </span>
                <h3
                  className="type-overline"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  Tarification & logistique
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body mb-1.5 block text-xs font-medium text-gray-600">
                    Prix de base (€) <span className="text-gray-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      €
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct?.basePrice ?? 0}
                      onChange={(e) =>
                        setEditingProduct((prev) => ({
                          ...prev!,
                          basePrice: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-8 text-sm text-gray-800 outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-body mb-1.5 block text-xs font-medium text-gray-600">
                    Poids (grammes)
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-semibold text-gray-400">
                      g
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct?.weight ?? 0}
                      onChange={(e) =>
                        setEditingProduct((prev) => ({
                          ...prev!,
                          weight: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-8 pl-4 text-sm text-gray-800 outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 3 : Calques visuels ── */}
            <div className="space-y-4 px-7 py-6">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: "var(--color-ink)" }}
                >
                  3
                </span>
                <h3
                  className="type-overline"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  Calques visuels
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Image de base */}
                <div
                  className="flex flex-col bg-white p-4"
                  style={{ border: "var(--rule-soft)" }}
                >
                  <div className="mb-2 flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="font-body text-sm leading-tight font-medium text-gray-800">
                        Image de base <span className="text-gray-400">*</span>
                      </p>
                      <p className="font-body mt-0.5 text-[10px] text-gray-400">
                        Silhouette + ombres
                      </p>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium"
                      style={{
                        border: "var(--rule-soft)",
                        color: "var(--color-ink-3)",
                      }}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${productImages.baseImage ? "bg-green-400" : "bg-gray-300"}`}
                      />
                      {productImages.baseImage ? "Ok" : "Requis"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <ImageUpload
                      value={
                        productImages.baseImage ? [productImages.baseImage] : []
                      }
                      onChange={(urls) =>
                        setProductImages((prev) => ({
                          ...prev,
                          baseImage: urls[0] || "",
                        }))
                      }
                      onRemove={() =>
                        setProductImages((prev) => ({ ...prev, baseImage: "" }))
                      }
                      showPreview={true}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Masque tissu */}
                <div
                  className="flex flex-col bg-white p-4"
                  style={{ border: "var(--rule-soft)" }}
                >
                  <div className="mb-2 flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="font-body text-sm leading-tight font-medium text-gray-800">
                        Masque tissu <span className="text-gray-400">*</span>
                      </p>
                      <p className="font-body mt-0.5 text-[10px] text-gray-400">
                        N&amp;B — blanc = tissu
                      </p>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium"
                      style={{
                        border: "var(--rule-soft)",
                        color: "var(--color-ink-3)",
                      }}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${productImages.maskImage ? "bg-green-400" : "bg-gray-300"}`}
                      />
                      {productImages.maskImage ? "Ok" : "Requis"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <ImageUpload
                      value={
                        productImages.maskImage ? [productImages.maskImage] : []
                      }
                      onChange={(urls) =>
                        setProductImages((prev) => ({
                          ...prev,
                          maskImage: urls[0] || "",
                        }))
                      }
                      onRemove={() =>
                        setProductImages((prev) => ({ ...prev, maskImage: "" }))
                      }
                      showPreview={true}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Masque couleur */}
                <div
                  className="flex flex-col bg-white p-4"
                  style={{ border: "var(--rule-soft)", borderStyle: "dashed" }}
                >
                  <div className="mb-2 flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="font-body text-sm leading-tight font-medium text-gray-800">
                        Masque couleur
                      </p>
                      <p className="font-body mt-0.5 text-[10px] text-gray-400">
                        Zone d&apos;accent coloré
                      </p>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium"
                      style={{
                        border: "var(--rule-soft)",
                        color: "var(--color-ink-3)",
                      }}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${productImages.colorMaskImage ? "bg-green-400" : "bg-gray-300"}`}
                      />
                      {productImages.colorMaskImage ? "Ok" : "Optionnel"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <ImageUpload
                      value={
                        productImages.colorMaskImage
                          ? [productImages.colorMaskImage as string]
                          : []
                      }
                      onChange={(urls) =>
                        setProductImages((prev) => ({
                          ...prev,
                          colorMaskImage: urls[0] || null,
                        }))
                      }
                      onRemove={() =>
                        setProductImages((prev) => ({
                          ...prev,
                          colorMaskImage: null,
                        }))
                      }
                      showPreview={true}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 4 : Tailles ── */}
            <div className="space-y-4 px-7 py-6">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: "var(--color-ink)" }}
                >
                  4
                </span>
                <h3
                  className="type-overline"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  Tailles disponibles
                </h3>
                <span
                  className="font-body ml-auto px-1.5 py-0.5 text-[10px] font-medium text-gray-400"
                  style={{ border: "var(--rule-soft)" }}
                >
                  Optionnel
                </span>
              </div>
              <p className="font-body -mt-2 text-xs text-gray-400">
                Laisser vide si le produit n&apos;a pas de taille. Cliquer sur
                une taille pour la définir par défaut{" "}
                <span className="text-gray-400">★</span>
              </p>

              {/* Input d'ajout */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSizeInput}
                  onChange={(e) =>
                    setNewSizeInput(e.target.value.toUpperCase())
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = newSizeInput.trim();
                      if (!val) return;
                      const current = editingProduct?.sizes ?? [];
                      if (current.includes(val)) return;
                      setEditingProduct((prev) => ({
                        ...prev!,
                        sizes: [...current, val],
                      }));
                      setNewSizeInput("");
                    }
                  }}
                  placeholder="Ex : XS, S, M, L, XL, 0–3M…"
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = newSizeInput.trim();
                    if (!val) return;
                    const current = editingProduct?.sizes ?? [];
                    if (current.includes(val)) return;
                    setEditingProduct((prev) => ({
                      ...prev!,
                      sizes: [...current, val],
                    }));
                    setNewSizeInput("");
                  }}
                  className="font-body flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 active:scale-95"
                  style={{ background: "var(--color-ink)" }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter
                </button>
              </div>

              {/* Tags des tailles */}
              {(editingProduct?.sizes ?? []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(editingProduct?.sizes ?? []).map((size) => {
                    const isDefault = editingProduct?.defaultSize === size;
                    return (
                      <div
                        key={size}
                        className="font-body flex items-center gap-1 py-1.5 pr-1.5 pl-3 text-sm font-medium transition-colors"
                        style={{
                          border: isDefault
                            ? "2px solid var(--color-ink)"
                            : "var(--rule-soft)",
                          background: "var(--color-paper)",
                          color: isDefault
                            ? "var(--color-ink)"
                            : "var(--color-ink-3)",
                        }}
                      >
                        <button
                          type="button"
                          title="Définir par défaut"
                          onClick={() =>
                            setEditingProduct((prev) => ({
                              ...prev!,
                              defaultSize: isDefault ? null : size,
                            }))
                          }
                          className="flex items-center gap-1 leading-none"
                        >
                          {size}
                          {isDefault && (
                            <span
                              className="text-xs"
                              style={{ color: "var(--color-ink-3)" }}
                            >
                              ★
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          title="Supprimer"
                          onClick={() => {
                            const next = (editingProduct?.sizes ?? []).filter(
                              (s) => s !== size,
                            );
                            setEditingProduct((prev) => ({
                              ...prev!,
                              sizes: next,
                              defaultSize:
                                prev?.defaultSize === size
                                  ? (next[0] ?? null)
                                  : (prev?.defaultSize ?? null),
                            }));
                          }}
                          className="ml-1 flex h-5 w-5 items-center justify-center text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="py-4 text-center"
                  style={{ border: "var(--rule-soft)", borderStyle: "dashed" }}
                >
                  <p
                    className="font-body text-xs"
                    style={{ color: "var(--color-ink-3)" }}
                  >
                    Aucune taille ajoutée — produit sans taille
                  </p>
                </div>
              )}

              {editingProduct?.defaultSize && (
                <p className="font-body text-overline text-gray-400">
                  Par défaut :{" "}
                  <strong className="text-gray-700">
                    {editingProduct.defaultSize}
                  </strong>
                </p>
              )}
            </div>

            {/* ── Footer / Submit ── */}
            <div className="sticky bottom-0 z-10 border-t border-[#ede8df] bg-white px-7 py-4">
              <button
                type="submit"
                disabled={isSavingProduct || isPending}
                className="font-body flex w-full items-center justify-center gap-2 py-3 font-medium transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-50"
                style={{
                  background: "var(--color-ink)",
                  color: "var(--color-paper)",
                }}
              >
                {isSavingProduct && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isSavingProduct
                  ? "Enregistrement…"
                  : editingProduct?.id &&
                      products.some((p) => p.id === editingProduct.id)
                    ? "Enregistrer les modifications"
                    : "Créer le produit"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE CONFIRMATION MODAL ══════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <Dialog
            open={deleteConfirmation.isOpen}
            onOpenChange={(open) =>
              setDeleteConfirmation((prev) => ({ ...prev, isOpen: open }))
            }
          >
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader>
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center"
                  style={{
                    border: "var(--rule-soft)",
                    color: "var(--color-accent)",
                    background: "var(--color-paper-2)",
                  }}
                >
                  <TrashBin className="h-6 w-6" />
                </div>
                <DialogTitle
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "1.125rem",
                    color: "var(--color-ink)",
                  }}
                >
                  {deleteConfirmation.type === "fabric"
                    ? "Supprimer ce tissu ?"
                    : deleteConfirmation.type === "category"
                      ? "Supprimer cette catégorie ?"
                      : deleteConfirmation.type === "color"
                        ? "Supprimer cette couleur ?"
                        : "Supprimer ce produit ?"}
                </DialogTitle>
                <DialogDescription className="font-body text-sm text-gray-500">
                  Vous êtes sur le point de supprimer{" "}
                  <span className="font-bold text-gray-800">
                    &laquo;{deleteConfirmation.name}&raquo;
                  </span>
                  . Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setDeleteConfirmation((prev) => ({
                      ...prev,
                      isOpen: false,
                    }))
                  }
                  className="font-body cursor-pointer font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  disabled={isPending}
                  className="cursor-pointer bg-red-500 font-medium text-white hover:bg-red-600"
                  onClick={handleConfirmDelete}
                >
                  Supprimer définitivement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* ═══ COLOR MODAL ═════════════════════════════════════════════════════════ */}
      <Dialog
        open={isColorModalOpen}
        onOpenChange={(open) => {
          setIsColorModalOpen(open);
          if (!open) setEditingColor(null);
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "1.125rem",
                color: "var(--color-ink)",
              }}
            >
              {editingColor?.id && colors.some((c) => c.id === editingColor.id)
                ? "Modifier la couleur"
                : "Ajouter une couleur"}
            </DialogTitle>
            <DialogDescription className="font-body text-sm text-gray-400">
              {editingColor?.type === "product"
                ? "Palette personnalisation produit"
                : "Palette fil de broderie"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleColorSubmit} className="mt-4 space-y-4">
            {/* Aperçu grand format */}
            {editingColor?.hex && (
              <div
                className="flex items-center gap-4 p-4"
                style={{
                  background: "var(--color-paper-2)",
                  border: "var(--rule-soft)",
                }}
              >
                <div
                  className="h-16 w-16 shrink-0 border-4 border-white shadow-lg ring-1 ring-black/10"
                  style={{ backgroundColor: editingColor.hex }}
                />
                <div>
                  <p className="font-body font-medium text-gray-800">
                    {editingColor.name || "Aperçu"}
                  </p>
                  <p className="font-mono text-sm text-gray-400">
                    {editingColor.hex?.toUpperCase()}
                  </p>
                </div>
              </div>
            )}

            {!colors.some((c) => c.id === editingColor?.id) && (
              <div>
                <label className="font-body mb-1.5 block text-sm font-medium text-gray-600">
                  ID unique
                </label>
                <input
                  type="text"
                  value={editingColor?.id || ""}
                  onChange={(e) =>
                    setEditingColor((prev) => ({
                      ...prev!,
                      id: e.target.value,
                    }))
                  }
                  placeholder="ex: rose-poudre"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
                  required
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-body mb-1.5 block text-sm font-medium text-gray-600">
                  Nom affiché
                </label>
                <input
                  type="text"
                  value={editingColor?.name || ""}
                  onChange={(e) =>
                    setEditingColor((prev) => ({
                      ...prev!,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Rose Poudré"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
                  required
                />
              </div>
              <div>
                <label className="font-body mb-1.5 block text-sm font-medium text-gray-600">
                  Ordre
                </label>
                <input
                  type="number"
                  value={editingColor?.order ?? 0}
                  onChange={(e) =>
                    setEditingColor((prev) => ({
                      ...prev!,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="font-body mb-1.5 block text-sm font-medium text-gray-600">
                Couleur
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={editingColor?.hex || "#000000"}
                  onChange={(e) =>
                    setEditingColor((prev) => ({
                      ...prev!,
                      hex: e.target.value,
                    }))
                  }
                  className="h-11 w-14 shrink-0 cursor-pointer border border-gray-200 bg-white p-1"
                />
                <input
                  type="text"
                  value={editingColor?.hex || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val))
                      setEditingColor((prev) => ({ ...prev!, hex: val }));
                  }}
                  placeholder="#E8B4B8"
                  className="flex-1 border border-gray-200 bg-white px-4 py-2.5 font-mono text-sm text-gray-800 uppercase outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <div
              className="flex items-center justify-between bg-white px-4 py-3"
              style={{ border: "var(--rule-soft)" }}
            >
              <label className="font-body text-sm font-medium text-gray-600">
                Visible (active)
              </label>
              <div
                onClick={() =>
                  setEditingColor((prev) => ({
                    ...prev!,
                    isActive: !prev?.isActive,
                  }))
                }
                className="relative h-6 w-11 cursor-pointer rounded-full transition-colors"
                style={{
                  background: editingColor?.isActive
                    ? "var(--color-ink)"
                    : "var(--color-paper-3)",
                }}
              >
                <span
                  className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ease-[var(--ease-out)] ${editingColor?.isActive ? "translate-x-5" : "translate-x-0"}`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSavingColor || isPending}
              className="font-body mt-1 flex w-full items-center justify-center gap-2 py-3.5 font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                background: "var(--color-ink)",
                color: "var(--color-paper)",
              }}
            >
              {isSavingColor && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ CATEGORY MODAL ══════════════════════════════════════════════════════ */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "1.125rem",
                color: "var(--color-ink)",
              }}
            >
              {editingCategory?.id &&
              categories.some((c) => c.id === editingCategory.id)
                ? "Modifier la catégorie"
                : "Nouvelle catégorie"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="mt-4 space-y-4">
            {!categories.some((c) => c.id === editingCategory?.id) && (
              <div>
                <label className="font-body mb-2 block text-sm font-medium text-gray-600">
                  Prefix/ID (ex: coton)
                </label>
                <input
                  type="text"
                  value={editingCategory?.id || ""}
                  onChange={(e) =>
                    setEditingCategory((prev) => ({
                      ...prev!,
                      id: e.target.value,
                    }))
                  }
                  className="font-body w-full px-4 py-2 text-sm outline-none"
                  style={{
                    border: "var(--rule-soft)",
                    background: "var(--color-paper)",
                    color: "var(--color-ink)",
                  }}
                  required
                />
              </div>
            )}
            <div>
              <label className="font-body mb-2 block text-sm font-medium text-gray-600">
                Titre
              </label>
              <input
                type="text"
                value={editingCategory?.title || ""}
                onChange={(e) =>
                  setEditingCategory((prev) => ({
                    ...prev!,
                    title: e.target.value,
                  }))
                }
                className="font-body w-full px-4 py-2 text-sm outline-none"
                style={{
                  border: "var(--rule-soft)",
                  background: "var(--color-paper)",
                  color: "var(--color-ink)",
                }}
                required
              />
            </div>
            <div>
              <label className="font-body mb-2 block text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                value={editingCategory?.description || ""}
                onChange={(e) =>
                  setEditingCategory((prev) => ({
                    ...prev!,
                    description: e.target.value,
                  }))
                }
                className="font-body min-h-[100px] w-full bg-white px-4 py-2 text-sm text-gray-800 outline-none"
                style={{ border: "var(--rule-soft)" }}
              />
            </div>
            <div>
              <label className="font-body mb-2 block text-sm font-medium text-gray-600">
                Ordre d&apos;affichage
              </label>
              <input
                type="number"
                value={editingCategory?.order ?? 0}
                onChange={(e) =>
                  setEditingCategory((prev) => ({
                    ...prev!,
                    order: parseInt(e.target.value) || 0,
                  }))
                }
                className="font-body w-full px-4 py-2 text-sm outline-none"
                style={{
                  border: "var(--rule-soft)",
                  background: "var(--color-paper)",
                  color: "var(--color-ink)",
                }}
                required
              />
            </div>
            <button
              type="submit"
              className="font-body mt-4 flex w-full items-center justify-center py-3 font-medium transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-ink)",
                color: "var(--color-paper)",
              }}
            >
              Enregistrer
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
