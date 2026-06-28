"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CheckCircle, ChevronDown, Clock, Facebook, Instagram, Mail, MapPin, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const fallbackContactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "ylang.creations@gmail.com",
    href: "mailto:ylang.creations@gmail.com",
    description: "Réponse sous 24–48 h",
  },
  {
    icon: MapPin,
    label: "Localisation",
    value: "Mayotte / Île de la Réunion",
    href: null,
    description: "Livraison France entière",
  },
];

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/ylang_creations/" },
  { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/ylangcreations/" },
];

const faqItems = [
  {
    question: "Quels sont les délais de confection ?",
    answer:
      "Les délais varient selon la complexité de votre commande. En général, comptez 2 à 3 semaines pour une création personnalisée. Nous vous tiendrons informé à chaque étape.",
  },
  {
    question: "Puis-je personnaliser n'importe quel produit ?",
    answer:
      "Tous produits personnalisables est indiqué sur la page du produit. Vous pouvez choisir les tissus, les couleurs, ajouter une broderie avec le prénom de votre enfant, etc.",
  },
  {
    question: "Livrez-vous hors de la Réunion ?",
    answer:
      "Oui, nous livrons dans toute la France métropolitaine et les DOM-TOM. Les frais de port sont calculés selon la destination.",
  },
  {
    question: "Comment entretenir les créations ?",
    answer:
      "Nos créations sont réalisées avec des tissus de qualité. Nous recommandons un lavage en machine à 30°C, pas de sèche-linge et un repassage à température moyenne.",
  },
];

interface ContactSettings {
  contactEmail?: string | null;
}

