import { NextResponse } from 'next/server'
import type { Order } from '@/types/admin'

// Mock data - À remplacer par vraie base de données (Supabase, MongoDB, etc.)
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'YC12345678',
    customerName: 'Marie Dupont',
    customerEmail: 'marie.dupont@email.com',
    items: [{
      productName: 'Gigoteuse 4 saisons',
      quantity: 1,
      price: 104,
      configuration: {
        fabricName: 'Liberty Betsy Rose',
        embroidery: 'Emma',
        accessories: ['Pompons', 'Ruban satin']
      }
    }],
    total: 104,
    status: 'in_production',
    paymentStatus: 'paid',
    shippingAddress: {
      address: '12 rue de la Paix',
      city: 'Paris',
      postalCode: '75002',
      country: 'France'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    orderNumber: 'YC87654321',
    customerName: 'Sophie Martin',
    customerEmail: 'sophie.martin@email.com',
    items: [{
      productName: 'Tour de lit',
      quantity: 1,
      price: 65,
      configuration: {
        fabricName: 'Velours Sauge',
        accessories: ['Dentelle']
      }
    }],
    total: 65,
    status: 'confirmed',
    paymentStatus: 'paid',
    shippingAddress: {
      address: '45 avenue des Champs',
      city: 'Lyon',
      postalCode: '69001',
      country: 'France'
    },
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  }
]

export async function GET(request: Request) {
  try {
    // TODO: Vérifier l'authentification admin
    // const session = await getServerSession()
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let filteredOrders = mockOrders

    if (status && status !== 'all') {
      filteredOrders = mockOrders.filter((order) => order.status === status)
    }

    return NextResponse.json({ orders: filteredOrders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}