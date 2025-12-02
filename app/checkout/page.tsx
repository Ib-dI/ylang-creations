"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Package } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalItems, getTotalPrice, getShipping, getFinalPrice } = useCartStore()

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#f5f1e8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#b76e79]/10 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#b76e79]" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-[#1a1a1a]">Votre panier</h2>
                  <p className="text-sm text-[#1a1a1a]/60">{getTotalItems()} article{getTotalItems() > 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f5f1e8] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-[#f5f1e8] rounded-full flex items-center justify-center mb-4">
                    <Package className="w-10 h-10 text-[#1a1a1a]/40" />
                  </div>
                  <p className="font-display text-lg text-[#1a1a1a] mb-2">Votre panier est vide</p>
                  <p className="text-sm text-[#1a1a1a]/60 mb-6">Commencez à créer votre produit unique</p>
                  <Button variant="primary" onClick={closeCart} asChild>
                    <Link href="/configurateur">
                      Créer mon produit
                    </Link>
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
                      className="bg-[#faf9f6] rounded-2xl p-4"
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-3xl">🛏️</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-[#1a1a1a] mb-1">
                            {item.productName}
                          </h3>
                          <p className="text-xs text-[#1a1a1a]/60 mb-2">
                            Tissu: {item.configuration.fabricName}
                          </p>
                          {item.configuration.embroidery && (
                            <p className="text-xs text-[#1a1a1a]/60 mb-1">
                              Broderie: "{item.configuration.embroidery}"
                            </p>
                          )}
                          {item.configuration.accessories.length > 0 && (
                            <p className="text-xs text-[#1a1a1a]/60">
                              +{item.configuration.accessories.length} accessoire{item.configuration.accessories.length > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-red-500 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-[#f5f1e8] transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium text-[#1a1a1a] w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-[#f5f1e8] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
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
              <div className="border-t border-[#f5f1e8] p-6 bg-[#faf9f6]">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1a1a1a]/70">Sous-total</span>
                    <span className="font-medium text-[#1a1a1a]">{getTotalPrice().toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1a1a1a]/70">Livraison</span>
                    <span className="font-medium text-[#1a1a1a]">
                      {getShipping() === 0 ? (
                        <span className="text-green-600">Offerte</span>
                      ) : (
                        `${getShipping().toFixed(2)}€`
                      )}
                    </span>
                  </div>
                  {getTotalPrice() < 100 && (
                    <p className="text-xs text-[#1a1a1a]/60">
                      Plus que {(100 - getTotalPrice()).toFixed(2)}€ pour la livraison offerte
                    </p>
                  )}
                  <div className="flex justify-between pt-3 border-t border-[#e8dcc8]">
                    <span className="font-display font-bold text-[#1a1a1a]">Total</span>
                    <span className="font-display text-2xl font-bold text-[#b76e79]">
                      {getFinalPrice().toFixed(2)}€
                    </span>
                  </div>
                </div>

                <Button variant="luxury" className="w-full" size="lg" asChild onClick={closeCart}>
                  <Link href="/checkout">
                    Passer commande
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>

                <button
                  onClick={closeCart}
                  className="w-full mt-3 text-sm text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
                >
                  Continuer mes achats
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
