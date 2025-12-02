"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useConfiguratorStore } from "@/lib/store/configurator-store"
import { ZoomIn, ZoomOut, RotateCw, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StepPreview() {
  const { configuration } = useConfiguratorStore()
  const [zoom, setZoom] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)

  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  // Draw preview on canvas
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background (fabric)
    if (configuration.fabric) {
      ctx.fillStyle = getFabricColor(configuration.fabric.color)
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add pattern indication
      ctx.font = '20px Arial'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.textAlign = 'center'
      ctx.fillText(configuration.fabric.pattern, canvas.width / 2, canvas.height / 2)
    }

    // Draw product silhouette
    if (configuration.product) {
      ctx.font = 'bold 60px Arial'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.textAlign = 'center'
      ctx.fillText(getProductEmoji(configuration.product.category), canvas.width / 2, canvas.height / 2 + 80)
    }

    // Draw embroidery if exists
    if (configuration.embroidery?.text) {
      ctx.font = 'bold 24px serif'
      ctx.fillStyle = configuration.embroidery.color || '#b76e79'
      ctx.textAlign = 'center'
      ctx.fillText(configuration.embroidery.text, canvas.width / 2, canvas.height - 50)
    }

  }, [configuration, zoom, rotation])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl lg:text-4xl text-ylang-charcoal mb-4">
          Aperçu de votre création
        </h2>
        <p className="font-body text-ylang-charcoal/60 text-lg">
          Visualisez votre produit personnalisé en temps réel
        </p>
      </div>

      {/* Preview Canvas */}
      <div className="bg-ylang-beige/30 rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Canvas */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center">
              <motion.div
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`
                }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={500}
                  className="max-w-full h-auto rounded-lg"
                />
              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              >
                <ZoomOut className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              >
                <ZoomIn className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRotation((rotation + 90) % 360)}
              >
                <RotateCw className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setZoom(1)
                  setRotation(0)
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:w-80 space-y-4">
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-ylang-rose" />
                <h3 className="font-display text-lg font-semibold text-ylang-charcoal">
                  Configuration actuelle
                </h3>
              </div>

              <div className="space-y-3">
                {configuration.product && (
                  <InfoItem
                    label="Produit"
                    value={configuration.product.name}
                  />
                )}

                {configuration.size && (
                  <InfoItem
                    label="Taille"
                    value={configuration.size}
                  />
                )}

                {configuration.fabric && (
                  <InfoItem
                    label="Tissu"
                    value={configuration.fabric.name}
                  />
                )}

                {configuration.embroidery?.text && (
                  <InfoItem
                    label="Broderie"
                    value={configuration.embroidery.text}
                  />
                )}

                {configuration.accessories.length > 0 && (
                  <InfoItem
                    label="Accessoires"
                    value={`${configuration.accessories.length} sélectionné(s)`}
                  />
                )}
              </div>
            </div>

            <div className="bg-ylang-rose/10 rounded-xl p-6">
              <p className="text-sm font-body text-ylang-charcoal/70">
                💡 <strong>Astuce :</strong> Vous pourrez modifier chaque élément à l'étape suivante
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center pb-3 border-b border-ylang-beige last:border-0">
      <span className="text-sm font-body text-ylang-charcoal/60">{label}</span>
      <span className="text-sm font-body font-medium text-ylang-charcoal">{value}</span>
    </div>
  )
}

function getFabricColor(colorName: string): string {
  const colors: Record<string, string> = {
    'Rose': '#f4c2c2',
    'Terracotta': '#d4a89a',
    'Vert': '#c8d5b9',
    'Bleu': '#a8c5dd',
    'Beige': '#f5f1e8',
    'Blanc': '#fafafa'
  }
  return colors[colorName] || '#f5f1e8'
}

function getProductEmoji(category: string): string {
  const emojis: Record<string, string> = {
    "Linge de lit": "🛏️",
    "Décoration": "🎨",
    "Éveil": "🧸"
  }
  return emojis[category] || "✨"
}