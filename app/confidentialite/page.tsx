import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Ylang Créations",
  description:
    "Politique de confidentialité et protection des données personnelles chez Ylang Créations.",
};

export default function ConfidentialitePage() {
  return (
    <div className="overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            Politique de Confidentialité
          </h1>
          <div className="bg-ylang-rose mx-auto mt-4 h-1 w-20 rounded"></div>
        </div>

        <div className="font-body space-y-12 text-gray-600">
          <p className="text-lg">
            La protection de vos données personnelles est une priorité pour
            Ylang Créations. Cette politique de confidentialité vous informe sur
            la manière dont nous recueillons, utilisons et protégeons vos
            données.
          </p>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              1. Collecte des données
            </h2>
            <p>
              Nous recueillons des informations lorsque vous passez une
              commande, vous inscrivez à notre newsletter, ou remplissez un
              formulaire de contact. Les informations recueillies incluent votre
              nom, votre adresse e-mail, votre numéro de téléphone et votre
              adresse postale.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              2. Utilisation des données
            </h2>
            <p className="mb-4">
              Toutes les informations que nous recueillons auprès de vous
              peuvent être utilisées pour :
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Traiter vos commandes et assurer la livraison</li>
              <li>
                Personnaliser votre expérience et répondre à vos besoins
                individuels
              </li>
              <li>
                Améliorer le service client et vos besoins de prise en charge
              </li>
              <li>
                Vous contacter par e-mail (suivi de commande, newsletter, etc.)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              3. Confidentialité du commerce en ligne
            </h2>
            <p>
              Nous sommes les seuls propriétaires des informations recueillies
              sur ce site. Vos informations personnelles ne seront pas vendues,
              échangées, transférées, ou données à une autre société pour
              n'importe quelle raison, sans votre consentement, en dehors de ce
              qui est nécessaire pour répondre à une demande et / ou une
              transaction, comme par exemple pour expédier une commande.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              4. Divulgation à des tiers
            </h2>
            <p>
              Nous ne vendons, n'échangeons et ne transférons pas vos
              informations personnelles identifiables à des tiers. Cela ne
              comprend pas les tierce parties de confiance qui nous aident à
              exploiter notre site Web ou à mener nos affaires, tant que ces
              parties conviennent de garder ces informations confidentielles
              (ex: Stripe pour les paiements, transporteurs pour la livraison).
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              5. Protection des informations
            </h2>
            <p>
              Nous mettons en œuvre une variété de mesures de sécurité pour
              préserver la sécurité de vos informations personnelles. Nous
              utilisons un cryptage à la pointe de la technologie pour protéger
              les informations sensibles transmises en ligne. Vercel et Supabase
              assurent également la sécurité de l'infrastructure et des bases de
              données.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              6. Cookies
            </h2>
            <p>
              Nos cookies améliorent l'accès à notre site et identifient les
              visiteurs réguliers. En outre, nos cookies améliorent l'expérience
              d'utilisateur grâce au suivi et au ciblage de ses intérêts.
              Cependant, cette utilisation des cookies n'est en aucune façon
              liée à des informations personnelles identifiables sur notre site.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              7. Consentement
            </h2>
            <p>
              En utilisant notre site, vous consentez à notre politique de
              confidentialité.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
