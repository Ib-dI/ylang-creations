import { MapPin, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livraison & Retours",
  description:
    "Informations sur les modes de livraison, les frais de port et notre politique de retours.",
};

export default function ShippingPage() {
  return (
    <div className="overflow-hidden bg-ylang-terracotta/50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="font-abramo-script text-5xl text-gray-900 sm:text-4xl">
            Livraison & Retours
          </h1>
          <div className="bg-ylang-rose mx-auto mt-4 h-1 w-20 rounded"></div>
        </div>

        <div className="font-body space-y-12 text-gray-600">
          <div className="grid gap-8 md:grid-cols-2">
            <section className="bg-ylang-beige/20 border-ylang-beige/30 rounded-3xl border p-8">
              <div className="bg-ylang-rose/10 text-ylang-rose mb-4 w-fit rounded-xl p-3">
                <Truck size={24} />
              </div>
              <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">
                Livraison
              </h2>
              <ul className="space-y-4">
                <li>
                  <strong>France Métropolitaine :</strong> Par Colissimo (48-72h
                  après expédition).
                </li>
                <li>
                  <strong>La Réunion :</strong> Retrait gratuit à l'atelier ou
                  livraison locale.
                </li>
                <li>
                  <strong>Dom-Tom & International :</strong> Livraison via
                  Colissimo International.
                </li>
              </ul>
              <p className="mt-4 text-sm italic">
                Rappel : Délai de confection de 10 à 15 jours pour les articles
                personnalisés.
              </p>
            </section>

            <section className="bg-ylang-beige/20 border-ylang-beige/30 rounded-3xl border p-8">
              <div className="bg-ylang-rose/10 text-ylang-rose mb-4 w-fit rounded-xl p-3">
                <RotateCcw size={24} />
              </div>
              <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">
                Retours
              </h2>
              <p className="mb-4">
                Vous disposez de 14 jours pour nous retourner un article s'il ne
                vous convient pas.
              </p>
              <div className="rounded-xl border border-red-100 bg-white/50 p-4 text-sm">
                <p className="mb-1 font-semibold text-red-600 italic">
                  Exception :
                </p>
                <p>
                  Conformément à la loi, les produits personnalisés ou sur
                  mesure ne peuvent être retournés ou échangés.
                </p>
              </div>
            </section>
          </div>

          <section className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display mb-4 flex items-center gap-3 text-2xl font-bold text-gray-900">
                <ShieldCheck className="text-ylang-rose" />
                Paiement Sécurisé
              </h2>
              <p>
                Toutes les transactions sur Ylang Créations sont sécurisées via
                notre partenaire Stripe. Vos informations bancaires ne sont
                jamais stockées sur nos serveurs.
              </p>
            </div>
            <div className="bg-ylang-charcoal text-ylang-beige rounded-3xl p-8">
              <h2 className="font-display mb-4 flex items-center gap-3 text-2xl font-bold">
                <MapPin />
                Click & Collect
              </h2>
              <p>
                Si vous habitez à la Réunion, vous pouvez choisir le retrait à
                notre atelier (Saint-Denis) lors du passage de votre commande
                pour éviter les frais de port.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
