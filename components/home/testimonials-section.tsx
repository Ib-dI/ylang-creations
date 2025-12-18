"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import * as React from "react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  product: string;
  image?: string;
  date: string;
}

const DUMMY_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Sophie M.",
    location: "Paris",
    rating: 5,
    text: "Une qualité exceptionnelle ! La gigoteuse personnalisée que j'ai commandée pour ma fille est magnifique. Les tissus sont doux, la confection est impeccable et le résultat dépasse mes attentes. Le configurateur est vraiment intuitif.",
    product: "Gigoteuse personnalisée",
    date: "Il y a 2 semaines",
  },
  {
    id: 2,
    name: "Claire D.",
    location: "Lyon",
    rating: 5,
    text: "J'ai offert un tour de lit sur mesure pour la naissance de mon neveu. Les parents étaient émerveillés ! L'emballage était soigné et la personnalisation avec le prénom brodé est sublime. Je recommande à 200%.",
    product: "Tour de l'it brodé",
    date: "Il y a 1 mois",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [testimonialsList, setTestimonialsList] =
    React.useState<any[]>(DUMMY_TESTIMONIALS);

  React.useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.testimonials && data.testimonials.length > 0) {
          setTestimonialsList(data.testimonials);
        }
      })
      .catch(console.error);
  }, []);

  const currentTestimonial = testimonialsList[currentIndex];

  const handleNext = () => {
    if (testimonialsList.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonialsList.length);
  };

  const handlePrev = () => {
    if (testimonialsList.length <= 1) return;
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonialsList.length) % testimonialsList.length,
    );
  };

  // Auto-play
  React.useEffect(() => {
    if (testimonialsList.length <= 1) return;
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, testimonialsList.length]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

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
          <p className="font-body text-ylang-rose mb-3 text-sm tracking-widest uppercase">
            Ils nous font confiance
          </p>
          <h2 className="font-display text-ylang-charcoal mb-6 text-4xl lg:text-5xl">
            Témoignages clients
          </h2>
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="fill-ylang-rose text-ylang-rose h-6 w-6"
                />
              ))}
            </div>
            <span className="font-display text-ylang-charcoal text-2xl font-bold">
              4.9/5
            </span>
          </div>
          <p className="font-body text-ylang-charcoal/60">
            Basé sur plus de 850 avis vérifiés
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="mx-auto mb-12 max-w-4xl">
          <div className="relative flex min-h-[400px] flex-col justify-between rounded-3xl bg-white p-8 shadow-md lg:p-12">
            {/* Quote Icon */}
            <div className="bg-ylang-rose absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-full shadow-lg">
              <Quote className="h-6 w-6 text-white" />
            </div>

            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="flex h-full flex-col justify-between"
              >
                {/* Stars */}
                <div className="mb-6 flex gap-1">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="fill-ylang-rose text-ylang-rose h-5 w-5"
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="font-body text-ylang-charcoal mb-8 text-lg leading-relaxed lg:text-xl">
                  "{currentTestimonial.text}"
                </p>

                {/* Author */}
                <div className="border-ylang-beige flex items-center justify-between border-t pt-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="from-ylang-rose to-ylang-terracotta font-display flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-linear-to-br text-xl font-bold text-white shadow-inner">
                      {currentTestimonial.image ? (
                        <img
                          src={currentTestimonial.image}
                          alt={currentTestimonial.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{currentTestimonial.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-display text-ylang-charcoal text-lg font-semibold">
                        {currentTestimonial.name}
                      </p>
                      <p className="font-body text-ylang-charcoal/60 text-sm">
                        {currentTestimonial.location} •{" "}
                        {currentTestimonial.date}
                      </p>
                    </div>
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="font-body text-ylang-charcoal/60 mb-1 text-sm">
                      Produit acheté :
                    </p>
                    <p className="font-display text-ylang-rose text-sm font-medium">
                      {currentTestimonial.product}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
              <button
                onClick={handlePrev}
                className="text-ylang-charcoal hover:bg-ylang-rose flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-colors duration-300 hover:text-white"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="text-ylang-charcoal hover:bg-ylang-rose flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-colors duration-300 hover:text-white"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="mt-12 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-ylang-rose w-8"
                    : "bg-ylang-beige hover:bg-ylang-rose/50 w-2"
                }`}
                aria-label={`Aller au témoignage ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mx-auto grid max-w-md grid-cols-2 gap-6"
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
