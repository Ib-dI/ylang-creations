"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Award,
  Baby,
  Heart,
  Leaf,
  MapPin,
  Scissors,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

// Timeline data
const timeline = [
  {
    year: "2019",
    title: "Naissance à Mayotte",
    description:
      "Ylang Créations voit le jour à Mayotte, devenant la première entreprise du territoire spécialisée dans la puériculture et la confection textile sur mesure.",
    icon: Baby,
  },
  {
    year: "2019-2024",
    title: "6 années d'expertise",
    description:
      "Développement du savoir-faire artisanal et création de centaines de pièces uniques pour les familles de l'île aux parfums.",
    icon: Award,
  },
  {
    year: "2025",
    title: "Cap vers la Réunion",
    description:
      "Forte de son expertise, la marque s'installe à la Réunion pour conquérir de nouveaux horizons tout en préservant son identité artisanale.",
    icon: MapPin,
  },
];

// Values data
const values = [
  {
    icon: Heart,
    title: "Fait avec amour",
    description:
      "Chaque création est inspirée par le quotidien d'une maman de 4 enfants. L'amour maternel guide chaque point de couture.",
  },
  {
    icon: Scissors,
    title: "Artisanat français",
    description:
      "Entièrement fait main dans notre atelier, chaque pièce est unique et confectionnée avec le plus grand soin.",
  },
  {
    icon: Leaf,
    title: "Éco-responsable",
    description:
      "Nous privilégions des tissus certifiés Oeko-Tex et coton bio, garantis sans substances nocives pour la santé.",
  },
  {
    icon: Shield,
    title: "Qualité premium",
    description:
      "Sélection rigoureuse des matières premières pour vous garantir des créations durables et de haute qualité.",
  },
];

// Stats data
const stats = [
  { value: "2019", label: "Fondée en" },
  { value: "6+", label: "Années d'expertise" },
  { value: "100%", label: "Fait main" },
  { value: "∞", label: "Créations uniques" },
];

