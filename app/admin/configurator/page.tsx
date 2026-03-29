"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrashBin } from "@gravity-ui/icons";
import { AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Search, ChevronDown, LayoutGrid, List, Palette, Crosshair, RotateCcw, Type, Maximize2 } from "lucide-react";
import { toast } from "sonner";

type Fabric = {
  id: string;
  name: string;
  price: number;
  baseColor: string;
  image: string;
  category: string;
  isActive: boolean;
};

type EmbroideryZone = {
  x: number;        // 0–1 (fraction de la largeur)
  y: number;        // 0–1 (fraction de la hauteur)
  maxWidth: number; // 0–1 (fraction de la largeur)
  rotation: number; // degrés
  fontSize: number; // pixels à l'échelle naturelle
  alignment: "center" | "left" | "right";
};

type ConfigProduct = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  weight: number;
  icon: string | null;
  baseImage: string;
  maskImage: string;
  colorMaskImage: string | null;
  embroideryZone: EmbroideryZone | null;
  isActive: boolean;
};

type FabricCategory = {
  id: string; // prefix
  title: string;
  description: string;
  order: number;
  isActive: boolean;
};

export default function ConfiguratorAdmin() {
  const [activeTab, setActiveTab] = useState<"fabrics" | "products" | "broderie">("fabrics");
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [products, setProducts] = useState<ConfigProduct[]>([]);
  const [categories, setCategories] = useState<FabricCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fabric modal
  const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<(Omit<Partial<Fabric>, "image"> & { image?: string | File }) | null>(null);
  const [isSavingFabric, setIsSavingFabric] = useState(false);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<ConfigProduct> | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productImages, setProductImages] = useState<{
    baseImage: string | File;
    maskImage: string | File;
    colorMaskImage: string | File | null;
  }>({ baseImage: "", maskImage: "", colorMaskImage: null });

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<FabricCategory> | null>(null);

  // Broderie tab
  const [embroideryProduct, setEmbroideryProduct] = useState<ConfigProduct | null>(null);
  const [embroideryZone, setEmbroideryZone] = useState<EmbroideryZone>({
    x: 0.5, y: 0.3, maxWidth: 0.5, rotation: 0, fontSize: 28, alignment: "center",
  });
  const [previewText, setPreviewText] = useState("Ylang");
  const [isSavingEmbroidery, setIsSavingEmbroidery] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [imageScale, setImageScale] = useState(1);

  const openEmbroideryEditor = useCallback((product: ConfigProduct) => {
    setEmbroideryProduct(product);
    setEmbroideryZone(product.embroideryZone ?? {
      x: 0.5, y: 0.3, maxWidth: 0.5, rotation: 0, fontSize: 28, alignment: "center",
    });
  }, []);

  useEffect(() => {
    if (!embroideryProduct || !imageContainerRef.current) return;
    const img = imageContainerRef.current.querySelector("img");
    if (!img) return;
    const compute = () => {
      const w = imageContainerRef.current?.getBoundingClientRect().width ?? 0;
      const natural = img.naturalWidth || 500;
      setImageScale(w / natural);
    };
    img.addEventListener("load", compute);
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(imageContainerRef.current);
    return () => { ro.disconnect(); img.removeEventListener("load", compute); };
  }, [embroideryProduct]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100) / 100;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100) / 100;
    setEmbroideryZone(prev => ({ ...prev, x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }));
  };

  const handleSaveEmbroidery = async () => {
    if (!embroideryProduct) return;
    setIsSavingEmbroidery(true);
    try {
      const res = await fetch(`/api/admin/configurator/products?id=${embroideryProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embroideryZone }),
      });
      if (res.ok) {
        toast.success("Zone de broderie sauvegardée");
        setProducts(prev => prev.map(p =>
          p.id === embroideryProduct.id ? { ...p, embroideryZone } : p
        ));
        setEmbroideryProduct(prev => prev ? { ...prev, embroideryZone } : prev);
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
    type: "fabric" | "category" | "product";
    id: string | null;
    name: string;
  }>({ isOpen: false, type: "fabric", id: null, name: "" });

  const openDeleteModal = (type: "fabric" | "category" | "product", id: string, name: string) => {
    setDeleteConfirmation({ isOpen: true, type, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    try {
      const url = deleteConfirmation.type === "fabric"
        ? `/api/admin/configurator/fabrics?id=${deleteConfirmation.id}`
        : deleteConfirmation.type === "category"
        ? `/api/admin/configurator/categories?id=${deleteConfirmation.id}`
        : `/api/admin/configurator/products?id=${deleteConfirmation.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        toast.success(
          deleteConfirmation.type === "fabric" ? "Tissu supprimé" :
          deleteConfirmation.type === "category" ? "Catégorie supprimée" :
          "Produit supprimé"
        );
        setDeleteConfirmation({ isOpen: false, type: "fabric", id: null, name: "" });
        fetchData();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fabricsRes, productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/configurator/fabrics"),
        fetch("/api/admin/configurator/products"),
        fetch("/api/admin/configurator/categories")
      ]);
      const fabricsData = await fabricsRes.json();
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setFabrics(fabricsData.fabrics?.map((f: Fabric) => ({ ...f, price: f.price / 100 })) || []);
      setProducts(productsData.products?.map((p: ConfigProduct) => ({ ...p, basePrice: p.basePrice / 100 })) || []);
      setCategories(categoriesData.categories || []);
    } catch (e) {
      console.error("Failed to load configurator data", e);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Derived categories from existing fabrics
  const uniqueFabricCategories = Array.from(new Set(fabrics.map(f => f.category))).filter(Boolean);

  // Filtered lists
  const filteredFabrics = fabrics.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = !selectedCategory || f.category === selectedCategory;
    const matchActive = !showActiveOnly || f.isActive;
    return matchSearch && matchCategory && matchActive;
  });

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchActive = !showActiveOnly || p.isActive;
    return matchSearch && matchActive;
  });

  // Filtered categories
  const filteredCategories = categories.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategorySelection = !selectedCategory || c.id === selectedCategory;
    const matchActive = !showActiveOnly || c.isActive;
    const categoryMatches = matchSearch && matchCategorySelection && matchActive;

    const hasMatchingFabrics = filteredFabrics.some(f => f.category === c.id);

    return categoryMatches || hasMatchingFabrics;
  });

  // ─── Category CRUD ────────────────────────────────────────────────────────────
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.id || !editingCategory?.title) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    const isExisting = categories.some(c => c.id === editingCategory.id);
    const method = isExisting ? "PUT" : "POST";
    const url = isExisting ? `/api/admin/configurator/categories?id=${editingCategory.id}` : "/api/admin/configurator/categories";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingCategory) });
      if (res.ok) {
        toast.success(isExisting ? "Catégorie mise à jour" : "Catégorie créée");
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        fetchData();
      } else {
        const err = await res.json();
        toast.error("Erreur serveur : " + (err.error || "Une erreur est survenue"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  const toggleCategoryActive = async (category: FabricCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/configurator/categories?id=${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive })
      });
      if (res.ok) {
        toast.success(category.isActive ? "Catégorie désactivée" : "Catégorie activée");
        setCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: !c.isActive } : c));
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  const deleteCategory = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openDeleteModal("category", id, name);
  };

  // ─── Fabric CRUD ──────────────────────────────────────────────────────────────
  const handleFabricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFabric?.id || !editingFabric?.name || !editingFabric?.baseColor || !editingFabric?.image || !editingFabric?.category) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    
    setIsSavingFabric(true);
    let finalImageUrl = editingFabric.image as string;
    
    if (editingFabric.image instanceof File) {
      try {
        const file = editingFabric.image;
        const safeName = file.name.replace(/\s/g, "-").toLowerCase();
        const folderId = globalThis.crypto?.randomUUID?.() || Date.now().toString();
        const uploadPath = `configurator/fabrics/${folderId}/${safeName}`;
        
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("path", uploadPath);

        const uploadRes = await fetch("/api/admin/storage/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) throw new Error("Erreur d'upload");
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      } catch (err) {
        toast.error("Erreur lors de l'upload de l'image");
        setIsSavingFabric(false);
        return;
      }
    }

    const isExisting = fabrics.some(f => f.id === editingFabric.id);
    const method = isExisting ? "PUT" : "POST";
    const url = isExisting ? `/api/admin/configurator/fabrics?id=${editingFabric.id}` : "/api/admin/configurator/fabrics";
    const payload = isExisting
      ? { name: editingFabric.name, price: Math.round((editingFabric.price ?? 0) * 100), baseColor: editingFabric.baseColor, image: finalImageUrl, category: editingFabric.category, isActive: editingFabric.isActive }
      : { ...editingFabric, image: finalImageUrl, price: Math.round((editingFabric.price ?? 0) * 100) };
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        toast.success(isExisting ? "Tissu mis à jour" : "Tissu créé");
        setIsFabricModalOpen(false);
        setEditingFabric(null);
        fetchData();
      } else {
        const err = await res.json();
        toast.error("Erreur serveur : " + (err.error || "Une erreur est survenue"));
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSavingFabric(false);
    }
  };

  const toggleFabricActive = async (fabric: Fabric, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/configurator/fabrics?id=${fabric.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !fabric.isActive })
      });
      if (res.ok) {
        toast.success(fabric.isActive ? "Tissu désactivé" : "Tissu activé");
        // Optimistic update
        setFabrics(prev => prev.map(f => f.id === fabric.id ? { ...f, isActive: !f.isActive } : f));
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  const deleteFabric = (id: string, name: string) => {
    openDeleteModal("fabric", id, name);
  };

  // ─── Product CRUD ─────────────────────────────────────────────────────────────
  const handleOpenProductModal = (product?: ConfigProduct) => {
    if (product) {
      setEditingProduct(product);
      setProductImages({
        baseImage: product.baseImage,
        maskImage: product.maskImage,
        colorMaskImage: product.colorMaskImage || null,
      });
    } else {
      setEditingProduct({});
      setProductImages({ baseImage: "", maskImage: "", colorMaskImage: null });
    }
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    const isExisting = products.some(p => p.id === editingProduct.id);
    if (!isExisting && !editingProduct.id) {
      toast.error("L'ID du produit est requis");
      return;
    }

    setIsSavingProduct(true);

    // Upload des images si nécessaire (même pattern que handleFabricSubmit)
    const uploadImage = async (file: string | File | null, layerName: string): Promise<string | null> => {
      if (!file) return null;
      if (typeof file === "string") return file;
      const safeName = file.name.replace(/\s/g, "-").toLowerCase();
      const uploadPath = `configurator/products/${editingProduct.id}/${layerName}-${safeName}`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", uploadPath);
      const res = await fetch("/api/admin/storage/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Erreur upload ${layerName}`);
      const data = await res.json();
      return data.url;
    };

    try {
      const baseImageUrl = await uploadImage(productImages.baseImage, "base");
      const maskImageUrl = await uploadImage(productImages.maskImage, "mask");
      const colorMaskUrl = await uploadImage(productImages.colorMaskImage, "color-mask");

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
      };

      const url = isExisting
        ? `/api/admin/configurator/products?id=${editingProduct.id}`
        : "/api/admin/configurator/products";
      const method = isExisting ? "PUT" : "POST";

      // Pour POST, inclure l'id dans le payload
      const fullPayload = isExisting ? payload : { ...payload, id: editingProduct.id };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload),
      });

      if (res.ok) {
        toast.success(isExisting ? "Produit mis à jour" : "Produit créé");
        setIsProductModalOpen(false);
        setEditingProduct(null);
        fetchData();
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Une erreur est survenue"));
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur réseau");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const toggleProductActive = async (product: ConfigProduct) => {
    try {
      const res = await fetch(`/api/admin/configurator/products?id=${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive })
      });
      if (res.ok) {
        toast.success(product.isActive ? "Produit désactivé" : "Produit activé");
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-ylang-rose h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="from-ylang-rose/20 to-ylang-gold/20 flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br">
              <Palette className="text-ylang-rose h-5 w-5" />
            </div>
            <div>
              <h1 className="text-ylang-charcoal text-2xl font-bold sm:text-3xl">Configurateur</h1>
              <p className="text-ylang-charcoal/60 text-sm">Gérez les tissus et produits du configurateur</p>
            </div>
          </div>
          <div className="text-ylang-charcoal/40 flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-ylang-beige border-ylang-cream/80 rounded-full border px-3 py-1">{fabrics.length} tissus</span>
            <span className="bg-ylang-beige border-ylang-cream/80 rounded-full border px-3 py-1">{fabrics.filter(f => f.isActive).length} actifs</span>
            <span className="bg-ylang-beige border-ylang-cream/80 rounded-full border px-3 py-1">{products.length} produits</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-ylang-beige">
        <button className={`px-4 py-2 font-medium transition-colors ${activeTab === 'fabrics' ? 'text-ylang-rose border-b-2 border-ylang-rose' : 'text-ylang-charcoal/60 hover:text-ylang-charcoal'}`}
          onClick={() => { setActiveTab('fabrics'); setSearchQuery(""); setSelectedCategory(null); }}>
          Tissus & Catégories
        </button>
        <button className={`px-4 py-2 font-medium transition-colors ${activeTab === 'products' ? 'text-ylang-rose border-b-2 border-ylang-rose' : 'text-ylang-charcoal/60 hover:text-ylang-charcoal'}`}
          onClick={() => { setActiveTab('products'); setSearchQuery(""); setSelectedCategory(null); }}>
          Produits ({products.length})
        </button>
        <button className={`flex items-center gap-1.5 px-4 py-2 font-medium transition-colors ${activeTab === 'broderie' ? 'text-ylang-rose border-b-2 border-ylang-rose' : 'text-ylang-charcoal/60 hover:text-ylang-charcoal'}`}
          onClick={() => { setActiveTab('broderie'); setSearchQuery(""); setSelectedCategory(null); }}>
          <Crosshair className="h-4 w-4" />
          Calibrage Broderie
        </button>
      </div>

      {/* Action bar */}
      {activeTab !== 'broderie' && <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex gap-2 lg:flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="text-ylang-charcoal/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'fabrics' ? "Rechercher un tissu..." : "Rechercher un produit..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border-ylang-beige focus:ring-ylang-rose/20 h-10 w-full rounded-xl border bg-white pr-4 pl-9 text-sm outline-none focus:ring-2"
            />
          </div>

          {/* Grid / List toggle */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-0.5">
            <button onClick={() => setViewMode("grid")}
              className={`rounded-lg p-1.5 transition-all ${viewMode === "grid" ? "bg-ylang-rose text-white shadow-sm" : "text-ylang-charcoal/40 hover:text-ylang-charcoal"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={`rounded-lg p-1.5 transition-all ${viewMode === "list" ? "bg-ylang-rose text-white shadow-sm" : "text-ylang-charcoal/40 hover:text-ylang-charcoal"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Category filter (fabrics only) */}
          {activeTab === 'fabrics' && uniqueFabricCategories.length > 0 && (
            <div className="relative">
              <select
                value={selectedCategory || ""}
                onChange={e => setSelectedCategory(e.target.value || null)}
                className="focus:ring-ylang-rose/20 text-ylang-charcoal h-10 cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white pr-8 pl-3 text-sm outline-none focus:ring-2"
              >
                <option value="">Toutes catégories</option>
                {uniqueFabricCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="text-ylang-charcoal/40 pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2" />
            </div>
          )}

          {/* Active-only switch */}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 h-10 select-none">
            <span className="text-sm text-ylang-charcoal/70 whitespace-nowrap">Actifs seulement</span>
            <div
              onClick={() => setShowActiveOnly(prev => !prev)}
              className={`relative h-5 w-9 rounded-full transition-colors ${showActiveOnly ? 'bg-ylang-rose' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${showActiveOnly ? 'left-4' : 'left-0.5'}`} />
            </div>
          </label>

          {/* Add buttons */}
          {activeTab === 'fabrics' && (
            <div className="flex gap-2 items-center">
              <button
                onClick={() => { setEditingCategory({ isActive: true, order: 0 }); setIsCategoryModalOpen(true); }}
                className="flex items-center gap-1.5 rounded-xl border-2 border-ylang-rose bg-white px-3 h-10 text-xs sm:text-sm font-bold text-ylang-rose transition-colors hover:bg-ylang-rose/10 whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Dossier Catégorie
              </button>
              <button
                onClick={() => { setEditingFabric({ isActive: true, price: 0 }); setIsFabricModalOpen(true); }}
                className="bg-ylang-rose hover:bg-ylang-terracotta flex items-center gap-1.5 rounded-xl px-3 h-10 text-xs sm:text-sm font-bold text-white transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Nouveau Tissu
              </button>
            </div>
          )}
        </div>
      </div>}

      {/* ═══ FABRICS & CATEGORIES TAB ═══════════════════════════════════════════════════════ */}
      {activeTab === 'fabrics' && (
        <div className="space-y-12">
          {filteredCategories.length === 0 && filteredFabrics.length === 0 ? (
            <div className="py-20 text-center text-sm text-ylang-charcoal/50">Aucun tissu ou catégorie trouvé</div>
          ) : (
            filteredCategories.map(category => {
              const categoryFabrics = filteredFabrics.filter(f => f.category === category.id);

              return (
                <div key={category.id} className="rounded-3xl border border-ylang-beige bg-white p-6 shadow-sm">
                  <div className="mb-6 flex flex-col justify-between gap-4 border-b border-ylang-beige pb-4 sm:flex-row sm:items-end">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="font-abramo-script text-3xl text-ylang-charcoal">{category.title}</h2>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {category.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      {category.description && <p className="text-ylang-charcoal/60 mt-1 text-sm">{category.description}</p>}
                      <p className="mt-1 text-xs text-ylang-charcoal/40">Prefix: {category.id} • Ordre: {category.order}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button onClick={() => { setEditingFabric({ isActive: true, price: 0, category: category.id }); setIsFabricModalOpen(true); }}
                        className="flex items-center gap-1.5 rounded-xl border border-dashed border-ylang-rose/50 bg-ylang-rose/5 px-3 py-2 text-xs font-bold text-ylang-rose transition-colors hover:bg-ylang-rose/10">
                        <Plus className="h-4 w-4" /> Ajouter tissu
                      </button>
                      <div className="h-6 w-px bg-gray-200"></div>
                      <button onClick={() => { setEditingCategory(category); setIsCategoryModalOpen(true); }}
                        className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200">
                        <Edit className="h-4 w-4" /> Modifier cat.
                      </button>
                      <button onClick={e => toggleCategoryActive(category, e)}
                        title={category.isActive ? "Désactiver catégorie" : "Activer catégorie"}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${category.isActive ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                        {category.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={e => deleteCategory(category.id, category.title, e)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {categoryFabrics.length === 0 ? (
                    <div className="py-8 text-center text-sm text-ylang-charcoal/40">Aucun tissu dans cette catégorie</div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {categoryFabrics.map(fabric => (
                        <div key={fabric.id} className={`rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-md ${fabric.isActive ? 'border-ylang-beige' : 'border-gray-200 opacity-60'}`}>
                          <div className="aspect-square w-full bg-cover bg-center" style={{ backgroundImage: `url(${fabric.image})`, backgroundColor: fabric.baseColor }} />
                          <div className="p-2.5">
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-bold text-ylang-charcoal">{fabric.name}</h3>
                                <span className="text-[10px] font-black text-ylang-rose">{fabric.price.toFixed(2)}€</span>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1">
                              <button onClick={e => toggleFabricActive(fabric, e)} title={fabric.isActive ? "Désactiver" : "Activer"} className={`flex h-7 w-7 items-center justify-center rounded-lg border p-1 transition-colors ${fabric.isActive ? 'border-green-300 bg-green-100 text-green-600 hover:bg-green-200' : 'border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                {fabric.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                              </button>
                              <button onClick={() => { setEditingFabric(fabric); setIsFabricModalOpen(true); }} className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-300 bg-blue-100 p-1 text-blue-600 transition-colors hover:bg-blue-200">
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => deleteFabric(fabric.id, fabric.name)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-300 bg-red-100 p-1 text-red-500 transition-colors hover:bg-red-200">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-ylang-beige overflow-hidden rounded-2xl border shadow-xs">
                      <div className="grid grid-cols-[48px_1fr_100px_80px_140px] items-center gap-4 border-b border-ylang-beige bg-gray-50/50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ylang-charcoal/50">
                        <div>Aperçu</div><div>Nom</div><div>Prix</div><div>Statut</div><div className="text-right">Actions</div>
                      </div>
                      <div className="divide-y divide-ylang-beige/50">
                        {categoryFabrics.map(fabric => (
                          <div key={fabric.id} className={`grid grid-cols-[48px_1fr_100px_80px_140px] items-center gap-4 px-5 py-2.5 transition-colors hover:bg-gray-50/50 ${!fabric.isActive ? 'opacity-60' : ''}`}>
                            <div className="h-10 w-10 rounded-lg bg-cover bg-center border border-ylang-beige" style={{ backgroundImage: `url(${fabric.image})`, backgroundColor: fabric.baseColor }} />
                            <div className="font-medium text-ylang-charcoal truncate">{fabric.name}</div>
                            <div className="text-sm font-bold text-ylang-rose">{fabric.price.toFixed(2)}€</div>
                            <div>
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${fabric.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {fabric.isActive ? 'Actif' : 'Inactif'}
                              </span>
                            </div>
                            <div className="flex justify-end gap-1.5">
                              <button onClick={e => toggleFabricActive(fabric, e)} className={`rounded-lg border p-1.5 transition-colors ${fabric.isActive ? 'border-green-300 bg-green-100 text-green-600 hover:bg-green-200' : 'border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title={fabric.isActive ? "Désactiver" : "Activer"}>
                                {fabric.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </button>
                              <button onClick={() => { setEditingFabric(fabric); setIsFabricModalOpen(true); }} className="rounded-lg border border-blue-300 bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-200">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button onClick={() => deleteFabric(fabric.id, fabric.name)} className="rounded-lg border border-red-300 bg-red-100 p-1.5 text-red-500 transition-colors hover:bg-red-200">
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
            })
          )}

          {/* Uncategorized / Others */}
          {(() => {
            const uncategorized = filteredFabrics.filter(f => !categories.some(c => c.id === f.category));
            if (uncategorized.length === 0) return null;
            return (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-6 opacity-80">
                <h3 className="mb-4 text-xl font-bold text-gray-500">Tissus hors catégories (ou ID de catégorie invalide)</h3>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {uncategorized.map(fabric => (
                      <div key={fabric.id} className={`rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-md ${fabric.isActive ? 'border-ylang-beige' : 'border-gray-200 opacity-60'}`}>
                        <div className="aspect-square w-full bg-cover bg-center" style={{ backgroundImage: `url(${fabric.image})`, backgroundColor: fabric.baseColor }} />
                        <div className="p-2.5">
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-ylang-charcoal">{fabric.name}</h3>
                              <span className="text-[10px] font-black text-ylang-rose">{fabric.price.toFixed(2)}€</span>
                            </div>
                          </div>
                          <p className="mt-1 truncate text-[10px] text-gray-400">Cat: {fabric.category}</p>
                          <div className="mt-2 flex items-center gap-1">
                            <button onClick={e => toggleFabricActive(fabric, e)} title={fabric.isActive ? "Désactiver" : "Activer"} className={`flex h-7 w-7 items-center justify-center rounded-lg border p-1 transition-colors ${fabric.isActive ? 'border-green-300 bg-green-100 text-green-600 hover:bg-green-200' : 'border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                              {fabric.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => { setEditingFabric(fabric); setIsFabricModalOpen(true); }} className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-300 bg-blue-100 p-1 text-blue-600 transition-colors hover:bg-blue-200">
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => deleteFabric(fabric.id, fabric.name)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-300 bg-red-100 p-1 text-red-500 transition-colors hover:bg-red-200">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-gray-200 overflow-hidden rounded-2xl border shadow-xs">
                    <div className="grid grid-cols-[48px_1fr_120px_100px_80px_140px] items-center gap-4 border-b border-gray-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      <div>Aperçu</div><div>Nom</div><div>Catégorie</div><div>Prix</div><div>Statut</div><div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {uncategorized.map(fabric => (
                        <div key={fabric.id} className={`grid grid-cols-[48px_1fr_120px_100px_80px_140px] items-center gap-4 bg-white px-5 py-2.5 transition-colors hover:bg-gray-50/50 ${!fabric.isActive ? 'opacity-60' : ''}`}>
                          <div className="h-10 w-10 rounded-lg bg-cover bg-center border border-gray-200" style={{ backgroundImage: `url(${fabric.image})`, backgroundColor: fabric.baseColor }} />
                          <div className="font-medium text-gray-600 truncate">{fabric.name}</div>
                          <div className="text-sm text-gray-400">{fabric.category}</div>
                          <div className="text-sm font-bold text-gray-500">{fabric.price.toFixed(2)}€</div>
                          <div>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${fabric.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {fabric.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                          <div className="flex justify-end gap-1.5">
                            <button onClick={e => toggleFabricActive(fabric, e)} className={`rounded-lg border p-1.5 transition-colors ${fabric.isActive ? 'border-green-300 bg-green-100 text-green-600 hover:bg-green-200' : 'border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title={fabric.isActive ? "Désactiver" : "Activer"}>
                              {fabric.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button onClick={() => { setEditingFabric(fabric); setIsFabricModalOpen(true); }} className="rounded-lg border border-blue-300 bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-200">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteFabric(fabric.id, fabric.name)} className="rounded-lg border border-red-300 bg-red-100 p-1.5 text-red-500 transition-colors hover:bg-red-200">
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
      {activeTab === 'products' && (
        <div>
          {/* Bouton créer */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => handleOpenProductModal()}
              className="bg-ylang-rose hover:bg-ylang-terracotta flex items-center gap-1.5 rounded-xl px-4 h-10 text-sm font-bold text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nouveau Produit
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map(product => {
              const layerCount = [product.baseImage, product.maskImage, product.colorMaskImage].filter(Boolean).length;
              return (
                <div key={product.id} className={`rounded-3xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${product.isActive ? 'border-ylang-beige' : 'border-gray-200 opacity-70'}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Aperçu calques */}
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f5f1e8]">
                      {product.baseImage && (
                        <img src={product.baseImage} alt={product.name} className="h-full w-full object-cover" />
                      )}
                      {!product.baseImage && (
                        <span className="text-3xl">{product.icon || "?"}</span>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-ylang-charcoal">{product.name}</h3>
                        {product.icon && <span className="text-xl">{product.icon}</span>}
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {product.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      {product.description && <p className="mt-1 text-sm text-ylang-charcoal/60 line-clamp-1">{product.description}</p>}
                      <p className="mt-1 text-sm font-black text-ylang-rose">Prix de base : {product.basePrice.toFixed(2)}€</p>

                      {/* Calques */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-ylang-charcoal/40 font-medium">{layerCount} calque{layerCount > 1 ? 's' : ''} :</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${product.baseImage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                          {product.baseImage ? '✓' : '✗'} Base
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${product.maskImage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                          {product.maskImage ? '✓' : '✗'} Masque tissu
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${product.colorMaskImage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                          {product.colorMaskImage ? '✓' : '○'} Masque couleur
                        </span>
                        {product.embroideryZone && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-ylang-rose/10 px-2 py-0.5 text-[10px] font-bold text-ylang-rose">
                            ✓ Broderie
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t pt-3 sm:border-none sm:pt-0">
                      <button onClick={() => handleOpenProductModal(product)}
                        className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-100 px-3 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-200">
                        <Edit className="h-4 w-4" /> Modifier
                      </button>
                      <button onClick={() => toggleProductActive(product)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${product.isActive ? 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200' : 'border-green-300 bg-green-100 text-green-600 hover:bg-green-200'}`}>
                        {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {product.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button onClick={() => openDeleteModal("product", product.id, product.name)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-300 bg-red-50 text-red-500 transition-colors hover:bg-red-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Miniatures des calques */}
                  {(product.baseImage || product.maskImage || product.colorMaskImage) && (
                    <div className="mt-4 flex gap-2 border-t border-ylang-beige pt-4">
                      {product.baseImage && (
                        <div className="group relative">
                          <img src={product.baseImage} alt="Base" className="h-14 w-14 rounded-xl border border-ylang-beige object-cover bg-[#f5f1e8]" />
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">Base</span>
                        </div>
                      )}
                      {product.maskImage && (
                        <div className="group relative">
                          <img src={product.maskImage} alt="Masque" className="h-14 w-14 rounded-xl border border-ylang-beige object-cover bg-gray-100" />
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">Masque tissu</span>
                        </div>
                      )}
                      {product.colorMaskImage && (
                        <div className="group relative">
                          <img src={product.colorMaskImage} alt="Masque couleur" className="h-14 w-14 rounded-xl border border-blue-200 object-cover bg-gray-100" />
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">Masque couleur</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ BRODERIE TAB ════════════════════════════════════════════════════════ */}
      {activeTab === 'broderie' && (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* ── Liste des produits ── */}
          <div className="w-full shrink-0 space-y-2 lg:w-72">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ylang-charcoal/40">Produits</p>
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => openEmbroideryEditor(product)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                  embroideryProduct?.id === product.id
                    ? 'border-ylang-rose bg-ylang-rose/5'
                    : 'border-ylang-beige bg-white hover:border-ylang-rose/40'
                }`}
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f5f1e8]">
                  {product.baseImage
                    ? <img src={product.baseImage} alt={product.name} className="h-full w-full object-cover" />
                    : <span className="flex h-full w-full items-center justify-center text-2xl">{product.icon}</span>
                  }
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ylang-charcoal">{product.name}</p>
                  {product.embroideryZone
                    ? <p className="text-[11px] text-green-600 font-medium">x:{Math.round(product.embroideryZone.x * 100)}% y:{Math.round(product.embroideryZone.y * 100)}% ✓</p>
                    : <p className="text-[11px] text-ylang-charcoal/40">Non configuré</p>
                  }
                </div>
              </button>
            ))}
          </div>

          {/* ── Éditeur ── */}
          {!embroideryProduct ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ylang-beige bg-white py-24">
              <Crosshair className="mb-3 h-10 w-10 text-ylang-charcoal/20" />
              <p className="text-sm text-ylang-charcoal/40">Sélectionnez un produit pour calibrer sa zone de broderie</p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-6 lg:flex-row">

              {/* Image interactive */}
              <div className="flex-1">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ylang-charcoal/40">
                  Cliquez sur l'image pour positionner la broderie
                </p>
                <div
                  ref={imageContainerRef}
                  className="relative cursor-crosshair overflow-hidden rounded-2xl border border-ylang-beige bg-[#f5f1e8] shadow-sm select-none"
                  onClick={handleImageClick}
                >
                  <img
                    src={embroideryProduct.baseImage}
                    alt={embroideryProduct.name}
                    className="w-full object-contain pointer-events-none"
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
                      <div className="absolute top-1/2 left-0 h-px w-full bg-ylang-rose/80" />
                      <div className="absolute left-1/2 top-0 h-full w-px bg-ylang-rose/80" />
                      <div className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ylang-rose ring-2 ring-white shadow" />
                    </div>
                  </div>

                  {/* Aperçu texte broderie */}
                  {previewText && (
                    <div
                      className="pointer-events-none absolute whitespace-nowrap font-bold text-ylang-rose drop-shadow-sm"
                      style={{
                        left: `${embroideryZone.x * 100}%`,
                        top: `${embroideryZone.y * 100}%`,
                        transform: `translate(-50%, -50%) rotate(${embroideryZone.rotation}deg)`,
                        fontSize: `${embroideryZone.fontSize * imageScale}px`,
                        maxWidth: `${embroideryZone.maxWidth * 100}%`,
                        textAlign: embroideryZone.alignment,
                      }}
                    >
                      {previewText}
                    </div>
                  )}

                  {/* Zone max-width indicator */}
                  <div
                    className="pointer-events-none absolute border border-dashed border-ylang-rose/30"
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
              <div className="flex w-full flex-col gap-5 lg:w-72">
                <div className="rounded-2xl border border-ylang-beige bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-ylang-charcoal">Paramètres</h3>

                  {/* Texte de prévisualisation */}
                  <div className="mb-4">
                    <label className="mb-1 block text-xs font-semibold text-ylang-charcoal/60">Texte de prévisualisation</label>
                    <input
                      type="text"
                      value={previewText}
                      onChange={e => setPreviewText(e.target.value.slice(0, 15))}
                      placeholder="Ylang"
                      className="border-ylang-beige focus:border-ylang-rose w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  {/* Position X */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-xs font-semibold text-ylang-charcoal/60">Position X</label>
                      <span className="text-xs font-bold text-ylang-rose">{Math.round(embroideryZone.x * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="1"
                      value={Math.round(embroideryZone.x * 100)}
                      onChange={e => setEmbroideryZone(prev => ({ ...prev, x: Number(e.target.value) / 100 }))}
                      className="w-full accent-ylang-rose" />
                  </div>

                  {/* Position Y */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-xs font-semibold text-ylang-charcoal/60">Position Y</label>
                      <span className="text-xs font-bold text-ylang-rose">{Math.round(embroideryZone.y * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="1"
                      value={Math.round(embroideryZone.y * 100)}
                      onChange={e => setEmbroideryZone(prev => ({ ...prev, y: Number(e.target.value) / 100 }))}
                      className="w-full accent-ylang-rose" />
                  </div>

                  {/* Rotation */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-ylang-charcoal/60">
                        <RotateCcw className="h-3 w-3" /> Rotation
                      </label>
                      <span className="text-xs font-bold text-ylang-rose">{embroideryZone.rotation}°</span>
                    </div>
                    <input type="range" min="-90" max="90" step="1"
                      value={embroideryZone.rotation}
                      onChange={e => setEmbroideryZone(prev => ({ ...prev, rotation: Number(e.target.value) }))}
                      className="w-full accent-ylang-rose" />
                  </div>

                  {/* Taille de police */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-ylang-charcoal/60">
                        <Type className="h-3 w-3" /> Taille police
                      </label>
                      <span className="text-xs font-bold text-ylang-rose">{embroideryZone.fontSize}px</span>
                    </div>
                    <input type="range" min="10" max="80" step="1"
                      value={embroideryZone.fontSize}
                      onChange={e => setEmbroideryZone(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                      className="w-full accent-ylang-rose" />
                  </div>

                  {/* Largeur max */}
                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-ylang-charcoal/60">
                        <Maximize2 className="h-3 w-3" /> Largeur max
                      </label>
                      <span className="text-xs font-bold text-ylang-rose">{Math.round(embroideryZone.maxWidth * 100)}%</span>
                    </div>
                    <input type="range" min="5" max="100" step="1"
                      value={Math.round(embroideryZone.maxWidth * 100)}
                      onChange={e => setEmbroideryZone(prev => ({ ...prev, maxWidth: Number(e.target.value) / 100 }))}
                      className="w-full accent-ylang-rose" />
                  </div>

                  {/* Alignement */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-ylang-charcoal/60">Alignement</label>
                    <div className="flex gap-2">
                      {(["left", "center", "right"] as const).map(align => (
                        <button
                          key={align}
                          onClick={() => setEmbroideryZone(prev => ({ ...prev, alignment: align }))}
                          className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition-colors ${
                            embroideryZone.alignment === align
                              ? 'border-ylang-rose bg-ylang-rose text-white'
                              : 'border-gray-200 bg-white text-ylang-charcoal/60 hover:border-ylang-rose/40'
                          }`}
                        >
                          {align === "left" ? "◀" : align === "center" ? "◉" : "▶"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Valeurs JSON */}
                <div className="rounded-2xl border border-ylang-beige bg-gray-50 px-4 py-3 font-mono text-[10px] text-ylang-charcoal/50">
                  <pre>{JSON.stringify(embroideryZone, null, 2)}</pre>
                </div>

                <button
                  onClick={handleSaveEmbroidery}
                  disabled={isSavingEmbroidery}
                  className="bg-ylang-rose hover:bg-ylang-terracotta flex items-center justify-center gap-2 rounded-2xl py-3 font-bold text-white transition-colors disabled:opacity-70"
                >
                  {isSavingEmbroidery && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSavingEmbroidery ? "Sauvegarde..." : "Sauvegarder la zone"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ FABRIC MODAL ══════════════════════════════════════════════════════ */}
      <Dialog open={isFabricModalOpen} onOpenChange={setIsFabricModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-ylang-charcoal text-xl font-bold">
              {editingFabric?.id && fabrics.some(f => f.id === editingFabric.id) ? "Modifier le tissu" : "Ajouter un tissu"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFabricSubmit} className="mt-4 space-y-4">
            {!fabrics.some(f => f.id === editingFabric?.id) && (
              <div>
                <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">ID unique (ex: coton-15)</label>
                <input type="text" value={editingFabric?.id || ""} onChange={e => setEditingFabric(prev => ({ ...prev!, id: e.target.value }))}
                  className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full rounded-xl border bg-white px-4 py-2 outline-none focus:ring-2" required />
              </div>
            )}
            <div>
              <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Nom</label>
              <input type="text" value={editingFabric?.name || ""} onChange={e => setEditingFabric(prev => ({ ...prev!, name: e.target.value }))}
                className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full rounded-xl border bg-white px-4 py-2 outline-none focus:ring-2" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Catégorie</label>
                <input type="text" value={editingFabric?.category || ""} onChange={e => setEditingFabric(prev => ({ ...prev!, category: e.target.value }))}
                  placeholder="coton, vichy..." className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full rounded-xl border bg-white px-4 py-2 outline-none focus:ring-2" required />
              </div>
              <div>
                <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Prix (€)</label>
                <div className="relative">
                  <input type="number" step="0.01" min="0" value={editingFabric?.price ?? 0} onChange={e => setEditingFabric(prev => ({ ...prev!, price: parseFloat(e.target.value) || 0 }))}
                    className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full rounded-xl border bg-white py-2 pr-8 pl-4 outline-none focus:ring-2" required />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-bold text-ylang-charcoal/40">€</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Couleur de base</label>
              <div className="flex gap-2">
                <input type="color" value={editingFabric?.baseColor || "#ffffff"} onChange={e => setEditingFabric(prev => ({ ...prev!, baseColor: e.target.value }))}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded border p-1" />
                <input type="text" value={editingFabric?.baseColor || ""} onChange={e => setEditingFabric(prev => ({ ...prev!, baseColor: e.target.value }))}
                  className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full grow rounded-xl border bg-white px-4 py-2 outline-none focus:ring-2" required />
              </div>
            </div>
            <div>
              <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Image (Texture)</label>
              <ImageUpload
                value={editingFabric?.image ? [editingFabric.image] : []}
                onChange={(urls) => setEditingFabric(prev => ({ ...prev!, image: urls[0] || "" }))}
                onRemove={() => setEditingFabric(prev => ({ ...prev!, image: "" }))}
                showPreview={true}
              />
            </div>
            <button type="submit" disabled={isSavingFabric} className="bg-ylang-rose hover:bg-ylang-terracotta mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition-colors disabled:opacity-70">
              {isSavingFabric && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSavingFabric ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ PRODUCT MODAL ═════════════════════════════════════════════════════ */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-ylang-charcoal text-xl font-bold">
              {editingProduct?.id && products.some(p => p.id === editingProduct.id) ? "Modifier le produit" : "Nouveau produit configurateur"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="mt-4 space-y-5">
            {/* ID - seulement pour la création */}
            {!products.some(p => p.id === editingProduct?.id) && (
              <div>
                <label className="text-ylang-charcoal/80 mb-1 block text-sm font-medium">ID unique <span className="text-ylang-rose">*</span></label>
                <input type="text" value={editingProduct?.id || ""} onChange={e => setEditingProduct(prev => ({ ...prev!, id: e.target.value }))}
                  placeholder="ex: gigoteuse-4-saisons"
                  className="border-ylang-beige focus:border-ylang-rose w-full rounded-xl border bg-white px-4 py-2 text-sm outline-none" required />
              </div>
            )}

            {/* Nom */}
            <div>
              <label className="text-ylang-charcoal/80 mb-1 block text-sm font-medium">Nom <span className="text-ylang-rose">*</span></label>
              <input type="text" value={editingProduct?.name || ""} onChange={e => setEditingProduct(prev => ({ ...prev!, name: e.target.value }))}
                className="border-ylang-beige focus:border-ylang-rose w-full rounded-xl border bg-white px-4 py-2 text-sm outline-none" required />
            </div>

            {/* Description */}
            <div>
              <label className="text-ylang-charcoal/80 mb-1 block text-sm font-medium">Description</label>
              <textarea value={editingProduct?.description || ""} onChange={e => setEditingProduct(prev => ({ ...prev!, description: e.target.value }))}
                rows={2} className="border-ylang-beige focus:border-ylang-rose w-full rounded-xl border bg-white px-4 py-2 text-sm outline-none resize-none" />
            </div>

            {/* Prix & Poids */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-ylang-charcoal/80 mb-1 block text-sm font-medium">Prix base (€)</label>
                <input type="number" step="0.01" min="0" value={editingProduct?.basePrice ?? 0}
                  onChange={e => setEditingProduct(prev => ({ ...prev!, basePrice: parseFloat(e.target.value) || 0 }))}
                  className="border-ylang-beige focus:border-ylang-rose w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="text-ylang-charcoal/80 mb-1 block text-sm font-medium">Poids (g)</label>
                <input type="number" min="0" value={editingProduct?.weight ?? 0}
                  onChange={e => setEditingProduct(prev => ({ ...prev!, weight: parseInt(e.target.value) || 0 }))}
                  className="border-ylang-beige focus:border-ylang-rose w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="text-ylang-charcoal/80 mb-1 block text-sm font-medium">Icône (emoji)</label>
                <input type="text" value={editingProduct?.icon || ""} onChange={e => setEditingProduct(prev => ({ ...prev!, icon: e.target.value }))}
                  placeholder="🧸" className="border-ylang-beige focus:border-ylang-rose w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none" />
              </div>
            </div>

            {/* Séparateur calques */}
            <div className="border-t border-ylang-beige pt-4">
              <h3 className="mb-3 text-sm font-bold text-ylang-charcoal">Calques du produit</h3>

              {/* Image de base */}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-ylang-charcoal/80">
                  Image de base <span className="text-ylang-rose">*</span>
                  <span className="ml-1 text-[10px] font-normal text-ylang-charcoal/40">Silhouette avec ombres et reflets</span>
                </label>
                <ImageUpload
                  value={productImages.baseImage ? [productImages.baseImage] : []}
                  onChange={urls => setProductImages(prev => ({ ...prev, baseImage: urls[0] || "" }))}
                  onRemove={() => setProductImages(prev => ({ ...prev, baseImage: "" }))}
                  showPreview={true}
                />
              </div>

              {/* Masque tissu */}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-ylang-charcoal/80">
                  Masque tissu <span className="text-ylang-rose">*</span>
                  <span className="ml-1 text-[10px] font-normal text-ylang-charcoal/40">Image N&B — zone blanche = tissu</span>
                </label>
                <ImageUpload
                  value={productImages.maskImage ? [productImages.maskImage] : []}
                  onChange={urls => setProductImages(prev => ({ ...prev, maskImage: urls[0] || "" }))}
                  onRemove={() => setProductImages(prev => ({ ...prev, maskImage: "" }))}
                  showPreview={true}
                />
              </div>

              {/* Masque couleur (optionnel) */}
              <div>
                <label className="mb-1 block text-sm font-medium text-ylang-charcoal/80">
                  Masque couleur
                  <span className="ml-1 text-[10px] font-normal text-ylang-charcoal/40">Optionnel — zone d&apos;accent coloré</span>
                </label>
                <ImageUpload
                  value={productImages.colorMaskImage ? [productImages.colorMaskImage as string] : []}
                  onChange={urls => setProductImages(prev => ({ ...prev, colorMaskImage: urls[0] || null }))}
                  onRemove={() => setProductImages(prev => ({ ...prev, colorMaskImage: null }))}
                  showPreview={true}
                />
              </div>
            </div>

            <button type="submit" disabled={isSavingProduct}
              className="bg-ylang-rose hover:bg-ylang-terracotta flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition-colors disabled:opacity-70">
              {isSavingProduct && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSavingProduct ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE CONFIRMATION MODAL ══════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <Dialog
            open={deleteConfirmation.isOpen}
            onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}
          >
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <TrashBin className="h-6 w-6" />
                </div>
                <DialogTitle>
                  {deleteConfirmation.type === "fabric" ? "Supprimer le tissu ?" :
                   deleteConfirmation.type === "category" ? "Supprimer la catégorie ?" :
                   "Supprimer le produit ?"}
                </DialogTitle>
                <DialogDescription>
                  Vous êtes sur le point de supprimer{" "}
                  <span className="font-semibold text-ylang-charcoal">&laquo;{deleteConfirmation.name}&raquo;</span>.
                  Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
                  className="cursor-pointer font-medium text-ylang-charcoal/60 hover:bg-ylang-beige/50 hover:text-ylang-charcoal"
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
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

      {/* ═══ CATEGORY MODAL ══════════════════════════════════════════════════════ */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-ylang-charcoal text-xl font-bold">
              {editingCategory?.id && categories.some(c => c.id === editingCategory.id) ? "Modifier la catégorie" : "Ajouter une catégorie"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="mt-4 space-y-4">
            {!categories.some(c => c.id === editingCategory?.id) && (
              <div>
                <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Prefix/ID (ex: coton)</label>
                <input type="text" value={editingCategory?.id || ""} onChange={e => setEditingCategory(prev => ({ ...prev!, id: e.target.value }))}
                  className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full rounded-xl border bg-white px-4 py-2 outline-none focus:ring-2" required />
              </div>
            )}
            <div>
              <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Titre</label>
              <input type="text" value={editingCategory?.title || ""} onChange={e => setEditingCategory(prev => ({ ...prev!, title: e.target.value }))}
                className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full rounded-xl border bg-white px-4 py-2 outline-none focus:ring-2" required />
            </div>
            <div>
              <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Description</label>
              <textarea value={editingCategory?.description || ""} onChange={e => setEditingCategory(prev => ({ ...prev!, description: e.target.value }))}
                className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full min-h-[100px] rounded-xl border bg-white px-4 py-2 outline-none focus:ring-2" />
            </div>
            <div>
              <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Ordre d'affichage</label>
              <input type="number" value={editingCategory?.order ?? 0} onChange={e => setEditingCategory(prev => ({ ...prev!, order: parseInt(e.target.value) || 0 }))}
                className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full rounded-xl border bg-white px-4 py-2 outline-none focus:ring-2" required />
            </div>
            <button type="submit" className="bg-ylang-rose hover:bg-ylang-terracotta mt-4 w-full rounded-xl py-3 font-bold text-white transition-colors">
              Enregistrer
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
