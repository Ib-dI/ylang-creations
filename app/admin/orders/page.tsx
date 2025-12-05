"use client"

import * as React from "react"
import { useAdminStore } from "@/lib/store/admin-store"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Package,
  Truck,
  CheckCircle2,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OrderStatus } from "@/types/admin"
import OrderDetailModal from "@/components/admin/order-detail-modal"

export default function OrdersPage() {
  const { orders, setOrders, setSelectedOrder, filterByStatus, searchOrders } = useAdminStore()
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filteredOrders, setFilteredOrders] = React.useState(orders)
  const [showModal, setShowModal] = React.useState(false)

  // Charger les commandes
  React.useEffect(() => {
    const fetchOrders = async () => {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      setOrders(data.orders)
    }
    fetchOrders()
  }, [])

  // Filtrer les commandes
  React.useEffect(() => {
    let result = orders

    if (statusFilter !== 'all') {
      result = filterByStatus(statusFilter)
    }

    if (searchQuery) {
      result = searchOrders(searchQuery)
    }

    setFilteredOrders(result)
  }, [statusFilter, searchQuery, orders])

  const statusTabs = [
    { value: 'all', label: 'Toutes', count: orders.length },
    { value: 'confirmed', label: 'Confirmées', count: orders.filter(o => o.status === 'confirmed').length },
    { value: 'in_production', label: 'En production', count: orders.filter(o => o.status === 'in_production').length },
    { value: 'shipped', label: 'Expédiées', count: orders.filter(o => o.status === 'shipped').length },
    { value: 'delivered', label: 'Livrées', count: orders.filter(o => o.status === 'delivered').length }
  ]

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#f5f1e8] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1a1a1a]">Gestion des commandes</h1>
              <p className="text-[#1a1a1a]/60 mt-1">{filteredOrders.length} commande(s)</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#f5f1e8] p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a1a]/40" />
                <Input
                  type="text"
                  placeholder="Rechercher par n° commande, client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab.value
                    ? 'bg-[#b76e79] text-white shadow-lg'
                    : 'bg-[#f5f1e8] text-[#1a1a1a] hover:bg-[#e8dcc8]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#f5f1e8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#faf9f6]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    N° Commande
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    Produit(s)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1e8]">
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#faf9f6] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-bold text-[#b76e79]">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">{order.customerName}</p>
                        <p className="text-xs text-[#1a1a1a]/60">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#1a1a1a]">{order.items[0].productName}</p>
                      {order.items.length > 1 && (
                        <p className="text-xs text-[#1a1a1a]/60">+{order.items.length - 1} autre(s)</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-[#1a1a1a]">
                        {order.total.toFixed(2)}€
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1a1a1a]/60">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-[#1a1a1a]/20 mx-auto mb-4" />
              <p className="text-[#1a1a1a]/60">Aucune commande trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: 'En attente', color: 'bg-gray-100 text-gray-700' },
    confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
    in_production: { label: 'En production', color: 'bg-orange-100 text-orange-700' },
    shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700' }
  }

  const { label, color } = config[status as keyof typeof config] || config.pending

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
