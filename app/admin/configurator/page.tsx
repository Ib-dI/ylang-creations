"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Search, ChevronDown, LayoutGrid, List, Palette } from "lucide-react";
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

type ConfigProduct = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string | null;
  baseImage: string;
  maskImage: string;
  colorMaskImage: string | null;
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
  const [activeTab, setActiveTab] = useState<"fabrics" | "products">("fabrics");
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

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<FabricCategory> | null>(null);

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
      alert("Veuillez remplir les champs obligatoires");
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
        alert("Erreur serveur : " + (err.error || "Une erreur est survenue"));
      }
    } catch { alert("Erreur réseau"); }
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

  const deleteCategory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
    try {
      const res = await fetch(`/api/admin/configurator/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Catégorie supprimée"); fetchData(); }
      else toast.error("Erreur lors de la suppression");
    } catch { toast.error("Erreur réseau"); }
  };

  // ─── Fabric CRUD ──────────────────────────────────────────────────────────────
  const handleFabricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFabric?.id || !editingFabric?.name || !editingFabric?.baseColor || !editingFabric?.image || !editingFabric?.category) {
      alert("Veuillez remplir les champs obligatoires");
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
        alert("Erreur lors de l'upload de l'image");
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
        alert("Erreur serveur : " + (err.error || "Une erreur est survenue"));
      }
    } catch { 
      alert("Erreur réseau"); 
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

  const deleteFabric = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce tissu ?")) return;
    try {
      const res = await fetch(`/api/admin/configurator/fabrics?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Tissu supprimé"); fetchData(); }
      else toast.error("Erreur lors de la suppression");
    } catch { toast.error("Erreur réseau"); }
  };

  // ─── Product CRUD ─────────────────────────────────────────────────────────────
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.id || !editingProduct?.name) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }
    const payload = { name: editingProduct.name, description: editingProduct.description, basePrice: Math.round((editingProduct.basePrice ?? 0) * 100) };
    try {
      const res = await fetch(`/api/admin/configurator/products?id=${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Produit mis à jour");
        setIsProductModalOpen(false);
        setEditingProduct(null);
        fetchData();
      } else {
        const err = await res.json();
        alert("Erreur serveur : " + (err.error || "Une erreur est survenue"));
      }
    } catch { alert("Erreur réseau"); }
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
      </div>

      {/* Action bar */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
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
      </div>

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
                      <button onClick={e => deleteCategory(category.id, e)}
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
                              <button onClick={() => deleteFabric(fabric.id)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-300 bg-red-100 p-1 text-red-500 transition-colors hover:bg-red-200">
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
                              <button onClick={() => deleteFabric(fabric.id)} className="rounded-lg border border-red-300 bg-red-100 p-1.5 text-red-500 transition-colors hover:bg-red-200">
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
                            <button onClick={() => deleteFabric(fabric.id)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-300 bg-red-100 p-1 text-red-500 transition-colors hover:bg-red-200">
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
                            <button onClick={() => deleteFabric(fabric.id)} className="rounded-lg border border-red-300 bg-red-100 p-1.5 text-red-500 transition-colors hover:bg-red-200">
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
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className={`flex flex-col gap-4 rounded-3xl border bg-white p-5 shadow-xs transition-all hover:shadow-md sm:flex-row sm:items-center ${product.isActive ? 'border-ylang-beige' : 'border-gray-200 opacity-70'}`}>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f5f1e8]">
                {product.baseImage ? (
                  <img src={product.baseImage} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl">{product.icon}</span>
                )}
              </div>
              <div className="grow">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-ylang-charcoal">{product.name}</h3>
                  {product.icon && <span className="text-xl">{product.icon}</span>}
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {product.description && <p className="mt-1 text-sm text-ylang-charcoal/60 line-clamp-1">{product.description}</p>}
                <p className="mt-1 text-sm font-black text-ylang-rose">Prix de base : {product.basePrice.toFixed(2)}€</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 border-t pt-3 sm:border-none sm:pt-0">
                <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-100 px-3 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-200">
                  <Edit className="h-4 w-4" /> Modifier
                </button>
                <button onClick={() => toggleProductActive(product)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${product.isActive ? 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200' : 'border-green-300 bg-green-100 text-green-600 hover:bg-green-200'}`}>
                  {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {product.isActive ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          ))}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-ylang-charcoal text-xl font-bold">Modifier le produit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Nom</label>
              <input type="text" value={editingProduct?.name || ""} onChange={e => setEditingProduct(prev => ({ ...prev!, name: e.target.value }))}
                className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full rounded-xl border bg-white px-4 py-2 outline-none focus:ring-2" required />
            </div>
            <div>
              <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Description</label>
              <textarea value={editingProduct?.description || ""} onChange={e => setEditingProduct(prev => ({ ...prev!, description: e.target.value }))}
                className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full min-h-[100px] rounded-xl border bg-white px-4 py-2 outline-none focus:ring-2" />
            </div>
            <div>
              <label className="text-ylang-charcoal/80 mb-2 block text-sm font-medium">Prix de base (€)</label>
              <div className="relative">
                <input type="number" step="0.01" min="0" value={editingProduct?.basePrice ?? 0} onChange={e => setEditingProduct(prev => ({ ...prev!, basePrice: parseFloat(e.target.value) || 0 }))}
                  className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 w-full rounded-xl border bg-white py-2 pr-8 pl-4 outline-none focus:ring-2" required />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-bold text-ylang-charcoal/40">€</span>
              </div>
            </div>
            <button type="submit" className="bg-ylang-rose hover:bg-ylang-terracotta mt-4 w-full rounded-xl py-3 font-bold text-white transition-colors">
              Enregistrer
            </button>
          </form>
        </DialogContent>
      </Dialog>

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
