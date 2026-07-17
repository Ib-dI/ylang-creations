"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import {
  DEFAULT_BROWSE,
  useNavigationStore,
} from "@/lib/store/navigation-store";
import { EASE_OUT } from "@/lib/motion-tokens";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

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
    refreshWeights,
    isOverWeightLimit,
    getTotalWeight,
  } = useCartStore();
  const lastBrowse =
    useNavigationStore((state) => state.lastBrowse) ?? DEFAULT_BROWSE;
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    refreshWeights();
  }, []);

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
            onClick={closeCart}
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
                  Panier
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
                  onClick={closeCart}
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
                  <ShoppingBag
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
                    Votre panier est vide
                  </p>
                  <p
                    className="font-body mb-8 text-sm"
                    style={{ color: "var(--color-ink-3)" }}
                  >
                    Commencez par explorer nos créations
                  </p>
                  <Button variant="luxury" onClick={closeCart} asChild>
                    <Link href={lastBrowse.path}>{lastBrowse.label}</Link>
                  </Button>
                </div>
              ) : (
                <div>
                  {items.map((item, index) => (
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
                        <div
                          className="relative h-20 w-16 shrink-0 overflow-hidden"
                          style={{ background: "var(--color-paper-2)" }}
                        >
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag
                                className="h-5 w-5"
                                style={{ color: "var(--color-ink-3)" }}
                                strokeWidth={1}
                              />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-body mb-1 text-sm leading-tight font-medium"
                            style={{ color: "var(--color-ink)" }}
                          >
                            {item.productName}
                          </h3>
                          <div className="space-y-0.5">
                            <p
                              className="font-body text-xs"
                              style={{ color: "var(--color-ink-3)" }}
                            >
                              {item.configuration.fabricName}
                            </p>
                            {item.configuration.size && (
                              <p
                                className="font-body text-xs"
                                style={{ color: "var(--color-ink-3)" }}
                              >
                                Taille {item.configuration.size}
                              </p>
                            )}
                            {item.configuration.embroidery && (
                              <p
                                className="font-body text-xs"
                                style={{ color: "var(--color-ink-3)" }}
                              >
                                « {item.configuration.embroidery} »
                              </p>
                            )}
                            {item.configuration.embroidery &&
                              item.configuration.embroideryFont && (
                                <p
                                  className="font-body text-xs"
                                  style={{ color: "var(--color-ink-3)" }}
                                >
                                  Police : {item.configuration.embroideryFont}
                                </p>
                              )}
                            {item.configuration.embroidery &&
                              item.configuration.embroideryColor && (
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                                    style={{
                                      backgroundColor:
                                        item.configuration.embroideryColor,
                                    }}
                                  />
                                  <span
                                    className="font-body text-xs"
                                    style={{ color: "var(--color-ink-3)" }}
                                  >
                                    Fil :{" "}
                                    {item.configuration.embroideryColorName ??
                                      item.configuration.embroideryColor}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center transition-opacity hover:opacity-50"
                          style={{ color: "var(--color-ink-3)" }}
                          aria-label="Supprimer"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Quantity & Price */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="font-body text-sm transition-opacity hover:opacity-50"
                            style={{ color: "var(--color-ink-3)" }}
                          >
                            <Minus className="h-3 w-3" strokeWidth={1.5} />
                          </button>
                          <span
                            className="font-body w-4 text-center text-sm"
                            style={{ color: "var(--color-ink)" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={isOverWeightLimit()}
                            className="font-body text-sm transition-opacity hover:opacity-50 disabled:opacity-20"
                            style={{ color: "var(--color-ink-3)" }}
                          >
                            <Plus className="h-3 w-3" strokeWidth={1.5} />
                          </button>
                        </div>

                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "var(--text-title)",
                            fontWeight: 400,
                            color: "var(--color-accent)",
                          }}
                        >
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
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
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between">
                    <span
                      className="font-body text-sm"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      Sous-total
                    </span>
                    <span
                      className="font-body text-sm"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {getTotalPrice().toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="font-body text-sm"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      Livraison
                    </span>
                    <span
                      className="font-body text-sm"
                      style={{
                        color:
                          getShipping() === 0
                            ? "var(--color-accent-green)"
                            : "var(--color-ink)",
                      }}
                    >
                      {getShipping() === 0
                        ? "Offerte"
                        : `${getShipping().toFixed(2)} €`}
                    </span>
                  </div>
                  {getTotalPrice() < freeShippingThreshold && (
                    <p
                      className="font-body text-xs"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      Plus que{" "}
                      {(freeShippingThreshold - getTotalPrice()).toFixed(2)} €
                      pour la livraison offerte
                    </p>
                  )}
                  <div
                    className="flex justify-between pt-4"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <span
                      className="font-body text-sm font-medium"
                      style={{ color: "var(--color-ink)" }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "var(--text-title)",
                        fontWeight: 400,
                        color: "var(--color-accent)",
                      }}
                    >
                      {getFinalPrice().toFixed(2)} €
                    </span>
                  </div>
                </div>

                {isOverWeightLimit() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 overflow-hidden"
                  >
                    <div
                      className="flex items-start gap-3 p-4"
                      style={{
                        background: "var(--color-paper)",
                        border: "var(--rule-soft)",
                      }}
                    >
                      <AlertTriangle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: "var(--color-accent)" }}
                        strokeWidth={1.5}
                      />
                      <div>
                        <p
                          className="font-body mb-0.5 text-sm font-medium"
                          style={{ color: "var(--color-ink)" }}
                        >
                          Limite de poids dépassée
                        </p>
                        <p
                          className="font-body text-xs leading-relaxed"
                          style={{ color: "var(--color-ink-3)" }}
                        >
                          Votre colis pèse{" "}
                          {(getTotalWeight() / 1000).toFixed(1)} kg (max 30 kg).
                          Merci de diviser votre commande.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <Button
                  variant={isOverWeightLimit() ? "secondary" : "luxury"}
                  className="w-full"
                  size="lg"
                  disabled={isOverWeightLimit()}
                  asChild={!isOverWeightLimit()}
                  onClick={!isOverWeightLimit() ? closeCart : undefined}
                >
                  {!isOverWeightLimit() ? (
                    <Link href="/checkout">
                      Passer commande
                      <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                    </Link>
                  ) : (
                    <span>Commande trop lourde</span>
                  )}
                </Button>

                <button
                  onClick={closeCart}
                  className="font-body mt-4 w-full text-sm transition-opacity hover:opacity-60"
                  style={{ color: "var(--color-ink-3)" }}
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
