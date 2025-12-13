import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales | Ylang Créations",
  description:
    "Mentions légales du site Ylang Créations, artisanat textile à la Réunion.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            Mentions Légales
          </h1>
          <div className="bg-ylang-rose mx-auto mt-4 h-1 w-20 rounded"></div>
        </div>

        <div className="font-body space-y-12 text-gray-600">
          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              1. Édition du site
            </h2>
            <p className="mb-4">
              En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour
              la confiance dans l'économie numérique, il est précisé aux
              utilisateurs du site internet Ylang Créations l'identité des
              différents intervenants dans le cadre de sa réalisation et de son
              suivi :
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Propriétaire du site :</strong> Ylang Créations
              </li>
              <li>
                <strong>Contact :</strong> ylang.creations@gmail.com / +262 693
                53 08 58
              </li>
              <li>
                <strong>Adresse :</strong> Île de la Réunion
              </li>
              <li>
                <strong>Statut :</strong> Entreprise individuelle (ou mentionner
                le statut réel si connu, e.g. Micro-entreprise)
              </li>
              <li>
                <strong>SIRET :</strong> [Numéro SIRET à compléter]
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              2. Hébergement
            </h2>
            <p>
              Le site est hébergé par Vercel Inc., dont le siège social est
              situé au 340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              3. Propriété intellectuelle et contrefaçons
            </h2>
            <p className="mb-4">
              Ylang Créations est propriétaire des droits de propriété
              intellectuelle et détient les droits d’usage sur tous les éléments
              accessibles sur le site internet, notamment les textes, images,
              graphismes, logos, vidéos, architecture, icônes et sons.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication,
              adaptation de tout ou partie des éléments du site, quel que soit
              le moyen ou le procédé utilisé, est interdite, sauf autorisation
              écrite préalable de Ylang Créations.
            </p>
            <p>
              Toute exploitation non autorisée du site ou de l’un quelconque des
              éléments qu’il contient sera considérée comme constitutive d’une
              contrefaçon et poursuivie conformément aux dispositions des
              articles L.335-2 et suivants du Code de Propriété Intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              4. Limitations de responsabilité
            </h2>
            <p className="mb-4">
              Ylang Créations ne pourra être tenu pour responsable des dommages
              directs et indirects causés au matériel de l’utilisateur, lors de
              l’accès au site.
            </p>
            <p>
              Ylang Créations décline toute responsabilité quant à l’utilisation
              qui pourrait être faite des informations et contenus présents sur
              le site.
            </p>
            <p>
              Ylang Créations s’engage à sécuriser au mieux le site, cependant
              sa responsabilité ne pourra être mise en cause si des données
              indésirables sont importées et installées sur son site à son insu.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
