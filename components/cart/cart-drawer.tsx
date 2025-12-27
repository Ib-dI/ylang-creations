"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    getShipping,
    getFinalPrice,
    freeShippingThreshold,
  } = useCartStore();

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
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
                  <ShoppingBag className="h-5 w-5 text-[#b76e79]" />
                </div>
                <div>
                  <h2 className="font-display text-ylang-charcoal text-xl font-bold">
                    Votre panier
                  </h2>
                  <p className="text-ylang-charcoal/60 text-sm">
                    {getTotalItems()} article{getTotalItems() > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="hover:bg-ylang-beige flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="bg-ylang-beige mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                    <Package className="text-ylang-charcoal/40 h-10 w-10" />
                  </div>
                  <p className="font-display text-ylang-charcoal mb-2 text-lg">
                    Votre panier est vide
                  </p>
                  <p className="text-ylang-charcoal/60 mb-6 text-sm">
                    Commencez à créer votre produit unique
                  </p>
                  <Button variant="primary" onClick={closeCart} asChild>
                    <Link href="/configurateur">Créer mon produit</Link>
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
                        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">🛏️</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-ylang-charcoal mb-1 font-semibold">
                            {item.productName}
                          </h3>
                          <p className="text-ylang-charcoal/60 mb-2 text-xs">
                            Tissu: {item.configuration.fabricName}
                          </p>
                          {item.configuration.embroidery && (
                            <p className="text-ylang-charcoal/60 mb-1 text-xs">
                              Broderie: "{item.configuration.embroidery}"
                            </p>
                          )}
                          {item.configuration.accessories.length > 0 && (
                            <p className="text-ylang-charcoal/60 text-xs">
                              +{item.configuration.accessories.length}{" "}
                              accessoire
                              {item.configuration.accessories.length > 1
                                ? "s"
                                : ""}
                            </p>
                          )}
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Quantity & Price */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="hover:bg-ylang-beige flex h-8 w-8 items-center justify-center rounded-lg bg-white transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-ylang-charcoal w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="hover:bg-ylang-beige flex h-8 w-8 items-center justify-center rounded-lg bg-white transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="font-display text-xl font-bold text-[#b76e79]">
                          {(item.price * item.quantity).toFixed(2)}€
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-ylang-beige bg-ylang-cream border-t p-6">
                <div className="mb-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-ylang-charcoal/70">Sous-total</span>
                    <span className="text-ylang-charcoal font-medium">
                      {getTotalPrice().toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ylang-charcoal/70">Livraison</span>
                    <span className="text-ylang-charcoal font-medium">
                      {getShipping() === 0 ? (
                        <span className="text-green-600">Offerte</span>
                      ) : (
                        `${getShipping().toFixed(2)}€`
                      )}
                    </span>
                  </div>
                  {getTotalPrice() < freeShippingThreshold && (
                    <p className="text-ylang-charcoal/60 text-xs">
                      Plus que{" "}
                      {(freeShippingThreshold - getTotalPrice()).toFixed(2)}€
                      pour la livraison offerte
                    </p>
                  )}

                  <div className="flex justify-between border-t border-[#e8dcc8] pt-3">
                    <span className="font-display text-ylang-charcoal font-bold">
                      Total
                    </span>
                    <span className="font-display text-2xl font-bold text-[#b76e79]">
                      {getFinalPrice().toFixed(2)}€
                    </span>
                  </div>
                </div>

                <Button
                  variant="luxury"
                  className="w-full"
                  size="lg"
                  asChild
                  onClick={closeCart}
                >
                  <Link href="/checkout">
                    Passer commande
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <button
                  onClick={closeCart}
                  className="text-ylang-charcoal/60 hover:text-ylang-charcoal mt-3 w-full text-sm transition-colors"
                >
                  Continuer mes achats
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
