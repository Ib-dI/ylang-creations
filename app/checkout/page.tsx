"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Download, Mail, Package, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent')
  
  // Générer un numéro de commande
  const orderNumber = `YC${Date.now().toString().slice(-8)}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1e8] pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-4xl font-bold text-[#1a1a1a] mb-3"
          >
            Commande confirmée !
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-[#1a1a1a]/60"
          >
            Merci pour votre confiance. Votre création unique est en cours de préparation.
          </motion.p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg border border-[#f5f1e8] overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-[#b76e79] to-[#d4a89a] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Numéro de commande</p>
                <p className="text-2xl font-bold">{orderNumber}</p>
              </div>
              <Package className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#f5f1e8] rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#b76e79]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">Email de confirmation envoyé</h3>
                <p className="text-sm text-[#1a1a1a]/60">
                  Un récapitulatif détaillé de votre commande vous a été envoyé par email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#f5f1e8] rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-[#b76e79]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">Délai de fabrication</h3>
                <p className="text-sm text-[#1a1a1a]/60">
                  Votre produit sera confectionné à la main dans notre atelier parisien sous 7 à 10 jours ouvrés.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#f5f1e8] rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#b76e79]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">Livraison suivie</h3>
                <p className="text-sm text-[#1a1a1a]/60">
                  Vous recevrez un numéro de suivi dès l'expédition de votre colis.
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
          className="bg-[#faf9f6] rounded-2xl p-6 mb-6"
        >
          <h3 className="font-display text-lg font-bold text-[#1a1a1a] mb-4">
            Prochaines étapes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#b76e79] text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <p className="text-sm text-[#1a1a1a]/70">
                Notre atelier prépare votre commande avec soin
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#b76e79]/60 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <p className="text-sm text-[#1a1a1a]/70">
                Confection artisanale de votre produit personnalisé
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#b76e79]/40 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <p className="text-sm text-[#1a1a1a]/70">
                Expédition dans un emballage premium
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#b76e79]/20 text-white rounded-full flex items-center justify-center text-sm font-bold">
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
          className="grid sm:grid-cols-2 gap-4"
        >
          <Button variant="primary" size="lg" className="w-full" asChild>
            <Link href="/">
              Retour à l'accueil
            </Link>
          </Button>
          <Button variant="secondary" size="lg" className="w-full" asChild>
            <Link href="/configurateur">
              Créer un autre produit
            </Link>
          </Button>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-8 p-6 bg-white rounded-xl border border-[#f5f1e8]"
        >
          <p className="text-sm text-[#1a1a1a]/60 mb-2">
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
  )
}