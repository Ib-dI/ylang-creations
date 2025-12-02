"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useConfiguratorStore } from "@/lib/store/configurator-store"
import { mockFabrics } from "@/data/fabrics"
import { Check, Search, X, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Fabric } from "@/types/configurator"

export function StepFabric() {
  const { configuration, setFabric } = useConfiguratorStore()
  const [selectedFabricId, setSelectedFabricId] = React.useState(
    configuration.fabric?.id || ""
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedFilters, setSelectedFilters] = React.useState<{
    category: string[]
    color: string[]
    pattern: string[]
    material: string[]
  }>({
    category: [],
    color: [],
    pattern: [],
    material: []
  })
  const [detailModalFabric, setDetailModalFabric] = React.useState<Fabric | null>(null)

  // Extract unique filter values
  const filterOptions = React.useMemo(() => ({
    categories: [...new Set(mockFabrics.map(f => f.category))],
    colors: [...new Set(mockFabrics.map(f => f.color))],
    patterns: [...new Set(mockFabrics.map(f => f.pattern))],
    materials: [...new Set(mockFabrics.map(f => f.material))]
  }), [])

  // Filter fabrics
  const filteredFabrics = React.useMemo(() => {
    return mockFabrics.filter(fabric => {
      // Search query
      if (searchQuery && !fabric.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter
      if (selectedFilters.category.length > 0 && !selectedFilters.category.includes(fabric.category)) {
        return false
      }

      // Color filter
      if (selectedFilters.color.length > 0 && !selectedFilters.color.includes(fabric.color)) {
        return false
      }

      // Pattern filter
      if (selectedFilters.pattern.length > 0 && !selectedFilters.pattern.includes(fabric.pattern)) {
        return false
      }

      // Material filter
      if (selectedFilters.material.length > 0 && !selectedFilters.material.includes(fabric.material)) {
        return false
      }

      return true
    })
  }, [searchQuery, selectedFilters])

  const handleSelectFabric = (fabric: Fabric) => {
    if (!fabric.inStock) return
    setSelectedFabricId(fabric.id)
    setFabric(fabric)
  }

  const toggleFilter = (filterType: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }))
  }

  const clearFilters = () => {
    setSelectedFilters({
      category: [],
      color: [],
      pattern: [],
      material: []
    })
    setSearchQuery("")
  }

  const hasActiveFilters = Object.values(selectedFilters).some(arr => arr.length > 0) || searchQuery

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl lg:text-4xl text-ylang-charcoal mb-4">
          Choisissez votre tissu
        </h2>
        <p className="font-body text-ylang-charcoal/60 text-lg">
          Plus de {mockFabrics.length} tissus premium disponibles
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-ylang-beige/30 rounded-2xl p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ylang-charcoal/40" />
          <Input
            type="text"
            placeholder="Rechercher un tissu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>

        {/* Filter Categories */}
        <div className="space-y-3">
          <FilterGroup
            label="Catégorie"
            options={filterOptions.categories}
            selected={selectedFilters.category}
            onToggle={(value) => toggleFilter('category', value)}
          />
          <FilterGroup
            label="Couleur"
            options={filterOptions.colors}
            selected={selectedFilters.color}
            onToggle={(value) => toggleFilter('color', value)}
          />
          <FilterGroup
            label="Motif"
            options={filterOptions.patterns}
            selected={selectedFilters.pattern}
            onToggle={(value) => toggleFilter('pattern', value)}
          />
          <FilterGroup
            label="Matière"
            options={filterOptions.materials}
            selected={selectedFilters.material}
            onToggle={(value) => toggleFilter('material', value)}
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Effacer les filtres
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-ylang-charcoal/60">
          {filteredFabrics.length} tissu{filteredFabrics.length > 1 ? 's' : ''} trouvé{filteredFabrics.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Fabrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFabrics.map((fabric, index) => {
          const isSelected = selectedFabricId === fabric.id

          return (
            <motion.div
              key={fabric.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <button
                onClick={() => handleSelectFabric(fabric)}
                disabled={!fabric.inStock}
                className={cn(
                  "w-full text-left rounded-2xl overflow-hidden transition-all duration-300",
                  isSelected && "ring-4 ring-ylang-rose shadow-2xl",
                  !fabric.inStock && "opacity-50 cursor-not-allowed",
                  fabric.inStock && "hover:shadow-xl hover:scale-105"
                )}
              >
                {/* Image */}
                <div className="relative aspect-square bg-ylang-beige/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">🧵</span>
                  </div>

                  {/* Out of Stock Badge */}
                  {!fabric.inStock && (
                    <div className="absolute inset-0 bg-ylang-charcoal/60 flex items-center justify-center">
                      <span className="text-white font-body text-sm font-medium px-4 py-2 bg-ylang-charcoal/80 rounded-full">
                        Rupture de stock
                      </span>
                    </div>
                  )}

                  {/* Checkmark */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-10 h-10 bg-ylang-rose rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-6 h-6 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 bg-white">
                  <h3 className="font-display text-lg font-semibold text-ylang-charcoal mb-2">
                    {fabric.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-ylang-beige/50 rounded text-xs font-body text-ylang-charcoal/70">
                      {fabric.category}
                    </span>
                    <span className="px-2 py-1 bg-ylang-beige/50 rounded text-xs font-body text-ylang-charcoal/70">
                      {fabric.color}
                    </span>
                  </div>

                  <p className="font-display text-xl font-bold text-ylang-rose">
                    +{fabric.price}€
                  </p>
                </div>
              </button>

              {/* Info Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDetailModalFabric(fabric)
                }}
                className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Info className="w-4 h-4 text-ylang-charcoal" />
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* No Results */}
      {filteredFabrics.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-ylang-charcoal/20 mx-auto mb-4" />
          <p className="font-body text-ylang-charcoal/60">
            Aucun tissu ne correspond à vos critères
          </p>
          <Button variant="secondary" onClick={clearFilters} className="mt-4">
            Réinitialiser les filtres
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <FabricDetailModal
        fabric={detailModalFabric}
        isOpen={detailModalFabric !== null}
        onClose={() => setDetailModalFabric(null)}
        onSelect={(fabric) => {
          handleSelectFabric(fabric)
          setDetailModalFabric(null)
        }}
      />
    </div>
  )
}

// Filter Group Component
function FilterGroup({
  label,
  options,
  selected,
  onToggle
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <p className="text-sm font-body font-medium text-ylang-charcoal mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              onClick={() => onToggle(option)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-body transition-all duration-300",
                isSelected
                  ? "bg-ylang-rose text-white shadow-md"
                  : "bg-white text-ylang-charcoal hover:bg-ylang-beige"
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Fabric Detail Modal
function FabricDetailModal({
  fabric,
  isOpen,
  onClose,
  onSelect
}: {
  fabric: Fabric | null
  isOpen: boolean
  onClose: () => void
  onSelect: (fabric: Fabric) => void
}) {
  if (!fabric) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ylang-charcoal/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 lg:p-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-ylang-beige rounded-full flex items-center justify-center hover:bg-ylang-rose hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="aspect-square bg-ylang-beige/20 rounded-xl flex items-center justify-center">
                  <span className="text-8xl">🧵</span>
                </div>

                {/* Details */}
                <div>
                  <h3 className="font-display text-2xl font-bold text-ylang-charcoal mb-2">
                    {fabric.name}
                  </h3>

                  <p className="font-display text-3xl font-bold text-ylang-rose mb-4">
                    +{fabric.price}€
                  </p>

                  <div className="space-y-3 mb-6">
                    <DetailRow label="Catégorie" value={fabric.category} />
                    <DetailRow label="Couleur" value={fabric.color} />
                    <DetailRow label="Motif" value={fabric.pattern} />
                    <DetailRow label="Matière" value={fabric.material} />
                    <DetailRow label="Composition" value={fabric.composition} />
                    <DetailRow label="Entretien" value={fabric.care} />
                    <DetailRow 
                      label="Disponibilité" 
                      value={fabric.inStock ? "En stock" : "Rupture de stock"}
                      valueClassName={fabric.inStock ? "text-green-600" : "text-red-600"}
                    />
                  </div>

                  <Button
                    variant="luxury"
                    className="w-full"
                    onClick={() => onSelect(fabric)}
                    disabled={!fabric.inStock}
                  >
                    {fabric.inStock ? "Sélectionner ce tissu" : "Indisponible"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function DetailRow({ 
  label, 
  value, 
  valueClassName 
}: { 
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm font-body text-ylang-charcoal/60">{label}</span>
      <span className={cn("text-sm font-body font-medium text-ylang-charcoal", valueClassName)}>
        {value}
      </span>
    </div>
  )
}
