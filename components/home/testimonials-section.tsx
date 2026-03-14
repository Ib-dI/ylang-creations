"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
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
    <section className="section-padding from-ylang-terracotta/40 relative overflow-hidden bg-linear-to-b to-ylang-rose/40 py-20">
      {/* Decoration */}
      <div className="bg-ylang-rose/5 absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="text-ylang-rose font-abramo mb-3 text-sm font-semibold tracking-widest uppercase">
            Vos retours en images
          </p>
          <h2 className="text-ylang-charcoal font-abramo-script mb-6 font-serif text-4xl lg:text-5xl">
            Ils adorent Ylang Créations
          </h2>
          <p className="text-ylang-charcoal/60 mx-auto max-w-2xl">
            Cliquez sur les images pour découvrir les moments de bonheur partagés par notre communauté.
          </p>
        </motion.div>

        {/* Masonry Layout Grid */}
        <div className="columns-1 gap-10 p-4 sm:columns-2 lg:columns-4">
          {testimonialsList.map((testimonial, index) => (
            <motion.div
              key={testimonial.id || index}
              onClick={() => setSelectedImage(testimonial.image)}
              className="group relative mb-10 cursor-zoom-in break-inside-avoid"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, rotate: index % 2 === 0 ? 1 : -1 }}
            >
              {/* stamp-card reçoit maintenant DIRECTEMENT le masque dentelé ET le drop-shadow */}
              <div className="stamp-card transition-all duration-300 group-hover:scale-105">
                <div className="stamp-inner">
                  <Image
                    src={testimonial.image}
                    alt={
                      testimonial.name || "Témoignage client Ylang Créations"
                    }
                    width={400}
                    height={600}
                    className="z-100 block h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Overlay zoom */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-50">
                    <div className="text-ylang-rose scale-90 rounded-full bg-white/90 p-3 transition-transform duration-300 group-hover:scale-100">
                      <ZoomIn size={20} />
                    </div>
                  </div>
                </div>
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
