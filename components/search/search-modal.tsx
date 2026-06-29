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
  "Cadeau naissance",
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [popularProducts, setPopularProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [debouncedQuery, setDebouncedQuery] = React.useState(query);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  React.useEffect(() => {
    const stored = localStorage.getItem("ylang-recent-searches");
    if (stored) setRecentSearches(JSON.parse(stored));

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

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length >= 2) {
        setIsLoading(true);
        try {
          const res = await fetch(
            `/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=6`,
          );
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

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const saveSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("ylang-recent-searches", JSON.stringify(updated));
  };

  const removeRecentSearch = (term: string) => {
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    localStorage.setItem("ylang-recent-searches", JSON.stringify(updated));
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("ylang-recent-searches");
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
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "tween", duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-60 flex items-start justify-center p-0 sm:p-4 sm:pt-20 lg:pt-24"
          >
            <div
              className="flex h-full w-full flex-col overflow-hidden sm:h-auto sm:max-w-2xl"
              style={{ background: "var(--color-paper)", boxShadow: "0 8px 60px rgba(0,0,0,0.12)" }}
            >
              {/* Search Input */}
              <div
                className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4"
                style={{ background: "var(--color-paper)", borderBottom: "var(--rule-hair)" }}
              >
                <Search className="h-4 w-4 shrink-0" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher une création…"
                    className="flex-1 bg-transparent font-body text-base outline-none placeholder:opacity-40"
                    style={{ color: "var(--color-ink)", WebkitAppearance: "none" }}
                  />
                </form>
                <div className="flex items-center gap-2">
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="transition-opacity hover:opacity-50"
                      style={{ color: "var(--color-ink-3)" }}
                      aria-label="Effacer la recherche"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="transition-opacity hover:opacity-50"
                    style={{ color: "var(--color-ink)" }}
                    aria-label="Fermer la recherche"
                  >
                    <X className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                  </div>
                ) : results.length > 0 ? (
                  /* Résultats */
                  <div className="px-5 py-4">
                    <p className="font-body mb-4 text-xs" style={{ color: "var(--color-ink-3)" }}>
                      {results.length} résultat{results.length > 1 ? "s" : ""} pour « {query} »
                    </p>
                    <div>
                      {results.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="group flex w-full items-center gap-4 py-4 text-left transition-opacity hover:opacity-70"
                          style={{ borderBottom: "var(--rule-soft)" }}
                        >
                          {/* Thumbnail */}
                          <div
                            className="relative h-14 w-12 shrink-0 overflow-hidden"
                            style={{ background: "var(--color-paper-2)" }}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4
                              className="truncate font-body text-sm font-medium"
                              style={{ color: "var(--color-ink)" }}
                            >
                              {product.name}
                            </h4>
                            <p className="font-body text-xs mt-0.5" style={{ color: "var(--color-ink-3)" }}>
                              {product.category}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p
                              style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 400,
                                color: "var(--color-accent)",
                              }}
                            >
                              {product.price} €
                            </p>
                            {product.customizable && (
                              <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                                Personnalisable
                              </span>
                            )}
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                        </button>
                      ))}
                    </div>

                    {/* Voir tous */}
                    <button
                      onClick={() => handleQuickSearch(query)}
                      className="mt-4 flex w-full items-center justify-center gap-2 py-4 font-body text-sm transition-opacity hover:opacity-70"
                      style={{ borderTop: "var(--rule-soft)", color: "var(--color-ink)" }}
                    >
                      Voir tous les résultats
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : query.length >= 2 ? (
                  /* Aucun résultat */
                  <div className="px-5 py-16 text-center">
                    <Search className="mx-auto mb-5 h-8 w-8" style={{ color: "var(--color-ink-3)" }} strokeWidth={1} />
                    <p
                      className="mb-2"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        color: "var(--color-ink)",
                      }}
                    >
                      Aucun résultat pour « {query} »
                    </p>
                    <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                      Essayez avec d&apos;autres mots-clés ou explorez nos suggestions
                    </p>
                  </div>
                ) : (
                  /* État initial */
                  <div className="px-5 py-6 space-y-8">
                    {/* Recherches récentes */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                            <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
                              Récentes
                            </span>
                          </div>
                          <button
                            onClick={clearAllRecentSearches}
                            className="font-body text-xs transition-opacity hover:opacity-50"
                            style={{ color: "var(--color-ink-3)" }}
                          >
                            Tout effacer
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((term) => (
                            <div
                              key={term}
                              className="flex items-center gap-1"
                              style={{ border: "var(--rule-soft)" }}
                            >
                              <button
                                onClick={() => handleQuickSearch(term)}
                                className="font-body py-1.5 pl-3 text-sm transition-opacity hover:opacity-70"
                                style={{ color: "var(--color-ink)" }}
                              >
                                {term}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeRecentSearch(term);
                                }}
                                className="px-2 py-1.5 transition-opacity hover:opacity-50"
                                style={{ color: "var(--color-ink-3)" }}
                                aria-label={`Supprimer ${term}`}
                              >
                                <X className="h-3 w-3" strokeWidth={1.5} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                        <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
                          Suggestions
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleQuickSearch(term)}
                            className="font-body px-4 py-2 text-sm transition-opacity hover:opacity-70"
                            style={{ border: "var(--rule-soft)", color: "var(--color-ink)" }}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Produits populaires */}
                    {popularProducts.length > 0 && (
                      <div style={{ borderTop: "var(--rule-hair)", paddingTop: "1.5rem" }}>
                        <div className="mb-4 flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                          <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
                            Populaires
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
                          {popularProducts.map((product, i) => (
                            <button
                              key={product.id}
                              onClick={() => handleProductClick(product)}
                              className="group flex flex-col items-center py-5 text-center transition-opacity hover:opacity-70 sm:py-4"
                              style={{
                                borderLeft: i > 0 ? "var(--rule-soft)" : undefined,
                                borderTop: "var(--rule-soft)",
                              }}
                            >
                              <div
                                className="relative mb-3 h-16 w-14 overflow-hidden"
                                style={{ background: "var(--color-paper-2)" }}
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                                {product.new && (
                                  <span
                                    className="absolute top-1 right-1 px-1.5 py-0.5 font-body text-[10px]"
                                    style={{ background: "var(--color-paper)", color: "var(--color-accent)" }}
                                  >
                                    Nouveau
                                  </span>
                                )}
                              </div>
                              <h4
                                className="line-clamp-2 font-body text-xs font-medium leading-snug"
                                style={{ color: "var(--color-ink)" }}
                              >
                                {product.name}
                              </h4>
                              <p
                                className="mt-1"
                                style={{
                                  fontFamily: "var(--font-display)",
                                  fontWeight: 400,
                                  color: "var(--color-accent)",
                                  fontSize: "var(--text-title)",
                                }}
                              >
                                {product.price} €
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
