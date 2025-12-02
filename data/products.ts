import type { Product } from '@/types/configurator'

export const mockProducts: Product[] = [
  {
    id: 'gigoteuse-1',
    name: 'Gigoteuse 4 saisons',
    category: 'Linge de lit',
    basePrice: 89,
    description: 'Gigoteuse évolutive 4 saisons en coton bio, personnalisable avec vos tissus préférés',
    image: '/images/products/gigoteuse.jpg',
    sizes: ['0-6 mois', '6-12 mois', '12-24 mois', '24-36 mois'],
    defaultSize: '0-6 mois'
  },
  {
    id: 'tour-lit-1',
    name: 'Tour de lit modulable',
    category: 'Décoration',
    basePrice: 65,
    description: 'Tour de lit sécurisé et confortable pour protéger bébé',
    image: '/images/products/tour-lit.jpg',
    sizes: ['60x120 cm', '70x140 cm'],
    defaultSize: '60x120 cm'
  },
  {
    id: 'mobile-1',
    name: 'Mobile musical',
    category: 'Éveil',
    basePrice: 79,
    description: 'Mobile musical artisanal avec éléments personnalisables',
    image: '/images/products/mobile.jpg'
  },
  {
    id: 'doudou-1',
    name: 'Doudou personnalisé',
    category: 'Éveil',
    basePrice: 35,
    description: 'Doudou tout doux avec broderie prénom incluse',
    image: '/images/products/doudou.jpg'
  }
]