export default function AProposPage() {
  return (
    <div className="bg-ylang-cream min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
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
              className="text-ylang-rose font-body mb-4 text-sm tracking-widest uppercase"
            >
              Notre Histoire
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-ylang-charcoal mb-6 text-4xl font-bold lg:text-6xl"
            >
              Élégance, raffinement
              <br />
              <span className="text-ylang-rose">& personnalisation</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="font-body text-ylang-charcoal/70 mx-auto max-w-2xl text-lg lg:text-xl"
            >
              Ylang Créations vous propose des services premium de confection
              textile, de décoration d'intérieur et d'aménagement personnalisés.
              Des prestations qui vous ressemblent et qui s'adaptent à vos
              envies.
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="font-display text-ylang-rose mt-6 text-xl italic"
            >
              Avec amour, Mélissa
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-ylang-beige relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="/images/about/founder.jpg"
                  alt="Mélissa, fondatrice de Ylang Créations"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback si l'image n'existe pas
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
                {/* Placeholder gradient si pas d'image */}
                <div className="from-ylang-rose/30 via-ylang-beige to-ylang-sage/30 absolute inset-0 flex items-center justify-center bg-gradient-to-br">
                  <div className="text-center">
                    <Sparkles className="text-ylang-rose mx-auto mb-4 h-16 w-16" />
                    <p className="font-display text-ylang-charcoal text-xl">
                      Mélissa
                    </p>
                    <p className="font-body text-ylang-charcoal/60 text-sm">
                      Fondatrice
                    </p>
                  </div>
                </div>
              </div>
              {/* Decorative badge */}
              <div className="absolute -right-6 -bottom-6 rounded-2xl bg-white p-6 shadow-xl">
                <p className="font-display text-ylang-rose text-3xl font-bold">
                  2019
                </p>
                <p className="font-body text-ylang-charcoal/60 text-sm">
                  Maison fondée
                </p>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div>
                <p className="text-ylang-rose font-body mb-3 text-sm tracking-widest uppercase">
                  L'histoire d'Ylang
                </p>
                <h2 className="font-display text-ylang-charcoal mb-6 text-3xl font-bold lg:text-4xl">
                  Une passion née du quotidien maternel
                </h2>
              </div>

              <div className="font-body text-ylang-charcoal/80 space-y-4 leading-relaxed">
                <p>
                  <strong className="text-ylang-charcoal">
                    Ylang Créations
                  </strong>{" "}
                  est une marque française fondée en 2019, spécialisée dans la
                  création et la confection d'articles de puériculture pour bébé
                  et parents.
                </p>
                <p>
                  Une entreprise dont chaque création est inspirée par le
                  quotidien d'une
                  <strong className="text-ylang-charcoal">
                    {" "}
                    maman de 4 enfants
                  </strong>
                  . "Ylang", un hommage aux aïeux de sa fondatrice et
                  "Créations" pour de multiples confections totalement uniques.
                </p>
                <p>
                  Créée à{" "}
                  <strong className="text-ylang-charcoal">Mayotte</strong>,
                  Ylang Créations fût la première entreprise du territoire
                  spécialisée dans le domaine de la puériculture, proposant une
                  offre de confection textile sur mesure et personnalisée.
                </p>
                <p>
                  Après 6 années passées sur l'île et forte de ses compétences
                  et de son savoir-faire, l'entreprise poursuit son activité à
                  la conquête d'un nouveau territoire :
                  <strong className="text-ylang-rose">
                    {" "}
                    l'île de la Réunion
                  </strong>
                  .
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="text-ylang-rose h-5 w-5" />
                  <span className="font-body text-ylang-charcoal/70">
                    Mayotte → La Réunion
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-ylang-rose font-body mb-3 text-sm tracking-widest uppercase">
              Notre parcours
            </p>
            <h2 className="font-display text-ylang-charcoal text-3xl font-bold lg:text-4xl">
              Une aventure humaine
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="bg-ylang-beige absolute top-0 bottom-0 left-1/2 hidden w-0.5 -translate-x-1/2 lg:block" />

            <div className="space-y-12 lg:space-y-24">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative flex flex-col items-center gap-8 lg:flex-row ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className="flex-1 lg:text-right">
                    <div
                      className={`bg-ylang-cream rounded-2xl p-8 shadow-lg ${
                        index % 2 === 1 ? "lg:text-left" : "lg:text-right"
                      }`}
                    >
                      <p className="font-display text-ylang-rose mb-2 text-2xl font-bold">
                        {item.year}
                      </p>
                      <h3 className="font-display text-ylang-charcoal mb-3 text-xl">
                        {item.title}
                      </h3>
                      <p className="font-body text-ylang-charcoal/70">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="bg-ylang-rose relative z-10 flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
                    <item.icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Empty space for alignment */}
                  <div className="hidden flex-1 lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-ylang-rose font-body mb-3 text-sm tracking-widest uppercase">
              Nos engagements
            </p>
            <h2 className="font-display text-ylang-charcoal mb-4 text-3xl font-bold lg:text-4xl">
              Nos valeurs
            </h2>
            <p className="font-body text-ylang-charcoal/60 mx-auto max-w-2xl">
              Nous accordons une importance primordiale au bien-être et à la
              santé de nos consommateurs. Chaque décision est guidée par ces
              valeurs fondamentales.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="bg-ylang-rose/10 group-hover:bg-ylang-rose mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-colors">
                  <value.icon className="text-ylang-rose h-7 w-7 transition-colors group-hover:text-white" />
                </div>
                <h3 className="font-display text-ylang-charcoal mb-3 text-lg">
                  {value.title}
                </h3>
                <p className="font-body text-ylang-charcoal/60 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Oeko-Tex Section */}
      <section className="from-ylang-sage/20 via-ylang-cream to-ylang-beige/30 bg-gradient-to-br py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-ylang-sage/30 inline-flex items-center gap-2 rounded-full px-4 py-2">
                <Leaf className="text-ylang-charcoal h-5 w-5" />
                <span className="font-body text-ylang-charcoal text-sm font-medium">
                  Démarche éco-responsable
                </span>
              </div>

              <h2 className="font-display text-ylang-charcoal text-3xl font-bold lg:text-4xl">
                Certification Oeko-Tex
              </h2>

              <div className="font-body text-ylang-charcoal/80 space-y-4 leading-relaxed">
                <p>
                  Nous privilégions des tissus garantis{" "}
                  <strong className="text-ylang-charcoal">100% Oeko-Tex</strong>{" "}
                  et en{" "}
                  <strong className="text-ylang-charcoal">coton bio</strong>.
                </p>
                <p>
                  <strong className="text-ylang-charcoal">
                    C'est quoi Oeko-Tex ?
                  </strong>
                  <br />
                  C'est la certification attribuée aux produits qui ne
                  présentent, lors du contrôle, aucune substance chimique ou
                  nocive pour la santé.
                </p>
              </div>

              <div className="rounded-xl bg-white/80 p-6 backdrop-blur-sm">
                <h3 className="font-display text-ylang-charcoal mb-3 text-lg">
                  Pourquoi choisir Ylang Créations ?
                </h3>
                <p className="font-body text-ylang-charcoal/70">
                  Nous choisir, c'est la garantie de s'offrir des produits
                  sains, de qualité premium, à notre image et qui respectent
                  l'environnement.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white p-6 text-center shadow-lg"
                >
                  <p className="font-display text-ylang-rose text-3xl font-bold lg:text-4xl">
                    {stat.value}
                  </p>
                  <p className="font-body text-ylang-charcoal/60 mt-2 text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="from-ylang-rose to-ylang-terracotta rounded-3xl bg-gradient-to-br p-12 text-center text-white lg:p-20"
          >
            <Sparkles className="mx-auto mb-6 h-12 w-12 opacity-80" />
            <h2 className="font-display mb-6 text-3xl font-bold lg:text-4xl">
              Notre concept
            </h2>
            <p className="font-body mx-auto max-w-3xl text-lg leading-relaxed opacity-90 lg:text-xl">
              Partager notre savoir-faire et proposer à notre clientèle des
              prestations haut de gamme qui leur ressemblent. Vous nous confiez
              vos projets, vos envies et vos attentes. En sélectionnant avec le
              plus grand soin nos matières premières, nous vous garantissons des
              créations de qualité, artisanales et entièrement fait main.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/collections">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-ylang-rose hover:bg-ylang-cream bg-white"
                >
                  Découvrir nos créations
                </Button>
              </Link>
              <Link href="/configurateur">
                <Button
                  variant="luxury"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Créer sur mesure
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-ylang-beige border-t py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Users className="text-ylang-rose mx-auto mb-6 h-12 w-12" />
            <h2 className="font-display text-ylang-charcoal mb-4 text-2xl font-bold lg:text-3xl">
              Une question ? Un projet ?
            </h2>
            <p className="font-body text-ylang-charcoal/60 mx-auto mb-8 max-w-xl">
              N'hésitez pas à nous contacter pour discuter de votre projet
              personnalisé. Nous serons ravies de vous accompagner.
            </p>
            <Link href="/contact">
              <Button variant="luxury" size="lg">
                Nous contacter
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
