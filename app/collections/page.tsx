"use client";

import { ProductCard } from "@/components/product/product-card";
import { categories, type CatalogProduct } from "@/data/products";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal, X , Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function CollectionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const isDesktop = useMediaQuery("(min-width: 640px)");

  // Charger les produits depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Erreur chargement produits:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error || "Unknown error",
          });
          return;
        }
        
        const data = await response.json();
        if (data.products) {
          setProducts(data.products);
        } else {
          console.warn("No products in response:", data);
        }
      } catch (error) {
        console.error("Erreur chargement produits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Synchroniser avec les paramètres URL
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    const categoryQuery = searchParams.get("category");

    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
    if (categoryQuery && categories.includes(categoryQuery)) {
      setSelectedCategory(categoryQuery);
    }
  }, [searchParams]);

  // Mettre à jour l'URL quand la recherche change
  const updateSearchUrl = (term: string) => {
    setSearchTerm(term);
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.replace(`/collections?${params.toString()}`, { scroll: false });
  };

  // Filtrage et tri des produits avec recherche améliorée
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        (product.description &&
          product.description.toLowerCase().includes(searchLower));
      const matchesCategory =
        selectedCategory === "Tout" || product.category === selectedCategory;
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Tri
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // featured - pas de tri spécifique
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  return (
    <div className="bg-ylang-cream section-padding min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <p className="text-ylang-rose font-body mb-3 text-sm tracking-widest uppercase">
            Nos Collections
          </p>
          <h1 className="text-ylang-charcoal font-display mb-4 text-4xl font-bold lg:text-5xl">
            Créations sur mesure
          </h1>
          <p className="text-ylang-charcoal/60 font-body mx-auto max-w-2xl text-lg">
            Découvrez notre univers de textile personnalisé pour bébé et
            décoration d'intérieur
          </p>
        </motion.div>

        {/* Barre de recherche et filtres */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => updateSearchUrl(e.target.value)}
                className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 font-body text-ylang-charcoal placeholder:text-ylang-charcoal/40 w-full rounded-xl border bg-white py-3 pr-4 pl-12 transition-all outline-none focus:ring-2"
              />
              {searchTerm && (
                <button
                  onClick={() => updateSearchUrl("")}
                  className="absolute top-1/2 right-4 -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Bouton filtres mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="border-ylang-beige hover:border-ylang-rose text-ylang-charcoal font-body flex items-center justify-center gap-2 rounded-xl border bg-white px-6 py-3 transition-colors sm:hidden"
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filtres
            </button>

            {/* Tri */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose/20 font-body text-ylang-charcoal cursor-pointer appearance-none rounded-xl border bg-white py-3 pr-10 pl-4 transition-all outline-none focus:ring-2"
              >
                <option value="featured">Mis en avant</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name">Nom A-Z</option>
              </select>
              <ChevronDown className="text-ylang-charcoal/40 pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2" />
            </div>
          </div>

          {/* Filtres desktop/mobile */}
          <AnimatePresence>
            {(showFilters || isDesktop) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                {/* Catégories */}
                <div className="mb-6">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Catégories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`font-body rounded-full px-4 py-2 text-sm transition-all ${
                          selectedCategory === cat
                            ? "bg-ylang-rose text-white"
                            : "bg-ylang-beige/50 text-ylang-charcoal hover:bg-ylang-beige"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prix */}
                <div>
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Fourchette de prix
                  </h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([0, parseInt(e.target.value)])
                      }
                      className="flex-1"
                    />
                    <span className="min-w-20 text-sm text-gray-600">
                      0 € - {priceRange[1]} €
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Résultats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-ylang-charcoal/60 font-body">
            <span className="text-ylang-charcoal font-semibold">
              {filteredProducts.length}
            </span>{" "}
            produit{filteredProducts.length > 1 ? "s" : ""} trouvé
            {filteredProducts.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Grille de produits */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Message si aucun résultat */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="text-ylang-charcoal font-display mb-2 text-xl font-semibold">
              Aucun produit trouvé
            </h3>
            <p className="text-ylang-charcoal/60 font-body mb-6">
              Essayez de modifier vos filtres ou votre recherche
            </p>
            <button
              onClick={() => {
                updateSearchUrl("");
                setSelectedCategory("Tout");
                setPriceRange([0, 200]);
              }}
              className="bg-ylang-rose hover:bg-ylang-rose/90 font-body rounded-xl px-6 py-3 text-white transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-ylang-cream flex min-h-screen items-center justify-center">
          <div className="text-ylang-charcoal/60 font-body animate-pulse">
            Chargement...
          </div>
        </div>
      }
    >
      <CollectionsContent />
    </Suspense>
  );
}
