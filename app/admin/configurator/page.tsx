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

type Color = {
  id: string;
  name: string;
  hex: string;
  type: "product" | "embroidery";
  order: number;
  isActive: boolean;
};

export default function ConfiguratorAdmin() {
  const [activeTab, setActiveTab] = useState<"fabrics" | "products" | "broderie" | "palettes">("fabrics");
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

  // Palettes tab
  const [colors, setColors] = useState<Color[]>([]);
  const [colorSubTab, setColorSubTab] = useState<"product" | "embroidery">("product");
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Partial<Color> | null>(null);
  const [isSavingColor, setIsSavingColor] = useState(false);

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
    type: "fabric" | "category" | "product" | "color";
    id: string | null;
    name: string;
  }>({ isOpen: false, type: "fabric", id: null, name: "" });

  const openDeleteModal = (type: "fabric" | "category" | "product" | "color", id: string, name: string) => {
    setDeleteConfirmation({ isOpen: true, type, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    try {
      const url = deleteConfirmation.type === "fabric"
        ? `/api/admin/configurator/fabrics?id=${deleteConfirmation.id}`
        : deleteConfirmation.type === "category"
        ? `/api/admin/configurator/categories?id=${deleteConfirmation.id}`
        : deleteConfirmation.type === "color"
        ? `/api/admin/configurator/colors?id=${deleteConfirmation.id}`
        : `/api/admin/configurator/products?id=${deleteConfirmation.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        toast.success(
          deleteConfirmation.type === "fabric" ? "Tissu supprimé" :
          deleteConfirmation.type === "category" ? "Catégorie supprimée" :
          deleteConfirmation.type === "color" ? "Couleur supprimée" :
          "Produit supprimé"
        );
        setDeleteConfirmation({ isOpen: false, type: "fabric", id: null, name: "" });
        if (deleteConfirmation.type === "color") {
          setColors(prev => prev.filter(c => c.id !== deleteConfirmation.id));
        } else {
          fetchData();
        }
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
      const [fabricsRes, productsRes, categoriesRes, colorsRes] = await Promise.all([
        fetch("/api/admin/configurator/fabrics"),
        fetch("/api/admin/configurator/products"),
        fetch("/api/admin/configurator/categories"),
        fetch("/api/admin/configurator/colors"),
      ]);
      const fabricsData = await fabricsRes.json();
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const colorsData = await colorsRes.json();
      setFabrics(fabricsData.fabrics?.map((f: Fabric) => ({ ...f, price: f.price / 100 })) || []);
      setProducts(productsData.products?.map((p: ConfigProduct) => ({ ...p, basePrice: p.basePrice / 100 })) || []);
      setCategories(categoriesData.categories || []);
      setColors(colorsData.colors || []);
    } catch (e) {
      console.error("Failed to load configurator data", e);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── Color CRUD ───────────────────────────────────────────────────────────────
  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColor?.id || !editingColor?.name || !editingColor?.hex || !editingColor?.type) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setIsSavingColor(true);
    const isExisting = colors.some(c => c.id === editingColor.id);
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
        const data = await res.json();
        toast.success(isExisting ? "Couleur mise à jour" : "Couleur ajoutée");
        setIsColorModalOpen(false);
        setEditingColor(null);
        if (isExisting) {
          setColors(prev => prev.map(c => c.id === data.color.id ? data.color : c));
        } else {
          setColors(prev => [...prev, data.color]);
        }
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
    finally { setIsSavingColor(false); }
  };

  const toggleColorActive = async (color: Color) => {
    try {
      const res = await fetch(`/api/admin/configurator/colors?id=${color.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !color.isActive }),
      });
      if (res.ok) {
        setColors(prev => prev.map(c => c.id === color.id ? { ...c, isActive: !c.isActive } : c));
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch { toast.error("Erreur réseau"); }
  };

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
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-ylang-beige" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-ylang-rose" />
          <Palette className="absolute inset-0 m-auto h-5 w-5 text-ylang-rose/50" />
        </div>
        <p className="text-sm font-medium text-ylang-charcoal/40">Chargement du configurateur…</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-ylang-rose/50">
        <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ylang-rose/20 ring-2 ring-ylang-rose/30">
              <Palette className="h-6 w-6 text-ylang-rose" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Configurateur</h1>
              <p className="text-sm text-white/70">Tissus · Produits · Broderie · Palettes</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-ylang-beige/15 px-3 py-1 text-xs font-semibold text-white/60 ring-1 ring-white/10">{fabrics.length} tissus</span>
            <span className="rounded-full bg-ylang-rose/20 px-3 py-1 text-xs font-bold text-ylang-rose ring-1 ring-ylang-rose/30">{fabrics.filter(f => f.isActive).length} actifs</span>
            <span className="rounded-full bg-ylang-beige/15 px-3 py-1 text-xs font-semibold text-white/60 ring-1 ring-white/10">{products.length} produits</span>
            <span className="rounded-full bg-ylang-beige/15 px-3 py-1 text-xs font-semibold text-white/60 ring-1 ring-white/10">{colors.length} couleurs</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-ylang-beige bg-white p-1 shadow-sm">
        <button
          className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${activeTab === 'fabrics' ? 'bg-ylang-rose text-white shadow-sm' : 'text-ylang-charcoal/50 hover:bg-ylang-beige/60 hover:text-ylang-charcoal'}`}
          onClick={() => { setActiveTab('fabrics'); setSearchQuery(""); setSelectedCategory(null); }}>
          Tissus & Catégories
        </button>
        <button
          className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-ylang-rose text-white shadow-sm' : 'text-ylang-charcoal/50 hover:bg-ylang-beige/60 hover:text-ylang-charcoal'}`}
          onClick={() => { setActiveTab('products'); setSearchQuery(""); setSelectedCategory(null); }}>
          Produits
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] transition-all ${activeTab === 'products' ? 'bg-white/20' : 'bg-ylang-beige text-ylang-charcoal/50'}`}>{products.length}</span>
        </button>
        <button
          className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${activeTab === 'broderie' ? 'bg-ylang-rose text-white shadow-sm' : 'text-ylang-charcoal/50 hover:bg-ylang-beige/60 hover:text-ylang-charcoal'}`}
          onClick={() => { setActiveTab('broderie'); setSearchQuery(""); setSelectedCategory(null); }}>
          <Crosshair className="h-3.5 w-3.5" />
          Broderie
        </button>
        <button
          className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${activeTab === 'palettes' ? 'bg-ylang-rose text-white shadow-sm' : 'text-ylang-charcoal/50 hover:bg-ylang-beige/60 hover:text-ylang-charcoal'}`}
          onClick={() => { setActiveTab('palettes'); setSearchQuery(""); setSelectedCategory(null); }}>
          <Palette className="h-3.5 w-3.5" />
          Palettes
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] transition-all ${activeTab === 'palettes' ? 'bg-white/20' : 'bg-ylang-beige text-ylang-charcoal/50'}`}>{colors.length}</span>
        </button>
      </div>

      {/* ── Action bar ────────────────────────────────────────── */}
      {activeTab !== 'broderie' && activeTab !== 'palettes' && (
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex gap-2 lg:flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="text-ylang-charcoal/30 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === 'fabrics' ? "Rechercher un tissu ou une catégorie…" : "Rechercher un produit…"}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-ylang-beige bg-white pr-4 pl-10 text-sm text-ylang-charcoal shadow-sm outline-none transition-shadow focus:border-ylang-rose/40 focus:shadow-md focus:ring-0"
              />
            </div>
            {/* Grid / List toggle */}
            <div className="flex items-center rounded-xl border border-ylang-beige bg-white p-1 shadow-sm">
              <button onClick={() => setViewMode("grid")}
                className={`rounded-lg p-1.5 transition-all ${viewMode === "grid" ? "bg-ylang-rose text-white shadow-sm" : "text-ylang-charcoal/30 hover:text-ylang-charcoal"}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`rounded-lg p-1.5 transition-all ${viewMode === "list" ? "bg-ylang-rose text-white shadow-sm" : "text-ylang-charcoal/30 hover:text-ylang-charcoal"}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category filter */}
            {activeTab === 'fabrics' && uniqueFabricCategories.length > 0 && (
              <div className="relative">
                <select
                  value={selectedCategory || ""}
                  onChange={e => setSelectedCategory(e.target.value || null)}
                  className="h-11 cursor-pointer appearance-none rounded-xl border border-ylang-beige bg-white pr-8 pl-3 text-sm text-ylang-charcoal shadow-sm outline-none"
                >
                  <option value="">Toutes catégories</option>
                  {uniqueFabricCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-ylang-charcoal/40" />
              </div>
            )}

            {/* Active-only toggle */}
            <label className="flex h-11 cursor-pointer select-none items-center gap-2.5 rounded-xl border border-ylang-beige bg-white px-3.5 shadow-sm">
              <span className="whitespace-nowrap text-sm font-medium text-ylang-charcoal/60">Actifs seulement</span>
              <div
                onClick={() => setShowActiveOnly(prev => !prev)}
                className={`relative h-5 w-9 rounded-full transition-colors ${showActiveOnly ? 'bg-ylang-rose' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${showActiveOnly ? 'left-4' : 'left-0.5'}`} />
              </div>
            </label>

            {/* Add buttons */}
            {activeTab === 'fabrics' && (
              <>
                <button
                  onClick={() => { setEditingCategory({ isActive: true, order: 0 }); setIsCategoryModalOpen(true); }}
                  className="flex h-11 items-center gap-1.5 whitespace-nowrap rounded-xl border-2 border-ylang-charcoal/20 bg-white px-4 text-sm font-bold text-ylang-charcoal transition-colors hover:border-ylang-charcoal hover:bg-ylang-beige/40"
                >
                  <Plus className="h-4 w-4" />
                  Catégorie
                </button>
                <button
                  onClick={() => { setEditingFabric({ isActive: true, price: 0 }); setIsFabricModalOpen(true); }}
                  className="flex h-11 items-center gap-1.5 whitespace-nowrap rounded-xl bg-ylang-rose px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-ylang-terracotta"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau Tissu
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ FABRICS & CATEGORIES TAB ═══════════════════════════════════════════════════════ */}
      {activeTab === 'fabrics' && (
        <div className="space-y-12">
          {filteredCategories.length === 0 && filteredFabrics.length === 0 ? (
            <div className="py-20 text-center text-sm text-ylang-charcoal/50">Aucun tissu ou catégorie trouvé</div>
          ) : (
            filteredCategories.map(category => {
              const categoryFabrics = filteredFabrics.filter(f => f.category === category.id);

              return (
                <div key={category.id} className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition-opacity ${category.isActive ? 'border-ylang-beige' : 'border-dashed border-gray-200 opacity-70'}`}>
                  {/* Category header */}
                  <div className="flex flex-col justify-between gap-4 border-b border-ylang-beige bg-ylang-beige/30 px-6 py-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${category.isActive ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]' : 'bg-gray-300'}`} />
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="font-abramo-script text-2xl text-ylang-charcoal sm:text-3xl">{category.title}</h2>
                          <span className="rounded-full bg-ylang-charcoal/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ylang-charcoal/40">{category.id}</span>
                        </div>
                        {category.description && <p className="mt-0.5 text-sm text-ylang-charcoal/50">{category.description}</p>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button onClick={() => { setEditingFabric({ isActive: true, price: 0, category: category.id }); setIsFabricModalOpen(true); }}
                        className="flex items-center gap-1.5 rounded-xl border border-ylang-rose/30 bg-ylang-rose/8 px-3 py-1.5 text-xs font-bold text-ylang-rose transition-all hover:bg-ylang-rose/15">
                        <Plus className="h-3.5 w-3.5" /> Tissu
                      </button>
                      <button onClick={() => { setEditingCategory(category); setIsCategoryModalOpen(true); }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-ylang-charcoal/40 shadow-sm transition-colors hover:bg-ylang-beige hover:text-ylang-charcoal">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={e => toggleCategoryActive(category, e)}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${category.isActive ? 'bg-white text-ylang-charcoal/40 shadow-sm hover:bg-ylang-beige' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                        {category.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={e => deleteCategory(category.id, category.title, e)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-red-400 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">

                  {categoryFabrics.length === 0 ? (
                    <div className="py-12 text-center text-sm text-ylang-charcoal/30">
                      <p className="font-medium">Aucun tissu dans cette catégorie</p>
                      <button onClick={() => { setEditingFabric({ isActive: true, price: 0, category: category.id }); setIsFabricModalOpen(true); }}
                        className="mt-2 text-xs font-bold text-ylang-rose underline-offset-2 hover:underline">
                        + Ajouter le premier tissu
                      </button>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {categoryFabrics.map(fabric => (
                        <div key={fabric.id} className={`group relative overflow-hidden rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-0.5 ${fabric.isActive ? 'border-ylang-beige' : 'border-dashed border-gray-200 opacity-55'}`}>
                          {/* Texture image */}
                          <div className="aspect-square w-full bg-cover bg-center" style={{ backgroundImage: `url(${fabric.image})`, backgroundColor: fabric.baseColor }} />
                          {/* Hover overlay actions */}
                          <div className="absolute inset-0 flex items-end justify-center gap-1.5 bg-ylang-charcoal/20 p-3 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                            <button onClick={e => toggleFabricActive(fabric, e)} title={fabric.isActive ? "Désactiver" : "Activer"}
                              className={`flex h-8 w-8 items-center justify-center rounded-xl shadow transition-colors ${fabric.isActive ? 'bg-white/90 text-ylang-charcoal hover:bg-white' : 'bg-green-400/90 text-white hover:bg-green-400'}`}>
                              {fabric.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => { setEditingFabric(fabric); setIsFabricModalOpen(true); }}
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-ylang-charcoal shadow transition-colors hover:bg-white">
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => deleteFabric(fabric.id, fabric.name)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/90 text-white shadow transition-colors hover:bg-red-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {/* Info bar */}
                          <div className="border-t border-ylang-beige bg-white px-2.5 py-2">
                            <h3 className="truncate text-xs font-bold text-ylang-charcoal">{fabric.name}</h3>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <div className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: fabric.baseColor }} />
                              <span className="font-mono text-[16px] font-black text-ylang-rose">{fabric.price.toFixed(2)}€</span>
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
                  </div>{/* /p-6 */}
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
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-medium text-ylang-charcoal/50">{filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}</p>
            <button
              onClick={() => handleOpenProductModal()}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-ylang-rose px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-ylang-terracotta"
            >
              <Plus className="h-4 w-4" />
              Nouveau Produit
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredProducts.map(product => {
              const layerCount = [product.baseImage, product.maskImage, product.colorMaskImage].filter(Boolean).length;
              return (
                <div key={product.id} className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${product.isActive ? 'border-ylang-beige' : 'border-dashed border-gray-200 opacity-65'}`}>
                  {/* Status accent stripe */}
                  <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${product.isActive ? 'bg-green-400' : 'bg-gray-300'}`} />

                  <div className="flex flex-col gap-4 p-5 pl-6 sm:flex-row sm:items-center">
                    {/* Aperçu */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-ylang-beige/60 ring-1 ring-ylang-beige">
                      {product.baseImage
                        ? <img src={product.baseImage} alt={product.name} className="h-full w-full object-cover" />
                        : <span className="flex h-full w-full items-center justify-center text-3xl">{product.icon || "?"}</span>
                      }
                      {/* Layer count badge */}
                      <div className="absolute bottom-1 right-1 rounded-md bg-ylang-charcoal/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {layerCount}L
                      </div>
                    </div>

                    {/* Infos */}
                    <div className="grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-ylang-charcoal">{product.name}</h3>
                        {product.icon && <span className="text-lg leading-none">{product.icon}</span>}
                      </div>
                      {product.description && <p className="mt-0.5 line-clamp-1 text-sm text-ylang-charcoal/50">{product.description}</p>}
                      <p className="mt-1 text-sm font-black text-ylang-rose">{product.basePrice.toFixed(2)} €</p>

                      {/* Calques badges */}
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${product.baseImage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                          {product.baseImage ? '✓' : '✗'} Base
                        </span>
                        <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${product.maskImage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                          {product.maskImage ? '✓' : '✗'} Masque
                        </span>
                        <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${product.colorMaskImage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                          {product.colorMaskImage ? '✓' : '○'} Couleur
                        </span>
                        {product.embroideryZone && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-ylang-rose/10 px-1.5 py-0.5 text-[10px] font-bold text-ylang-rose">
                            ✓ Broderie
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Miniatures calques */}
                    {(product.baseImage || product.maskImage || product.colorMaskImage) && (
                      <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
                        {product.baseImage && (
                          <div className="group/thumb relative">
                            <img src={product.baseImage} alt="Base" className="h-12 w-12 rounded-xl border border-ylang-beige object-cover bg-ylang-beige/60" />
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ylang-charcoal px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover/thumb:opacity-100">Base</span>
                          </div>
                        )}
                        {product.maskImage && (
                          <div className="group/thumb relative">
                            <img src={product.maskImage} alt="Masque" className="h-12 w-12 rounded-xl border border-ylang-beige object-cover bg-gray-100" />
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ylang-charcoal px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover/thumb:opacity-100">Masque</span>
                          </div>
                        )}
                        {product.colorMaskImage && (
                          <div className="group/thumb relative">
                            <img src={product.colorMaskImage} alt="Couleur" className="h-12 w-12 rounded-xl border border-blue-200 object-cover bg-gray-100" />
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ylang-charcoal px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover/thumb:opacity-100">Couleur</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5 border-t pt-3 sm:border-none sm:pt-0">
                      <button onClick={() => handleOpenProductModal(product)}
                        className="flex h-9 items-center gap-1.5 rounded-xl bg-ylang-beige px-3 text-sm font-bold text-ylang-charcoal transition-colors hover:bg-ylang-beige/80">
                        <Edit className="h-3.5 w-3.5" /> Modifier
                      </button>
                      <button onClick={() => toggleProductActive(product)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${product.isActive ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                        {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => openDeleteModal("product", product.id, product.name)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600">
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
      {activeTab === 'broderie' && (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* ── Liste des produits ── */}
          <div className="w-full shrink-0 space-y-1.5 lg:w-72">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-ylang-charcoal/30">Sélectionner un produit</p>
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => openEmbroideryEditor(product)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                  embroideryProduct?.id === product.id
                    ? 'border-ylang-rose bg-ylang-rose/5 shadow-sm'
                    : 'border-ylang-beige bg-white hover:border-ylang-rose/30 hover:shadow-sm'
                }`}
              >
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-ylang-beige/60 ring-1 ring-ylang-beige">
                  {product.baseImage
                    ? <img src={product.baseImage} alt={product.name} className="h-full w-full object-cover" />
                    : <span className="flex h-full w-full items-center justify-center text-xl">{product.icon}</span>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ylang-charcoal">{product.name}</p>
                  {product.embroideryZone
                    ? <p className="mt-0.5 text-[10px] font-semibold text-green-600">✓ Calibré ({Math.round(product.embroideryZone.x * 100)}%, {Math.round(product.embroideryZone.y * 100)}%)</p>
                    : <p className="mt-0.5 text-[10px] text-ylang-charcoal/35">Non configuré</p>
                  }
                </div>
                {embroideryProduct?.id === product.id && (
                  <div className="h-2 w-2 shrink-0 rounded-full bg-ylang-rose" />
                )}
              </button>
            ))}
          </div>

          {/* ── Éditeur ── */}
          {!embroideryProduct ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ylang-beige bg-white py-24">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ylang-beige/60">
                <Crosshair className="h-8 w-8 text-ylang-charcoal/20" />
              </div>
              <p className="font-medium text-ylang-charcoal/40">Sélectionnez un produit</p>
              <p className="mt-1 text-sm text-ylang-charcoal/25">pour calibrer sa zone de broderie</p>
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
              <div className="flex w-full flex-col gap-4 lg:w-72">
                <div className="rounded-2xl border border-ylang-beige bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-ylang-charcoal/40">Paramètres</h3>

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
                <div className="rounded-xl border border-ylang-beige bg-ylang-beige/30 px-4 py-3 font-mono text-[9px] text-ylang-charcoal/40">
                  <pre>{JSON.stringify(embroideryZone, null, 2)}</pre>
                </div>

                <button
                  onClick={handleSaveEmbroidery}
                  disabled={isSavingEmbroidery}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-ylang-charcoal py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-ylang-charcoal/80 disabled:opacity-70"
                >
                  {isSavingEmbroidery && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSavingEmbroidery ? "Sauvegarde…" : "Sauvegarder la zone"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ PALETTES TAB ════════════════════════════════════════════════════════ */}
      {activeTab === 'palettes' && (
        <div className="space-y-5">
          {/* Sub-tabs + CTA */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 self-start rounded-2xl border border-ylang-beige bg-white p-1 shadow-sm">
              {(["product", "embroidery"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setColorSubTab(type)}
                  className={`rounded-xl px-5 py-2 text-sm font-bold transition-all ${
                    colorSubTab === type
                      ? "bg-ylang-charcoal text-white shadow-sm"
                      : "text-ylang-charcoal/50 hover:bg-ylang-beige/60 hover:text-ylang-charcoal"
                  }`}
                >
                  {type === "product" ? "Couleurs Produit" : "Fils Broderie"}
                  <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${colorSubTab === type ? 'bg-white/20' : 'bg-ylang-beige text-ylang-charcoal/50'}`}>
                    {colors.filter(c => c.type === type).length}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setEditingColor({ type: colorSubTab, isActive: true, order: colors.filter(c => c.type === colorSubTab).length });
                setIsColorModalOpen(true);
              }}
              className="flex h-10 items-center gap-2 self-start rounded-xl bg-ylang-rose px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-ylang-terracotta sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Ajouter une couleur
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-ylang-charcoal/50">
            {colorSubTab === "product"
              ? "Couleurs proposées pour personnaliser les zones colorées des produits (masque couleur)."
              : "Couleurs de fil proposées pour la broderie personnalisée."}
          </p>

          {/* Color grid */}
          {colors.filter(c => c.type === colorSubTab).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ylang-beige bg-white py-20 text-center">
              <Palette className="mb-3 h-10 w-10 text-ylang-charcoal/20" />
              <p className="text-sm font-medium text-ylang-charcoal/40">Aucune couleur pour l&apos;instant</p>
              <button
                onClick={() => { setEditingColor({ type: colorSubTab, isActive: true, order: 0 }); setIsColorModalOpen(true); }}
                className="mt-3 text-xs font-bold text-ylang-rose underline-offset-2 hover:underline"
              >
                + Ajouter la première couleur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {colors.filter(c => c.type === colorSubTab).sort((a, b) => a.order - b.order).map(color => (
                <div
                  key={color.id}
                  className={`group flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    color.isActive ? "border-ylang-beige bg-white" : "border-dashed border-gray-200 bg-gray-50/60 opacity-55"
                  }`}
                >
                  {/* Swatch avec fond damier pour couleurs claires */}
                  <div
                    className="h-12 w-12 rounded-full border-4 border-white shadow-lg ring-1 ring-black/10"
                    style={{
                      backgroundColor: color.hex,
                      backgroundImage: color.hex?.toLowerCase() === '#ffffff' || color.hex?.toLowerCase() === '#fff'
                        ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'%23ccc\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'%23ccc\'/%3E%3C/svg%3E")'
                        : undefined,
                    }}
                  />
                  <p className="max-w-full truncate text-center text-[11px] font-bold leading-tight text-ylang-charcoal">{color.name}</p>
                  <p className="font-mono text-[9px] uppercase text-ylang-charcoal/35">{color.hex}</p>

                  {/* Actions on hover */}
                  <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => toggleColorActive(color)}
                      className="rounded-lg p-1 text-ylang-charcoal/40 transition-colors hover:bg-ylang-beige hover:text-ylang-charcoal"
                    >
                      {color.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => { setEditingColor(color); setIsColorModalOpen(true); }}
                      className="rounded-lg p-1 text-ylang-charcoal/40 transition-colors hover:bg-ylang-beige hover:text-ylang-charcoal"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => openDeleteModal("color", color.id, color.name)}
                      className="rounded-lg p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
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

      {/* ═══ FABRIC MODAL ══════════════════════════════════════════════════════ */}
      <Dialog open={isFabricModalOpen} onOpenChange={setIsFabricModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-ylang-charcoal">
              {editingFabric?.id && fabrics.some(f => f.id === editingFabric.id) ? "Modifier le tissu" : "Nouveau tissu"}
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
            <button type="submit" disabled={isSavingFabric} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ylang-charcoal py-3 font-bold text-white transition-colors hover:bg-ylang-charcoal/80 disabled:opacity-70">
              {isSavingFabric && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSavingFabric ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ PRODUCT MODAL ═════════════════════════════════════════════════════ */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[580px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-ylang-charcoal">
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ylang-charcoal py-3 font-bold text-white transition-colors hover:bg-ylang-charcoal/80 disabled:opacity-70">
              {isSavingProduct && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSavingProduct ? "Enregistrement…" : "Enregistrer"}
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
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-500 ring-4 ring-red-50">
                  <TrashBin className="h-6 w-6" />
                </div>
                <DialogTitle className="text-lg font-black text-ylang-charcoal">
                  {deleteConfirmation.type === "fabric" ? "Supprimer ce tissu ?" :
                   deleteConfirmation.type === "category" ? "Supprimer cette catégorie ?" :
                   deleteConfirmation.type === "color" ? "Supprimer cette couleur ?" :
                   "Supprimer ce produit ?"}
                </DialogTitle>
                <DialogDescription className="text-sm text-ylang-charcoal/50">
                  Vous êtes sur le point de supprimer{" "}
                  <span className="font-bold text-ylang-charcoal">&laquo;{deleteConfirmation.name}&raquo;</span>.
                  {" "}Cette action est irréversible.
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

      {/* ═══ COLOR MODAL ═════════════════════════════════════════════════════════ */}
      <Dialog open={isColorModalOpen} onOpenChange={open => { setIsColorModalOpen(open); if (!open) setEditingColor(null); }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-ylang-charcoal">
              {editingColor?.id && colors.some(c => c.id === editingColor.id) ? "Modifier la couleur" : "Ajouter une couleur"}
            </DialogTitle>
            <DialogDescription className="text-sm text-ylang-charcoal/40">
              {editingColor?.type === "product" ? "Palette personnalisation produit" : "Palette fil de broderie"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleColorSubmit} className="mt-4 space-y-4">
            {/* Aperçu grand format */}
            {editingColor?.hex && (
              <div className="flex items-center gap-4 rounded-2xl bg-ylang-beige/40 p-4">
                <div
                  className="h-16 w-16 shrink-0 rounded-2xl border-4 border-white shadow-lg ring-1 ring-black/10"
                  style={{ backgroundColor: editingColor.hex }}
                />
                <div>
                  <p className="font-black text-ylang-charcoal">{editingColor.name || "Aperçu"}</p>
                  <p className="font-mono text-sm text-ylang-charcoal/50">{editingColor.hex?.toUpperCase()}</p>
                </div>
              </div>
            )}

            {!colors.some(c => c.id === editingColor?.id) && (
              <div>
                <label className="mb-1.5 block text-sm font-bold text-ylang-charcoal/70">ID unique</label>
                <input
                  type="text"
                  value={editingColor?.id || ""}
                  onChange={e => setEditingColor(prev => ({ ...prev!, id: e.target.value }))}
                  placeholder="ex: rose-poudre"
                  className="w-full rounded-xl border border-ylang-beige bg-white px-4 py-2.5 text-sm outline-none transition focus:border-ylang-rose/50 focus:shadow-sm"
                  required
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-ylang-charcoal/70">Nom affiché</label>
                <input
                  type="text"
                  value={editingColor?.name || ""}
                  onChange={e => setEditingColor(prev => ({ ...prev!, name: e.target.value }))}
                  placeholder="Rose Poudré"
                  className="w-full rounded-xl border border-ylang-beige bg-white px-4 py-2.5 text-sm outline-none transition focus:border-ylang-rose/50 focus:shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-ylang-charcoal/70">Ordre</label>
                <input
                  type="number"
                  value={editingColor?.order ?? 0}
                  onChange={e => setEditingColor(prev => ({ ...prev!, order: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-xl border border-ylang-beige bg-white px-4 py-2.5 text-sm outline-none transition focus:border-ylang-rose/50 focus:shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ylang-charcoal/70">Couleur</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={editingColor?.hex || "#000000"}
                  onChange={e => setEditingColor(prev => ({ ...prev!, hex: e.target.value }))}
                  className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-ylang-beige bg-white p-1"
                />
                <input
                  type="text"
                  value={editingColor?.hex || ""}
                  onChange={e => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) setEditingColor(prev => ({ ...prev!, hex: val }));
                  }}
                  placeholder="#E8B4B8"
                  className="flex-1 rounded-xl border border-ylang-beige bg-white px-4 py-2.5 font-mono text-sm uppercase outline-none transition focus:border-ylang-rose/50 focus:shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-ylang-beige bg-white px-4 py-3">
              <label className="text-sm font-bold text-ylang-charcoal/70">Visible (active)</label>
              <div
                onClick={() => setEditingColor(prev => ({ ...prev!, isActive: !prev?.isActive }))}
                className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors ${editingColor?.isActive ? "bg-ylang-rose" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${editingColor?.isActive ? "left-6" : "left-1"}`} />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSavingColor}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-ylang-charcoal py-3.5 font-bold text-white transition-colors hover:bg-ylang-charcoal/80 disabled:opacity-70"
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
            <DialogTitle className="text-xl font-black text-ylang-charcoal">
              {editingCategory?.id && categories.some(c => c.id === editingCategory.id) ? "Modifier la catégorie" : "Nouvelle catégorie"}
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
            <button type="submit" className="mt-4 w-full rounded-xl bg-ylang-charcoal py-3 font-bold text-white transition-colors hover:bg-ylang-charcoal/80">
              Enregistrer
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
