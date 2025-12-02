import type { Fabric } from '@/types/configurator'

export const mockFabrics: Fabric[] = [
  {
    id: 'fabric-1',
    name: 'Liberty Betsy Rose',
    category: 'Liberty',
    color: 'Rose',
    pattern: 'Fleuri',
    material: 'Coton',
    price: 15,
    image: '/images/fabrics/liberty-betsy-rose.jpg',
    inStock: true,
    composition: '100% coton bio certifié GOTS',
    care: 'Lavage 30°C, séchage naturel'
  },
  {
    id: 'fabric-2',
    name: 'Gaze de coton Terracotta',
    category: 'Unis',
    color: 'Terracotta',
    pattern: 'Uni',
    material: 'Gaze',
    price: 12,
    image: '/images/fabrics/gaze-terracotta.jpg',
    inStock: true,
    composition: '100% coton double gaze',
    care: 'Lavage 40°C'
  },
  {
    id: 'fabric-3',
    name: 'Velours Sauge',
    category: 'Velours',
    color: 'Vert',
    pattern: 'Uni',
    material: 'Velours',
    price: 18,
    image: '/images/fabrics/velours-sauge.jpg',
    inStock: true,
    composition: '95% coton, 5% élasthanne',
    care: 'Lavage 30°C délicat'
  },
  {
    id: 'fabric-4',
    name: 'Liberty Michelle Bleu',
    category: 'Liberty',
    color: 'Bleu',
    pattern: 'Fleuri',
    material: 'Coton',
    price: 15,
    image: '/images/fabrics/liberty-michelle-bleu.jpg',
    inStock: true,
    composition: '100% coton Liberty London',
    care: 'Lavage 30°C'
  },
  {
    id: 'fabric-5',
    name: 'Lin Naturel',
    category: 'Lin',
    color: 'Beige',
    pattern: 'Uni',
    material: 'Lin',
    price: 14,
    image: '/images/fabrics/lin-naturel.jpg',
    inStock: true,
    composition: '100% lin lavé',
    care: 'Lavage 40°C'
  },
  {
    id: 'fabric-6',
    name: 'Étoiles Dorées',
    category: 'Imprimés',
    color: 'Blanc',
    pattern: 'Étoiles',
    material: 'Coton',
    price: 13,
    image: '/images/fabrics/etoiles-dorees.jpg',
    inStock: false,
    composition: '100% coton',
    care: 'Lavage 30°C'
  }
]