"use client";

import { ImageReorderGrid } from "@/components/admin/image-reorder-grid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import type { AdminProduct } from "@/lib/admin/get-products-data";
import { TrashBin } from "@gravity-ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
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
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const categories = [
  "La Chambre",
  "La Toilette",
  "Bagageries/Promenade",
  "Linge de Naissance",
  "Accessoires",
  "Les Jeux",
];

type TabId = "general" | "media" | "details" | "options" | "seo";

const tabs: { id: TabId; label: string; icon: React.ElementType<{ className?: string; strokeWidth?: number }> }[] = [
  { id: "general", label: "Général",    icon: Info },
  { id: "media",   label: "Médias",     icon: ImageIcon },
  { id: "details", label: "Détails",    icon: FileText },
  { id: "options", label: "Options",    icon: Settings },
  { id: "seo",     label: "Visibilité", icon: Tags },
];

const EMPTY_FORM = {
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
  weight: "0",
  images: [] as (string | File)[],
  tags: "",
  features: [] as string[],
  sizes: [] as string[],
  defaultSize: "",
  isNew: true,
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="font-body mb-2 block text-sm font-medium" style={{ color: "var(--color-ink)" }}>
      {children}{required && <span style={{ color: "var(--color-accent)" }}> *</span>}
    </label>
  );
}

function FlatInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`font-body w-full px-4 py-2.5 text-sm outline-none ${className}`}
      style={{
        border: "var(--rule-soft)",
        background: "var(--color-paper)",
        color: "var(--color-ink)",
        ...props.style,
      }}
    />
  );
}

function FlatTextarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="font-body w-full resize-none px-4 py-3 text-sm outline-none"
      style={{
        border: "var(--rule-soft)",
        background: "var(--color-paper)",
        color: "var(--color-ink)",
      }}
    />
  );
}

