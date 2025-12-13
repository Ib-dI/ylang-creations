"use client";

import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { AnimatePresence, motion } from "framer-motion";
import {
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: "",
    subcategory: "",
    stock: "0",
    sku: "",
    isActive: true,
    isFeatured: false,
    images: [] as (string | File)[],
    tags: "",
  });

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
        images: product.images,
        tags: product.tags.join(", "),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        compareAtPrice: "",
        category: "",
        subcategory: "",
        stock: "0",
        sku: "",
        isActive: true,
        isFeatured: false,
        images: [],
        tags: "",
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Upload new images (Files)
      const uploadedImageUrls: string[] = [];
      const existingImageUrls: string[] = [];
      const folderId = crypto.randomUUID();

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
            // Continue with other images or throw? Let's verify
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

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-ylang-charcoal mb-2 text-3xl font-bold">
          Produits
        </h1>
        <p className="text-ylang-charcoal/60">
          Gérez votre catalogue de produits ({products.length} produits)
        </p>
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

        {/* Category filter */}
        <select
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="border-ylang-beige focus:ring-ylang-rose/20 rounded-xl border bg-white px-4 py-3 focus:ring-2 focus:outline-none"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

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
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-ylang-beige overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg"
            >
              {/* Image */}
              <div className="bg-ylang-beige relative aspect-square">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="text-ylang-charcoal/20 h-12 w-12" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {!product.isActive && (
                    <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                      Inactif
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                      <Star className="h-3 w-3" />
                      Vedette
                    </span>
                  )}
                </div>

                {/* Stock badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      product.stock === 0
                        ? "bg-red-100 text-red-600"
                        : product.stock < 5
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    Stock: {product.stock}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-ylang-rose mb-1 text-xs font-medium">
                  {product.category}
                </p>
                <h3 className="text-ylang-charcoal mb-2 line-clamp-1 font-semibold">
                  {product.name}
                </h3>
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

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="bg-ylang-beige text-ylang-charcoal flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-sm transition-colors hover:bg-[#e8dcc8]"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleToggleActive(product)}
                    className={`rounded-lg p-2 transition-colors ${
                      product.isActive
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                    className={`rounded-lg p-2 transition-colors ${
                      product.isFeatured
                        ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                    className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:inset-auto lg:top-1/2 lg:left-1/2 lg:max-h-[90vh] lg:w-full lg:max-w-2xl lg:-translate-x-1/2 lg:-translate-y-1/2"
            >
              {/* Modal header */}
              <div className="border-ylang-beige flex items-center justify-between border-b p-6">
                <h2 className="text-ylang-charcoal text-xl font-bold">
                  {editingProduct ? "Modifier le produit" : "Nouveau produit"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="hover:bg-ylang-beige rounded-lg p-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal content */}
              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                {/* Images Upload */}
                <div>
                  <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                    Images du produit
                  </label>
                  <ImageUpload
                    value={formData.images}
                    onChange={(urls) =>
                      setFormData({ ...formData, images: urls })
                    }
                    onRemove={(url) =>
                      setFormData({
                        ...formData,
                        images: formData.images.filter(
                          (current) => current !== url,
                        ),
                      })
                    }
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="border-ylang-beige focus:ring-ylang-rose/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                    placeholder="Ex: Gigoteuse 4 saisons"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="border-ylang-beige focus:ring-ylang-rose/20 w-full resize-none rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                    placeholder="Description du produit..."
                  />
                </div>

                {/* Price & Compare price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                      Prix (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="border-ylang-beige focus:ring-ylang-rose/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                      Prix barré (€)
                    </label>
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
                      className="border-ylang-beige focus:ring-ylang-rose/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                      Catégorie *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="border-ylang-beige focus:ring-ylang-rose/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                    >
                      <option value="">Sélectionner...</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
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
                      className="border-ylang-beige focus:ring-ylang-rose/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                      placeholder="Ex: Gigoteuses"
                    />
                  </div>
                </div>

                {/* Stock & SKU */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="border-ylang-beige focus:ring-ylang-rose/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
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
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="border-ylang-beige focus:ring-ylang-rose/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                      placeholder="Ex: GIG-4S-001"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-ylang-charcoal mb-2 block text-sm font-medium">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="border-ylang-beige focus:ring-ylang-rose/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                    placeholder="Ex: nouveau, promo, best-seller"
                  />
                </div>

                {/* Options */}
                <div className="flex items-center gap-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="border-ylang-beige text-ylang-rose focus:ring-ylang-rose/20 h-5 w-5 rounded"
                    />
                    <span className="text-ylang-charcoal text-sm">
                      Produit actif
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="border-ylang-beige text-ylang-rose focus:ring-ylang-rose/20 h-5 w-5 rounded"
                    />
                    <span className="text-ylang-charcoal text-sm">
                      Mettre en vedette
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal footer */}
              <div className="border-ylang-beige flex items-center justify-end gap-3 border-t p-6">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
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
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
