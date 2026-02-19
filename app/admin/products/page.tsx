"use client";

import { ImageReorderGrid } from "@/components/admin/image-reorder-grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { TrashBin } from "@gravity-ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Box,
  Check,
  ChevronDown,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Info,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  Package,
  Palette,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Tags,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
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
  options: {
    sizes?: string[];
    defaultSize?: string;
    features?: string[];
    longDescription?: string;
    customizable?: boolean;
    isNew?: boolean;
  };
  createdAt: Date;
}

const categories = [
  "La Chambre",
  "La Toilette",
  "Bagageries/Promenade",
  "Linge de Naissance",
  "Accessoires",
  "Les Jeux",
];

type TabId = "general" | "media" | "details" | "options" | "seo";

interface Tab {
  id: TabId;
  label: string;
  icon: any;
}

const tabs: Tab[] = [
  { id: "general", label: "Général", icon: Info },
  { id: "media", label: "Médias", icon: ImageIcon },
  { id: "details", label: "Détails", icon: FileText },
  { id: "options", label: "Options", icon: Settings },
  { id: "seo", label: "Visibilité", icon: Tags },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    productId: string | null;
  }>({
    isOpen: false,
    productId: null,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
    price: "",
    compareAtPrice: "",
    category: "",
    subcategory: "",
    stock: "0",
    sku: "",
    isActive: true,
    isFeatured: false,
    customizable: true,
    images: [] as (string | File)[],
    tags: "",
    features: [] as string[],
    sizes: [] as string[],
    defaultSize: "",
    isNew: true,
  });

  const [newFeature, setNewFeature] = useState("");
  const [newSize, setNewSize] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        longDescription: product.options?.longDescription || "",
        price: String(product.price),
        compareAtPrice: product.compareAtPrice
          ? String(product.compareAtPrice)
          : "",
        category: product.category,
        subcategory: product.subcategory || "",
        stock: String(product.stock),
        sku: product.sku || "",
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        customizable: product.options?.customizable ?? true,
        images: product.images,
        tags: product.tags.join(", "),
        features: product.options?.features || [],
        sizes: product.options?.sizes || [],
        defaultSize: product.options?.defaultSize || "",
        isNew: product.options?.isNew ?? true,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        longDescription: "",
        price: "",
        compareAtPrice: "",
        category: "",
        subcategory: "",
        stock: "0",
        sku: "",
        isActive: true,
        isFeatured: false,
        customizable: true,
        images: [],
        tags: "",
        features: [],
        sizes: [],
        defaultSize: "",
        isNew: true,
      });
    }
    setActiveTab("general");
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Upload new images (Files)
      const uploadedImageUrls: string[] = [];
      const existingImageUrls: string[] = [];
      const folderId =
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

      for (const item of formData.images) {
        if (typeof item === "string") {
          existingImageUrls.push(item);
        } else {
          // It's a File, upload it
          const safeName = item.name.replace(/\s/g, "-").toLowerCase();
          const filePath = `products/${folderId}/${Date.now()}-${safeName}`;

          const uploadFormData = new FormData();
          uploadFormData.append("file", item);
          uploadFormData.append("path", filePath);

          const response = await fetch("/api/admin/storage/upload", {
            method: "POST",
            body: uploadFormData,
          });

          if (!response.ok) {
            console.error("Failed to upload image");
            continue;
          }

          const data = await response.json();
          uploadedImageUrls.push(data.url);
        }
      }

      const finalImages = [...existingImageUrls, ...uploadedImageUrls];

      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : null,
        category: formData.category,
        subcategory: formData.subcategory || null,
        stock: parseInt(formData.stock),
        sku: formData.sku || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        images: finalImages,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        options: {
          sizes: formData.sizes,
          defaultSize: formData.defaultSize,
          features: formData.features,
          longDescription: formData.longDescription,
          customizable: formData.customizable,
          isNew: formData.isNew,
        },
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";

      const response = await fetch(url, {
        method: editingProduct ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmation({ isOpen: true, productId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.productId) return;

    try {
      const response = await fetch(
        `/api/admin/products/${deleteConfirmation.productId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setDeleteConfirmation({ isOpen: false, productId: null });
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      fetchProducts();
    } catch (error) {
      console.error("Error toggling product:", error);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !product.isFeatured }),
      });
      fetchProducts();
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, newSize.trim()],
      });
      setNewSize("");
    }
  };

  const removeSize = (index: number) => {
    const removedSize = formData.sizes[index];
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index),
      defaultSize:
        formData.defaultSize === removedSize ? "" : formData.defaultSize,
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="from-ylang-rose/20 to-ylang-gold/20 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br">
            <Package className="text-ylang-rose h-6 w-6" />
          </div>
          <div>
            <h1 className="text-ylang-charcoal text-3xl font-bold">Produits</h1>
            <p className="text-ylang-charcoal/60 text-sm">
              Gérez votre catalogue de produits
            </p>
          </div>
        </div>
        <div className="text-ylang-charcoal/40 *:border-ylang-cream/80 flex items-center gap-2 text-sm *:border">
          <span className="bg-ylang-beige rounded-full px-3 py-1">
            {products.length} produits au total
          </span>
          <span className="bg-ylang-beige rounded-full px-3 py-1">
            {products.filter((p) => p.isActive).length} actifs
          </span>
          <span className="bg-ylang-beige rounded-full px-3 py-1">
            {products.filter((p) => p.isFeatured).length} en vedette
          </span>
        </div>
      </div>

      {/* Actions bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="text-ylang-charcoal/40 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-ylang-beige focus:ring-ylang-rose/20 w-full rounded-xl border bg-white py-3 pr-4 pl-12 focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category filter */}
          <div className="relative">
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="focus:ring-ylang-rose/20 font-body text-ylang-charcoal cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white py-3.5 pr-10 pl-6 text-sm font-medium transition-all outline-none focus:ring-2"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="text-ylang-charcoal/40 pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-2xl border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-xl p-2.5 transition-all ${
                viewMode === "grid"
                  ? "bg-ylang-rose text-white shadow-md"
                  : "text-ylang-charcoal/40 hover:text-ylang-charcoal hover:bg-gray-50"
              }`}
              title="Vue grille"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-xl p-2.5 transition-all ${
                viewMode === "list"
                  ? "bg-ylang-rose text-white shadow-md"
                  : "text-ylang-charcoal/40 hover:text-ylang-charcoal hover:bg-gray-50"
              }`}
              title="Vue liste"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Add button */}
        <Button
          variant="luxury"
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Ajouter un produit
        </Button>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center">
          <Package className="text-ylang-charcoal/20 mx-auto mb-4 h-16 w-16" />
          <h3 className="text-ylang-charcoal mb-2 text-xl font-semibold">
            Aucun produit
          </h3>
          <p className="text-ylang-charcoal/60 mb-6">
            Commencez par ajouter votre premier produit
          </p>
          <Button variant="luxury" onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-5 w-5" />
            Ajouter un produit
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group border-ylang-beige overflow-hidden border bg-white transition-all hover:shadow-sm"
            >
              {/* Image */}
              <div className="bg-ylang-beige relative aspect-square overflow-hidden">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="text-ylang-charcoal/20 h-12 w-12" />
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 font-medium shadow-lg transition-transform hover:scale-105"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {!product.isActive && (
                    <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                      Inactif
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="flex items-center gap-1 rounded-full border border-yellow-600 bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                      <Star className="h-3 w-3" />
                      Vedette
                    </span>
                  )}
                  {product.options?.customizable && (
                    <span className="flex items-center gap-1 rounded-full border border-purple-600 bg-purple-500 px-2 py-1 text-xs font-medium text-white">
                      <Palette className="h-3 w-3" />
                      Personnalisable
                    </span>
                  )}
                </div>

                {/* Stock badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-medium ${
                      product.stock === 0
                        ? "border-red-600 bg-red-100 text-red-600"
                        : product.stock < 5
                          ? "border-orange-600 bg-orange-100 text-orange-600"
                          : "border-green-600 bg-green-100 text-green-600"
                    }`}
                  >
                    Stock: {product.stock}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between">
                  <div className="">
                    <p className="text-ylang-rose mb-1 text-xs font-medium">
                      {product.category}
                    </p>
                    <h3 className="text-ylang-charcoal mb-2 line-clamp-1 font-semibold">
                      {product.name}
                    </h3>
                  </div>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-ylang-rose text-lg font-bold">
                      {product.price.toFixed(2)}€
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-ylang-charcoal/40 text-sm line-through">
                        {product.compareAtPrice.toFixed(2)}€
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-blue-300 bg-blue-100 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-200"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleToggleActive(product)}
                    className={`cursor-pointer rounded-lg border p-2 transition-colors ${
                      product.isActive
                        ? "border-green-300 bg-green-100 text-green-600 hover:bg-green-200"
                        : "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title={product.isActive ? "Désactiver" : "Activer"}
                  >
                    {product.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(product)}
                    className={`cursor-pointer rounded-lg border p-2 transition-colors ${
                      product.isFeatured
                        ? "border-yellow-300 bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        : "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title={
                      product.isFeatured
                        ? "Retirer vedette"
                        : "Mettre en vedette"
                    }
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="cursor-pointer rounded-lg border border-red-300 bg-red-100 p-2 text-red-500 transition-colors hover:bg-red-200"
                    title="Supprimer"
                  >
                    <TrashBin strokeWidth="0.5" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="border-ylang-beige overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-ylang-beige text-ylang-charcoal/60 hidden grid-cols-[80px_1fr_150px_120px_100px_180px] items-center gap-4 border-b bg-gray-50/50 px-6 py-4 text-sm font-semibold lg:grid">
            <div>Image</div>
            <div>Produit</div>
            <div>Catégorie</div>
            <div>Prix</div>
            <div>Stock</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-ylang-beige/50 divide-y">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-[64px_1fr] items-start gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-gray-50/50 sm:px-6 lg:grid-cols-[80px_1fr_150px_120px_100px_180px] lg:items-center"
              >
                {/* Image */}
                <div className="bg-ylang-beige h-16 w-16 overflow-hidden rounded-xl lg:h-16 lg:w-16">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="text-ylang-charcoal/20 h-6 w-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <h3 className="text-ylang-charcoal truncate font-semibold">
                    {product.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 lg:hidden">
                    <span className="text-ylang-rose text-xs font-medium">
                      {product.category}
                    </span>
                    <span className="text-ylang-charcoal/40 text-xs">
                      {product.price.toFixed(2)}€
                    </span>
                    {product.stock > 0 ? (
                      <span className="text-[10px] font-medium text-green-600">
                        {product.stock} en stock
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-red-600">
                        Rupture
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {!product.isActive && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">
                        Inactif
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-600">
                        <Star className="h-2.5 w-2.5" />
                        Vedette
                      </span>
                    )}
                    {product.options?.customizable && (
                      <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-600">
                        <Palette className="h-2.5 w-2.5" />
                        Personnalisable
                      </span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="hidden lg:block">
                  <span className="text-ylang-charcoal/60 text-sm">
                    {product.category}
                  </span>
                </div>

                {/* Price */}
                <div className="hidden lg:block">
                  <div className="flex flex-col">
                    <span className="text-ylang-rose font-semibold">
                      {product.price.toFixed(2)}€
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-ylang-charcoal/40 text-xs line-through">
                        {product.compareAtPrice.toFixed(2)}€
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock */}
                <div className="hidden lg:block">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      product.stock === 0
                        ? "bg-red-100 text-red-600"
                        : product.stock < 5
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {product.stock} en stock
                  </span>
                </div>

                {/* Actions */}
                <div className="col-start-2 flex items-center justify-end gap-2 lg:col-start-auto">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="cursor-pointer rounded-lg border border-blue-300 bg-blue-100 p-2 text-blue-500 transition-colors hover:bg-blue-200"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(product)}
                    className={`cursor-pointer rounded-lg border p-2 transition-colors ${
                      product.isActive
                        ? "border-green-300 bg-green-50 text-green-600 hover:bg-green-100"
                        : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                    title={product.isActive ? "Désactiver" : "Activer"}
                  >
                    {product.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(product)}
                    className={`cursor-pointer rounded-lg border p-2 transition-colors ${
                      product.isFeatured
                        ? "border-yellow-300 bg-yellow-100 text-yellow-600 hover:bg-yellow-100"
                        : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                    title={
                      product.isFeatured
                        ? "Retirer vedette"
                        : "Mettre en vedette"
                    }
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="cursor-pointer rounded-lg border border-red-300 bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100"
                    title="Supprimer"
                  >
                    <TrashBin strokeWidth="2" className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-ylang-terracotta/90 fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col shadow-2xl md:w-[800px] lg:w-[900px]"
            >
              {/* Modal Header */}
              <div className="border-ylang-beige/50 relative overflow-hidden border-b bg-white px-8 py-6">
                {/* Decorative background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="bg-ylang-rose/20 absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl" />
                  <div className="bg-ylang-terracotta/20 absolute -bottom-8 -left-8 h-24 w-24 rounded-full blur-2xl" />
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="from-ylang-rose to-ylang-terracotta shadow-ylang-rose/25 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg">
                      {editingProduct ? (
                        <Edit className="h-6 w-6 text-white" />
                      ) : (
                        <Sparkles className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-ylang-charcoal text-2xl font-bold">
                        {editingProduct
                          ? "Modifier le produit"
                          : "Nouveau produit"}
                      </h2>
                      <p className="text-ylang-charcoal/60 text-sm">
                        {editingProduct
                          ? `Modification de "${editingProduct.name}"`
                          : "Créez un nouveau produit pour votre catalogue"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-ylang-rose/10 hover:bg-ylang-rose/20 rounded-full p-2 transition-all"
                  >
                    <X className="text-ylang-rose h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="border-ylang-beige/50 bg-ylang-cream/80 flex gap-1 border-b bg-linear-to-r px-8 py-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex cursor-pointer items-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-ylang-rose shadow-ylang-rose/25 text-white shadow-md"
                          : "text-ylang-charcoal/70 hover:text-ylang-charcoal hover:bg-ylang-cream/90 hover:border-ylang-cream"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${isActive ? "" : "text-ylang-terracotta/60"}`}
                      />
                      {tab.label}
                      {isActive && (
                        <span className="bg-ylang-rose absolute -bottom-3 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  {/* General Tab */}
                  {activeTab === "general" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="border-ylang-terracotta/20 rounded-2xl border bg-white p-6 shadow-sm">
                        <h3 className="text-ylang-charcoal mb-4 flex items-center gap-2 text-lg font-semibold">
                          <div className="bg-ylang-rose/10 flex h-8 w-8 items-center justify-center rounded-lg">
                            <Info className="text-ylang-rose h-4 w-4" />
                          </div>
                          Informations de base
                        </h3>

                        {/* Name */}
                        <div className="mb-4">
                          <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                            Nom du produit{" "}
                            <span className="text-ylang-rose">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose w-full rounded-xl border bg-white px-4 py-3.5 text-lg transition-all focus:ring-2 focus:outline-none"
                            placeholder="Ex: Gigoteuse 4 saisons personnalisée"
                          />
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                          <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                            Description courte
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            rows={3}
                            className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose w-full resize-none rounded-xl border bg-white px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                            placeholder="Une brève description pour les listes et aperçus..."
                          />
                        </div>

                        {/* Category and Subcategory */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                              Catégorie{" "}
                              <span className="text-ylang-rose">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={formData.category}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    category: e.target.value,
                                  })
                                }
                                className="focus:border-ylang-rose focus:ring-ylang-rose/10 font-body text-ylang-charcoal w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white py-3.5 pr-10 pl-6 text-sm font-medium transition-all outline-none focus:ring-2"
                              >
                                <option value="">Sélectionner...</option>
                                {categories.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="text-ylang-charcoal/40 pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2" />
                            </div>
                          </div>
                          <div>
                            <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                              Sous-catégorie
                            </label>
                            <input
                              type="text"
                              value={formData.subcategory}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  subcategory: e.target.value,
                                })
                              }
                              className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose w-full rounded-xl border bg-white px-4 py-3.5 transition-all focus:ring-2 focus:outline-none"
                              placeholder="Ex: Gigoteuses"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="border-ylang-terracotta/20 rounded-2xl border bg-white p-6 shadow-sm">
                        <h3 className="text-ylang-charcoal mb-4 flex items-center gap-2 text-lg font-semibold">
                          <div className="bg-ylang-terracotta/10 flex h-8 w-8 items-center justify-center rounded-lg">
                            <Box className="text-ylang-terracotta h-4 w-4" />
                          </div>
                          Prix et Stock
                        </h3>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div>
                            <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                              Prix (€){" "}
                              <span className="text-ylang-rose">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    price: e.target.value,
                                  })
                                }
                                className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose w-full rounded-xl border bg-white px-4 py-3.5 pr-8 transition-all focus:ring-2 focus:outline-none"
                                placeholder="0.00"
                              />
                              <span className="text-ylang-charcoal/40 absolute top-1/2 right-4 -translate-y-1/2">
                                €
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                              Prix barré (€)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.01"
                                value={formData.compareAtPrice}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    compareAtPrice: e.target.value,
                                  })
                                }
                                className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose w-full rounded-xl border bg-white px-4 py-3.5 pr-8 transition-all focus:ring-2 focus:outline-none"
                                placeholder="0.00"
                              />
                              <span className="text-ylang-charcoal/40 absolute top-1/2 right-4 -translate-y-1/2">
                                €
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                              Stock
                            </label>
                            <input
                              type="number"
                              value={formData.stock}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  stock: e.target.value,
                                })
                              }
                              className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose w-full rounded-xl border bg-white px-4 py-3.5 transition-all focus:ring-2 focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                              SKU
                            </label>
                            <input
                              type="text"
                              value={formData.sku}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  sku: e.target.value,
                                })
                              }
                              className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose w-full rounded-xl border bg-white px-4 py-3.5 transition-all focus:ring-2 focus:outline-none"
                              placeholder="GIG-4S-001"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Media Tab */}
                  {activeTab === "media" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="border-ylang-terracotta/20 rounded-2xl border bg-white p-6 shadow-sm">
                        <h3 className="text-ylang-charcoal mb-2 flex items-center gap-2 text-lg font-semibold">
                          <div className="bg-ylang-rose/10 flex h-8 w-8 items-center justify-center rounded-lg">
                            <ImageIcon className="text-ylang-rose h-4 w-4" />
                          </div>
                          Images du produit
                        </h3>
                        <p className="text-ylang-charcoal/60 mb-6 ml-10 text-sm">
                          Ajoutez jusqu'a 5 images. La première image sera
                          l'image principale.
                        </p>

                        <ImageReorderGrid
                          images={formData.images}
                          onReorder={(newImages) =>
                            setFormData((prev) => ({
                              ...prev,
                              images: newImages,
                            }))
                          }
                          onRemove={(img) =>
                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter((i) => i !== img),
                            }))
                          }
                        >
                          {/* Upload Button */}
                          <ImageUpload
                            value={formData.images}
                            onChange={(urls) =>
                              setFormData((prev) => ({
                                ...prev,
                                images: [...prev.images, ...urls],
                              }))
                            }
                            onRemove={() => {}}
                            showPreview={false}
                          />
                        </ImageReorderGrid>

                        {formData.images.length > 0 && (
                          <div className="border-ylang-terracotta/20 bg-ylang-cream/50 mt-6 rounded-xl border p-4">
                            <div className="flex items-start gap-3">
                              <Info className="text-ylang-terracotta mt-0.5 h-5 w-5 shrink-0" />
                              <div>
                                <p className="text-ylang-charcoal font-medium">
                                  Conseil pour les images
                                </p>
                                <p className="text-ylang-charcoal/70 text-sm">
                                  Utilisez des images de haute qualité (min.
                                  800x800px) avec un fond neutre pour un rendu
                                  optimal.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Details Tab */}
                  {activeTab === "details" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Long Description */}
                      <div className="border-ylang-terracotta/20 rounded-2xl border bg-white p-6 shadow-sm">
                        <h3 className="text-ylang-charcoal mb-2 flex items-center gap-2 text-lg font-semibold">
                          <div className="bg-ylang-rose/10 flex h-8 w-8 items-center justify-center rounded-lg">
                            <FileText className="text-ylang-rose h-4 w-4" />
                          </div>
                          Description détaillée
                        </h3>
                        <p className="text-ylang-charcoal/60 mb-4 ml-10 text-sm">
                          Décrivez votre produit en détail pour la page produit.
                        </p>

                        <textarea
                          value={formData.longDescription}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              longDescription: e.target.value,
                            })
                          }
                          rows={6}
                          className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose w-full resize-none rounded-xl border bg-white px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                          placeholder="Décrivez les matériaux, le processus de fabrication, les avantages du produit..."
                        />
                      </div>

                      {/* Features */}
                      <div className="border-ylang-terracotta/20 rounded-2xl border bg-white p-6 shadow-sm">
                        <h3 className="text-ylang-charcoal mb-2 flex items-center gap-2 text-lg font-semibold">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          Caractéristiques
                        </h3>
                        <p className="text-ylang-charcoal/60 mb-4 ml-10 text-sm">
                          Listez les points clés de votre produit.
                        </p>

                        {/* Existing features */}
                        {formData.features.length > 0 && (
                          <div className="mb-4 space-y-2">
                            {formData.features.map((feature, index) => (
                              <div
                                key={index}
                                className="border-ylang-beige flex items-center gap-3 rounded-lg border bg-white px-4 py-3"
                              >
                                <Check className="text-ylang-rose h-4 w-4 shrink-0" />
                                <span className="flex-1">{feature}</span>
                                <button
                                  onClick={() => removeFeature(index)}
                                  className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new feature */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addFeature())
                            }
                            className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose flex-1 rounded-xl border bg-white px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                            placeholder="Ex: 100% coton certifié Oeko-Tex"
                          />
                          <Button
                            variant="secondary"
                            onClick={addFeature}
                            className="shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Options Tab */}
                  {activeTab === "options" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Customizable */}
                      <div className="rounded-2xl border border-purple-200 bg-linear-to-br from-white to-purple-50/30 p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                              <Palette className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-ylang-charcoal text-lg font-semibold">
                                Produit personnalisable
                              </h3>
                              <p className="text-ylang-charcoal/60 text-sm">
                                Le client pourra personnaliser ce produit
                                (broderie, couleurs, etc.)
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              checked={formData.customizable}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customizable: e.target.checked,
                                })
                              }
                              className="peer sr-only"
                            />
                            <div className="peer h-7 w-12 rounded-full bg-gray-200 peer-checked:bg-purple-600 peer-focus:ring-4 peer-focus:ring-purple-300 after:absolute after:top-0.5 after:left-0.5 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5 peer-checked:after:border-white"></div>
                          </label>
                        </div>
                      </div>

                      {/* Sizes */}
                      <div className="border-ylang-terracotta/20 rounded-2xl border bg-white p-6 shadow-sm">
                        <h3 className="text-ylang-charcoal mb-2 flex items-center gap-2 text-lg font-semibold">
                          <div className="bg-ylang-rose/10 flex h-8 w-8 items-center justify-center rounded-lg">
                            <Layers className="text-ylang-rose h-4 w-4" />
                          </div>
                          Tailles disponibles
                        </h3>
                        <p className="text-ylang-charcoal/60 mb-4 ml-10 text-sm">
                          Définissez les tailles disponibles pour ce produit.
                        </p>

                        {/* Existing sizes */}
                        {formData.sizes.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {formData.sizes.map((size, index) => (
                              <div
                                key={index}
                                className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
                                  formData.defaultSize === size
                                    ? "border-ylang-rose bg-ylang-rose/10 text-ylang-rose"
                                    : "border-ylang-beige bg-white"
                                }`}
                              >
                                <span className="text-sm font-medium">
                                  {size}
                                </span>
                                {formData.defaultSize === size && (
                                  <span className="text-xs opacity-60">
                                    (défaut)
                                  </span>
                                )}
                                <button
                                  onClick={() => removeSize(index)}
                                  className="ml-1 rounded-full p-0.5 text-red-300 transition-colors hover:bg-red-50"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new size */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addSize())
                            }
                            className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose flex-1 rounded-xl border bg-white px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                            placeholder="Ex: 0-6 mois, S, M, L..."
                          />
                          <Button
                            variant="secondary"
                            onClick={addSize}
                            className="shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                            Ajouter
                          </Button>
                        </div>

                        {/* Default size selector */}
                        {formData.sizes.length > 0 && (
                          <div className="mt-4">
                            <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                              Taille par défaut
                            </label>
                            <select
                              value={formData.defaultSize}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  defaultSize: e.target.value,
                                })
                              }
                              className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose w-full rounded-xl border bg-white px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                            >
                              <option value="">Sélectionner...</option>
                              {formData.sizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* SEO/Visibility Tab */}
                  {activeTab === "seo" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Status Cards */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Active */}
                        <div
                          className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                            formData.isActive
                              ? "border-green-500 bg-green-50"
                              : "border-ylang-beige bg-white hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              isActive: !formData.isActive,
                            })
                          }
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                                formData.isActive
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              <Eye className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="text-ylang-charcoal font-semibold">
                                Actif
                              </h4>
                              <p className="text-ylang-charcoal/60 text-xs">
                                Visible boutique
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Featured */}
                        <div
                          className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                            formData.isFeatured
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-ylang-beige bg-white hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              isFeatured: !formData.isFeatured,
                            })
                          }
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                                formData.isFeatured
                                  ? "bg-yellow-500 text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              <Star className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="text-ylang-charcoal font-semibold">
                                Vedette
                              </h4>
                              <p className="text-ylang-charcoal/60 text-xs">
                                Accueil
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* New */}
                        <div
                          className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                            formData.isNew
                              ? "bg-ylang-terracotta border-white"
                              : "border-ylang-beige bg-white hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              isNew: !formData.isNew,
                            })
                          }
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                                formData.isNew
                                  ? "bg-ylang-rose/30 text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="text-ylang-charcoal font-semibold">
                                Nouveauté
                              </h4>
                              <p className="text-ylang-charcoal/60 text-xs">
                                Badge "Nouveau"
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="border-ylang-terracotta/20 rounded-2xl border bg-white p-6 shadow-sm">
                        <h3 className="text-ylang-charcoal mb-2 flex items-center gap-2 text-lg font-semibold">
                          <div className="bg-ylang-rose/10 flex h-8 w-8 items-center justify-center rounded-lg">
                            <Tags className="text-ylang-rose h-4 w-4" />
                          </div>
                          Tags
                        </h3>
                        <p className="text-ylang-charcoal/60 mb-4 ml-10 text-sm">
                          Ajoutez des tags pour améliorer la recherche et le
                          filtrage (séparés par des virgules).
                        </p>

                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) =>
                            setFormData({ ...formData, tags: e.target.value })
                          }
                          className="border-ylang-beige focus:ring-ylang-rose/20 focus:border-ylang-rose w-full rounded-xl border bg-white px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                          placeholder="Ex: nouveau, promo, best-seller, coton-bio"
                        />

                        {formData.tags && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {formData.tags.split(",").map(
                              (tag, i) =>
                                tag.trim() && (
                                  <span
                                    key={i}
                                    className="bg-ylang-beige text-ylang-charcoal rounded-full px-3 py-1 text-sm"
                                  >
                                    #{tag.trim()}
                                  </span>
                                ),
                            )}
                          </div>
                        )}
                      </div>

                      {/* Preview Link */}
                      {editingProduct && (
                        <div className="border-ylang-rose/20 rounded-2xl border bg-white p-6 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-ylang-rose/10 flex h-10 w-10 items-center justify-center rounded-xl">
                                <Eye className="text-ylang-rose h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-ylang-charcoal font-semibold">
                                  Aperçu du produit
                                </h3>
                                <p className="text-ylang-charcoal/60 text-sm">
                                  Voir le produit tel qu'il apparaît aux clients
                                </p>
                              </div>
                            </div>
                            <a
                              href={`/produits/${editingProduct.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-ylang-rose shadow-ylang-rose/25 hover:bg-ylang-rose/90 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg"
                            >
                              Voir la page
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-ylang-beige flex items-center justify-between border-t bg-white px-8 py-5">
                <div className="text-ylang-charcoal/50 text-sm">
                  {editingProduct && (
                    <div className="flex items-center gap-2">
                      <div className="bg-ylang-terracotta/70 h-2 w-2 rounded-full" />
                      <span>
                        Dernière modification:{" "}
                        {new Date(editingProduct.createdAt).toLocaleDateString(
                          "fr-FR",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="px-6"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="luxury"
                    onClick={handleSave}
                    disabled={
                      isSaving ||
                      !formData.name ||
                      !formData.price ||
                      !formData.category
                    }
                    className="px-8"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {editingProduct ? "Mettre à jour" : "Créer le produit"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <Dialog
            open={deleteConfirmation.isOpen}
            onOpenChange={(open) =>
              setDeleteConfirmation((prev) => ({ ...prev, isOpen: open }))
            }
          >
            <DialogContent className="overflow-hidden p-0 sm:max-w-[485px]">
              <div className="flex flex-col p-4">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <TrashBin className="h-6 w-6" />
                </div>
                <DialogHeader className="mb-2">
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Supprimer le produit ?
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir supprimer ce produit ? Cette action
                  est irréversible et supprimera toutes les données associées.
                </DialogDescription>
              </div>
              <DialogFooter className="flex flex-col gap-2 bg-gray-50/50 p-4 sm:flex-row sm:justify-end sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setDeleteConfirmation({ isOpen: false, productId: null })
                  }
                  className="w-full cursor-pointer font-medium hover:bg-gray-100 sm:w-auto"
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  className="w-full cursor-pointer bg-red-600 px-2 font-medium text-white shadow-sm hover:bg-red-700 sm:ml-2 sm:w-auto"
                  onClick={confirmDelete}
                >
                  Supprimer définitivement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
