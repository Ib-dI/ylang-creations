"use client";

import Link from "next/link";
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

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-16">

      <div>
        <p className="type-overline mb-5" style={{ color: "var(--color-accent)" }}>
          Questions fréquentes
        </p>
        <h2
          className="mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-title)",
            fontWeight: 400,
            color: "var(--color-ink)",
          }}
        >
          Foire aux questions
        </h2>
        <p className="font-body text-base leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
          Retrouvez ici les réponses aux questions les plus fréquentes.
        </p>
      </div>

      {/* Accordion */}
      <div>
        {faqs.map((faq, index) => (
          <div key={index} style={{ borderTop: "var(--rule-soft)" }}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between py-6 text-left"
            >
              <span className="font-body pr-8 text-base" style={{ color: "var(--color-ink)" }}>
                {faq.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                style={{ color: "var(--color-ink-3)" }}
                strokeWidth={1.5}
              />
            </button>
            <div
              style={{
                display: "grid",
                gridTemplateRows: openIndex === index ? "1fr" : "0fr",
                transition: "grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div className="overflow-hidden">
                <p
                  className="font-body pb-6 text-sm leading-relaxed"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div style={{ borderTop: "var(--rule-soft)" }} />
      </div>

      {/* CTA */}
      <div style={{ borderTop: "var(--rule-hair)", paddingTop: "3rem" }}>
        <p className="font-body text-sm mb-2" style={{ color: "var(--color-ink-3)" }}>
          Vous ne trouvez pas la réponse à votre question ?
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 font-body text-sm transition-opacity hover:opacity-70"
          style={{ color: "var(--color-ink)" }}
        >
          <span style={{ borderBottom: "1px solid var(--color-accent)" }}>
            Posez-nous votre question directement
          </span>
          <span aria-hidden>→</span>
        </Link>
      </div>

    </div>
  );
}
