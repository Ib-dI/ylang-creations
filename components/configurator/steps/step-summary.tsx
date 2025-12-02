"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useConfiguratorStore } from "@/lib/store/configurator-store"
import { Check, Edit2, Package, Truck, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function StepSummary() {
  const { configuration, getTotalPrice, setStep } = useConfiguratorStore()
  const totalPrice = getTotalPrice()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-ylang-rose rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="font-display text-3xl lg:text-4xl text-ylang-charcoal mb-4">
          Votre création est prête !
        </h2>
        <p className="font-body text-ylang-charcoal/60 text-lg">
          Vérifiez les détails avant d'ajouter au panier
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Configuration Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Product */}
          {configuration.product && (
            <ConfigSection
              title="Produit sélectionné"
              onEdit={() => setStep(1)}
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-ylang-beige/30 rounded-xl flex items-center justify-center text-3xl">
                  {getProductEmoji(configuration.product.category)}
                </div>
                <div className="flex-1">
                  <h4 className="font-display text-lg font-semibold text-ylang-charcoal">
                    {configuration.product.name}
                  </h4>
                  <p className="text-sm text-ylang-charcoal/60">
                    {configuration.product.category}
                  </p>
                  {configuration.size && (
                    <p className="text-sm text-ylang-charcoal/60 mt-1">
                      Taille : {configuration.size}
                    </p>
                  )}
                </div>
                <p className="font-display text-xl font-bold text-ylang-rose">
                  {configuration.product.basePrice}€
                </p>
              </div>
            </ConfigSection>
          )}

          {/* Fabric */}
          {configuration.fabric && (
            <ConfigSection
              title="Tissu choisi"
              onEdit={() => setStep(2)}
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-ylang-beige/30 rounded-xl flex items-center justify-center text-3xl">
                  🧵
                </div>
                <div className="flex-1">
                  <h4 className="font-display text-lg font-semibold text-ylang-charcoal">
                    {configuration.fabric.name}
                  </h4>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-1 bg-ylang-beige/50 rounded text-xs text-ylang-charcoal/70">
                      {configuration.fabric.category}
                    </span>
                    <span className="px-2 py-1 bg-ylang-beige/50 rounded text-xs text-ylang-charcoal/70">
                      {configuration.fabric.color}
                    </span>
                  </div>
                </div>
                <p className="font-display text-xl font-bold text-ylang-rose">
                  +{configuration.fabric.price}€
                </p>
              </div>
            </ConfigSection>
          )}

          {/* Personalization */}
          {(configuration.embroidery || configuration.accessories.length > 0) && (
            <ConfigSection
              title="Personnalisation"
              onEdit={() => setStep(4)}
            >
              <div className="space-y-3">
                {configuration.embroidery && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✨</span>
                      <div>
                        <p className="font-body text-sm font-medium text-ylang-charcoal">
                          Broderie "{configuration.embroidery.text}"
                        </p>
                        <p className="text-xs text-ylang-charcoal/60">
                          Police {configuration.embroidery.font}
                        </p>
                      </div>
                    </div>
                    <p className="font-body font-semibold text-ylang-rose">+15€</p>
                  </div>
                )}

                {configuration.accessories.map((accId) => (
                  <div key={accId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎀</span>
                      <p className="font-body text-sm font-medium text-ylang-charcoal">
                        Accessoire {accId}
                      </p>
                    </div>
                    <p className="font-body font-semibold text-ylang-rose">+10€</p>
                  </div>
                ))}
              </div>
            </ConfigSection>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          
          {/* Price Breakdown */}
          <Card className="p-6 sticky top-32">
            <h3 className="font-display text-xl font-semibold text-ylang-charcoal mb-4">
              Récapitulatif
            </h3>

            <div className="space-y-3 pb-4 border-b border-ylang-beige">
              {configuration.product && (
                <PriceRow
                  label="Produit"
                  value={`${configuration.product.basePrice}€`}
                />
              )}
              {configuration.fabric && (
                <PriceRow
                  label="Tissu"
                  value={`${configuration.fabric.price}€`}
                />
              )}
              {configuration.embroidery && (
                <PriceRow
                  label="Broderie"
                  value="15€"
                />
              )}
              {configuration.accessories.length > 0 && (
                <PriceRow
                  label={`Accessoires (${configuration.accessories.length})`}
                  value={`${configuration.accessories.length * 10}€`}
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mb-6">
              <span className="font-display text-lg font-semibold text-ylang-charcoal">
                Total
              </span>
              <span className="font-display text-3xl font-bold text-ylang-rose">
                {totalPrice}€
              </span>
            </div>

            <Button variant="luxury" className="w-full mb-3" size="lg">
              <Package className="w-5 h-5 mr-2" />
              Ajouter au panier
            </Button>

            <p className="text-xs text-center text-ylang-charcoal/60">
              Livraison offerte dès 100€ d'achat
            </p>
          </Card>

          {/* Trust Badges */}
          <div className="space-y-3">
            <TrustBadge
              icon={<Truck className="w-5 h-5" />}
              text="Livraison sous 7-10 jours"
            />
            <TrustBadge
              icon={<Shield className="w-5 h-5" />}
              text="Satisfait ou remboursé 30 jours"
            />
            <TrustBadge
              icon={<Check className="w-5 h-5" />}
              text="Confection artisanale française"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfigSection({
  title,
  onEdit,
  children
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-ylang-charcoal">
          {title}
        </h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit2 className="w-4 h-4 mr-2" />
          Modifier
        </Button>
      </div>
      {children}
    </Card>
  )
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-body text-ylang-charcoal/70">{label}</span>
      <span className="text-sm font-body font-medium text-ylang-charcoal">{value}</span>
    </div>
  )
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-ylang-beige/30 rounded-lg">
      <div className="text-ylang-rose">{icon}</div>
      <p className="text-sm font-body text-ylang-charcoal">{text}</p>
    </div>
  )
}

function getProductEmoji(category: string): string {
  const emojis: Record<string, string> = {
    "Linge de lit": "🛏️",
    "Décoration": "🎨",
    "Éveil": "🧸"
  }
  return emojis[category] || "✨"
}