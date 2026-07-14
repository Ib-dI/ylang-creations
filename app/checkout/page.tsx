"use client";

import { OrderSummary } from "@/components/checkout/order-summary";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { useCartStore } from "@/lib/store/cart-store";
import { DEFAULT_BROWSE, useNavigationStore } from "@/lib/store/navigation-store";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Lock,
  Package,
  Shield,
  Truck,
  AlertTriangle,
} from "lucide-react";
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
  const lastBrowse = useNavigationStore((state) => state.lastBrowse) ?? DEFAULT_BROWSE;

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
      // Pass items directly to checkout session (already CartItem type)
      const result = await createCheckoutSession(items);

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
      <div
        className="flex min-h-screen items-center justify-center pt-24 pb-12"
        style={{ background: "var(--color-paper)" }}
      >
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: "var(--color-accent)" }} />
      </div>
    );
  }

  // Panier vide
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12" style={{ background: "var(--color-paper)" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div
              className="mb-6 flex h-24 w-24 items-center justify-center rounded-full"
              style={{ background: "var(--color-paper-2)" }}
            >
              <Package className="h-12 w-12" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
            </div>
            <h1
              className="font-display mb-3 text-3xl font-bold"
              style={{ color: "var(--color-ink)" }}
            >
              Votre panier est vide
            </h1>
            <p className="mb-8" style={{ color: "var(--color-ink-3)" }}>
              Ajoutez des créations à votre panier pour passer commande
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link href={lastBrowse.path}>{lastBrowse.label}</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: "var(--color-paper)" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href={lastBrowse.path}
            className="mb-4 inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-60"
            style={{ color: "var(--color-ink-3)" }}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            {lastBrowse.label}
          </Link>
          <h1 className="font-display text-4xl font-bold" style={{ color: "var(--color-ink)" }}>
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
            <OrderSummary
              items={items}
              totalPrice={getTotalPrice()}
              shipping={getShipping()}
              finalPrice={getFinalPrice()}
              freeShippingThreshold={freeShippingThreshold}
            />
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
              <div style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }} className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <Lock className="h-5 w-5" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                  <h2 className="font-display text-xl font-bold" style={{ color: "var(--color-ink)" }}>
                    Connexion requise
                  </h2>
                </div>
                <p className="mb-6" style={{ color: "var(--color-ink-3)" }}>
                  Veuillez vous connecter pour finaliser votre commande
                </p>
                <Button variant="luxury" size="lg" className="w-full" asChild>
                  <Link href="/sign-in?redirect=/checkout">Se connecter</Link>
                </Button>
                <p className="mt-4 text-center text-sm" style={{ color: "var(--color-ink-3)" }}>
                  Pas encore de compte ?{" "}
                  <Link
                    href="/sign-up?redirect=/checkout"
                    className="hover:underline"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Créer un compte
                  </Link>
                </p>
              </div>
            ) : (
              <div style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }} className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <CreditCard className="h-5 w-5" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                  <h2 className="font-display text-xl font-bold" style={{ color: "var(--color-ink)" }}>
                    Paiement sécurisé
                  </h2>
                </div>

                {checkoutId ? (
                  <div className="mt-4">
                    <p className="mb-4 text-sm" style={{ color: "var(--color-ink-3)" }}>
                      Veuillez saisir vos coordonnées bancaires ci-dessous :
                    </p>
                    {/* SumUp Widget Container */}
                    <div
                      id="sumup-card-container"
                      className="min-h-[300px] w-full p-4"
                      style={{ background: "var(--color-paper-2)", border: "var(--rule-soft)" }}
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
                <div
                  className="mt-4 flex items-center justify-center gap-2 text-xs"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  <Lock className="h-3 w-3" strokeWidth={1.5} />
                  Paiement sécurisé par SumUp
                </div>
              </div>
            )}

            {/* Avantages */}
            <div className="space-y-4">
              <div
                className="flex items-start gap-4 p-4"
                style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }}
              >
                <Shield className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--color-ink)" }}>
                    Paiement 100% sécurisé
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-ink-3)" }}>
                    Vos données sont chiffrées et protégées par SumUp
                  </p>
                </div>
              </div>

              <div
                className="flex items-start gap-4 p-4"
                style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }}
              >
                <Truck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--color-ink)" }}>
                    Livraison suivie
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-ink-3)" }}>
                    Recevez votre colis sous 7-10 jours ouvrés
                  </p>
                </div>
              </div>

              <div
                className="flex items-start gap-4 p-4"
                style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }}
              >
                <Package className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--color-ink)" }}>
                    Fabrication artisanale
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-ink-3)" }}>
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
