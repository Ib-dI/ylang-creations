"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Mail, MapPin, Package, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");

  // Générer un numéro de commande
  const orderNumber = `YC${Date.now().toString().slice(-8)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1e8] pt-24 pb-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-2xl">
            <CheckCircle2 className="h-14 w-14 text-white" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display mb-3 text-4xl font-bold text-[#1a1a1a]"
          >
            Commande confirmée !
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-[#1a1a1a]/60"
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
          className="mb-6 overflow-hidden rounded-2xl border border-[#f5f1e8] bg-white shadow-lg"
        >
          <div className="bg-gradient-to-r from-[#b76e79] to-[#d4a89a] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm opacity-90">Numéro de commande</p>
                <p className="text-2xl font-bold">{orderNumber}</p>
              </div>
              <Package className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f5f1e8]">
                <Mail className="h-5 w-5 text-[#b76e79]" />
              </div>
              <div>
                <h3 className="mb-1 font-bold text-[#1a1a1a]">
                  Email de confirmation envoyé
                </h3>
                <p className="text-sm text-[#1a1a1a]/60">
                  Un récapitulatif détaillé de votre commande vous a été envoyé
                  par email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f5f1e8]">
                <Clock className="h-5 w-5 text-[#b76e79]" />
              </div>
              <div>
                <h3 className="mb-1 font-bold text-[#1a1a1a]">
                  Délai de fabrication
                </h3>
                <p className="text-sm text-[#1a1a1a]/60">
                  Votre produit sera confectionné à la main dans notre atelier
                  parisien sous 7 à 10 jours ouvrés.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f5f1e8]">
                <MapPin className="h-5 w-5 text-[#b76e79]" />
              </div>
              <div>
                <h3 className="mb-1 font-bold text-[#1a1a1a]">
                  Livraison suivie
                </h3>
                <p className="text-sm text-[#1a1a1a]/60">
                  Vous recevrez un numéro de suivi dès l'expédition de votre
                  colis.
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
          className="mb-6 rounded-2xl bg-[#faf9f6] p-6"
        >
          <h3 className="font-display mb-4 text-lg font-bold text-[#1a1a1a]">
            Prochaines étapes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b76e79] text-sm font-bold text-white">
                1
              </div>
              <p className="text-sm text-[#1a1a1a]/70">
                Notre atelier prépare votre commande avec soin
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b76e79]/60 text-sm font-bold text-white">
                2
              </div>
              <p className="text-sm text-[#1a1a1a]/70">
                Confection artisanale de votre produit personnalisé
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b76e79]/40 text-sm font-bold text-white">
                3
              </div>
              <p className="text-sm text-[#1a1a1a]/70">
                Expédition dans un emballage premium
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b76e79]/20 text-sm font-bold text-white">
                4
              </div>
              <p className="text-sm text-[#1a1a1a]/70">
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
            <Link href="/">Retour à l'accueil</Link>
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
          className="mt-8 rounded-xl border border-[#f5f1e8] bg-white p-6 text-center"
        >
          <p className="mb-2 text-sm text-[#1a1a1a]/60">
            Une question sur votre commande ?
          </p>
          <Link
            href="/contact"
            className="text-sm font-medium text-[#b76e79] hover:underline"
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#faf9f6] to-[#f5f1e8] pt-24 pb-12">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#b76e79]" />
        <p className="text-[#1a1a1a]/60">Chargement...</p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmationContent />
    </Suspense>
  );
}
