"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useConfiguratorStore } from "@/lib/store/configurator-store"
import { Type, Palette, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const fonts = ['Arial', 'Times New Roman', 'Courier', 'Georgia', 'Brush Script MT']
const embroideryColors = [
  { name: 'Rose', hex: '#b76e79' },
  { name: 'Or', hex: '#d4af37' },
  { name: 'Argent', hex: '#c0c0c0' },
  { name: 'Blanc', hex: '#ffffff' },
  { name: 'Noir', hex: '#000000' },
  { name: 'Bleu marine', hex: '#001f3f' }
]

const accessories = [
  { id: 'pompom', name: 'Pompons décoratifs', price: 10, emoji: '🎀' },
  { id: 'ruban', name: 'Ruban satin', price: 8, emoji: '🎗️' },
  { id: 'dentelle', name: 'Bordure dentelle', price: 12, emoji: '🧵' },
  { id: 'bouton', name: 'Boutons bois', price: 6, emoji: '⚪' }
]

export function StepPersonalization() {
  const { configuration, setEmbroidery, addAccessory, removeAccessory } = useConfiguratorStore()

  const [embroideryText, setEmbroideryText] = React.useState(
    configuration.embroidery?.text || ''
  )
  const [selectedFont, setSelectedFont] = React.useState(
    configuration.embroidery?.font || fonts[0]
  )
  const [selectedColor, setSelectedColor] = React.useState(
    configuration.embroidery?.color || embroideryColors[0].hex
  )

  // Update embroidery in store
  React.useEffect(() => {
    if (embroideryText.trim()) {
      setEmbroidery({
        text: embroideryText,
        font: selectedFont,
        color: selectedColor,
        position: 'center'
      })
    } else {
      setEmbroidery(undefined)
    }
  }, [embroideryText, selectedFont, selectedColor])

  const isAccessorySelected = (accessoryId: string) => {
    return configuration.accessories.includes(accessoryId)
  }

  const toggleAccessory = (accessoryId: string) => {
    if (isAccessorySelected(accessoryId)) {
      removeAccessory(accessoryId)
    } else {
      addAccessory(accessoryId)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl lg:text-4xl text-ylang-charcoal mb-4">
          Personnalisez votre création
        </h2>
        <p className="font-body text-ylang-charcoal/60 text-lg">
          Ajoutez votre touche personnelle avec broderie et accessoires
        </p>
      </div>

      {/* Embroidery Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-ylang-beige/30 rounded-2xl p-6 lg:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-ylang-rose/10 rounded-xl flex items-center justify-center">
            <Type className="w-6 h-6 text-ylang-rose" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-ylang-charcoal">
              Broderie personnalisée
            </h3>
            <p className="text-sm text-ylang-charcoal/60">
              +15€ • Prénom, initiales ou message court
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-body font-medium text-ylang-charcoal mb-2">
              Texte à broder (max 15 caractères)
            </label>
            <Input
              type="text"
              value={embroideryText}
              onChange={(e) => setEmbroideryText(e.target.value.slice(0, 15))}
              placeholder="Ex: Emma, M.D., ♥ Bébé"
              maxLength={15}
            />
            <p className="text-xs text-ylang-charcoal/40 mt-1">
              {embroideryText.length}/15 caractères
            </p>
          </div>

          {embroideryText && (
            <>
              {/* Font Selection */}
              <div>
                <label className="block text-sm font-body font-medium text-ylang-charcoal mb-3">
                  Police de broderie
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {fonts.map((font) => (
                    <button
                      key={font}
                      onClick={() => setSelectedFont(font)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-300",
                        selectedFont === font
                          ? "border-ylang-rose bg-ylang-rose/5"
                          : "border-ylang-beige hover:border-ylang-rose/50"
                      )}
                    >
                      <span style={{ fontFamily: font }} className="text-lg">
                        Aa
                      </span>
                      <p className="text-xs text-ylang-charcoal/60 mt-1">
                        {font.split(' ')[0]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-body font-medium text-ylang-charcoal mb-3">
                  Couleur de fil
                </label>
                <div className="flex flex-wrap gap-3">
                  {embroideryColors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(color.hex)}
                      className={cn(
                        "relative group",
                        selectedColor === color.hex && "ring-2 ring-ylang-rose ring-offset-2"
                      )}
                    >
                      <div
                        className="w-12 h-12 rounded-full border-2 border-ylang-beige transition-transform group-hover:scale-110"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-ylang-charcoal/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-xl p-6 text-center">
                <p className="text-sm text-ylang-charcoal/60 mb-3">Aperçu broderie :</p>
                <p
                  style={{
                    fontFamily: selectedFont,
                    color: selectedColor,
                    fontSize: '32px',
                    fontWeight: 'bold'
                  }}
                >
                  {embroideryText}
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Accessories Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-ylang-beige/30 rounded-2xl p-6 lg:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-ylang-rose/10 rounded-xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-ylang-rose" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-ylang-charcoal">
              Accessoires décoratifs
            </h3>
            <p className="text-sm text-ylang-charcoal/60">
              Ajoutez des finitions premium
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {accessories.map((accessory, index) => {
            const isSelected = isAccessorySelected(accessory.id)

            return (
              <motion.button
                key={accessory.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => toggleAccessory(accessory.id)}
                className={cn(
                  "relative p-6 rounded-xl border-2 transition-all duration-300 text-left",
                  isSelected
                    ? "border-ylang-rose bg-ylang-rose/5 shadow-lg"
                    : "border-ylang-beige hover:border-ylang-rose/50 hover:shadow-md"
                )}
              >
                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-ylang-rose rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white rotate-45" />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <span className="text-4xl">{accessory.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-display text-lg font-semibold text-ylang-charcoal mb-1">
                      {accessory.name}
                    </h4>
                    <p className="text-sm font-display font-bold text-ylang-rose">
                      +{accessory.price}€
                    </p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Summary */}
      {(embroideryText || configuration.accessories.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-ylang-rose/10 rounded-xl p-6"
        >
          <h4 className="font-display text-lg font-semibold text-ylang-charcoal mb-3">
            Options sélectionnées :
          </h4>
          <ul className="space-y-2">
            {embroideryText && (
              <li className="flex items-center gap-2 text-sm font-body text-ylang-charcoal">
                <span className="w-2 h-2 bg-ylang-rose rounded-full" />
                Broderie "{embroideryText}" (+15€)
              </li>
            )}
            {configuration.accessories.map((accId) => {
              const acc = accessories.find(a => a.id === accId)
              return acc ? (
                <li key={accId} className="flex items-center gap-2 text-sm font-body text-ylang-charcoal">
                  <span className="w-2 h-2 bg-ylang-rose rounded-full" />
                  {acc.name} (+{acc.price}€)
                </li>
              ) : null
            })}
          </ul>
        </motion.div>
      )}
    </div>
  )
}