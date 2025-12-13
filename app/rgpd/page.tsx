import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RGPD et Protection des Données | Ylang Créations",
  description:
    "Informations sur le Règlement Général sur la Protection des Données (RGPD) et vos droits.",
};

export default function RGPDPage() {
  return (
    <div className="overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            Charte RGPD
          </h1>
          <div className="bg-ylang-rose mx-auto mt-4 h-1 w-20 rounded"></div>
        </div>

        <div className="font-body space-y-12 text-gray-600">
          <p className="text-lg">
            Le Règlement Général sur la Protection des Données (RGPD) est un
            règlement de l'UE qui vise à renforcer et unifier la protection des
            données pour les individus au sein de l'Union Européenne. Ylang
            Créations s'engage à respecter ce règlement.
          </p>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              1. Responsable du traitement
            </h2>
            <p className="mb-4">
              Le responsable du traitement des données personnelles est Ylang
              Créations.
            </p>
            <ul className="list-none space-y-1 pl-0">
              <li>
                <strong>
                  Contact DPO (Délégué à la Protection des Données) :
                </strong>{" "}
                ylang.creations@gmail.com
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              2. Vos droits
            </h2>
            <p className="mb-4">
              Conformément à la réglementation en vigueur, vous disposez des
              droits suivants concernant vos données personnelles :
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Droit d'accès :</strong> Vous avez le droit d'accéder
                aux données personnelles que nous détenons à votre sujet.
              </li>
              <li>
                <strong>Droit de rectification :</strong> Vous pouvez demander
                la correction de données inexactes ou incomplètes.
              </li>
              <li>
                <strong>Droit à l'effacement ("Droit à l'oubli") :</strong> Vous
                avez le droit de demander la suppression de vos données
                personnelles sous certaines conditions.
              </li>
              <li>
                <strong>Droit à la limitation du traitement :</strong> Vous
                pouvez demander de limiter l'utilisation de vos données dans
                certains cas.
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> Vous avez le droit de
                recevoir vos données personnelles dans un format structuré et
                couramment utilisé.
              </li>
              <li>
                <strong>Droit d'opposition :</strong> Vous pouvez vous opposer
                au traitement de vos données pour des motifs légitimes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              3. Exercice de vos droits
            </h2>
            <p className="mb-4">
              Pour exercer vos droits, vous pouvez nous contacter par e-mail à
              l'adresse suivante : <strong>ylang.creations@gmail.com</strong>.
            </p>
            <p>
              Nous nous engageons à répondre à votre demande dans un délai d'un
              mois. Si nécessaire, ce délai peut être prolongé de deux mois,
              compte tenu de la complexité et du nombre de demandes.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              4. Sécurité des données
            </h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles
              appropriées pour protéger vos données personnelles contre la
              destruction accidentelle ou illicite, la perte, l'altération, la
              diffusion ou l'accès non autorisé.
            </p>
          </section>

          <section className="bg-ylang-beige/20 border-ylang-beige/50 rounded-lg border p-6">
            <h3 className="font-display mb-2 font-semibold text-gray-800">
              Besoin de plus d'informations ?
            </h3>
            <p className="mb-4">
              Pour en savoir plus sur notre politique globale de
              confidentialité, veuillez consulter notre page dédiée.
            </p>
            <Link
              href="/confidentialite"
              className="text-ylang-rose font-medium hover:underline"
            >
              Voir la Politique de Confidentialité &rarr;
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
