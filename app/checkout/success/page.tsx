"use client";

import { Button } from "@/components/ui/button";
import { getCheckoutSession } from "@/lib/actions/checkout";
import { useCartStore } from "@/lib/store/cart-store";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface SessionData {
  id: string;
  customerEmail?: string | null;
  customerName?: string | null;
  amountTotal?: number | null;
  paymentStatus?: string | null;
  shippingAddress?: {
    line1?: string | null;
    city?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
  lineItems?:
    | {
        name?: string | null;
        quantity?: number | null;
        amount?: number | null;
      }[]
    | null;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const { clearCart } = useCartStore();

  useEffect(() => {
    if (sessionId) {
      setOrderNumber(`YC${sessionId.slice(0, 8).toUpperCase()}`);
    }
  }, [sessionId]);

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) {
        setError("Session ID manquant");
        setLoading(false);
        return;
      }

      try {
        const result = await getCheckoutSession(sessionId);
        if (result.success && result.session) {
          setSession(result.session);
          // Vider le panier après un paiement réussi
          clearCart();
        } else {
          setError(
            result.error ||
              "Impossible de récupérer les détails de la commande",
          );
        }
      } catch (err) {
        setError("Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center pt-24 pb-12"
        style={{ background: "var(--color-paper)" }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin" style={{ color: "var(--color-accent)" }} />
          <p style={{ color: "var(--color-ink-3)" }}>
            Confirmation de votre paiement...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center pt-24 pb-12"
        style={{ background: "var(--color-paper)" }}
      >
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <Button variant="primary" asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning={true}
      className="min-h-screen pt-24 pb-12"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500">
            <CheckCircle2 className="h-14 w-14 text-white" strokeWidth={1.5} />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display mb-3 text-4xl font-bold"
            style={{ color: "var(--color-ink)" }}
          >
            Commande confirmée !
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg"
            style={{ color: "var(--color-ink-3)" }}
          >
            Merci pour votre confiance. Votre création unique est en cours de
            préparation.
          </motion.p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-6 overflow-hidden"
          style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }}
        >
          <div
            className="p-6"
            style={{ background: "var(--color-paper-2)", borderBottom: "var(--rule-soft)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
                  Numéro de commande
                </p>
                <p className="text-2xl font-bold" style={{ color: "var(--color-ink)" }}>
                  {orderNumber}
                </p>
              </div>
              <Package className="h-12 w-12" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-4 p-6">
            {/* Montant total */}
            {session?.amountTotal && (
              <div className="flex items-center justify-between pb-4" style={{ borderBottom: "var(--rule-soft)" }}>
                <span style={{ color: "var(--color-ink-3)" }}>Montant total</span>
                <span className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>
                  {(session.amountTotal / 100).toFixed(2)} €
                </span>
              </div>
            )}

            <div className="flex items-start gap-4">
              <Mail className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
              <div>
                <h3 className="mb-1 font-bold" style={{ color: "var(--color-ink)" }}>
                  Email de confirmation envoyé
                </h3>
                <p className="text-sm" style={{ color: "var(--color-ink-3)" }}>
                  Un récapitulatif détaillé de votre commande a été envoyé à{" "}
                  <span className="font-medium">{session?.customerEmail}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
              <div>
                <h3 className="mb-1 font-bold" style={{ color: "var(--color-ink)" }}>
                  Délai de fabrication
                </h3>
                <p className="text-sm" style={{ color: "var(--color-ink-3)" }}>
                  Votre produit sera confectionné à la main dans notre atelier
                  sous 7 à 10 jours ouvrés.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
              <div>
                <h3 className="mb-1 font-bold" style={{ color: "var(--color-ink)" }}>
                  Livraison suivie
                </h3>
                <p className="text-sm" style={{ color: "var(--color-ink-3)" }}>
                  Vous recevrez un numéro de suivi dès l&apos;expédition de
                  votre colis.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-6 p-6"
          style={{ background: "var(--color-paper-2)" }}
        >
          <h3 className="font-display mb-4 text-lg font-bold" style={{ color: "var(--color-ink)" }}>
            Prochaines étapes
          </h3>
          <div className="space-y-3">
            {[
              "Notre atelier prépare votre commande avec soin",
              "Confection artisanale de votre produit personnalisé",
              "Expédition dans un emballage premium",
              "Livraison à votre domicile sous 7-10 jours",
            ].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    border: "1.5px solid var(--color-accent)",
                    color: "var(--color-accent)",
                  }}
                >
                  {index + 1}
                </div>
                <p className="text-sm" style={{ color: "var(--color-ink-3)" }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Button variant="primary" size="lg" className="w-full" asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
          <Button variant="secondary" size="lg" className="w-full" asChild>
            <Link href="/configurateur">Créer un autre produit</Link>
          </Button>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-8 p-6 text-center"
          style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }}
        >
          <p className="mb-2 text-sm" style={{ color: "var(--color-ink-3)" }}>
            Une question sur votre commande ?
          </p>
          <Link
            href="/contact"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            Contactez notre service client
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center pt-24 pb-12"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin" style={{ color: "var(--color-accent)" }} />
        <p style={{ color: "var(--color-ink-3)" }}>Chargement...</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
