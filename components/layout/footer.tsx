"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Facebook,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Phone
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

const footerLinks = {
  shop: [
    { name: "Toutes les collections", href: "/collections" },
    { name: "Linge de lit bébé", href: "/collections/linge-lit" },
    { name: "Décoration chambre", href: "/collections/decoration" },
    { name: "Cadeaux de naissance", href: "/collections/cadeaux" },
    { name: "Sur mesure", href: "/configurateur" },
  ],
  company: [
    { name: "Notre histoire", href: "/a-propos" },
    { name: "Savoir-faire artisanal", href: "/a-propos#savoir-faire" },
    { name: "Nos engagements", href: "/a-propos#engagements" },
    { name: "Blog & Inspirations", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ],
  help: [
    { name: "Guide des tailles", href: "/aide/tailles" },
    { name: "Comment personnaliser", href: "/aide/personnalisation" },
    { name: "Livraison & Retours", href: "/aide/livraison" },
    { name: "Entretien des produits", href: "/aide/entretien" },
    { name: "FAQ", href: "/aide/faq" },
  ],
  legal: [
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "CGV", href: "/cgv" },
    { name: "Politique de confidentialité", href: "/confidentialite" },
    { name: "Cookies", href: "/cookies" },
  ],
};
type NavigationType = {
  name: string;
  href: string;
  featured?: boolean;
};

const navigation: NavigationType[] = [
  { name: "Accueil", href: "/" },
  { name: "Boutique", href: "/boutique" },
  { name: "Collections", href: "/collections" },
  {
    name: "Créer sur mesure",
    href: "/configurateur",
    featured: true, // Badge "Nouveau" ✨
  },
  { name: "Notre atelier", href: "/atelier" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/ylang.creations",
    color: "hover:text-pink-600",
  },
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://facebook.com/ylangcreations",
    color: "hover:text-blue-600",
  },
];

export function Footer() {
  const [email, setEmail] = React.useState("");
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    // À connecter avec votre service email
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <footer className="from-ylang-cream to-ylang-beige border-ylang-beige/50 border-t bg-gradient-to-b">
      {/* Newsletter Section */}
      <div className="border-ylang-beige/50 border-b">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            {/* Texte */}
            <div className="text-center lg:text-left">
              <h3 className="font-display text-ylang-charcoal mb-3 text-3xl lg:text-4xl">
                Rejoignez notre univers
              </h3>
              <p className="font-body text-ylang-charcoal/60 mx-auto max-w-xl text-lg lg:mx-0">
                Recevez en avant-première nos nouvelles créations, inspirations
                et offres exclusives
              </p>
            </div>

            {/* Form Newsletter */}
            <form
              onSubmit={handleNewsletter}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="votre@email.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                variant={isSubscribed ? "secondary" : "primary"}
                size="lg"
                className="whitespace-nowrap sm:w-auto"
              >
                {isSubscribed ? "✓ Inscrit !" : "S'inscrire"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          {/* Colonne 1 : Branding */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="group mb-6 inline-flex items-center space-x-3"
            >
              <Image
                src="/logo/ylang créations_long.png"
                alt="Logo"
                width={200}
                height={200}
                // className="h-12 w-12"
              />
            </Link>

            <p className="font-body text-ylang-charcoal/60 mb-6 leading-relaxed">
              Créations textiles sur mesure pour bébés et décoration
              d'intérieur. Savoir-faire artisanal français, tissus premium et
              personnalisation illimitée.
            </p>

            {/* Contact Info */}
            <div className="mb-6 space-y-3">
              <a
                href="tel:+33612345678"
                className="text-ylang-charcoal/70 hover:text-ylang-rose group flex items-center gap-3 transition-colors"
              >
                <div className="bg-ylang-beige group-hover:bg-ylang-rose/10 flex h-10 w-10 items-center justify-center rounded-full transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="font-body text-sm">+33 6 12 34 56 78</span>
              </a>

              <a
                href="mailto:contact@ylang-creations.fr"
                className="text-ylang-charcoal/70 hover:text-ylang-rose group flex items-center gap-3 transition-colors"
              >
                <div className="bg-ylang-beige group-hover:bg-ylang-rose/10 flex h-10 w-10 items-center justify-center rounded-full transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="font-body text-sm">
                  contact@ylang-creations.fr
                </span>
              </a>

              <div className="text-ylang-charcoal/70 flex items-start gap-3">
                <div className="bg-ylang-beige flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="font-body text-sm leading-relaxed">
                  Atelier Ylang
                  <br />
                  12 rue de l'Artisanat
                  <br />
                  75011 Paris, France
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "bg-ylang-beige text-ylang-charcoal flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg",
                    social.color,
                  )}
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Colonne 2 : Boutique */}
          <div>
            <h4 className="font-display text-ylang-charcoal mb-4 text-lg font-semibold tracking-tight">
              Boutique
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-ylang-charcoal/60 hover:text-ylang-rose inline-block text-sm transition-colors duration-300 hover:translate-x-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : À propos */}
          <div>
            <h4 className="font-display text-ylang-charcoal mb-4 text-lg font-semibold tracking-tight">
              À propos
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-ylang-charcoal/60 hover:text-ylang-rose inline-block text-sm transition-colors duration-300 hover:translate-x-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 : Aide */}
          <div>
            <h4 className="font-display text-ylang-charcoal mb-4 text-lg font-semibold tracking-tight">
              Aide & Infos
            </h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-ylang-charcoal/60 hover:text-ylang-rose inline-block text-sm transition-colors duration-300 hover:translate-x-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Certifications / Trust badges */}
        <div className="border-ylang-beige/50 mt-12 border-t pt-8">
          <div className="grid grid-cols-2 items-center justify-items-center gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="bg-ylang-beige/50 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl">🇫🇷</span>
              </div>
              <p className="font-body text-ylang-charcoal/60 text-xs">
                Fabrication
                <br />
                française
              </p>
            </div>

            <div className="text-center">
              <div className="bg-ylang-beige/50 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl">🌿</span>
              </div>
              <p className="font-body text-ylang-charcoal/60 text-xs">
                Tissus
                <br />
                biologiques
              </p>
            </div>

            <div className="text-center">
              <div className="bg-ylang-beige/50 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl">✂️</span>
              </div>
              <p className="font-body text-ylang-charcoal/60 text-xs">
                Confection
                <br />
                artisanale
              </p>
            </div>

            <div className="text-center">
              <div className="bg-ylang-beige/50 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl">💫</span>
              </div>
              <p className="font-body text-ylang-charcoal/60 text-xs">
                Personnalisation
                <br />
                illimitée
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-ylang-beige/50 bg-ylang-beige/30 border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright */}
            <p className="font-body text-ylang-charcoal/60 text-center text-sm md:text-left">
              © {new Date().getFullYear()} Ylang Créations. Tous droits
              réservés.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {footerLinks.legal.map((link, index) => (
                <React.Fragment key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-ylang-charcoal/60 hover:text-ylang-rose text-xs transition-colors"
                  >
                    {link.name}
                  </Link>
                  {index < footerLinks.legal.length - 1 && (
                    <span className="text-ylang-charcoal/30">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
