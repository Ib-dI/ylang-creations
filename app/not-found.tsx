"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-ylang-cream/50 flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Decorative blurred backgrounds */}
      <div className="bg-ylang-rose/5 absolute top-1/4 left-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" />
      <div className="bg-ylang-terracotta/5 absolute right-1/4 bottom-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-abramo-script text-ylang-rose mb-4 text-7xl md:text-9xl"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-display text-ylang-charcoal mb-6 text-2xl md:text-3xl"
        >
          Oups ! La page s&apos;est envolée...
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="font-body text-ylang-charcoal/60 mx-auto mb-10 max-w-md"
        >
          Il semblerait que le petit lapin ait emporté cette page dans son
          terrier. Pas d&apos;inquiétude, revenons ensemble vers notre
          collection.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            variant="luxury"
            size="lg"
            className="rounded-full px-10"
          >
            <Link href="/"> Retour à l&apos;accueil </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="border-ylang-rose text-ylang-rose hover:bg-ylang-rose rounded-full px-10 hover:text-white"
          >
            <Link href="/collections"> Nos collections </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 1, duration: 2 }}
          className="mt-16 flex justify-center"
        >
          <Image
            src="/Illustrations/Arc en Ciel.png"
            alt="Arc en ciel"
            width={180}
            height={120}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
