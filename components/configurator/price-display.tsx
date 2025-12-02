"use client"

import * as React from "react"
import { useConfiguratorStore } from "@/lib/store/configurator-store"
import { motion } from "framer-motion"

export function PriceDisplay() {
  const getTotalPrice = useConfiguratorStore((state) => state.getTotalPrice)
  const [price, setPrice] = React.useState(getTotalPrice())

  React.useEffect(() => {
    const newPrice = getTotalPrice()
    if (newPrice !== price) {
      setPrice(newPrice)
    }
  }, [getTotalPrice])

  return (
    <motion.div
      key={price}
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-right"
    >
      <p className="text-xs text-ylang-charcoal/60 uppercase tracking-wide mb-1">
        Prix total
      </p>
      <p className="font-display text-3xl lg:text-4xl font-bold text-ylang-rose">
        {price}€
      </p>
    </motion.div>
  )
}
