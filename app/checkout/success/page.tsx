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
    // Générer un numéro de commande côté client uniquement
    setOrderNumber(`YC${Date.now().toString().slice(-8)}`);
  }, []);

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
      <div className="from-ylang-cream to-ylang-beige flex min-h-screen items-center justify-center bg-linear-to-br pt-24 pb-12">
        <div className="text-center">
          <Loader2 className="text-ylang-rose mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-ylang-charcoal/60">
            Confirmation de votre paiement...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="from-ylang-cream to-ylang-beige flex min-h-screen items-center justify-center bg-linear-to-br pt-24 pb-12">
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
    <div suppressHydrationWarning={true} className="from-ylang-terracotta/50 to-ylang-terracotta/30 min-h-screen bg-linear-to-br pt-24 pb-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-sm">
            <CheckCircle2 className="h-14 w-14 text-white" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-ylang-charcoal mb-3 text-4xl font-bold"
          >
            Commande confirmée !
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-ylang-charcoal/60 text-lg"
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
          className="border-ylang-beige mb-6 overflow-hidden rounded-2xl border bg-white shadow-lg"
        >
          <div className="from-ylang-rose to-ylang-terracotta bg-linear-to-r p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm opacity-90">Numéro de commande</p>
                <p className="text-2xl font-bold">{orderNumber}</p>
              </div>
              <Package className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="space-y-4 p-6">
            {/* Montant total */}
            {session?.amountTotal && (
              <div className="border-ylang-beige flex items-center justify-between border-b pb-4">
                <span className="text-ylang-charcoal/60">Montant total</span>
                <span className="text-ylang-rose text-2xl font-bold">
                  {(session.amountTotal / 100).toFixed(2)} €
                </span>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="bg-ylang-beige flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Mail className="text-ylang-rose h-5 w-5" />
              </div>
              <div>
                <h3 className="text-ylang-charcoal mb-1 font-bold">
                  Email de confirmation envoyé
                </h3>
                <p className="text-ylang-charcoal/60 text-sm">
                  Un récapitulatif détaillé de votre commande a été envoyé à{" "}
                  <span className="font-medium">{session?.customerEmail}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-ylang-beige flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Clock className="text-ylang-rose h-5 w-5" />
              </div>
              <div>
                <h3 className="text-ylang-charcoal mb-1 font-bold">
                  Délai de fabrication
                </h3>
                <p className="text-ylang-charcoal/60 text-sm">
                  Votre produit sera confectionné à la main dans notre atelier
                  sous 7 à 10 jours ouvrés.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-ylang-beige flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <MapPin className="text-ylang-rose h-5 w-5" />
              </div>
              <div>
                <h3 className="text-ylang-charcoal mb-1 font-bold">
                  Livraison suivie
                </h3>
                <p className="text-ylang-charcoal/60 text-sm">
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
          className="bg-ylang-cream mb-6 rounded-2xl p-6"
        >
          <h3 className="font-display text-ylang-charcoal mb-4 text-lg font-bold">
            Prochaines étapes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-ylang-rose flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                1
              </div>
              <p className="text-ylang-charcoal/70 text-sm">
                Notre atelier prépare votre commande avec soin
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-ylang-rose/60 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                2
              </div>
              <p className="text-ylang-charcoal/70 text-sm">
                Confection artisanale de votre produit personnalisé
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-ylang-rose/40 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                3
              </div>
              <p className="text-ylang-charcoal/70 text-sm">
                Expédition dans un emballage premium
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-ylang-rose/20 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                4
              </div>
              <p className="text-ylang-charcoal/70 text-sm">
                Livraison à votre domicile sous 7-10 jours
              </p>
            </div>
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
          className="border-ylang-beige mt-8 rounded-xl border bg-white p-6 text-center"
        >
          <p className="text-ylang-charcoal/60 mb-2 text-sm">
            Une question sur votre commande ?
          </p>
          <Link
            href="/contact"
            className="text-ylang-rose text-sm font-medium hover:underline"
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
    <div className="from-ylang-cream to-ylang-beige flex min-h-screen items-center justify-center bg-linear-to-br pt-24 pb-12">
      <div className="text-center">
        <Loader2 className="text-ylang-rose mx-auto mb-4 h-12 w-12 animate-spin" />
        <p className="text-ylang-charcoal/60">Chargement...</p>
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
