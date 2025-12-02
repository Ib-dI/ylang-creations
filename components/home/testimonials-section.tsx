"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Testimonial {
  id: number
  name: string
  location: string
  rating: number
  text: string
  product: string
  image?: string
  date: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sophie M.",
    location: "Paris",
    rating: 5,
    text: "Une qualité exceptionnelle ! La gigoteuse personnalisée que j'ai commandée pour ma fille est magnifique. Les tissus sont doux, la confection est impeccable et le résultat dépasse mes attentes. Le configurateur est vraiment intuitif.",
    product: "Gigoteuse personnalisée",
    date: "Il y a 2 semaines"
  },
  {
    id: 2,
    name: "Claire D.",
    location: "Lyon",
    rating: 5,
    text: "J'ai offert un tour de lit sur mesure pour la naissance de mon neveu. Les parents étaient émerveillés ! L'emballage était soigné et la personnalisation avec le prénom brodé est sublime. Je recommande à 200%.",
    product: "Tour de lit brodé",
    date: "Il y a 1 mois"
  },
  {
    id: 3,
    name: "Mathilde L.",
    location: "Bordeaux",
    rating: 5,
    text: "Service client au top et produit d'une qualité rare. J'ai créé toute la décoration de la chambre de bébé avec Ylang Créations. Chaque pièce est unique et faite avec amour. Un vrai savoir-faire artisanal.",
    product: "Ensemble décoration chambre",
    date: "Il y a 3 semaines"
  },
  {
    id: 4,
    name: "Julie P.",
    location: "Nantes",
    rating: 5,
    text: "Je cherchais du textile premium et personnalisable, j'ai trouvé exactement ce dont je rêvais. Les délais sont respectés, la communication est fluide et le résultat est juste parfait. Bravo pour ce travail !",
    product: "Mobile musical personnalisé",
    date: "Il y a 2 mois"
  }
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(0)

  const currentTestimonial = testimonials[currentIndex]

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Auto-play
  React.useEffect(() => {
    const timer = setInterval(handleNext, 5000)
    return () => clearInterval(timer)
  }, [currentIndex])

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  return (
    <section className="section-padding bg-gradient-to-b from-ylang-beige/30 to-white relative overflow-hidden">
      
      {/* Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-ylang-rose/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-body text-ylang-rose uppercase tracking-widest mb-3">
            Ils nous font confiance
          </p>
          <h2 className="font-display text-4xl lg:text-5xl text-ylang-charcoal mb-6">
            Témoignages clients
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-ylang-rose text-ylang-rose" />
              ))}
            </div>
            <span className="font-display text-2xl font-bold text-ylang-charcoal">4.9/5</span>
          </div>
          <p className="font-body text-ylang-charcoal/60">
            Basé sur plus de 850 avis vérifiés
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative bg-white rounded-3xl shadow-md p-8 lg:p-12 min-h-[400px] flex flex-col justify-between">
            
            {/* Quote Icon */}
            <div className="absolute -top-6 left-8 w-12 h-12 bg-ylang-rose rounded-full flex items-center justify-center shadow-lg">
              <Quote className="w-6 h-6 text-white" />
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
                  opacity: { duration: 0.2 }
                }}
                className="flex flex-col justify-between h-full"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-ylang-rose text-ylang-rose" />
                  ))}
                </div>

                {/* Text */}
                <p className="font-body text-lg lg:text-xl text-ylang-charcoal leading-relaxed mb-8">
                  "{currentTestimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-between border-t border-ylang-beige pt-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-gradient-to-br from-ylang-rose to-ylang-terracotta rounded-full flex items-center justify-center text-white font-display text-xl font-bold">
                      {currentTestimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-ylang-charcoal">
                        {currentTestimonial.name}
                      </p>
                      <p className="font-body text-sm text-ylang-charcoal/60">
                        {currentTestimonial.location} • {currentTestimonial.date}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block text-right">
                    <p className="font-body text-sm text-ylang-charcoal/60 mb-1">
                      Produit acheté :
                    </p>
                    <p className="font-display text-sm font-medium text-ylang-rose">
                      {currentTestimonial.product}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              <button
                onClick={handlePrev}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-ylang-charcoal hover:bg-ylang-rose hover:text-white transition-colors duration-300"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-ylang-charcoal hover:bg-ylang-rose hover:text-white transition-colors duration-300"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1)
                  setCurrentIndex(index)
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-ylang-rose"
                    : "w-2 bg-ylang-beige hover:bg-ylang-rose/50"
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
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { icon: "✓", text: "Paiement sécurisé" },
            { icon: "↻", text: "Satisfait ou remboursé" },
            { icon: "📦", text: "Livraison soignée" },
            { icon: "💬", text: "Support 7j/7" }
          ].map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm"
            >
              <span className="text-3xl mb-2">{badge.icon}</span>
              <p className="font-body text-sm text-ylang-charcoal/70">
                {badge.text}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
