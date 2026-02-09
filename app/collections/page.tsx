"use client";

import { ProductCard } from "@/components/product/product-card";
import { Slider } from "@/components/ui/slider";
import { categories, type CatalogProduct } from "@/data/products";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .trim();
};

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
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyCustomizable, setOnlyCustomizable] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Ouvrir les filtres par défaut sur desktop
  useEffect(() => {
    if (isDesktop) {
      setShowFilters(true);
    }
  }, [isDesktop]);

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

  // Configuration du mapping des catégories URL vers les catégories d'affichage
  const categoryMapping: Record<string, string> = useMemo(
    () => ({
      // La Chambre
      chambre: "La chambre",
      "la-chambre": "La chambre",
      "coussin-musical": "La chambre",
      couverture: "La chambre",
      "draps-lit": "La chambre",
      "gigoteuse-legere-0-3": "La chambre",
      "gigoteuse-legere-3-6": "La chambre",
      "gigoteuse-legere-6-12": "La chambre",
      "gigoteuse-legere-12-24": "La chambre",
      "gigoteuse-molletonnee-0-3": "La chambre",
      "gigoteuse-molletonnee-3-6": "La chambre",
      "gigoteuse-molletonnee-6-12": "La chambre",
      "gigoteuse-molletonnee-12-24": "La chambre",
      "housse-matelas": "La chambre",
      "lange-carre": "La chambre",
      "mobile-lit": "La chambre",
      "tour-de-lit": "La chambre",

      // La Toilette
      toilette: "La Toilette",
      "la-toilette": "La Toilette",
      bavoir: "La Toilette",
      "cape-de-bain": "La Toilette",
      "gant-toilette": "La Toilette",
      "serviette-toilette": "La Toilette",

      // Linge de naissance
      "linge-naissance": "Linge de naissance",
      "linge-de-naissance": "Linge de naissance",
      pyjama: "Linge de naissance",
      chaussons: "Linge de naissance",
      pantalon: "Linge de naissance",
      "gilet-cache-coeur": "Linge de naissance",
      bloomer: "Linge de naissance",
      "robe-chasuble": "Linge de naissance",

      // Accessoires
      accessoires: "Accessoires",
      "anneaux-dentition": "Accessoires",
      "attache-tetine": "Accessoires",
      "brosse-cheveux": "Accessoires",

      // Bagageries
      bagageries: "Bagageries/promenade",
      "bagageries-promenade": "Bagageries/promenade",
      bagageriespromenade: "Bagageries/promenade",
      valisette: "Bagageries/promenade",
      vanity: "Bagageries/promenade",
      "sac-a-langer": "Bagageries/promenade",
      "sac-dos-maternelle": "Bagageries/promenade",
      "matelas-langer-nomade": "Bagageries/promenade",
      "protege-carnet-sante": "Bagageries/promenade",
      "protege-livret-famille": "Bagageries/promenade",
      "protege-passeport": "Bagageries/promenade",
      "trousse-toilette": "Bagageries/promenade",

      // Jeux
      jeux: "Les jeux",
      "les-jeux": "Les jeux",
      poupees: "Les jeux",
      bebes: "Les jeux",
      "accessoires-jeux": "Les jeux",
    }),
    [],
  );

  // Synchroniser avec les paramètres URL
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    const categoryQuery = searchParams.get("category");
    const filterQuery = searchParams.get("filter");
    const customizableQuery = searchParams.get("customizable");

    // 0. Gérer les flags (Nouveautés, Personnalisables)
    setOnlyNew(filterQuery === "new");
    setOnlyCustomizable(customizableQuery === "true");

    // Helper pour formater le nom de la catégorie (ex: "coussin-musical" -> "Coussin musical")
    const formatCategoryName = (slug: string) => {
      // Cas spéciaux
      if (slug === "sac-dos-maternelle") return "Sac à dos";
      if (slug === "gilet-cache-coeur") return "Gilet cache-cœur";
      if (slug === "protege-carnet-sante") return "Protège carnet de santé";

      return slug
        .split("-")
        .map((word, index) =>
          index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
        )
        .join(" ");
    };

    // 1. Gérer la catégorie parente
    if (categoryQuery) {
      const mappedCategory = categoryMapping[categoryQuery];
      if (mappedCategory) {
        setSelectedCategory(mappedCategory);
      } else {
        const foundCategory = categories.find(
          (cat) => slugify(cat) === slugify(categoryQuery),
        );
        setSelectedCategory(foundCategory || "Tout");
      }
    } else {
      setSelectedCategory("Tout");
    }

    // 2. Gérer le terme de recherche
    // IMPORTANT: On vérifie !== null pour accepter la chaîne vide "" (recherche réinitialisée)
    if (searchQuery !== null) {
      setSearchTerm(searchQuery);
    } else if (categoryQuery) {
      // Si on a une catégorie mais pas de recherche, on regarde si c'est une sous-catégorie
      const isMainCategorySlug = [
        "chambre",
        "la-chambre",
        "toilette",
        "la-toilette",
        "linge-naissance",
        "linge-de-naissance",
        "accessoires",
        "bagageries",
        "bagageries-promenade",
        "bagageriespromenade",
        "jeux",
        "les-jeux",
      ].includes(categoryQuery);

      if (!isMainCategorySlug) {
        setSearchTerm(formatCategoryName(categoryQuery));
      } else {
        setSearchTerm("");
      }
    } else {
      setSearchTerm("");
    }
  }, [searchParams, categoryMapping]);

  // Mettre à jour l'URL quand la recherche change
  const updateSearchUrl = (term: string) => {
    setSearchTerm(term);
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      // On garde le paramètre vide pour signaler une volonté de recherche vide
      // et éviter que l'effet category n'écrase ce choix
      params.set("search", "");
    }
    router.replace(`/collections?${params.toString()}`, { scroll: false });
  };

  // Réinitialiser tous les filtres
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Tout");
    setPriceRange([0, 200]);
    setOnlyNew(false);
    setOnlyCustomizable(false);
    router.replace("/collections", { scroll: false });
  };

  // Mettre à jour la catégorie et l'URL
  const updateCategory = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());

    if (category === "Tout") {
      params.delete("category");
    } else {
      const slug = slugify(category);
      params.set("category", slug);
    }

    router.replace(`/collections?${params.toString()}`, { scroll: false });
  };

  // Mettre à jour les flags dans l'URL
  const updateFlag = (key: string, value: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, key === "filter" ? "new" : "true");
    } else {
      params.delete(key);
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
        selectedCategory === "Tout" ||
        product.category === selectedCategory ||
        slugify(product.category) === slugify(selectedCategory) ||
        // Gérer les catégories parentes (ex: 'chambre' matches 'Coussin musical')
        (selectedCategory === "chambre" &&
          [
            "coussin",
            "couverture",
            "draps",
            "gigoteuse",
            "housse-matelas",
            "mobile-lit",
            "tour-de-lit",
            "chambre",
            "lit",
            "sommeil",
          ].some(
            (sub) =>
              slugify(product.category).includes(sub) ||
              slugify(product.name).includes(sub),
          )) ||
        (selectedCategory === "toilette" &&
          ["bavoir", "cape", "gant", "serviette", "bain", "toilette"].some(
            (sub) =>
              slugify(product.category).includes(sub) ||
              slugify(product.name).includes(sub),
          ));

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesNew = !onlyNew || product.new === true;
      const matchesCustomizable =
        !onlyCustomizable || product.customizable === true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesNew &&
        matchesCustomizable
      );
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
  }, [
    products,
    searchTerm,
    selectedCategory,
    priceRange,
    sortBy,
    onlyNew,
    onlyCustomizable,
  ]);

  return (
    <div className="bg-ylang-terracotta/50 section-padding min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <p className="text-ylang-rose font-abramo mb-3 text-sm tracking-widest uppercase font-semibold">
            Nos Collections
          </p>
          <h1 className="text-ylang-charcoal font-abramo-script mb-4 text-4xl lg:text-5xl">
            {searchTerm
              ? searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)
              : selectedCategory === "Tout"
                ? "Créations sur mesure"
                : selectedCategory}
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
              <div className="absolute top-1/2 left-4 -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une création..."
                value={searchTerm}
                onChange={(e) => updateSearchUrl(e.target.value)}
                className="focus:border-ylang-rose focus:ring-ylang-rose/10 font-body text-ylang-charcoal border-ylang-rose w-full rounded-2xl border bg-white py-3.5 pr-12 pl-12 transition-all outline-none placeholder:text-gray-400 focus:ring-4"
              />
              {searchTerm && (
                <button
                  onClick={() => updateSearchUrl("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Bouton filtres Desktop/Mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`font-body border-ylang-rose flex items-center justify-center gap-2.5 rounded-2xl border bg-white px-6 py-3.5 text-sm font-medium transition-all ${
                  showFilters
                    ? "border-ylang-rose bg-ylang-rose/5 text-ylang-rose"
                    : "text-ylang-charcoal"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>{showFilters ? "Masquer les filtres" : "Filtres"}</span>
                {(selectedCategory !== "Tout" ||
                  priceRange[0] !== 0 ||
                  priceRange[1] !== 200 ||
                  onlyNew ||
                  onlyCustomizable) && (
                  <span className="bg-ylang-rose flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
                    {(selectedCategory !== "Tout" ? 1 : 0) +
                      (priceRange[0] !== 0 || priceRange[1] !== 200 ? 1 : 0) +
                      (onlyNew ? 1 : 0) +
                      (onlyCustomizable ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Tri */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="focus:border-ylang-rose focus:ring-ylang-rose/10 font-body text-ylang-charcoal border-ylang-rose cursor-pointer appearance-none rounded-2xl border bg-white py-3.5 pr-10 pl-6 text-sm font-medium transition-all outline-none focus:ring-4"
                >
                  <option value="featured">Mis en avant</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="name">Nom A-Z</option>
                </select>
                <ChevronDown className="text-ylang-charcoal/40 pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Filtres desktop/mobile */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="border-ylang-rose overflow-hidden rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  {/* Catégories */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-semibold text-gray-900">
                        Catégories
                      </h3>
                      {selectedCategory !== "Tout" && (
                        <button
                          onClick={() => updateCategory("Tout")}
                          className="text-ylang-rose hover:text-ylang-rose/80 font-body text-xs font-medium underline underline-offset-4"
                        >
                          Réinitialiser
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => updateCategory(cat)}
                          className={`font-body relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                            selectedCategory === cat
                              ? "bg-ylang-rose shadow-ylang-rose/20 text-white shadow-md"
                              : "bg-ylang-beige/40 text-ylang-charcoal/70 hover:bg-ylang-beige hover:text-ylang-charcoal"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prix */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-semibold text-gray-900">
                        Fourchette de prix
                      </h3>
                      <div className="bg-ylang-cream flex items-center gap-1 rounded-lg px-3 py-1.5 shadow-inner">
                        <span className="font-body text-ylang-rose text-sm font-semibold">
                          {priceRange[0]}€
                        </span>
                        <span className="text-ylang-charcoal/30 mx-1">-</span>
                        <span className="font-body text-ylang-rose text-sm font-semibold">
                          {priceRange[1]}€
                        </span>
                      </div>
                    </div>

                    <div className="px-2 pt-2">
                      <Slider
                        defaultValue={[0, 200]}
                        max={200}
                        step={5}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value)}
                        className="**:data-[slot=slider-range]:bg-ylang-rose **:data-[slot=slider-thumb]:border-ylang-rose **:data-[slot=slider-thumb]:hover:ring-ylang-rose/20 py-4"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "- de 30€", min: 0, max: 30 },
                        { label: "30€ - 60€", min: 30, max: 60 },
                        { label: "60€ - 100€", min: 60, max: 100 },
                        { label: "100€ +", min: 100, max: 200 },
                      ].map((range) => (
                        <button
                          key={range.label}
                          onClick={() => setPriceRange([range.min, range.max])}
                          className={`font-body rounded-lg border px-3 py-1.5 text-xs transition-all ${
                            priceRange[0] === range.min &&
                            priceRange[1] === range.max
                              ? "border-ylang-rose bg-ylang-rose/5 text-ylang-rose font-semibold"
                              : "hover:border-ylang-rose/30 hover:text-ylang-rose border-gray-100 bg-white text-gray-500"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Options supplémentaires */}
                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-semibold text-gray-900">
                      Options
                    </h3>
                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={onlyNew}
                          onChange={(e) =>
                            updateFlag("filter", e.target.checked)
                          }
                          className="accent-ylang-rose focus:ring-ylang-rose h-5 w-5 rounded border-gray-300 transition-all"
                        />
                        <span className="font-body text-ylang-charcoal text-sm font-medium">
                          Nouveautés uniquement
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={onlyCustomizable}
                          onChange={(e) =>
                            updateFlag("customizable", e.target.checked)
                          }
                          className="accent-ylang-rose focus:ring-ylang-rose h-5 w-5 rounded border-gray-300 transition-all"
                        />
                        <span className="font-body text-ylang-charcoal text-sm font-medium">
                          Produits personnalisables
                        </span>
                      </label>
                    </div>
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
        {!isLoading && filteredProducts.length === 0 && (
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
              onClick={clearFilters}
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
