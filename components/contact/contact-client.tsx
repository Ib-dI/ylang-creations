"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

// Fallback Contact info data
const fallbackContactInfo = [
  // {
  //   icon: Phone,
  //   label: "Téléphone",
  //   value: "*********",
  //   href: "tel:#",
  //   description: "Du lundi au vendredi, 9h-18h",
  // },
  {
    icon: Mail,
    label: "Email",
    value: "ylang.creations@gmail.com",
    href: "mailto:ylang.creations@gmail.com",
    description: "Réponse sous 24–48 h",
  },
  {
    icon: MapPin,
    label: "Localisation",
    value: "Mayotte / Île de la Réunion",
    href: null,
    description: "Livraison France entière",
  },
];

// Social links
const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://www.instagram.com/ylang.creations/",
    color:
      "hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400",
  },
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://www.facebook.com/ylangcreations/",
    color: "hover:bg-blue-600",
  },
];

// FAQ data
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

export function ContactClient({ settings }: { settings: any }) {
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

  // Compute dynamic contact info
  const contactInfo = [
    // {
    //   icon: Phone,
    //   label: "Téléphone",
    //   value: settings?.contactPhone || fallbackContactInfo[0].value,
    //   href: settings?.contactPhone
    //     ? `tel:${settings.contactPhone.replace(/\s/g, "")}`
    //     : fallbackContactInfo[0].href,
    //   description: fallbackContactInfo[0].description,
    // },
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

    // Simulation d'envoi
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-ylang-terracotta/30 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-ylang-rose/10 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
          <div className="bg-ylang-sage/20 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p
              variants={fadeInUp}
              className="text-ylang-rose font-abramo mb-4 text-sm font-semibold tracking-widest uppercase"
            >
              Contactez-nous
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="font-abramo-script text-ylang-charcoal mb-6 text-4xl lg:text-5xl"
            >
              Parlons de votre projet
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="font-body text-ylang-charcoal/70 mx-auto max-w-2xl text-lg"
            >
              Une question, un projet personnalisé ou simplement envie d'en
              savoir plus ? Nous sommes là pour vous accompagner dans la
              création de pièces uniques.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="rounded-3xl bg-white p-8 shadow-xs lg:p-10">
                <div className="mb-8">
                  <h2 className="font-display text-ylang-charcoal mb-2 text-2xl font-bold">
                    Envoyez-nous un message
                  </h2>
                  <p className="font-body text-ylang-charcoal/60">
                    Remplissez le formulaire ci-dessous et nous vous répondrons
                    dans les plus brefs délais.
                  </p>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="font-display text-ylang-charcoal mb-2 text-xl font-bold">
                      Message envoyé !
                    </h3>
                    <p className="font-body text-ylang-charcoal/60">
                      Merci pour votre message. Nous vous répondrons sous
                      24–48 h.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Name */}
                      <Input
                        id="name"
                        name="name"
                        label="Nom complet *"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom…"
                      />

                      {/* Email */}
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        label="Email *"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        spellCheck={false}
                        placeholder="votre@email.com…"
                      />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Phone */}
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        label="Téléphone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+262 6XX XX XX XX…"
                      />

                      {/* Subject */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="font-body text-ylang-charcoal mb-2 block text-sm font-semibold"
                        >
                          Sujet *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="font-body border-ylang-beige bg-ylang-cream/50 text-ylang-charcoal focus:border-ylang-rose focus:ring-ylang-rose/20 w-full rounded-xl border px-4 py-3 transition-[border-color,box-shadow,transform] focus:ring-2 focus:outline-none"
                        >
                          <option value="">Choisir un sujet</option>
                          <option value="devis">Demande de devis</option>
                          <option value="personnalisation">
                            Personnalisation
                          </option>
                          <option value="commande">Suivi de commande</option>
                          <option value="question">Question générale</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="font-body text-ylang-charcoal mb-2 block text-sm font-semibold"
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
                        className="font-body border-ylang-beige bg-ylang-cream/50 text-ylang-charcoal placeholder:text-ylang-charcoal/40 focus:border-ylang-rose focus:ring-ylang-rose/20 w-full resize-none rounded-xl border px-4 py-3 transition-[border-color,box-shadow,transform] focus:ring-2 focus:outline-none"
                        placeholder="Décrivez votre projet, vos envies…"
                      />
                    </div>

                    {/* Submit Button */}
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

            {/* Contact Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 lg:col-span-2"
            >
              {/* Contact Cards */}
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {info.href ? (
                      <a
                        href={info.href}
                        className="group flex items-start gap-4 rounded-2xl bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:shadow-sm"
                      >
                        <div className="bg-ylang-rose/10 group-hover:bg-ylang-rose flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors">
                          <info.icon className="text-ylang-rose h-6 w-6 transition-colors group-hover:text-white" />
                        </div>
                        <div>
                          <p className="font-body text-ylang-charcoal/60 text-sm">
                            {info.label}
                          </p>
                          <p className="font-display text-ylang-charcoal font-semibold">
                            {info.value}
                          </p>
                          <p className="font-body text-ylang-charcoal/50 mt-1 text-xs">
                            {info.description}
                          </p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-xs">
                        <div className="bg-ylang-yellow/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                          <info.icon className="text-ylang-yellow h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-body text-ylang-charcoal/60 text-sm">
                            {info.label}
                          </p>
                          <p className="font-display text-ylang-charcoal font-semibold">
                            {info.value}
                          </p>
                          <p className="font-body text-ylang-charcoal/50 mt-1 text-xs">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="rounded-2xl bg-white p-6 shadow-xs">
                <h3 className="font-display text-ylang-charcoal mb-4 text-lg font-semibold">
                  Suivez-nous
                </h3>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`bg-ylang-beige text-ylang-charcoal flex h-12 w-12 items-center justify-center rounded-xl transition-all hover:text-white ${social.color}`}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
                <p className="font-body text-ylang-charcoal/50 mt-4 text-sm">
                  Rejoignez notre communauté pour découvrir nos dernières
                  créations !
                </p>
              </div>

              {/* Response Time */}
              <div className="from-ylang-rose/10 to-ylang-terracotta/10 rounded-2xl bg-linear-to-br p-6">
                <div className="mb-3 flex items-center gap-3">
                  <Clock className="text-ylang-rose h-5 w-5" />
                  <h3 className="font-display text-ylang-charcoal font-semibold">
                    Temps de réponse
                  </h3>
                </div>
                <p className="font-body text-ylang-charcoal/70 text-sm">
                  Nous nous efforçons de répondre à toutes les demandes sous
                  <strong className="text-ylang-charcoal"> 24/48 h</strong>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-ylang-terracotta/20 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="text-ylang-rose font-abramo mb-3 text-sm font-semibold tracking-widest uppercase">
              FAQ
            </p>
            <h2 className="font-abramo-script text-ylang-charcoal mb-4 text-3xl">
              Questions fréquentes
            </h2>
            <p className="font-body text-ylang-charcoal/60">
              Retrouvez les réponses aux questions les plus courantes
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border-ylang-beige bg-ylang-cream/50 overflow-hidden rounded-2xl border"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="font-display text-ylang-charcoal pr-4 font-semibold">
                    {item.question}
                  </span>
                  <span
                    className={`bg-ylang-rose/10 text-ylang-rose flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform ${
                      openFaq === index ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-6 pb-6"
                  >
                    <p className="font-body text-ylang-charcoal/70 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="from-ylang-rose/10 to-ylang-terracotta/10 text-ylang-charcoal rounded-3xl bg-linear-to-br p-12 text-center lg:p-16"
          >
            <Sparkles
              strokeWidth={1.5}
              className="text-ylang-rose mx-auto mb-6 h-10 w-10 opacity-80"
            />
            <h2 className="font-abramo-script mb-4 text-2xl lg:text-3xl">
              Prêt à créer quelque chose d'unique ?
            </h2>
            <p className="font-body text-ylang-charcoal/70 mx-auto mb-8 max-w-xl opacity-90">
              Découvrez notre configurateur pour imaginer votre création sur
              mesure ou explorez nos collections pour trouver l'inspiration.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/configurateur">
                <Button variant="secondary" size="lg" className="">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Créer sur mesure
                </Button>
              </Link>
              <Link href="/collections">
                <Button variant="luxury" size="lg" className="">
                  Voir les collections
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
