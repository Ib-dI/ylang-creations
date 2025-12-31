"use client";

import { motion } from "framer-motion";
import * as React from "react";

export function TestimonialsSection() {
  const [testimonialsList, setTestimonialsList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.testimonials) {
          // Filtrer les témoignages qui ont une image
          setTestimonialsList(data.testimonials.filter((t: any) => t.image));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || testimonialsList.length === 0) return null;

  return (
    <section className="section-padding from-ylang-beige/30 relative overflow-hidden bg-linear-to-b to-white">
      {/* Decoration */}
      <div className="bg-ylang-rose/5 absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-ylang-rose font-body mb-3 text-sm tracking-widest uppercase">
            Vos retours en images
          </p>
          <h2 className="font-display text-ylang-charcoal mb-6 text-4xl lg:text-5xl">
            Ils adorent Ylang Créations
          </h2>
          <p className="font-body text-ylang-charcoal/60 mx-auto max-w-2xl">
            Nous sommes fiers de partager avec vous les messages de bonheur que
            nous recevons chaque jour.
          </p>
        </motion.div>

        {/* Visual Grid for Screenshots */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonialsList.map((testimonial, index) => (
            <motion.div
              key={testimonial.id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-5/4 overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={testimonial.image}
                alt={`Témoignage client ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
