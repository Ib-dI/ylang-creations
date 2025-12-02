"use client"

import * as React from "react"
import { useConfiguratorStore } from "@/lib/store/configurator-store"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react"

export function ConfiguratorNavigation() {
  const { currentStep, nextStep, prevStep, canGoNext } = useConfiguratorStore()

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === 5

  return (
    <div className="bg-ylang-beige/30 border-t border-ylang-beige px-6 lg:px-12 py-6">
      <div className="flex items-center justify-between">
        
        {/* Bouton Précédent */}
        <Button
          variant="ghost"
          size="lg"
          onClick={prevStep}
          disabled={isFirstStep}
          className="group"
        >
          <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour
        </Button>

        {/* Bouton Suivant / Ajouter au panier */}
        {isLastStep ? (
          <Button variant="luxury" size="lg" className="group">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Ajouter au panier
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={nextStep}
            disabled={!canGoNext()}
            className="group"
          >
            Continuer
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
    </div>
  )
}
