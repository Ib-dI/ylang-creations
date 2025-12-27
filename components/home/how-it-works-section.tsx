"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Palette, Wand2, Package, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "01",
    icon: Palette,
    title: "Choisissez votre produit",
    description: "Parcourez notre collection et sélectionnez le produit qui vous correspond : gigoteuse, tour de lit, doudou, décoration...",
    features: ["Large choix de produits", "Toutes les tailles disponibles", "Conseils personnalisés"]
  },
  {
    number: "02",
    icon: Wand2,
    title: "Personnalisez à l'infini",
    description: "Utilisez notre configurateur intuitif pour choisir vos tissus, couleurs, broderies et options. Visualisez en temps réel votre création.",
    features: ["Bibliothèque de 200+ tissus", "Broderie sur mesure", "Aperçu instantané"]
  },
  {
    number: "03",
    icon: Package,
    title: "Recevez votre création",
    description: "Votre pièce unique est confectionnée à la main dans notre atelier et livrée avec soin dans un emballage premium.",
    features: ["Confection sous 7-10 jours", "Livraison soignée", "Garantie satisfait ou remboursé"]
  }
]

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Décorations d'arrière-plan */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-ylang-sage/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-ylang-rose/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-body text-ylang-rose uppercase tracking-widest mb-3">
            Simple et intuitif
          </p>
          <h2 className="font-display text-4xl lg:text-5xl text-ylang-charcoal mb-6">
            Comment ça marche ?
          </h2>
          <p className="font-body text-lg text-ylang-charcoal/60 max-w-2xl mx-auto">
            Créez votre produit unique en 3 étapes simples. 
            Notre configurateur vous guide à chaque instant.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative group"
            >
              {/* Connecting Line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-linear-to-r from-ylang-rose/50 to-transparent -translate-x-1/2 z-0" />
              )}

              {/* Card */}
              <div className="relative bg-ylang-cream rounded-2xl p-8 hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 h-full">
                
                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-linear-to-br from-ylang-rose to-ylang-terracotta rounded-full flex items-center justify-center shadow-lg">
                  <span className="font-display text-2xl font-bold text-white">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-ylang-terracotta" />
                </div>

                {/* Content */}
                <h3 className="font-display text-2xl text-ylang-charcoal mb-4">
                  {step.title}
                </h3>
                <p className="font-body text-ylang-charcoal/70 mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* Features list */}
                <ul className="space-y-2">
                  {step.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-ylang-terracotta shrink-0 mt-0.5" />
                      <span className="text-sm font-body text-ylang-charcoal/60">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button variant="luxury" size="xl" className="group" asChild>
            <Link href="/configurateur">
              <Wand2 className="w-5 h-5 mr-2" />
              Commencer ma création
            </Link>
          </Button>
          <p className="font-body text-sm text-ylang-charcoal/60 mt-4">
            ✨ Aucun engagement • Aperçu gratuit • Paiement sécurisé
          </p>
        </motion.div>
      </div>
    </section>
  )
}