import type { Product as ConfiguratorProduct } from "@/types/configurator";

// Type pour les produits du catalogue
export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  description?: string;
  longDescription?: string;
  features?: string[];
  new?: boolean;
  featured?: boolean;
  customizable?: boolean;
  sizes?: string[];
  defaultSize?: string;
}

// Produits du catalogue principal
export const catalogProducts: CatalogProduct[] = [
  {
    id: "1",
    name: "Gigoteuse fleurie personnalisée",
    category: "Linge de lit bébé",
    price: 89,
    image: "/images/products/gigoteuse.jpg",
    images: [
      "/images/products/gigoteuse.jpg",
      "/images/products/gigoteuse-1.jpg",
      "/images/products/gigoteuse-2.jpg",
      "/images/products/gigoteuse-3.jpg",
    ],
    description:
      "Une gigoteuse douce et élégante, entièrement personnalisable selon vos envies. Confectionnée avec amour dans notre atelier, elle assure confort et sécurité pour les nuits de votre bébé.",
    longDescription:
      "Notre gigoteuse fleurie est le fruit d'un savoir-faire artisanal alliant esthétique et fonctionnalité. Chaque pièce est unique et cousue à la main avec des tissus premium certifiés Oeko-Tex. Le motif fleuri apporte une touche de douceur et de poésie à la chambre de bébé.",
    features: [
      "100% coton certifié Oeko-Tex",
      "Confection artisanale française",
      "Personnalisable (broderie prénom)",
      "Fermeture éclair robuste",
      "Lavable en machine 30°C",
    ],
    new: true,
    customizable: true,
    sizes: ["0-6 mois", "6-12 mois", "12-24 mois", "24-36 mois"],
    defaultSize: "0-6 mois",
  },
  {
    id: "2",
    name: "Tour de lit nuage",
    category: "Décoration chambre",
    price: 65,
    image: "/images/products/tour-lit.jpg",
    images: [
      "/images/products/tour-lit.jpg",
      "/images/products/tour-lit-1.jpg",
      "/images/products/tour-lit-2.jpg",
      "/images/products/tour-lit-3.jpg",
    ],
    description:
      "Un tour de lit en forme de nuage pour envelopper bébé de douceur. Design unique et protection optimale.",
    longDescription:
      "Notre tour de lit nuage est conçu pour offrir une protection maximale tout en apportant une touche poétique à la chambre de bébé. Réalisé en coton bio ultra-doux, il est parfait pour créer un cocon rassurant.",
    features: [
      "Coton bio certifié GOTS",
      "Forme nuage originale",
      "Attaches sécurisées",
      "Lavable en machine 40°C",
      "Plusieurs coloris disponibles",
    ],
    customizable: true,
    sizes: ["60x120 cm", "70x140 cm"],
    defaultSize: "60x120 cm",
  },
  {
    id: "3",
    name: "Ensemble bébé personnalisé",
    category: "Vêtements bébé",
    price: 79,
    image: "/images/products/ensemble2-bébé.jpg",
    images: [
      "/images/products/ensemble2-bébé.jpg",
      "/images/products/ensemble2-bébé-1.jpg",
      "/images/products/ensemble2-bébé-2.jpg",
      "/images/products/ensemble2-bébé-3.jpg",
    ],
    description:
      "Un ensemble complet pour bébé, doux et confortable. Parfait pour les premiers mois.",
    longDescription:
      "Cet ensemble bébé comprend un haut et un pantalon coordonnés, confectionnés dans un jersey premium extra-doux. Chaque pièce peut être personnalisée avec le prénom de votre enfant brodé à la main.",
    features: [
      "Jersey 100% coton peigné",
      "Coutures plates pour le confort",
      "Broderie prénom incluse",
      "Élastique doux à la taille",
      "Lavable en machine 30°C",
    ],
    customizable: true,
    sizes: ["0-3 mois", "3-6 mois", "6-12 mois", "12-18 mois"],
    defaultSize: "0-3 mois",
  },
  {
    id: "4",
    name: "Carnet de dessins personnalisé",
    category: "Accessoires",
    price: 14.95,
    image: "/images/products/carnet.jpg",
    images: [
      "/images/products/carnet.jpg",
      "/images/products/carnet-1.jpg",
      "/images/products/carnet-2.jpg",
      "/images/products/carnet-3.jpg",
    ],
    description:
      "Un carnet de dessins unique pour laisser libre cours à l'imagination des petits artistes.",
    longDescription:
      "Ce carnet de dessins artisanal est le compagnon idéal pour les jeunes créatifs. Avec sa couverture personnalisable et son papier de qualité, il est parfait pour dessiner, écrire ou coller des souvenirs.",
    features: [
      "Couverture personnalisable",
      "Papier 120g sans acide",
      "64 pages vierges",
      "Format A5 pratique",
      "Reliure cousue main",
    ],
    customizable: true,
  },
  {
    id: "5",
    name: "Ubidoll mahoraise personnalisé",
    category: "Jouets",
    price: 35,
    image: "/images/products/ubidoll-mahoraise.jpg",
    images: [
      "/images/products/ubidoll-mahoraise.jpg",
      "/images/products/ubidoll-mahoraise-1.jpg",
      "/images/products/ubidoll-mahoraise-2.jpg",
      "/images/products/ubidoll-mahoraise-3.jpg",
    ],
    description:
      "Une poupée Ubidoll inspirée de la culture mahoraise, douce et attachante.",
    longDescription:
      "Notre Ubidoll mahoraise célèbre la richesse de la culture de Mayotte. Chaque poupée est confectionnée à la main avec des tissus traditionnels et modernes, créant un jouet unique qui transmet l'héritage culturel.",
    features: [
      "Tissus wax authentiques",
      "Rembourrage hypoallergénique",
      "Visage brodé à la main",
      "Tenue personnalisable",
      "Fabrication artisanale",
    ],
    new: true,
    customizable: true,
  },
  {
    id: "6",
    name: "Coussin décoratif étoile",
    category: "Décoration chambre",
    price: 45,
    image: "/images/products/coussin-étoile.jpg",
    images: [
      "/images/products/coussin-étoile.jpg",
      "/images/products/coussin-étoile-1.jpg",
      "/images/products/coussin-étoile-2.jpg",
      "/images/products/coussin-étoile-3.jpg",
    ],
    description:
      "Un coussin étoile pour apporter une touche de magie à la chambre de bébé.",
    longDescription:
      "Ce coussin en forme d'étoile est parfait pour décorer la chambre de bébé ou servir de doudou. Réalisé en velours ultra-doux, il est à la fois décoratif et câlin.",
    features: [
      "Velours côtelé premium",
      "Rembourrage moelleux",
      "Forme étoile 5 branches",
      "Plusieurs tailles disponibles",
      "Lavable en machine",
    ],
    customizable: true,
  },
  {
    id: "7",
    name: "Sac à main personnalisé",
    category: "Accessoires",
    price: 125,
    image: "/images/products/sac.jpg",
    images: [
      "/images/products/sac.jpg",
      "/images/products/sac-1.jpg",
      "/images/products/sac-2.jpg",
      "/images/products/sac-3.jpg",
    ],
    description:
      "Un sac à main élégant et unique, personnalisé selon vos goûts.",
    longDescription:
      "Ce sac à main artisanal allie élégance et praticité. Confectionné avec des matériaux de qualité, il peut être personnalisé avec vos initiales ou un motif de votre choix pour un accessoire vraiment unique.",
    features: [
      "Cuir vegan premium",
      "Doublure en coton",
      "Poche intérieure zippée",
      "Anses renforcées",
      "Personnalisation sur-mesure",
    ],
    customizable: true,
  },
  {
    id: "8",
    name: "Ensemble bébé personnalisé",
    category: "Vêtements bébé",
    price: 95,
    image: "/images/products/ensemble-bébé.jpg",
    images: [
      "/images/products/ensemble-bébé.jpg",
      "/images/products/haut-bébé-1.jpg",
      "/images/products/pentalon-bébé.jpg",
      "/images/products/pentalon-1.jpg",
    ],
    description:
      "Un ensemble complet et chic pour bébé, idéal pour les occasions spéciales.",
    longDescription:
      "Cet ensemble bébé premium est parfait pour les grandes occasions. Il comprend un haut élégant et un pantalon assorti, le tout personnalisable avec broderie du prénom.",
    features: [
      "Tissu double gaze premium",
      "Coupe confortable",
      "Broderie prénom incluse",
      "Boutons pressions cachés",
      "Lavable en machine 30°C",
    ],
    customizable: true,
    sizes: ["0-3 mois", "3-6 mois", "6-12 mois", "12-18 mois"],
    defaultSize: "0-3 mois",
  },
];

