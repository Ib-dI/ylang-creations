"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import * as React from "react";

export function TestimonialsSection() {
  const [testimonialsList, setTestimonialsList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.testimonials) {
          setTestimonialsList(data.testimonials);
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
            Vos moments de bonheur
          </p>
          <h2 className="font-display text-ylang-charcoal mb-6 text-4xl lg:text-5xl">
            La Galerie des Parents
          </h2>
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="fill-ylang-rose text-ylang-rose h-5 w-5"
                />
              ))}
            </div>
            <span className="font-display text-ylang-charcoal text-xl font-bold">
              Avis vérifiés
            </span>
          </div>
          <p className="font-body text-ylang-charcoal/60">
            Découvrez les créations Ylang Créations dans leur nouvelle maison
          </p>
        </motion.div>

        {/* Visual Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonialsList.map((testimonial, index) => (
            <motion.div
              key={testimonial.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={`${testimonial.name} - Ylang Créations`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="from-ylang-rose/20 to-ylang-beige flex h-full w-full items-center justify-center bg-linear-to-br">
                    <Quote className="text-ylang-rose/20 h-20 w-20" />
                  </div>
                )}

                {/* Overlay on Hover */}
                <div className="absolute inset-0 flex flex-col justify-end bg-black/40 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="mb-2 flex gap-1">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-white text-white" />
                    ))}
                  </div>
                  <p className="font-body line-clamp-4 text-sm leading-relaxed text-white">
                    "{testimonial.text}"
                  </p>
                </div>
              </div>

              {/* Info Bottom */}
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="from-ylang-rose to-ylang-terracotta flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-linear-to-br text-sm font-bold text-white shadow-inner">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{testimonial.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-display text-ylang-charcoal text-base font-semibold">
                      {testimonial.name}
                    </p>
                    <p className="text-ylang-charcoal/60 text-xs">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
                {testimonial.product && (
                  <div className="bg-ylang-rose/10 rounded-full px-3 py-1">
                    <p className="text-ylang-rose text-[10px] font-medium tracking-wider uppercase">
                      {testimonial.product}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-20 grid max-w-md grid-cols-2 gap-6"
        >
          {[
            { icon: "✓", text: "Paiement sécurisé" },
            { icon: "📦", text: "Livraison soignée" },
          ].map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-sm"
            >
              <span className="mb-2 text-3xl">{badge.icon}</span>
              <p className="font-body text-ylang-charcoal/70 text-sm">
                {badge.text}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
