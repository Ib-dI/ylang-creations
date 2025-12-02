"use client"

import * as React from "react"
import { useConfiguratorStore } from "@/lib/store/configurator-store"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { number: 1, label: "Produit" },
  { number: 2, label: "Tissu" },
  { number: 3, label: "Aperçu" },
  { number: 4, label: "Personnalisation" },
  { number: 5, label: "Récapitulatif" }
]

export function StepIndicator() {
  const currentStep = useConfiguratorStore((state) => state.currentStep)

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number
        const isCompleted = currentStep > step.number
        const isLast = index === steps.length - 1

        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={cn(
                  "w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-display font-bold text-sm lg:text-base transition-all duration-300",
                  isCompleted && "bg-ylang-rose text-white",
                  isActive && "bg-ylang-rose text-white ring-4 ring-ylang-rose/20",
                  !isActive && !isCompleted && "bg-ylang-beige text-ylang-charcoal/40"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 lg:w-6 lg:h-6" />
                ) : (
                  step.number
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "mt-2 text-xs lg:text-sm font-body text-center transition-colors duration-300",
                  (isActive || isCompleted) ? "text-ylang-rose font-medium" : "text-ylang-charcoal/40"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 lg:mx-4 transition-all duration-500",
                  isCompleted ? "bg-ylang-rose" : "bg-ylang-beige"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
