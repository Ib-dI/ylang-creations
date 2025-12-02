"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Scissors, Heart, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const values = [
  {
    icon: Scissors,
    title: "Confection artisanale",
    description: "Chaque pièce est cousue à la main dans notre atelier parisien avec le plus grand soin"
  },
  {
    icon: Heart,
    title: "Tissus premium",
    description: "Sélection rigoureuse de textiles biologiques certifiés GOTS et Oeko-Tex"
  },
  {
    icon: Sparkles,
    title: "Personnalisation illimitée",
    description: "Broderies, couleurs, motifs : créez un produit 100% unique qui vous ressemble"
  }
]

export function CraftsmanshipSection() {
  return (
    <section className="section-padding bg-gradient-to-b from-white to-ylang-beige/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-body text-ylang-rose uppercase tracking-widest mb-3">
            Excellence artisanale
          </p>
          <h2 className="font-display text-4xl lg:text-5xl text-ylang-charcoal mb-6">
            Un savoir-faire d'exception
          </h2>
          <p className="font-body text-lg text-ylang-charcoal/60 max-w-3xl mx-auto leading-relaxed">
            Depuis notre atelier Mahorais/Réunion, nous créons des pièces textiles uniques alliant tradition 
            artisanale et innovation. Chaque création est le fruit d'un travail minutieux et passionné.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          
          {/* Images Atelier */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Image principale */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-ylang-beige to-ylang-cream flex items-center justify-center">
                <div className="text-center p-8">
                  <span className="text-6xl mb-4 block">✂️</span>
                  <p className="font-body text-ylang-charcoal/60">
                    Photo de l'atelier
                    <br />
                    <span className="text-sm">(à remplacer)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Image flottante secondaire */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -bottom-8 -right-8 w-2/5 aspect-square rounded-xl overflow-hidden shadow-xl border-4 border-white hidden lg:block"
            >
              <div className="absolute inset-0 bg-ylang-rose/20 flex items-center justify-center">
                <span className="text-4xl">🧵</span>
              </div>
            </motion.div>

            {/* Badge Made in France */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇫🇷</span>
                <div>
                  <p className="text-xs font-body text-ylang-charcoal/60">Fièrement</p>
                  <p className="font-display text-sm font-semibold text-ylang-charcoal">Made in France</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Texte & Valeurs */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-display text-3xl text-ylang-charcoal mb-4">
                L'excellence au service de vos émotions
              </h3>
              <p className="font-body text-ylang-charcoal/70 leading-relaxed mb-4">
                Chaque pièce Ylang Créations naît d'une rencontre entre votre vision et notre expertise. 
                Nous sélectionnons avec soin les plus beaux tissus biologiques et les transformons en 
                créations uniques qui accompagneront les moments précieux de votre vie.
              </p>
              <p className="font-body text-ylang-charcoal/70 leading-relaxed">
                Notre atelier Ylang Créations perpétue un savoir-faire traditionnel tout en intégrant des 
                techniques modernes de personnalisation pour vous offrir une expérience sur mesure 
                inégalée.
              </p>
            </div>

            {/* Values Cards */}
            <div className="space-y-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="flex gap-4 p-4 bg-white rounded-xl hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-ylang-rose/10 rounded-lg flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-ylang-rose" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-ylang-charcoal mb-1">
                      {value.title}
                    </h4>
                    <p className="font-body text-sm text-ylang-charcoal/60">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Button variant="secondary" size="lg" className="group" asChild>
              <Link href="/a-propos">
                Découvrir notre histoire
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-white rounded-2xl shadow-lg"
        >
          {[
            { number: "1500+", label: "Créations uniques" },
            { number: "6 ans", label: "D'expertise" },
            { number: "4.9/5", label: "Satisfaction clients" },
            { number: "100%", label: "Made in France" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-4xl lg:text-5xl font-bold text-ylang-rose mb-2">
                {stat.number}
              </p>
              <p className="font-body text-sm text-ylang-charcoal/60">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}