"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function WishlistDrawer() {
  const { items, isOpen, closeWishlist, removeItem, getTotalItems } =
    useWishlistStore();
  const { addItem: addToCart, openCart } = useCartStore();

  const handleAddToCart = (item: (typeof items)[0]) => {
    addToCart({
      id: `${item.productId}-standard-${Date.now()}`,
      productId: item.productId,
      productName: item.name,
      configuration: {
        fabricName: "Standard",
        fabricColor: "Original",
      },
      price: item.price,
      quantity: 1,
      thumbnail: item.image,
    });
    removeItem(item.id);
    closeWishlist();
    openCart();
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="border-ylang-beige flex items-center justify-between border-b p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b76e79]/10">
                  <Heart className="h-5 w-5 text-[#b76e79]" />
                </div>
                <div>
                  <h2 className="font-display text-ylang-charcoal text-xl font-bold">
                    Mes favoris
                  </h2>
                  <p className="text-ylang-charcoal/60 text-sm">
                    {getTotalItems()} article{getTotalItems() > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={closeWishlist}
                className="hover:bg-ylang-beige flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="bg-ylang-terracotta/50 flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="bg-ylang-beige mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                    <Heart className="text-ylang-charcoal/40 h-10 w-10" />
                  </div>
                  <p className="font-display text-ylang-charcoal mb-2 text-lg">
                    Aucun favori
                  </p>
                  <p className="text-ylang-charcoal/60 mb-6 text-sm">
                    Découvrez nos créations et ajoutez vos coups de cœur
                  </p>
                  <Button variant="primary" onClick={closeWishlist} asChild>
                    <Link href="/collections">Découvrir les collections</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-ylang-cream rounded-2xl p-4"
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <Link
                          href={`/produits/${item.productId}`}
                          onClick={closeWishlist}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white"
                        >
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="text-3xl">🛏️</span>
                            </div>
                          )}
                        </Link>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-ylang-charcoal/50 font-abramo mb-1 text-xs font-semibold tracking-wider uppercase">
                            {item.category}
                          </p>
                          <Link
                            href={`/produits/${item.productId}`}
                            onClick={closeWishlist}
                          >
                            <h3 className="font-display text-ylang-charcoal mb-1 font-semibold transition-colors hover:text-[#b76e79]">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="font-display text-lg font-bold text-[#b76e79]">
                            {item.price}€
                          </p>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Ajouter au panier
                        </Button>
                        {item.customizable && (
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            onClick={closeWishlist}
                          >
                            <Link
                              href={`/configurateur?product=${item.productId}`}
                            >
                              <Sparkles className="mr-1 h-4 w-4" />
                              Personnaliser
                            </Link>
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-ylang-beige bg-ylang-cream border-t p-6">
                <Button
                  variant="luxury"
                  className="w-full"
                  size="lg"
                  asChild
                  onClick={closeWishlist}
                >
                  <Link href="/collections">
                    Continuer mes découvertes
                    <Heart className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <button
                  onClick={closeWishlist}
                  className="text-ylang-charcoal/60 hover:text-ylang-charcoal mt-3 w-full text-sm transition-colors"
                >
                  Fermer
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
