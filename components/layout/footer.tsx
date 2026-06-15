"use client";

import { Input } from "@/components/ui/input";
import { Facebook, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

const footerLinks = {
  shop: [
    { name: "La Chambre", href: "/collections?category=chambre" },
    { name: "La Toilette", href: "/collections?category=toilette" },
    { name: "Linge de naissance", href: "/collections?category=linge-naissance" },
    { name: "Accessoires", href: "/collections?category=accessoires" },
    { name: "Bagageries & Promenade", href: "/collections?category=bagageries" },
    { name: "Les Jeux", href: "/collections?category=jeux" },
    { name: "Créations sur mesure", href: "/configurateur" },
    { name: "Nouvelle collection", href: "/collections?filter=new" },
  ],
  company: [
    { name: "La marque", href: "/a-propos" },
    { name: "Savoir-faire artisanal", href: "/a-propos#savoir-faire" },
    { name: "Nos engagements", href: "/a-propos#engagements" },
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
    { name: "RGPD", href: "/rgpd" },
    { name: "Cookies", href: "/cookies" },
  ],
};

const trustLabels = [
  "Fabrication française",
  "Tissus biologiques certifiés",
  "Confection artisanale",
  "Personnalisation illimitée",
];

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/ylang_creations/" },
  { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/ylangcreations/?ref=_xav_ig_profile_page_web#" },
];

export function Footer() {
  const [email, setEmail] = React.useState("");
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setIsSubscribed(true);
          setEmail("");
          setTimeout(() => setIsSubscribed(false), 5000);
        } else {
          setError(data.error || "Une erreur est survenue.");
        }
        return;
      }
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 5000);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer style={{ background: "var(--color-paper-2)" }}>

      {/* ── Newsletter — bloc éditorial d'ouverture ── */}
      <div style={{ borderBottom: "var(--rule-hair)" }}>
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-[1fr_380px] lg:items-end">

            {/* Titre éditorial */}
            <div>
              <p
                className="mb-5 text-[11px] uppercase tracking-[0.2em]"
                style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
              >
                Restez dans notre univers
              </p>
              <h2
                className="mb-4 font-semibold leading-[1.06] tracking-tight text-4xl lg:text-5xl xl:text-[3.5rem]"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
              >
                Nouvelles créations,<br />inspirations exclusives
              </h2>
              {/* Abramo Script — accent décoratif uniquement, pas un titre */}
              <p
                className="text-xl leading-relaxed"
                style={{ fontFamily: "var(--font-accent)", color: "var(--color-accent)" }}
              >
                En avant-première, pour nos abonnés seulement
              </p>
            </div>

            {/* Formulaire */}
            <div>
              {isSubscribed ? (
                <p
                  className="text-sm"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-accent-green)" }}
                >
                  Merci — vous êtes inscrit.
                </p>
              ) : (
                <form onSubmit={handleNewsletter} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="votre@email.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full rounded-none border-0 border-b bg-transparent py-5 text-sm
                               focus-visible:ring-0 placeholder:opacity-40"
                    style={{
                      borderColor: "var(--color-ink-2)",
                      fontFamily: "var(--font-body)",
                      color: "var(--color-ink)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.14em]
                               transition-opacity duration-200 disabled:opacity-40"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)" }}
                  >
                    <span
                      className="border-b pb-px"
                      style={{ borderColor: "var(--color-accent)" }}
                    >
                      {isLoading ? "Envoi…" : "S'inscrire"}
                    </span>
                    <span
                      className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    >
                      →
                    </span>
                  </button>
                  {error && (
                    <p
                      className="text-xs"
                      style={{ fontFamily: "var(--font-body)", color: "var(--color-accent)" }}
                    >
                      {error}
                    </p>
                  )}
                  <p
                    className="text-xs opacity-40"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)" }}
                  >
                    Désinscription possible à tout moment.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust strip — labels texte, sans emoji ── */}
      <div style={{ borderBottom: "var(--rule-soft)" }}>
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {trustLabels.map((label, i) => (
              <React.Fragment key={label}>
                <span
                  className="text-[10px] uppercase tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-brand)", color: "var(--color-ink-3)" }}
                >
                  {label}
                </span>
                {i < trustLabels.length - 1 && (
                  <span aria-hidden className="opacity-30" style={{ color: "var(--color-ink)" }}>
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3 colonnes ── */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">

          {/* Col 1 — Brand + social */}
          <div>
            <Link href="/" className="mb-8 inline-block">
              <Image
                src="/logo/ylang créations_long.png"
                alt="Ylang Créations"
                width={160}
                height={40}
                className="h-auto w-auto"
              />
            </Link>
            <p
              className="mb-8 text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-ink-3)" }}
            >
              Créations textiles sur mesure pour bébés et enfants. Savoir-faire artisanal, tissus premium certifiés et personnalisation illimitée.
            </p>
            <div className="flex items-center gap-5">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="opacity-50 transition-opacity duration-200 hover:opacity-100
                               focus-visible:outline-2 focus-visible:outline-offset-4"
                    style={{ color: "var(--color-ink)", outlineColor: "var(--color-accent)" }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2 — Boutique & Marque */}
          <div>
            <p
              className="mb-6 text-[11px] uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
            >
              Boutique
            </p>
            <ul className="mb-10 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-60 transition-opacity duration-200 hover:opacity-100"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)" }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <p
              className="mb-6 text-[11px] uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
            >
              La marque
            </p>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-60 transition-opacity duration-200 hover:opacity-100"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)" }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Aide */}
          <div>
            <p
              className="mb-6 text-[11px] uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
            >
              Aide & Infos
            </p>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-60 transition-opacity duration-200 hover:opacity-100"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)" }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Barre légale ── */}
      <div style={{ borderTop: "var(--rule-soft)" }}>
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p
              className="text-xs opacity-50"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)" }}
            >
              © {new Date().getFullYear()} Ylang Créations. Tous droits réservés.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              {footerLinks.legal.map((link, i) => (
                <React.Fragment key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[11px] opacity-40 transition-opacity duration-200 hover:opacity-80"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)" }}
                  >
                    {link.name}
                  </Link>
                  {i < footerLinks.legal.length - 1 && (
                    <span aria-hidden className="opacity-20" style={{ color: "var(--color-ink)" }}>
                      ·
                    </span>
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
