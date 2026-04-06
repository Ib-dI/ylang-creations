"use client";

import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { useCartStore } from "@/lib/store/cart-store";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Lock,
  Package,
  Shield,
  ShoppingBag,
  Truck,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

// Add TypeScript declaration for SumUpCard
declare global {
  interface Window {
    SumUpCard: any;
  }
}

export default function CheckoutPage() {
  const {
    items,
    getTotalPrice,
    getShipping,
    getFinalPrice,
    freeShippingThreshold,
    getTotalWeight,
    isOverWeightLimit,
  } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [isWidgetMounted, setIsWidgetMounted] = useState(false);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsSignedIn(!!user);
      } catch {
        setIsSignedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Transformer les items du panier pour le checkout
      const checkoutItems = items.map((item) => ({
        productId: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        weight: item.weight,
        image: item.thumbnail,
        configuration: item.configuration,
      }));

      const result = await createCheckoutSession(checkoutItems);

      if (result.success && result.url) {
        // Here result.url is actually the checkout ID returned by our new API
        setCheckoutId(result.url);
      } else {
        setError(result.error || "Une erreur est survenue");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Impossible de procéder au paiement. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  // Effect is triggered when checkoutId is set and the SumUp script is loaded
  useEffect(() => {
    if (checkoutId && window.SumUpCard && !isWidgetMounted) {
      setIsWidgetMounted(true);

      window.SumUpCard.mount({
        id: "sumup-card-container",
        checkoutId: checkoutId,
        onResponse: function (type: string, body: any) {
          console.log("SumUp Response:", type, body);

          // Verify on backend before marking success
          if (type === "success" || type === "payment-success") {
            window.location.href = `/checkout/success?session_id=${checkoutId}`;
          } else {
            setError("Le paiement a échoué ou a été annulé.");
            setCheckoutId(null);
            setIsWidgetMounted(false);
            setIsLoading(false);
          }
        },
      });
    }
  }, [checkoutId, isWidgetMounted]);

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="from-ylang-cream to-ylang-beige flex min-h-screen items-center justify-center bg-linear-to-br pt-24 pb-12">
        <Loader2 className="text-ylang-rose h-12 w-12 animate-spin" />
      </div>
    );
  }

  // Panier vide
  if (items.length === 0) {
    return (
      <div className="from-ylang-cream to-ylang-beige min-h-screen bg-linear-to-br pt-24 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="bg-ylang-beige mb-6 flex h-24 w-24 items-center justify-center rounded-full">
              <Package className="text-ylang-charcoal/40 h-12 w-12" />
            </div>
            <h1 className="font-display text-ylang-charcoal mb-3 text-3xl font-bold">
              Votre panier est vide
            </h1>
            <p className="text-ylang-charcoal/60 mb-8">
              Ajoutez des créations à votre panier pour passer commande
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link href="/collections">Découvrir nos créations</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="from-ylang-cream to-ylang-beige min-h-screen bg-linear-to-br pt-24 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="text-ylang-charcoal/60 hover:text-ylang-charcoal mb-4 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuer mes achats
          </Link>
          <h1 className="font-display text-ylang-charcoal text-4xl font-bold">
            Finaliser ma commande
          </h1>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Récapitulatif du panier */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="border-ylang-beige rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b76e79]/10">
                  <ShoppingBag className="h-5 w-5 text-[#b76e79]" />
                </div>
                <h2 className="font-display text-ylang-charcoal text-xl font-bold">
                  Récapitulatif ({items.length} article
                  {items.length > 1 ? "s" : ""})
                </h2>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-ylang-cream flex gap-4 rounded-xl p-4"
                  >
                    {/* Thumbnail */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.productName}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-3xl">🛏️</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-display text-ylang-charcoal font-semibold">
                        {item.productName}
                      </h3>
                      <p className="text-ylang-charcoal/60 text-xs">
                        Tissu: {item.configuration.fabricName}
                      </p>
                      {item.configuration.size && (
                        <p className="text-ylang-charcoal/60 text-xs">
                          Taille: {item.configuration.size}
                        </p>
                      )}
                      {item.configuration.embroidery && (
                        <p className="text-ylang-charcoal/60 text-xs">
                          Broderie: &quot;{item.configuration.embroidery}&quot;
                        </p>
                      )}
                      <p className="text-ylang-charcoal/60 text-xs">
                        Qté: {item.quantity}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-[#b76e79]">
                        {(item.price * item.quantity).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="border-ylang-beige mt-6 space-y-3 border-t pt-6">
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
                    {(freeShippingThreshold - getTotalPrice()).toFixed(2)}€ pour
                    la livraison offerte
                  </p>
                )}

                <div className="flex justify-between border-t border-[#e8dcc8] pt-3">
                  <span className="font-display text-ylang-charcoal font-bold">
                    Total TTC
                  </span>
                  <span className="font-display text-2xl font-bold text-[#b76e79]">
                    {getFinalPrice().toFixed(2)}€
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Colonne de paiement */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Message d'erreur */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
              >
                {error}
              </motion.div>
            )}

            {/* Section connexion ou paiement */}
            {!isSignedIn ? (
              <div className="border-ylang-beige rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b76e79]/10">
                    <Lock className="h-5 w-5 text-[#b76e79]" />
                  </div>
                  <h2 className="font-display text-ylang-charcoal text-xl font-bold">
                    Connexion requise
                  </h2>
                </div>
                <p className="text-ylang-charcoal/60 mb-6">
                  Veuillez vous connecter pour finaliser votre commande
                </p>
                <Button variant="luxury" size="lg" className="w-full" asChild>
                  <Link href="/sign-in?redirect=/checkout">Se connecter</Link>
                </Button>
                <p className="text-ylang-charcoal/60 mt-4 text-center text-sm">
                  Pas encore de compte ?{" "}
                  <Link
                    href="/sign-up?redirect=/checkout"
                    className="text-[#b76e79] hover:underline"
                  >
                    Créer un compte
                  </Link>
                </p>
              </div>
            ) : (
              <div className="border-ylang-beige rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b76e79]/10">
                    <CreditCard className="h-5 w-5 text-[#b76e79]" />
                  </div>
                  <h2 className="font-display text-ylang-charcoal text-xl font-bold">
                    Paiement sécurisé
                  </h2>
                </div>

                {checkoutId ? (
                  <div className="mt-4">
                    <p className="text-ylang-charcoal/60 mb-4 text-sm">
                      Veuillez saisir vos coordonnées bancaires ci-dessous :
                    </p>
                    {/* SumUp Widget Container */}
                    <div
                      id="sumup-card-container"
                      className="bg-ylang-cream/30 border-ylang-beige min-h-[300px] w-full rounded-lg border p-4"
                    />
                  </div>
                ) : (
                  <>
                    {isOverWeightLimit() && (
                      <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div className="space-y-1 text-left">
                          <p className="text-sm font-bold">Limite de poids (30kg) dépassée</p>
                          <p className="text-xs opacity-90">
                            Votre colis pèse {(getTotalWeight() / 1000).toFixed(1)}kg. 
                            Merci de diviser votre commande en plusieurs colis s'il vous plaît.
                          </p>
                        </div>
                      </div>
                    )}

                    <Button
                      variant={isOverWeightLimit() ? "secondary" : "luxury"}
                      size="lg"
                      className="w-full"
                      onClick={handleCheckout}
                      disabled={isLoading || isOverWeightLimit()}
                    >
                      {isOverWeightLimit() ? (
                        "Commande trop lourde"
                      ) : isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Préparation...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          Payer {getFinalPrice().toFixed(2)}€
                        </>
                      )}
                    </Button>
                  </>
                )}

                {/* Secure payment badge */}
                <div className="text-ylang-charcoal/40 mt-4 flex items-center justify-center gap-2 text-xs">
                  <Lock className="h-3 w-3" />
                  Paiement sécurisé par SumUp
                </div>
              </div>
            )}

            {/* Avantages */}
            <div className="space-y-4">
              <div className="border-ylang-beige flex items-start gap-4 rounded-xl border bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-ylang-charcoal font-semibold">
                    Paiement 100% sécurisé
                  </h3>
                  <p className="text-ylang-charcoal/60 text-sm">
                    Vos données sont chiffrées et protégées par Stripe
                  </p>
                </div>
              </div>

              <div className="border-ylang-beige flex items-start gap-4 rounded-xl border bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-ylang-charcoal font-semibold">
                    Livraison suivie
                  </h3>
                  <p className="text-ylang-charcoal/60 text-sm">
                    Recevez votre colis sous 7-10 jours ouvrés
                  </p>
                </div>
              </div>

              <div className="border-ylang-beige flex items-start gap-4 rounded-xl border bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-ylang-charcoal font-semibold">
                    Fabrication artisanale
                  </h3>
                  <p className="text-ylang-charcoal/60 text-sm">
                    Chaque création est confectionnée à la main avec soin
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* SumUp Script Loading */}
      <Script
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
