import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | Ylang Créations",
  description: "Conditions Générales de Vente (CGV) de Ylang Créations.",
};

export default function CGVPage() {
  return (
    <div className="overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            Conditions Générales de Vente (CGV)
          </h1>
          <div className="bg-ylang-rose mx-auto mt-4 h-1 w-20 rounded"></div>
        </div>

        <div className="font-body space-y-12 text-gray-600">
          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              1. Objet
            </h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les
              relations contractuelles entre Ylang Créations et toute personne
              effectuant un achat via le site internet.
              <br />
              L'acquisition d'un produit à travers le présent site implique une
              acceptation sans réserve par l'acheteur des présentes conditions
              de vente.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              2. Produits et Prix
            </h2>
            <p className="mb-4">
              Les produits proposés sont ceux qui figurent sur le site Ylang
              Créations, dans la limite des stocks disponibles. Ylang Créations
              se réserve le droit de modifier à tout moment l'assortiment de
              produits.
            </p>
            <p className="mb-4">
              Chaque produit est présenté sur le site internet sous forme d'un
              descriptif reprenant ses principales caractéristiques techniques.
              Les photographies sont les plus fidèles possibles mais n'engagent
              pas le Vendeur.
            </p>
            <p>
              Les prix sont indiqués en Euros (€) toutes taxes comprises (TTC).
              Ylang Créations se réserve le droit de modifier ses prix à tout
              moment, étant toutefois entendu que le prix figurant au catalogue
              le jour de la commande sera le seul applicable à l'acheteur.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              3. Commandes
            </h2>
            <p>
              L'acheteur passe commande sur le site internet : il sélectionne
              les produits qu'il souhaite commander, les ajoute à son panier, et
              valide sa commande après avoir vérifié le détail de celle-ci et
              son prix total.
              <br />
              La confirmation de la commande entraîne acceptation des présentes
              conditions de vente, la reconnaissance d'en avoir parfaite
              connaissance et la renonciation à se prévaloir de ses propres
              conditions d'achat ou d'autres conditions.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              4. Paiement
            </h2>
            <p>
              Le paiement est exigible immédiatement à la commande. Le règlement
              s'effectue par carte bancaire via un système sécurisé (Stripe).
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              5. Livraison
            </h2>
            <p className="mb-4">
              Les livraisons sont faites à l'adresse indiquée sur le bon de
              commande. Ylang Créations livre en France métropolitaine et dans
              les DOM-TOM.
            </p>
            <p>
              Les délais de livraison ne sont donnés qu'à titre indicatif. En
              cas de retard d'expédition, un mail vous sera adressé pour vous
              informer d'une éventuelle conséquence sur le délai de livraison
              qui vous a été indiqué.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              6. Rétractation
            </h2>
            <p className="mb-4">
              Conformément à l'article L121-20 du Code de la consommation,
              l'acheteur dispose d'un délai de quatorze jours ouvrables à
              compter de la livraison de leur commande pour exercer son droit de
              rétractation et faire retour du produit au vendeur pour échange ou
              remboursement sans pénalité, à l'exception des frais de retour.
            </p>
            <p className="text-sm italic">
              Note : Le droit de rétractation ne s'applique pas aux produits
              confectionnés sur mesure ou nettement personnalisés (Article
              L121-21-8 du Code de la consommation).
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              7. Responsabilité
            </h2>
            <p>
              Ylang Créations, dans le processus de vente en ligne, n'est tenue
              que par une obligation de moyens; sa responsabilité ne pourra être
              engagée pour un dommage résultant de l'utilisation du réseau
              Internet tel que perte de données, intrusion, virus, rupture du
              service, ou autres problèmes involontaires.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              8. Données personnelles
            </h2>
            <p>
              Ylang Créations s'engage à préserver la confidentialité des
              informations fournies par l'acheteur. Toute information le
              concernant est soumise aux dispositions de la loi n° 78-17 du 6
              janvier 1978. A ce titre, l'internaute dispose d'un droit d'accès,
              de modification et de suppression des informations le concernant.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              9. Règlement des litiges
            </h2>
            <p>
              Les présentes conditions de vente en ligne sont soumises à la loi
              française. En cas de litige, compétence est attribuée aux
              tribunaux compétents.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
