"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useConfiguratorStore } from "@/lib/store/configurator-store"
import { mockProducts } from "@/data/products"
import { Check, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function StepProduct() {
  const { configuration, setProduct, setSize } = useConfiguratorStore()
  const [selectedProductId, setSelectedProductId] = React.useState(
    configuration.product?.id || ""
  )
  const [selectedSize, setSelectedSize] = React.useState(
    configuration.size || ""
  )

  const selectedProduct = mockProducts.find(p => p.id === selectedProductId)

  const handleSelectProduct = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId)
    if (product) {
      setSelectedProductId(productId)
      setProduct(product)
      if (product.defaultSize) {
        setSelectedSize(product.defaultSize)
        setSize(product.defaultSize)
      }
    }
  }

  const handleSelectSize = (size: string) => {
    setSelectedSize(size)
    setSize(size)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl lg:text-4xl text-ylang-charcoal mb-4">
          Choisissez votre produit
        </h2>
        <p className="font-body text-ylang-charcoal/60 text-lg">
          Sélectionnez le produit que vous souhaitez personnaliser
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockProducts.map((product, index) => {
          const isSelected = selectedProductId === product.id

          return (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelectProduct(product.id)}
              className={cn(
                "relative group text-left rounded-2xl overflow-hidden transition-all duration-300",
                isSelected
                  ? "ring-4 ring-ylang-rose shadow-2xl scale-105"
                  : "hover:shadow-xl hover:scale-105"
              )}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] bg-ylang-beige/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">{getProductEmoji(product.category)}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-xs text-ylang-charcoal/50 uppercase tracking-wider mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-display text-lg font-semibold text-ylang-charcoal">
                      {product.name}
                    </h3>
                  </div>
                  
                  {/* Checkmark */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 bg-ylang-rose rounded-full flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>

                <p className="font-display text-xl font-bold text-ylang-rose mb-2">
                  À partir de {product.basePrice}€
                </p>

                <p className="text-sm text-ylang-charcoal/60 line-clamp-2">
                  {product.description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Size Selection */}
      {selectedProduct?.sizes && selectedProduct.sizes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-ylang-beige/30 rounded-2xl p-6 lg:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-ylang-rose" />
            <h3 className="font-display text-xl text-ylang-charcoal">
              Sélectionnez la taille
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {selectedProduct.sizes.map((size) => {
              const isSelected = selectedSize === size

              return (
                <button
                  key={size}
                  onClick={() => handleSelectSize(size)}
                  className={cn(
                    "px-4 py-3 rounded-xl font-body text-sm transition-all duration-300",
                    isSelected
                      ? "bg-ylang-rose text-white shadow-lg scale-105"
                      : "bg-white text-ylang-charcoal hover:bg-ylang-beige"
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </motion.div>
      )}
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
