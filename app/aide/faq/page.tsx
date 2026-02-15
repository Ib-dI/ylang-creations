"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Quels sont les délais de fabrication ?",
    answer:
      "Chaque article personnalisé est confectionné à la main dans notre atelier à la Réunion. Il faut compter environ 10 à 15 jours ouvrés de fabrication avant l'expédition de votre commande.",
  },
  {
    question: "Puis-je modifier une commande déjà validée ?",
    answer:
      "Si le processus de confection n'a pas encore débuté, nous pouvons exceptionnellement modifier votre commande. Contactez-nous au plus vite par e-mail ou via le formulaire de contact.",
  },
  {
    question: "Où sont fabriqués vos produits ?",
    answer:
      "Toutes nos créations sont imaginées et confectionnées artisanalement sur l'île de la Réunion, garantissant un savoir-faire français et une attention particulière à chaque détail.",
  },
  {
    question: "Quels tissus utilisez-vous ?",
    answer:
      "Nous sélectionnons rigoureusement nos matières. Nous utilisons principalement de la gaze de coton certifiée Oeko-Tex ou biologique, garantissant l'absence de substances nocives pour la peau de bébé.",
  },
  {
    question: "Proposez-vous des emballages cadeaux ?",
    answer:
      "Oui, chaque commande est préparée avec soin dans un emballage délicat. Vous pouvez également ajouter un mot personnalisé lors de la validation de votre panier.",
  },
  {
    question: "Livrez-vous vers la France métropolitaine ?",
    answer:
      "Oui, nous livrons partout en France métropolitaine, dans les DOM-TOM et à l'international via Colissimo ou transporteur partenaire.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-ylang-terracotta/50 relative min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-12 text-center"
        >
          <h1 className="font-abramo-script text-5xl text-gray-900 sm:text-4xl">
            Foire Aux Questions
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 50 }}
            className="bg-ylang-rose mx-auto mt-4 h-1 rounded"
          ></motion.div>
          <p className="font-body mt-6 text-lg text-gray-600">
            Retrouvez ici les réponses aux questions les plus fréquentes.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              layout
              key={index}
              variants={itemVariants}
              className="border-ylang-beige/50 overflow-hidden rounded-2xl border bg-white/40 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xs"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-display text-lg font-semibold text-gray-900">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={springTransition}
                  className="text-ylang-rose shrink-0"
                >
                  <ChevronDown />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: "auto" },
                      collapsed: { opacity: 0, height: 0 },
                    }}
                    transition={{
                      height: springTransition,
                      opacity: { duration: 0.2 },
                    }}
                  >
                    <div className="font-body border-ylang-beige/20 p-6 pt-0 text-gray-600">
                      <motion.p
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 5, opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="mt-4 leading-relaxed"
                      >
                        {faq.answer}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          layout
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-ylang-beige/20 mt-16 rounded-3xl p-8 text-center"
        >
          <p className="font-body mb-4 text-lg text-gray-800">
            Vous ne trouvez pas la réponse à votre question ?
          </p>
          <motion.a
            whileHover={{ x: 5 }}
            href="/contact"
            className="text-ylang-rose inline-flex items-center font-bold hover:underline"
          >
            Posez-nous votre question directement{" "}
            <span className="ml-2">&rarr;</span>
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
