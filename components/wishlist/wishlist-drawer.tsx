"use client";

import { Button } from "@/components/ui/button";
import { euros } from "@/lib/currency";
import { useCartStore } from "@/lib/store/cart-store";
import {
  DEFAULT_BROWSE,
  useNavigationStore,
} from "@/lib/store/navigation-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { EASE_OUT } from "@/lib/motion-tokens";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart, ShoppingBag, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function WishlistDrawer() {
  const { items, isOpen, closeWishlist, removeItem, getTotalItems } =
    useWishlistStore();
  const { addItem: addToCart, openCart } = useCartStore();
  const lastBrowse =
    useNavigationStore((state) => state.lastBrowse) ?? DEFAULT_BROWSE;
  const shouldReduce = useReducedMotion();

  const handleAddToCart = (item: (typeof items)[0]) => {
    addToCart({
      id: `${item.productId}-standard-${Date.now()}`,
      productId: item.productId,
      productName: item.name,
      configuration: {
        fabricName: "Standard",
        fabricColor: "Original",
      },
      price: euros(item.price),
      weight: item.weight,
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
            transition={{ duration: 0.25 }}
            onClick={closeWishlist}
            className="fixed inset-0 z-50 bg-black/40"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              transform: shouldReduce ? "translateX(0%)" : "translateX(100%)",
              opacity: shouldReduce ? 0 : 1,
            }}
            animate={{ transform: "translateX(0%)", opacity: 1 }}
            exit={{
              transform: shouldReduce ? "translateX(0%)" : "translateX(100%)",
              opacity: shouldReduce ? 0 : 1,
            }}
            transition={{
              type: "tween",
              duration: shouldReduce ? 0.15 : 0.35,
              ease: EASE_OUT,
            }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col"
            style={{
              background: "var(--color-paper)",
              boxShadow: "-4px 0 40px rgba(0,0,0,0.10)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 py-6"
              style={{ borderBottom: "var(--rule-hair)" }}
            >
              <div>
                <p
                  className="type-overline mb-1"
                  style={{ color: "var(--color-accent)" }}
                >
                  Votre sélection
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-title)",
                    fontWeight: 400,
                    color: "var(--color-ink)",
                  }}
                >
                  Favoris
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="font-body text-sm"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  {getTotalItems()} article{getTotalItems() > 1 ? "s" : ""}
                </span>
                <button
                  onClick={closeWishlist}
                  className="flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-60"
                  style={{ color: "var(--color-ink)" }}
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Heart
                    className="mb-6 h-10 w-10"
                    style={{ color: "var(--color-ink-3)" }}
                    strokeWidth={1}
                  />
                  <p
                    className="mb-2"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-title)",
                      fontWeight: 400,
                      color: "var(--color-ink)",
                    }}
                  >
                    Aucun favori
                  </p>
                  <p
                    className="font-body mb-8 text-sm"
                    style={{ color: "var(--color-ink-3)" }}
                  >
                    Découvrez nos créations et ajoutez vos coups de cœur
                  </p>
                  <Button variant="luxury" onClick={closeWishlist} asChild>
                    <Link href={lastBrowse.path}>{lastBrowse.label}</Link>
                  </Button>
                </div>
              ) : (
                <div>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transform: "translateX(-40px)" }}
                      transition={{ duration: 0.2 }}
                      className="py-5"
                      style={{ borderBottom: "var(--rule-soft)" }}
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <Link
                          href={`/produits/${item.productId}`}
                          onClick={closeWishlist}
                          className="relative h-20 w-16 shrink-0 overflow-hidden"
                          style={{ background: "var(--color-paper-2)" }}
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
                              <Heart
                                className="h-5 w-5"
                                style={{ color: "var(--color-ink-3)" }}
                                strokeWidth={1}
                              />
                            </div>
                          )}
                        </Link>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          {item.category && (
                            <p
                              className="type-overline mb-1"
                              style={{ color: "var(--color-ink-3)" }}
                            >
                              {item.category}
                            </p>
                          )}
                          <Link
                            href={`/produits/${item.productId}`}
                            onClick={closeWishlist}
                            className="transition-opacity hover:opacity-70"
                          >
                            <h3
                              className="font-body mb-1 text-sm leading-tight font-medium"
                              style={{ color: "var(--color-ink)" }}
                            >
                              {item.name}
                            </h3>
                          </Link>
                          <p
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "var(--text-title)",
                              fontWeight: 400,
                              color: "var(--color-accent)",
                            }}
                          >
                            {item.price} €
                          </p>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center transition-opacity hover:opacity-50"
                          style={{ color: "var(--color-ink-3)" }}
                          aria-label="Retirer des favoris"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="font-body flex flex-1 items-center justify-center gap-2 py-2.5 text-sm transition-opacity hover:opacity-70"
                          style={{
                            border: "var(--rule-soft)",
                            color: "var(--color-ink)",
                          }}
                        >
                          <ShoppingBag
                            className="h-3.5 w-3.5"
                            strokeWidth={1.5}
                          />
                          Ajouter au panier
                        </button>
                        {item.customizable && (
                          <Link
                            href={`/configurateur?product=${item.productId}`}
                            onClick={closeWishlist}
                            className="font-body flex items-center gap-1.5 px-4 py-2.5 text-sm transition-opacity hover:opacity-70"
                            style={{
                              background: "var(--color-paper-2)",
                              color: "var(--color-ink-3)",
                            }}
                          >
                            <Sparkles
                              className="h-3.5 w-3.5"
                              strokeWidth={1.5}
                            />
                            Personnaliser
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="px-8 py-6"
                style={{
                  background: "var(--color-paper-2)",
                  borderTop: "var(--rule-hair)",
                }}
              >
                <Button
                  variant="luxury"
                  className="w-full"
                  size="lg"
                  asChild
                  onClick={closeWishlist}
                >
                  <Link href="/collections">
                    Découvrir d'autres créations
                    <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </Button>

                <button
                  onClick={closeWishlist}
                  className="font-body mt-4 w-full text-sm transition-opacity hover:opacity-60"
                  style={{ color: "var(--color-ink-3)" }}
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
