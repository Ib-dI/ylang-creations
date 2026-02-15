import { Edit3, Heart, Palette, Scissors } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comment personnaliser ",
  description:
    "Découvrez comment personnaliser vos créations textiles pour un cadeau unique et mémorable.",
};

export default function CustomizationPage() {
  const steps = [
    {
      title: "Choisissez votre article",
      description:
        "Parcourez nos collections et sélectionnez l'article que vous souhaitez personnaliser (gigoteuse, couverture, protège carnet, etc.).",
      icon: Scissors,
    },
    {
      title: "Sélectionnez vos tissus",
      description:
        "Choisissez parmi notre sélection de gazes de coton, tissus motifs et doublures premium pour créer votre harmonie parfaite.",
      icon: Palette,
    },
    {
      title: "Ajoutez une broderie",
      description:
        "Indiquez le prénom ou le mot doux à broder. Choisissez la police et la couleur du fil pour une touche personnelle.",
      icon: Edit3,
    },
    {
      title: "Nous confectionnons",
      description:
        "Dès validation, notre atelier artisanal à la Réunion lance la confection de votre pièce unique avec le plus grand soin.",
      icon: Heart,
    },
  ];

  return (
    <div className="overflow-hidden bg-ylang-terracotta/50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="font-abramo-script text-4xl text-gray-900 sm:text-4xl">
            Comment Personnaliser
          </h1>
          <div className="bg-ylang-rose mx-auto mt-4 h-1 w-20 rounded"></div>
          <p className="font-body mt-6 text-lg text-gray-600">
            Chez Ylang Créations, chaque pièce est unique. Découvrez les étapes
            pour créer un article qui vous ressemble.
          </p>
        </div>

        <div className="space-y-16">
          <div className="grid gap-8 md:grid-cols-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-ylang-beige/10 border-ylang-beige/30 relative rounded-2xl border p-8 transition-transform hover:-translate-y-1"
              >
                <div className="bg-ylang-rose absolute -top-4 -left-4 flex h-8 w-8 items-center justify-center rounded-full font-bold text-white">
                  {index + 1}
                </div>
                <div className="text-ylang-rose mb-4">
                  <step.icon size={32} />
                </div>
                <h3 className="font-display mb-2 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="font-body text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <section className="bg-ylang-charcoal rounded-3xl p-10 text-center text-white">
            <h2 className="font-abramo text-ylang-beige mb-4 text-3xl">
              Besoin d'une création sur mesure ?
            </h2>
            <p className="font-body text-ylang-beige/80 mx-auto mb-8 max-w-2xl">
              Si vous ne trouvez pas votre bonheur dans notre configurateur,
              nous pouvons réaliser des projets spécifiques hors catalogue.
            </p>
            <a
              href="/contact"
              className="bg-ylang-rose hover:bg-ylang-rose/90 inline-block rounded-full px-8 py-3 font-semibold text-white transition-colors"
            >
              Contactez-nous
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