export function ContactClient({ settings }: { settings: ContactSettings | null }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: settings?.contactEmail || fallbackContactInfo[0].value,
      href: settings?.contactEmail
        ? `mailto:${settings.contactEmail}`
        : fallbackContactInfo[0].href,
      description: fallbackContactInfo[0].description,
    },
    {
      icon: MapPin,
      label: "Localisation",
      value: fallbackContactInfo[1].value,
      href: fallbackContactInfo[1].href,
      description: fallbackContactInfo[1].description,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ background: "var(--color-paper)" }}>

      {/* Hero */}
      <section className="py-24 lg:py-36" style={{ borderBottom: "var(--rule-hair)" }}>
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeInUp} className="mb-8 font-abramo tracking-[0.22em] text-sm font-bold" style={{fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}>
              Contactez-nous
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="mb-8 font-display"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "var(--color-ink)" }}
            >
              Parlons de votre projet
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="font-body mx-auto max-w-xl text-base leading-relaxed"
              style={{ color: "var(--color-ink-3)" }}
            >
              Une question, un projet personnalisé ou simplement envie d&apos;en savoir plus ?
              Nous sommes là pour vous accompagner dans la création de pièces uniques.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Formulaire + Coordonnées */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-20 lg:grid-cols-5">

            {/* Formulaire */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="space-y-10" style={{ borderTop: "var(--rule-hair)", paddingTop: "2.5rem" }}>
                <div>
                  <p className="type-overline mb-4" style={{ color: "var(--color-accent)" }}>
                    Formulaire
                  </p>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-title)",
                      fontWeight: 400,
                      color: "var(--color-ink)",
                    }}
                  >
                    Envoyez-nous un message
                  </h2>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-16 text-center"
                  >
                    <CheckCircle
                      className="mx-auto mb-6 h-10 w-10"
                      style={{ color: "var(--color-accent)" }}
                      strokeWidth={1}
                    />
                    <p className="font-body font-medium mb-1" style={{ color: "var(--color-ink)" }}>
                      Message envoyé
                    </p>
                    <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                      Nous vous répondrons sous 24–48 h.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Input
                        id="name"
                        name="name"
                        label="Nom complet *"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom…"
                      />
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        label="Email *"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com…"
                      />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        label="Téléphone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+262 6XX XX XX XX…"
                      />
                      <div>
                        <label
                          htmlFor="subject"
                          className="font-body mb-2 block text-sm"
                          style={{ color: "var(--color-ink-3)" }}
                        >
                          Sujet *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="font-body w-full border-0 border-b bg-transparent py-3 text-sm focus:outline-none"
                          style={{ borderColor: "var(--color-ink-2)", color: "var(--color-ink)" }}
                        >
                          <option value="">Choisir un sujet</option>
                          <option value="devis">Demande de devis</option>
                          <option value="personnalisation">Personnalisation</option>
                          <option value="commande">Suivi de commande</option>
                          <option value="question">Question générale</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="font-body mb-2 block text-sm"
                        style={{ color: "var(--color-ink-3)" }}
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="font-body w-full resize-none border-b bg-transparent py-3 text-sm focus:outline-none placeholder:opacity-40"
                        style={{ borderColor: "var(--color-ink-2)", color: "var(--color-ink)" }}
                        placeholder="Décrivez votre projet, vos envies…"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="luxury"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Envoi en cours…
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12 lg:col-span-2"
            >
              {/* Coordonnées */}
              <div style={{ borderTop: "var(--rule-hair)", paddingTop: "2.5rem" }}>
                <p className="type-overline mb-6" style={{ color: "var(--color-accent)" }}>
                  Coordonnées
                </p>
                <div>
                  {contactInfo.map((info) =>
                    info.href ? (
                      <a
                        key={info.label}
                        href={info.href}
                        className="flex items-start gap-4 py-5 transition-opacity hover:opacity-70"
                        style={{ borderBottom: "var(--rule-soft)" }}
                      >
                        <info.icon
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: "var(--color-accent)" }}
                          strokeWidth={1.5}
                        />
                        <div>
                          <p className="font-body mb-1 text-xs uppercase tracking-wider" style={{ color: "var(--color-ink-3)" }}>
                            {info.label}
                          </p>
                          <p className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
                            {info.value}
                          </p>
                          <p className="font-body mt-0.5 text-xs" style={{ color: "var(--color-ink-3)" }}>
                            {info.description}
                          </p>
                        </div>
                      </a>
                    ) : (
                      <div
                        key={info.label}
                        className="flex items-start gap-4 py-5"
                        style={{ borderBottom: "var(--rule-soft)" }}
                      >
                        <info.icon
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: "var(--color-accent)" }}
                          strokeWidth={1.5}
                        />
                        <div>
                          <p className="font-body mb-1 text-xs uppercase tracking-wider" style={{ color: "var(--color-ink-3)" }}>
                            {info.label}
                          </p>
                          <p className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
                            {info.value}
                          </p>
                          <p className="font-body mt-0.5 text-xs" style={{ color: "var(--color-ink-3)" }}>
                            {info.description}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Réseaux + Délai */}
              <div>
                <p className="type-overline mb-6" style={{ color: "var(--color-accent)" }}>
                  Réseaux sociaux
                </p>
                <div className="flex items-center gap-5 mb-8">
                  {socialLinks.map((s) => {
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.name}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.name}
                        className="opacity-50 transition-opacity duration-200 hover:opacity-100"
                        style={{ color: "var(--color-ink)" }}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                      </a>
                    );
                  })}
                </div>
                <div className="flex items-start gap-3">
                  <Clock
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "var(--color-ink-3)" }}
                    strokeWidth={1.5}
                  />
                  <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                    Réponse sous{" "}
                    <strong style={{ color: "var(--color-ink)" }}>24–48 h</strong> — du lundi au vendredi
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="py-24 lg:py-32"
        style={{ background: "var(--color-paper-2)", borderTop: "var(--rule-hair)" }}
      >
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mb-16">
            <p className="type-overline mb-6" style={{ color: "var(--color-accent)" }}>
              FAQ
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
              }}
            >
              Questions fréquentes
            </h2>
          </div>

          <div>
            {faqItems.map((item, index) => (
              <div key={index} style={{ borderTop: "var(--rule-soft)" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between py-6 text-left"
                >
                  <span className="font-body pr-8 text-base" style={{ color: "var(--color-ink)" }}>
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${openFaq === index ? "rotate-180" : ""}`}
                    style={{ color: "var(--color-ink-3)" }}
                    strokeWidth={1.5}
                  />
                </button>
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: openFaq === index ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <div className="overflow-hidden">
                    <p
                      className="font-body pb-6 text-sm leading-relaxed"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ borderTop: "var(--rule-soft)" }} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32" style={{ borderTop: "var(--rule-hair)" }}>
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
              }}
            >
              Prêt à créer quelque chose d&apos;unique ?
            </h2>
            <p className="font-body mx-auto max-w-lg text-base" style={{ color: "var(--color-ink-3)" }}>
              Découvrez notre configurateur pour imaginer votre création sur mesure ou
              explorez nos collections pour trouver l&apos;inspiration.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/configurateur">
                <Button variant="luxury" size="lg">Créer sur mesure</Button>
              </Link>
              <Link href="/collections">
                <Button variant="secondary" size="lg">Voir les collections</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
