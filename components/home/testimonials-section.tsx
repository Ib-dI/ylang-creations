"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import * as React from "react";

interface Testimonial {
  image: string;
  id?: string;
  name?: string;
}

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  // Filter testimonials to ensure they have an image
  const testimonialsList = React.useMemo(
    () => testimonials.filter((t) => t.image),
    [testimonials],
  );

  return (
    <section className="relative overflow-hidden py-20" style={{ background: "var(--color-paper-2)" }}>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p
            className="mb-3 text-xs tracking-[0.2em] uppercase font-semibold"
            style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
          >
            Vos retours en images
          </p>
          <h2 className="text-ylang-charcoal font-display mb-6 font-semibold tracking-tight" style={{ fontSize: "var(--text-headline)" }}>
            Ils adorent Ylang Créations
          </h2>
          <p className="text-ylang-charcoal/60 mx-auto max-w-2xl">
            Cliquez sur les images pour découvrir les moments de bonheur partagés par notre communauté.
          </p>
        </motion.div>

        {/* Masonry Layout Grid */}
        <div className="columns-1 gap-1 sm:columns-2 sm:gap-2 lg:columns-4 lg:gap-3">
          {testimonialsList.map((testimonial, index) => (
            <motion.div
              key={testimonial.id || index}
              onClick={() => setSelectedImage(testimonial.image)}
              className="group relative mb-1 cursor-zoom-in break-inside-avoid sm:mb-2 lg:mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="overflow-hidden transition-opacity duration-300 group-hover:opacity-90"
                style={{ border: "var(--rule-hair)" }}
              >
                <Image
                  src={testimonial.image}
                  alt={
                    testimonial.name || "Témoignage client Ylang Créations"
                  }
                  width={400}
                  height={600}
                  className="block h-auto w-full object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox / Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-10"
          >
            <button
              className="hover:text-ylang-rose absolute top-6 right-6 text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={40} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-full max-w-4xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image zoomée sans effet timbre */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt="Zoom témoignage"
                className="max-h-[85vh] w-auto rounded-lg border-4 border-white/10 shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
