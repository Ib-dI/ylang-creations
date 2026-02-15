import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide des Tailles",
  description:
    "Consultez notre guide des tailles pour choisir le produit parfait pour votre bébé.",
};

export default function SizeGuidePage() {
  return (
    <div className="overflow-hidden bg-ylang-terracotta/50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="font-abramo-script text-3xl text-gray-900 sm:text-5xl">
            Guide des Tailles
          </h1>
          <div className="bg-ylang-rose mx-auto mt-4 h-1 w-20 rounded"></div>
        </div>

        <div className="font-body space-y-12 text-gray-600">
          <section>
            <h2 className="font-abramo-script mb-6 text-4xl text-gray-900">
              Gigoteuses (Turbulettes)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-200 text-gray-900">
                    <th className="border p-4">Âge</th>
                    <th className="border p-4">Taille Bébé (cm)</th>
                    <th className="border p-4">Taille Gigoteuse</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border p-4">Naissance - 6 mois</td>
                    <td className="border p-4">50 - 68 cm</td>
                    <td className="border p-4">70 cm</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="border p-4">6 mois - 24 mois</td>
                    <td className="border p-4">68 - 92 cm</td>
                    <td className="border p-4">90 cm</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-4">24 mois - 36 mois</td>
                    <td className="border p-4">92 - 105 cm</td>
                    <td className="border p-4">110 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm italic">
              Note : Assurez-vous que l'ouverture du cou est bien ajustée pour
              éviter que bébé ne glisse à l'intérieur.
            </p>
          </section>

          <section>
            <h2 className="font-abramo-script mb-6 text-4xl text-gray-900">
              Linge de Lit
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="bg-ylang-beige/30 border-ylang-beige/30 rounded-lg border p-6">
                <h3 className="mb-2 font-bold text-gray-900">
                  Tresse de lit
                </h3>
                <p>
                  Nos tresses sont disponibles en longueurs de 1m, 2m, 3m ou 4m
                  pour s'adapter à tous les types de berceaux et lits.
                </p>
              </div>
              <div className="bg-ylang-beige/30 border-ylang-beige/30 rounded-lg border p-6">
                <h3 className="mb-2 font-semibold text-gray-900">
                  Tour de lit
                </h3>
                <p>Adapté aux lits standard de 60x120cm ou 70x140cm.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-abramo-script mb-6 text-4xl text-gray-900">
              Cape de Bain
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="bg-ylang-rose/10 text-ylang-rose shrink-0 rounded p-2 font-bold">
                  S
                </div>
                <div>
                  <p className="font-semibold">Format Standard (75x75 cm)</p>
                  <p className="text-sm">
                    Idéal de la naissance jusqu'à 2 ans.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-ylang-rose/10 text-ylang-rose shrink-0 rounded p-2 font-bold">
                  L
                </div>
                <div>
                  <p className="font-semibold">Format Junior (100x100 cm)</p>
                  <p className="text-sm">
                    Parfait pour les enfants de 2 à 5 ans.
                  </p>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
