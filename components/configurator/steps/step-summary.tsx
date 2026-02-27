"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConfiguratorStore } from "@/lib/store/configurator-store";
import { motion } from "framer-motion";
import { Check, Edit2, Package, Shield, Truck } from "lucide-react";
import * as React from "react";

export function StepSummary() {
  const { configuration, getTotalPrice, setStep } = useConfiguratorStore();
  const totalPrice = getTotalPrice();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-ylang-rose mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        >
          <Check className="h-10 w-10 text-white" />
        </motion.div>
        <h2 className="font-display text-ylang-charcoal mb-4 text-3xl lg:text-4xl">
          Votre création est prête !
        </h2>
        <p className="font-body text-ylang-charcoal/60 text-lg">
          Vérifiez les détails avant d'ajouter au panier
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Configuration Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Product */}
          {configuration.product && (
            <ConfigSection
              title="Produit sélectionné"
              onEdit={() => setStep(1)}
            >
              <div className="flex items-center gap-4">
                <div className="bg-ylang-beige/30 flex h-20 w-20 items-center justify-center rounded-xl text-3xl">
                  {getProductEmoji(configuration.product.category)}
                </div>
                <div className="flex-1">
                  <h4 className="font-display text-ylang-charcoal text-lg font-semibold">
                    {configuration.product.name}
                  </h4>
                  <p className="text-ylang-charcoal/60 text-sm">
                    {configuration.product.category}
                  </p>
                  {configuration.size && (
                    <p className="text-ylang-charcoal/60 mt-1 text-sm">
                      Taille : {configuration.size}
                    </p>
                  )}
                </div>
                <p className="font-display text-ylang-rose text-xl font-bold">
                  {configuration.product.basePrice}€
                </p>
              </div>
            </ConfigSection>
          )}

          {/* Fabric */}
          {configuration.fabric && (
            <ConfigSection title="Tissu choisi" onEdit={() => setStep(2)}>
              <div className="flex items-center gap-4">
                <div className="bg-ylang-beige/30 flex h-20 w-20 items-center justify-center rounded-xl text-3xl">
                  🧵
                </div>
                <div className="flex-1">
                  <h4 className="font-display text-ylang-charcoal text-lg font-semibold">
                    {configuration.fabric.name}
                  </h4>
                  <div className="mt-1 flex gap-2">
                    <span className="bg-ylang-beige/50 text-ylang-charcoal/70 rounded px-2 py-1 text-xs">
                      {configuration.fabric.category}
                    </span>
                    <span className="bg-ylang-beige/50 text-ylang-charcoal/70 rounded px-2 py-1 text-xs">
                      {configuration.fabric.color}
                    </span>
                  </div>
                </div>
                <p className="font-display text-ylang-rose text-xl font-bold">
                  +{configuration.fabric.price}€
                </p>
              </div>
            </ConfigSection>
          )}

          {/* Personalization */}
          {configuration.embroidery && (
            <ConfigSection title="Personnalisation" onEdit={() => setStep(4)}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="font-body text-ylang-charcoal text-sm font-medium">
                        Broderie "{configuration.embroidery.text}"
                      </p>
                      <p className="text-ylang-charcoal/60 text-xs">
                        Police {configuration.embroidery.font}
                      </p>
                    </div>
                  </div>
                  <p className="font-body text-ylang-rose font-semibold">
                    +15€
                  </p>
                </div>
              </div>
            </ConfigSection>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <Card className="sticky top-32 p-6">
            <h3 className="font-display text-ylang-charcoal mb-4 text-xl font-semibold">
              Récapitulatif
            </h3>

            <div className="border-ylang-beige space-y-3 border-b pb-4">
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
                <PriceRow label="Broderie" value="15€" />
              )}
            </div>

            <div className="mb-6 flex items-center justify-between pt-4">
              <span className="font-display text-ylang-charcoal text-lg font-semibold">
                Total
              </span>
              <span className="font-display text-ylang-rose text-3xl font-bold">
                {totalPrice}€
              </span>
            </div>

            <Button variant="luxury" className="mb-3 w-full" size="lg">
              <Package className="mr-2 h-5 w-5" />
              Ajouter au panier
            </Button>

            <p className="text-ylang-charcoal/60 text-center text-xs">
              Livraison offerte dès 100€ d'achat
            </p>
          </Card>

          {/* Trust Badges */}
          <div className="space-y-3">
            <TrustBadge
              icon={<Truck className="h-5 w-5" />}
              text="Livraison sous 7-10 jours"
            />
            <TrustBadge
              icon={<Shield className="h-5 w-5" />}
              text="Satisfait ou remboursé 30 jours"
            />
            <TrustBadge
              icon={<Check className="h-5 w-5" />}
              text="Confection artisanale française"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-ylang-charcoal text-lg font-semibold">
          {title}
        </h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit2 className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>
      {children}
    </Card>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body text-ylang-charcoal/70 text-sm">{label}</span>
      <span className="font-body text-ylang-charcoal text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="bg-ylang-beige/30 flex items-center gap-3 rounded-lg p-3">
      <div className="text-ylang-rose">{icon}</div>
      <p className="font-body text-ylang-charcoal text-sm">{text}</p>
    </div>
  );
}

function getProductEmoji(category: string): string {
  const emojis: Record<string, string> = {
    "Linge de lit": "🛏️",
    Décoration: "🎨",
    Éveil: "🧸",
  };
  return emojis[category] || "✨";
}