interface ProductsClientProps {
  initialProducts: AdminProduct[];
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const products = initialProducts;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; productId: string | null }>({ isOpen: false, productId: null });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [newFeature, setNewFeature] = useState("");
  const [newSize, setNewSize] = useState("");

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product?: AdminProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        longDescription: product.options?.longDescription || "",
        price: String(product.price),
        compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
        category: product.category,
        subcategory: product.subcategory || "",
        stock: String(product.stock),
        sku: product.sku || "",
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        customizable: product.options?.customizable ?? true,
        weight: String(product.weight || 0),
        images: product.images,
        tags: product.tags.join(", "),
        features: product.options?.features || [],
        sizes: product.sizes || [],
        defaultSize: product.defaultSize || "",
        isNew: product.options?.isNew ?? true,
      });
    } else {
      setEditingProduct(null);
      setFormData(EMPTY_FORM);
    }
    setActiveTab("general");
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const uploadedUrls: string[] = [];
      const existingUrls: string[] = [];
      const folderId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

      for (const item of formData.images) {
        if (typeof item === "string") {
          existingUrls.push(item);
        } else {
          const safeName = item.name.replace(/\s/g, "-").toLowerCase();
          const filePath = `products/${folderId}/${Date.now()}-${safeName}`;
          const fd = new FormData();
          fd.append("file", item);
          fd.append("path", filePath);
          const response = await fetch("/api/admin/storage/upload", { method: "POST", body: fd });
          if (!response.ok) { console.error("Failed to upload image"); continue; }
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        category: formData.category,
        subcategory: formData.subcategory || null,
        stock: parseInt(formData.stock),
        sku: formData.sku || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        weight: parseInt(formData.weight) || 0,
        images: [...existingUrls, ...uploadedUrls],
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        sizes: formData.sizes,
        defaultSize: formData.defaultSize || null,
        options: {
          features: formData.features,
          longDescription: formData.longDescription,
          customizable: formData.customizable,
          isNew: formData.isNew,
        },
      };

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
      const response = await fetch(url, {
        method: editingProduct ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setShowModal(false);
        startTransition(() => router.refresh());
      }
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => setDeleteConfirmation({ isOpen: true, productId: id });
  const confirmDelete = async () => {
    if (!deleteConfirmation.productId) return;
    try {
      const response = await fetch(`/api/admin/products/${deleteConfirmation.productId}`, { method: "DELETE" });
      if (response.ok) {
        setDeleteConfirmation({ isOpen: false, productId: null });
        startTransition(() => router.refresh());
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      startTransition(() => router.refresh());
    } catch (error) { console.error("Error toggling product:", error); }
  };

  const handleToggleFeatured = async (product: AdminProduct) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !product.isFeatured }),
      });
      startTransition(() => router.refresh());
    } catch (error) { console.error("Error toggling featured:", error); }
  };

  const addFeature = () => {
    if (newFeature.trim()) { setFormData({ ...formData, features: [...formData.features, newFeature.trim()] }); setNewFeature(""); }
  };
  const removeFeature = (index: number) => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) { setFormData({ ...formData, sizes: [...formData.sizes, newSize.trim()] }); setNewSize(""); }
  };
  const removeSize = (index: number) => {
    const removed = formData.sizes[index];
    setFormData({ ...formData, sizes: formData.sizes.filter((_, i) => i !== index), defaultSize: formData.defaultSize === removed ? "" : formData.defaultSize });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>Administration</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.75rem", color: "var(--color-ink)" }}>
            Produits
          </h1>
          <div className="mt-1 flex items-center gap-4">
            <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>{products.length} produits</span>
            <span className="font-body text-sm" style={{ color: "var(--color-ink-3)", opacity: 0.6 }}>·</span>
            <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>{products.filter((p) => p.isActive).length} actifs</span>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex shrink-0 items-center gap-2 px-5 py-2.5 font-body text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Ajouter un produit
        </button>
      </div>

      {/* Filters row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Rechercher par nom ou SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-body w-full py-2.5 pr-4 pl-9 text-sm outline-none"
            style={{ border: "var(--rule-soft)", background: "var(--color-paper)", color: "var(--color-ink)" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="font-body cursor-pointer appearance-none py-2.5 pr-9 pl-4 text-sm outline-none"
              style={{ border: "var(--rule-soft)", background: "var(--color-paper)", color: "var(--color-ink)", minWidth: "160px" }}
            >
              <option value="">Toutes catégories</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
          </div>

          <div className="flex" style={{ border: "var(--rule-soft)" }}>
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="flex items-center justify-center p-2.5 transition-colors"
                style={{
                  background: viewMode === mode ? "var(--color-ink)" : "var(--color-paper)",
                  color: viewMode === mode ? "var(--color-paper)" : "var(--color-ink-3)",
                }}
              >
                {mode === "grid" ? <LayoutGrid className="h-4 w-4" strokeWidth={1.5} /> : <List className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center" style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
          <Package className="mx-auto mb-4 h-8 w-8" style={{ color: "var(--color-ink-3)", opacity: 0.3 }} strokeWidth={1} />
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1rem", color: "var(--color-ink)", marginBottom: "0.5rem" }}>
            Aucun produit
          </p>
          <p className="font-body mb-6 text-sm" style={{ color: "var(--color-ink-3)" }}>Commencez par ajouter votre premier produit</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 font-body text-sm transition-opacity hover:opacity-80"
            style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Ajouter un produit
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="group overflow-hidden"
              style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}
            >
              <div className="relative aspect-square overflow-hidden" style={{ background: "var(--color-paper-2)" }}>
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-8 w-8" style={{ color: "var(--color-ink-3)", opacity: 0.2 }} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 hidden items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 lg:flex">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="flex items-center gap-2 px-4 py-2 font-body text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
                  >
                    <Edit className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Modifier
                  </button>
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {!product.isActive && <span className="font-body px-1.5 py-0.5 text-[10px]" style={{ background: "#ef4444", color: "#fff" }}>Inactif</span>}
                  {product.isFeatured && <span className="font-body flex items-center gap-1 px-1.5 py-0.5 text-[10px]" style={{ background: "#f59e0b", color: "#fff" }}><Star className="h-2.5 w-2.5" strokeWidth={2} />Vedette</span>}
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className="font-body px-1.5 py-0.5 text-[10px]"
                    style={{
                      background: product.stock === 0 ? "#fef2f2" : product.stock < 5 ? "#fff7ed" : "#f0fdf4",
                      color: product.stock === 0 ? "#ef4444" : product.stock < 5 ? "#f59e0b" : "#22c55e",
                      border: `1px solid ${product.stock === 0 ? "#fecaca" : product.stock < 5 ? "#fed7aa" : "#bbf7d0"}`,
                    }}
                  >
                    {product.stock}
                  </span>
                </div>
              </div>

              <div className="p-3">
                <p className="type-overline mb-1" style={{ color: "var(--color-accent)" }}>{product.category}</p>
                <p className="font-body mb-2 line-clamp-1 text-sm font-medium" style={{ color: "var(--color-ink)" }}>{product.name}</p>
                <div className="mb-3 flex items-baseline gap-2">
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "0.9375rem", color: "var(--color-ink)" }}>
                    {product.price.toFixed(2)} €
                  </span>
                  {product.compareAtPrice && (
                    <span className="font-body text-xs line-through" style={{ color: "var(--color-ink-3)", opacity: 0.5 }}>
                      {product.compareAtPrice.toFixed(2)} €
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleOpenModal(product)} className="flex flex-1 items-center justify-center gap-1 py-1.5 font-body text-xs transition-opacity hover:opacity-70" style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}>
                    <Edit className="h-3 w-3" strokeWidth={1.5} />
                    <span className="hidden sm:inline">Modifier</span>
                  </button>
                  <button onClick={() => handleToggleActive(product)} title={product.isActive ? "Désactiver" : "Activer"} className="p-1.5 transition-opacity hover:opacity-70" style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}>
                    {product.isActive ? <Eye className="h-3 w-3" strokeWidth={1.5} /> : <EyeOff className="h-3 w-3" strokeWidth={1.5} />}
                  </button>
                  <button onClick={() => handleToggleFeatured(product)} title={product.isFeatured ? "Retirer vedette" : "Mettre en vedette"} className="p-1.5 transition-opacity hover:opacity-70" style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}>
                    <Star className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} title="Supprimer" className="p-1.5 transition-opacity hover:opacity-70" style={{ border: "1px solid #fecaca", color: "#ef4444" }}>
                    <TrashBin strokeWidth="0.5" className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--color-paper-2)" }}>
                {["Image", "Produit", "Catégorie", "Prix", "Stock", "Actions"].map((th) => (
                  <th key={th} className="type-overline px-6 py-3 text-left" style={{ color: "var(--color-ink-3)" }}>{th}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="transition-colors hover:bg-[var(--color-paper-2)]"
                  style={{ borderTop: "var(--rule-soft)" }}
                >
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 overflow-hidden" style={{ border: "var(--rule-soft)" }}>
                      {product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center" style={{ background: "var(--color-paper-2)" }}>
                          <Package className="h-4 w-4" style={{ color: "var(--color-ink-3)", opacity: 0.3 }} strokeWidth={1} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-body font-medium" style={{ color: "var(--color-ink)" }}>{product.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {!product.isActive && <span className="type-overline" style={{ color: "#ef4444" }}>Inactif</span>}
                      {product.isFeatured && <span className="type-overline" style={{ color: "#f59e0b" }}>Vedette</span>}
                      {product.options?.customizable && <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>Perso.</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "0.9375rem", color: "var(--color-ink)" }}>
                      {product.price.toFixed(2)} €
                    </span>
                    {product.compareAtPrice && (
                      <span className="font-body ml-2 text-xs line-through" style={{ color: "var(--color-ink-3)", opacity: 0.5 }}>
                        {product.compareAtPrice.toFixed(2)} €
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="font-body px-2 py-1 text-xs"
                      style={{
                        background: product.stock === 0 ? "#fef2f2" : product.stock < 5 ? "#fff7ed" : "#f0fdf4",
                        color: product.stock === 0 ? "#ef4444" : product.stock < 5 ? "#f59e0b" : "#22c55e",
                      }}
                    >
                      {product.stock} en stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenModal(product)} className="p-2 transition-opacity hover:opacity-70" style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }} title="Modifier"><Edit className="h-3.5 w-3.5" strokeWidth={1.5} /></button>
                      <button onClick={() => handleToggleActive(product)} className="p-2 transition-opacity hover:opacity-70" style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }} title={product.isActive ? "Désactiver" : "Activer"}>
                        {product.isActive ? <Eye className="h-3.5 w-3.5" strokeWidth={1.5} /> : <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />}
                      </button>
                      <button onClick={() => handleToggleFeatured(product)} className="p-2 transition-opacity hover:opacity-70" style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }} title={product.isFeatured ? "Retirer vedette" : "Vedette"}>
                        <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 transition-opacity hover:opacity-70" style={{ border: "1px solid #fecaca", color: "#ef4444" }} title="Supprimer">
                        <TrashBin strokeWidth="2" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col md:w-[720px] lg:w-[800px]"
              style={{ background: "var(--color-paper)", borderLeft: "var(--rule-hair)" }}
            >
              {/* Modal header */}
              <div
                className="flex items-center justify-between px-8 py-5"
                style={{ background: "var(--color-ink)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div>
                  <p className="type-overline mb-1" style={{ color: "var(--color-paper)", opacity: 0.4 }}>
                    {editingProduct ? "Modification" : "Nouveau produit"}
                  </p>
                  <h2
                    style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.125rem", color: "var(--color-paper)" }}
                  >
                    {editingProduct ? editingProduct.name : "Créer un produit"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-60"
                  style={{ color: "var(--color-paper)" }}
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto" style={{ borderBottom: "var(--rule-hair)" }}>
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="flex shrink-0 items-center gap-2 px-5 py-3.5 font-body text-sm whitespace-nowrap transition-all"
                    style={{
                      color: activeTab === id ? "var(--color-ink)" : "var(--color-ink-3)",
                      borderBottom: activeTab === id ? "2px solid var(--color-ink)" : "2px solid transparent",
                      background: activeTab === id ? "var(--color-paper-2)" : "transparent",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  {activeTab === "general" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div style={{ border: "var(--rule-hair)", padding: "1.5rem" }}>
                        <p className="type-overline mb-4" style={{ color: "var(--color-ink-3)" }}>Informations de base</p>
                        <div className="space-y-4">
                          <div>
                            <FieldLabel required>Nom du produit</FieldLabel>
                            <FlatInput type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex : Gigoteuse 4 saisons personnalisée" />
                          </div>
                          <div>
                            <FieldLabel>Description courte</FieldLabel>
                            <FlatTextarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Une brève description pour les listes et aperçus..." />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <FieldLabel required>Catégorie</FieldLabel>
                              <div className="relative">
                                <select
                                  value={formData.category}
                                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                  className="font-body w-full cursor-pointer appearance-none py-2.5 pr-8 pl-4 text-sm outline-none"
                                  style={{ border: "var(--rule-soft)", background: "var(--color-paper)", color: "var(--color-ink)" }}
                                >
                                  <option value="">Sélectionner…</option>
                                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                              </div>
                            </div>
                            <div>
                              <FieldLabel>Sous-catégorie</FieldLabel>
                              <FlatInput type="text" value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} placeholder="Ex : Gigoteuses" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ border: "var(--rule-hair)", padding: "1.5rem" }}>
                        <p className="type-overline mb-4" style={{ color: "var(--color-ink-3)" }}>Prix et stock</p>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div>
                            <FieldLabel required>Prix (€)</FieldLabel>
                            <FlatInput type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" />
                          </div>
                          <div>
                            <FieldLabel required>Poids (g)</FieldLabel>
                            <FlatInput type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="0" />
                          </div>
                          <div>
                            <FieldLabel>Prix barré (€)</FieldLabel>
                            <FlatInput type="number" step="0.01" value={formData.compareAtPrice} onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })} placeholder="0.00" />
                          </div>
                          <div>
                            <FieldLabel>Stock</FieldLabel>
                            <FlatInput type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="0" />
                          </div>
                          <div>
                            <FieldLabel>SKU</FieldLabel>
                            <FlatInput type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="GIG-4S-001" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "media" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div style={{ border: "var(--rule-hair)", padding: "1.5rem" }}>
                        <p className="type-overline mb-1" style={{ color: "var(--color-ink-3)" }}>Images du produit</p>
                        <p className="font-body mb-6 text-sm" style={{ color: "var(--color-ink-3)" }}>
                          Ajoutez jusqu&apos;à 5 images. La première image sera l&apos;image principale.
                        </p>
                        <ImageReorderGrid
                          images={formData.images}
                          onReorder={(newImages) => setFormData((prev) => ({ ...prev, images: newImages }))}
                          onRemove={(img) => setFormData((prev) => ({ ...prev, images: prev.images.filter((i) => i !== img) }))}
                        >
                          <ImageUpload
                            value={formData.images}
                            onChange={(urls) => setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }))}
                            onRemove={() => {}}
                            showPreview={false}
                          />
                        </ImageReorderGrid>
                        {formData.images.length > 0 && (
                          <div className="mt-6 flex items-start gap-3 p-4" style={{ border: "var(--rule-soft)", background: "var(--color-paper-2)" }}>
                            <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                            <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                              Utilisez des images de haute qualité (min. 800×800 px) avec un fond neutre.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "details" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div style={{ border: "var(--rule-hair)", padding: "1.5rem" }}>
                        <p className="type-overline mb-4" style={{ color: "var(--color-ink-3)" }}>Description détaillée</p>
                        <FlatTextarea value={formData.longDescription} onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })} rows={6} placeholder="Matériaux, processus de fabrication, avantages du produit..." />
                      </div>

                      <div style={{ border: "var(--rule-hair)", padding: "1.5rem" }}>
                        <p className="type-overline mb-4" style={{ color: "var(--color-ink-3)" }}>Caractéristiques</p>
                        {formData.features.length > 0 && (
                          <div className="mb-4 space-y-2">
                            {formData.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-3 px-4 py-2.5" style={{ border: "var(--rule-soft)" }}>
                                <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={2} />
                                <span className="font-body flex-1 text-sm" style={{ color: "var(--color-ink)" }}>{feature}</span>
                                <button onClick={() => removeFeature(index)} className="transition-opacity hover:opacity-60" style={{ color: "#ef4444" }}>
                                  <X className="h-4 w-4" strokeWidth={1.5} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <FlatInput type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} placeholder="Ex : 100% coton certifié Oeko-Tex" />
                          <button onClick={addFeature} className="flex shrink-0 items-center gap-2 px-4 py-2.5 font-body text-sm transition-opacity hover:opacity-70" style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}>
                            <Plus className="h-4 w-4" strokeWidth={1.5} />
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "options" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div style={{ border: "var(--rule-hair)", padding: "1.5rem" }}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Palette className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                            <div>
                              <p className="font-body font-medium" style={{ color: "var(--color-ink)" }}>Produit personnalisable</p>
                              <p className="font-body mt-0.5 text-sm" style={{ color: "var(--color-ink-3)" }}>Le client pourra personnaliser ce produit (broderie, couleurs, etc.)</p>
                            </div>
                          </div>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input type="checkbox" checked={formData.customizable} onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })} className="peer sr-only" />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-[var(--color-ink)] after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5" />
                          </label>
                        </div>
                      </div>

                      <div style={{ border: "var(--rule-hair)", padding: "1.5rem" }}>
                        <div className="mb-1 flex items-center gap-3">
                          <Layers className="h-4 w-4" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                          <p className="type-overline" style={{ color: "var(--color-ink-3)" }}>Tailles disponibles</p>
                        </div>
                        <p className="font-body mb-4 ml-7 text-sm" style={{ color: "var(--color-ink-3)" }}>
                          Ex : XS, S, M, L, XL ou 0–6 mois, 6–12 mois…
                        </p>
                        {formData.sizes.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {formData.sizes.map((size, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-1.5 font-body text-sm"
                                style={{
                                  border: formData.defaultSize === size ? `1px solid var(--color-ink)` : "var(--rule-soft)",
                                  color: formData.defaultSize === size ? "var(--color-ink)" : "var(--color-ink-3)",
                                }}
                              >
                                {size}
                                {formData.defaultSize === size && <span className="font-body text-xs opacity-50">(défaut)</span>}
                                <button onClick={() => removeSize(index)} className="ml-1 transition-opacity hover:opacity-60" style={{ color: "#ef4444" }}>
                                  <X className="h-3 w-3" strokeWidth={1.5} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <FlatInput type="text" value={newSize} onChange={(e) => setNewSize(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())} placeholder="Ex : XS, S, M ou 0-6 mois" />
                          <button onClick={addSize} className="flex shrink-0 items-center gap-2 px-4 py-2.5 font-body text-sm transition-opacity hover:opacity-70" style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}>
                            <Plus className="h-4 w-4" strokeWidth={1.5} />
                            Ajouter
                          </button>
                        </div>
                        {formData.sizes.length > 0 && (
                          <div className="mt-4">
                            <FieldLabel>Taille par défaut</FieldLabel>
                            <div className="relative">
                              <select
                                value={formData.defaultSize}
                                onChange={(e) => setFormData({ ...formData, defaultSize: e.target.value })}
                                className="font-body w-full cursor-pointer appearance-none py-2.5 pr-8 pl-4 text-sm outline-none"
                                style={{ border: "var(--rule-soft)", background: "var(--color-paper)", color: "var(--color-ink)" }}
                              >
                                <option value="">Sélectionner…</option>
                                {formData.sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                              </select>
                              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "seo" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[
                          { key: "isActive", label: "Actif", sub: "Visible en boutique", icon: Eye },
                          { key: "isFeatured", label: "Vedette", sub: "Mis en avant sur l'accueil", icon: Star },
                          { key: "isNew", label: "Nouveauté", sub: "Badge « Nouveau »", icon: Sparkles },
                        ].map(({ key, label, sub, icon: Icon }) => {
                          const value = formData[key as keyof typeof formData] as boolean;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setFormData({ ...formData, [key]: !value })}
                              className="flex items-start gap-4 p-5 text-left transition-all"
                              style={{
                                border: value ? `1px solid var(--color-ink)` : "var(--rule-soft)",
                                background: value ? "var(--color-paper-2)" : "var(--color-paper)",
                              }}
                            >
                              <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: value ? "var(--color-ink)" : "var(--color-ink-3)", opacity: value ? 1 : 0.4 }} strokeWidth={1.5} />
                              <div>
                                <p className="font-body font-medium" style={{ color: "var(--color-ink)" }}>{label}</p>
                                <p className="font-body mt-0.5 text-xs" style={{ color: "var(--color-ink-3)" }}>{sub}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ border: "var(--rule-hair)", padding: "1.5rem" }}>
                        <div className="mb-4 flex items-center gap-3">
                          <Tags className="h-4 w-4" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                          <p className="type-overline" style={{ color: "var(--color-ink-3)" }}>Tags</p>
                        </div>
                        <FlatInput type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="Ex : nouveau, promo, best-seller, coton-bio (séparés par des virgules)" />
                        {formData.tags && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {formData.tags.split(",").map((tag, i) => tag.trim() && (
                              <span key={i} className="font-body px-3 py-1 text-sm" style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}>
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {editingProduct && (
                        <div className="flex items-center justify-between p-5" style={{ border: "var(--rule-hair)" }}>
                          <div>
                            <p className="font-body font-medium" style={{ color: "var(--color-ink)" }}>Aperçu du produit</p>
                            <p className="font-body mt-0.5 text-sm" style={{ color: "var(--color-ink-3)" }}>Voir tel qu&apos;il apparaît aux clients</p>
                          </div>
                          <a
                            href={`/produits/${editingProduct.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 font-body text-sm transition-opacity hover:opacity-70"
                            style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
                          >
                            Voir la page
                            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                          </a>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Modal footer */}
              <div
                className="flex items-center justify-between px-8 py-4"
                style={{ borderTop: "var(--rule-hair)", background: "var(--color-paper)" }}
              >
                <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                  {editingProduct && `Créé le ${new Date(editingProduct.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`}
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowModal(false)} className="px-5 py-2.5 font-body text-sm transition-opacity hover:opacity-70" style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}>
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || isPending || !formData.name || !formData.price || !formData.category}
                    className="flex items-center gap-2 px-6 py-2.5 font-body text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                    style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
                  >
                    {isSaving || isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />Enregistrement…</>
                    ) : (
                      <><Check className="h-4 w-4" strokeWidth={2} />{editingProduct ? "Mettre à jour" : "Créer le produit"}</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <Dialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) => setDeleteConfirmation((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-[400px]" style={{ background: "var(--color-paper)", border: "var(--rule-hair)" }}>
          <DialogHeader>
            <div className="mb-3 flex h-10 w-10 items-center justify-center" style={{ border: "1px solid #fecaca" }}>
              <TrashBin className="h-5 w-5 text-red-500" />
            </div>
            <DialogTitle style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.125rem", color: "var(--color-ink)" }}>
              Supprimer le produit ?
            </DialogTitle>
            <DialogDescription className="font-body" style={{ color: "var(--color-ink-3)" }}>
              Cette action est irréversible et supprimera toutes les données associées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setDeleteConfirmation({ isOpen: false, productId: null })}
              className="px-5 py-2.5 font-body text-sm transition-opacity hover:opacity-70"
              style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
            >
              Annuler
            </button>
            <button
              onClick={confirmDelete}
              disabled={isPending}
              className="px-5 py-2.5 font-body text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: "#ef4444" }}
            >
              Supprimer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