// Fonction pour récupérer un produit par son ID
export function getProductById(id: string): CatalogProduct | undefined {
  return catalogProducts.find((product) => product.id === id);
}

// Fonction pour récupérer les produits similaires (même catégorie, sauf le produit actuel)
export function getSimilarProducts(
  productId: string,
  limit: number = 4,
): CatalogProduct[] {
  const product = getProductById(productId);
  if (!product) return [];

  return catalogProducts
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

// Fonction pour récupérer les produits recommandés (différente catégorie)
export function getRecommendedProducts(
  productId: string,
  limit: number = 4,
): CatalogProduct[] {
  const product = getProductById(productId);
  if (!product) return [];

  const similarCategoryProducts = catalogProducts
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, 2);

  const otherProducts = catalogProducts
    .filter((p) => p.id !== productId && p.category !== product.category)
    .slice(0, limit - similarCategoryProducts.length);

  return [...similarCategoryProducts, ...otherProducts].slice(0, limit);
}

// Catégories disponibles
export const categories = [
  "Tout",
  "Linge de lit bébé",
  "Décoration chambre",
  "Vêtements bébé",
  "Accessoires",
  "Jouets",
];

// Produits pour le configurateur (format différent)
export const mockProducts: ConfiguratorProduct[] = [
  {
    id: "gigoteuse-1",
    name: "Gigoteuse 4 saisons",
    category: "Linge de lit",
    basePrice: 89,
    description:
      "Gigoteuse évolutive 4 saisons en coton bio, personnalisable avec vos tissus préférés",
    image: "/images/products/gigoteuse.jpg",
    sizes: ["0-6 mois", "6-12 mois", "12-24 mois", "24-36 mois"],
    defaultSize: "0-6 mois",
  },
  {
    id: "tour-lit-1",
    name: "Tour de lit modulable",
    category: "Décoration",
    basePrice: 65,
    description: "Tour de lit sécurisé et confortable pour protéger bébé",
    image: "/images/products/tour-lit.jpg",
    sizes: ["60x120 cm", "70x140 cm"],
    defaultSize: "60x120 cm",
  },
  {
    id: "mobile-1",
    name: "Mobile musical",
    category: "Éveil",
    basePrice: 79,
    description: "Mobile musical artisanal avec éléments personnalisables",
    image: "/images/products/mobile.jpg",
  },
  {
    id: "doudou-1",
    name: "Doudou personnalisé",
    category: "Éveil",
    basePrice: 35,
    description: "Doudou tout doux avec broderie prénom incluse",
    image: "/images/products/doudou.jpg",
  },
];
