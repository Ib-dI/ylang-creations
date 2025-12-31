import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Cookies | Ylang Créations",
  description:
    "Informations sur l'utilisation des cookies sur le site Ylang Créations.",
};

export default function CookiesPage() {
  return (
    <div className="overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            Politique de Cookies
          </h1>
          <div className="bg-ylang-rose mx-auto mt-4 h-1 w-20 rounded"></div>
        </div>

        <div className="font-body space-y-12 text-gray-600">
          <p className="text-lg">
            Cette politique de cookies explique ce que sont les cookies et
            comment nous les utilisons sur le site de Ylang Créations. Elle a
            pour but de vous informer de manière transparente sur les traceurs
            déposés lors de votre navigation.
          </p>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              1. Qu'est-ce qu'un cookie ?
            </h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal
              (ordinateur, tablette ou mobile) lors de la consultation d'un site
              internet. Il permet au site de reconnaître votre terminal et de
              mémoriser certaines informations relatives à votre navigation.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              2. Les cookies que nous utilisons
            </h2>
            <p className="mb-4">
              Nous utilisons différentes catégories de cookies pour améliorer
              votre expérience :
            </p>
            <div className="space-y-4">
              <div className="bg-ylang-beige/20 rounded-lg p-6">
                <h3 className="mb-2 font-semibold text-gray-900">
                  Cookies indispensables (Nécessaires)
                </h3>
                <p className="text-sm">
                  Ces cookies sont strictement nécessaires au bon fonctionnement
                  du site. Ils vous permettent de naviguer, d'utiliser les
                  fonctionnalités essentielles comme le panier d'achat ou
                  l'accès à votre compte client sécurisé. Sans ces cookies, le
                  site ne pourrait pas fonctionner normalement.
                </p>
              </div>
              <div className="bg-ylang-beige/20 rounded-lg p-6">
                <h3 className="mb-2 font-semibold text-gray-900">
                  Cookies de performance et d'analyse
                </h3>
                <p className="text-sm">
                  Ces cookies nous permettent de mesurer l'audience et
                  d'analyser l'utilisation de notre site (pages les plus
                  consultées, temps passé, erreurs éventuelles). Ces données
                  nous aident à améliorer continuellement l'ergonomie et le
                  contenu de notre boutique.
                </p>
              </div>
              <div className="bg-ylang-beige/20 rounded-lg p-6">
                <h3 className="mb-2 font-semibold text-gray-900">
                  Cookies de personnalisation
                </h3>
                <p className="text-sm">
                  Ils permettent de mémoriser vos choix (comme vos produits
                  favoris dans la wishlist) afin de vous proposer une expérience
                  plus fluide et personnalisée lors de vos prochaines visites.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              3. Durée de conservation
            </h2>
            <p>
              Les cookies déposés sur votre terminal ont une durée de vie
              limitée, ne dépassant généralement pas 13 mois. Votre choix
              (consentement ou refus) est conservé pendant une durée de 6 mois,
              après quoi le bandeau de cookies réapparaîtra pour vous demander à
              nouveau votre avis.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              4. Comment gérer vos cookies ?
            </h2>
            <p className="mb-4">
              Vous pouvez à tout moment modifier vos préférences ou retirer
              votre consentement. Plusieurs options s'offrent à vous :
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Via notre bandeau de cookies présent lors de votre première
                visite.
              </li>
              <li>
                En paramétrant votre navigateur internet (Chrome, Safari,
                Firefox, etc.) pour bloquer ou supprimer les cookies.
              </li>
            </ul>
            <p className="mt-4">
              Notez que le blocage complet des cookies peut altérer certaines
              fonctionnalités de notre site, notamment le processus de commande.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-semibold text-gray-900">
              5. Contact
            </h2>
            <p>
              Pour toute question concernant notre utilisation des cookies, vous
              pouvez nous contacter via notre formulaire de contact ou à
              l'adresse email indiquée dans les mentions légales.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
