"use client";

import { useConfiguratorStore } from "@/lib/store/configurator-store";
import { motion } from "framer-motion";

export function PriceDisplay() {
  const price = useConfiguratorStore((state) => state.getTotalPrice());

  return (
    <motion.div
      key={price}
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-right"
    >
      <p className="text-ylang-charcoal/60 mb-1 text-xs tracking-wide uppercase">
        Prix total
      </p>
      <p className="font-display text-ylang-rose text-3xl font-bold lg:text-4xl">
        {price}€
      </p>
    </motion.div>
  );
}
