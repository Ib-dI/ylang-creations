"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  description?: string;
  new?: boolean;
  featured?: boolean;
  customizable?: boolean;
  slug?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  "Gigoteuse",
  "Tour de lit", 
  "Couverture",
  "Coussin musical",
  "Cape de bain",
  "Sac à langer",
  "Personnalisé",
  "Cadeau naissance"
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [popularProducts, setPopularProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounce query for API calls
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Load recent searches and popular products
  React.useEffect(() => {
    const stored = localStorage.getItem("ylang-recent-searches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }

    // Fetch popular products
    const fetchPopular = async () => {
      try {
        const res = await fetch("/api/products?featured=true&limit=3");
        if (res.ok) {
          const data = await res.json();
          setPopularProducts(data.products || []);
        }
      } catch (error) {
        console.error("Failed to fetch popular products", error);
      }
    };
    fetchPopular();
  }, []);

  // Focus input when modal opens
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search effect
  React.useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length >= 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=6`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.products || []);
          }
        } catch (error) {
          console.error("Search failed", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Close with Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const saveSearch = (searchTerm: string) => {
    const updated = [
      searchTerm,
      ...recentSearches.filter((s) => s !== searchTerm),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("ylang-recent-searches", JSON.stringify(updated));
  };

  const handleProductClick = (product: Product) => {
    saveSearch(query || product.name);
    onClose();
    router.push(`/produits/${product.id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearch(query.trim());
      onClose();
      router.push(`/collections?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    saveSearch(term);
    onClose();
    router.push(`/collections?search=${encodeURIComponent(term)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="bg-ylang-charcoal/60 fixed inset-0 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 left-0 z-50 mx-auto max-w-3xl p-4 pt-20 lg:pt-24"
          >
            <div className="bg-ylang-cream border-ylang-beige overflow-hidden rounded-2xl border shadow-2xl">
              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="border-ylang-beige flex items-center border-b px-6 py-4">
                  <Search className="text-ylang-charcoal/40 h-5 w-5 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher un produit, une catégorie..."
                    className="text-ylang-charcoal font-body placeholder:text-ylang-charcoal/40 flex-1 bg-transparent px-4 py-2 text-lg focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="hover:bg-ylang-beige rounded-full p-1 transition-colors"
                    >
                      <X className="text-ylang-charcoal/60 h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="hover:bg-ylang-beige ml-2 rounded-lg p-2 transition-colors"
                  >
                    <span className="text-ylang-charcoal/60 font-body text-sm">
                      Esc
                    </span>
                  </button>
                </div>
              </form>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
                  </div>
                ) : results.length > 0 ? (
                  /* Résultats de recherche */
                  <div className="p-4">
                    <p className="text-ylang-charcoal/60 font-body mb-3 px-2 text-sm">
                      {results.length} résultat{results.length > 1 ? "s" : ""}{" "}
                      pour "{query}"
                    </p>
                    <div className="space-y-2">
                      {results.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="hover:bg-ylang-beige/50 group flex w-full items-center gap-4 rounded-xl p-3 text-left transition-all"
                        >
                          <div className="bg-ylang-beige relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-display text-ylang-charcoal group-hover:text-ylang-rose truncate transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-ylang-charcoal/60 font-body text-sm">
                              {product.category}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-display text-ylang-rose font-semibold">
                              {product.price}€
                            </p>
                            {product.customizable && (
                              <span className="text-ylang-sage font-body inline-flex items-center gap-1 text-xs">
                                <Sparkles className="h-3 w-3" />
                                Personnalisable
                              </span>
                            )}
                          </div>
                          <ArrowRight className="text-ylang-charcoal/30 group-hover:text-ylang-rose h-4 w-4 transition-all group-hover:translate-x-1" />
                        </button>
                      ))}
                    </div>

                    {/* Voir tous les résultats */}
                    <button
                      onClick={() => handleQuickSearch(query)}
                      className="bg-ylang-rose/10 text-ylang-rose font-body hover:bg-ylang-rose mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all hover:text-white"
                    >
                      Voir tous les résultats
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : query.length >= 2 ? (
                  /* Aucun résultat */
                  <div className="p-8 text-center">
                    <div className="bg-ylang-beige mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                      <Search className="text-ylang-charcoal/30 h-8 w-8" />
                    </div>
                    <p className="font-display text-ylang-charcoal mb-2">
                      Aucun résultat pour "{query}"
                    </p>
                    <p className="text-ylang-charcoal/60 font-body text-sm">
                      Essayez avec d'autres mots-clés ou explorez nos
                      suggestions
                    </p>
                  </div>
                ) : (
                  /* État initial : suggestions et récents */
                  <div className="space-y-6 p-4">
                    {/* Recherches récentes */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center gap-2 px-2">
                          <Clock className="text-ylang-charcoal/40 h-4 w-4" />
                          <span className="text-ylang-charcoal/60 font-body text-sm">
                            Recherches récentes
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((term) => (
                            <button
                              key={term}
                              onClick={() => handleQuickSearch(term)}
                              className="bg-ylang-beige/50 text-ylang-charcoal font-body hover:bg-ylang-rose rounded-full px-4 py-2 text-sm transition-all hover:text-white"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions populaires */}
                    <div>
                      <div className="mb-3 flex items-center gap-2 px-2">
                        <TrendingUp className="text-ylang-charcoal/40 h-4 w-4" />
                        <span className="text-ylang-charcoal/60 font-body text-sm">
                          Suggestions populaires
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleQuickSearch(term)}
                            className="border-ylang-beige text-ylang-charcoal font-body hover:border-ylang-rose hover:text-ylang-rose rounded-full border px-4 py-2 text-sm transition-all"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Produits populaires (Featured) */}
                    {popularProducts.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center gap-2 px-2">
                          <Sparkles className="text-ylang-rose h-4 w-4" />
                          <span className="text-ylang-charcoal/60 font-body text-sm">
                            Produits populaires
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {popularProducts.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleProductClick(product)}
                              className="group bg-ylang-beige/30 hover:bg-ylang-beige/60 flex flex-col items-center rounded-xl p-4 transition-all"
                            >
                              <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-lg">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                {product.new && (
                                  <span className="bg-ylang-rose absolute top-1 right-1 rounded-full px-1.5 py-0.5 text-[10px] text-white">
                                    Nouveau
                                  </span>
                                )}
                              </div>
                              <h4 className="font-display text-ylang-charcoal group-hover:text-ylang-rose line-clamp-2 text-center text-sm transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-ylang-rose font-display mt-1 font-semibold">
                                {product.price}€
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
