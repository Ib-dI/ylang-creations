import { Thermometer, Waves, Wind, ZapOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entretien des Produits",
  description:
    "Conseils pour prendre soin de vos créations Ylang et assurer leur longévité.",
};

export default function MaintenancePage() {
  const tips = [
    {
      title: "Lavage Doux",
      description:
        "Lavage en machine à 30°C maximum en cycle délicat pour préserver les fibres et les couleurs.",
      icon: Waves,
    },
    {
      title: "Séchage à l'air",
      description:
        "Privilégiez le séchage à l'air libre à plat. Le sèche-linge est déconseillé pour la gaze de coton.",
      icon: Wind,
    },
    {
      title: "Repassage",
      description:
        "Repassage à fer doux si nécessaire. La gaze de coton gagne en douceur et en aspect gaufré sans repassage.",
      icon: Thermometer,
    },
    {
      title: "Blanchiment",
      description:
        "L'utilisation de chlore ou de produits blanchissants est strictement interdite.",
      icon: ZapOff,
    },
  ];

  return (
    <div className="overflow-hidden bg-ylang-terracotta/50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="font-abramo-script text-5xl text-gray-900 sm:text-4xl">
            Entretien de vos Créations
          </h1>
          <div className="bg-ylang-rose mx-auto mt-4 h-1 w-20 rounded"></div>
          <p className="font-body mt-6 text-lg text-gray-600">
            Nos produits sont confectionnés avec des tissus délicats. Voici nos
            conseils pour les garder beaux et doux longtemps.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="bg-ylang-beige/20 border-ylang-beige/20 flex gap-6 rounded-2xl border p-8"
            >
              <div className="bg-ylang-rose/10 text-ylang-rose h-fit shrink-0 rounded-xl p-4">
                <tip.icon size={28} />
              </div>
              <div>
                <h3 className="font-display mb-2 text-xl font-bold text-gray-900">
                  {tip.title}
                </h3>
                <p className="font-body text-gray-600">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="font-abramo mb-6 text-2xl font-semibold text-gray-900">
            Conseils spécifiques par matière
          </h2>
          <div className="space-y-6">
            <div className="border-ylang-rose border-l-4 pl-6">
              <h3 className="mb-2 font-bold text-gray-900">
                Double gaze de coton
              </h3>
              <p className="font-body text-gray-600">
                La gaze de coton s'adoucit au fil des lavages. Elle n'a pas
                besoin d'être repassée pour garder son bel aspect froissé
                naturel.
              </p>
            </div>
            <div className="border-ylang-rose border-l-4 pl-6">
              <h3 className="mb-2 font-bold text-gray-900">Broderies</h3>
              <p className="font-body text-gray-600">
                Pour protéger les broderies personnalisées, nous recommandons de
                laver l'article sur l'envers ou dans un filet de protection.
              </p>
            </div>
            <div className="border-ylang-rose border-l-4 pl-6">
              <h3 className="mb-2 font-bold text-gray-900">
                Articles avec ouatine
              </h3>
              <p className="font-body text-gray-600">
                Pour les gigoteuses et couvertures, redonnez du gonflant après
                lavage en secouant doucement l'article avant de le faire sécher.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
