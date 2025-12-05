export type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{
    productName: string
    quantity: number
    price: number
    configuration: {
      fabricName: string
      embroidery?: string
      accessories: string[]
    }
  }>
  total: number
  status: OrderStatus
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: {
    address: string
    city: string
    postalCode: string
    country: string
  }
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  inProduction: number
  averageOrderValue: number
  revenueGrowth: number
}
