"use client"

import * as React from "react"
import { useAdminStore } from "@/lib/store/admin-store"
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  TrendingUp, 
  Euro,
  ShoppingBag,
  AlertCircle
} from "lucide-react"
import type { DashboardStats } from "@/types/admin"
import StatusBadge from "@/components/admin/status-badge"

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "blue" 
}: { 
  title: string
  value: string | number
  icon: any
  trend?: string
  color?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#f5f1e8] hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[#1a1a1a] mb-1">{value}</p>
      <p className="text-sm text-[#1a1a1a]/60">{title}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { orders, setOrders } = useAdminStore()
  const [stats, setStats] = React.useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    inProduction: 0,
    averageOrderValue: 0,
    revenueGrowth: 12.5
  })

  // Charger les commandes
  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders')
        const data = await response.json()
        setOrders(data.orders)

        // Calculer les stats
        const totalOrders = data.orders.length
        const totalRevenue = data.orders.reduce((sum: number, order: any) => sum + order.total, 0)
        const pendingOrders = data.orders.filter((o: any) => o.status === 'confirmed').length
        const inProduction = data.orders.filter((o: any) => o.status === 'in_production').length
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        setStats({
          totalOrders,
          totalRevenue,
          pendingOrders,
          inProduction,
          averageOrderValue,
          revenueGrowth: 12.5
        })
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }

    fetchOrders()
  }, [setOrders])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#f5f1e8] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1a1a1a]">Dashboard Admin</h1>
              <p className="text-[#1a1a1a]/60 mt-1">Gérez vos commandes et suivez votre activité</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#b76e79] to-[#d4a89a] rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Commandes"
            value={stats.totalOrders}
            icon={ShoppingBag}
            color="blue"
          />
          <StatCard
            title="Chiffre d'affaires"
            value={`${stats.totalRevenue.toFixed(0)}€`}
            icon={Euro}
            trend={`+${stats.revenueGrowth}%`}
            color="green"
          />
          <StatCard
            title="En attente"
            value={stats.pendingOrders}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="En production"
            value={stats.inProduction}
            icon={Package}
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <a
            href="/admin/orders"
            className="bg-white rounded-2xl p-6 border border-[#f5f1e8] hover:shadow-lg hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#b76e79]/10 rounded-xl flex items-center justify-center group-hover:bg-[#b76e79] transition-colors">
                <Package className="w-6 h-6 text-[#b76e79] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-bold text-[#1a1a1a] mb-1">Toutes les commandes</p>
                <p className="text-sm text-[#1a1a1a]/60">Gérer et suivre</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/products"
            className="bg-white rounded-2xl p-6 border border-[#f5f1e8] hover:shadow-lg hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#b76e79]/10 rounded-xl flex items-center justify-center group-hover:bg-[#b76e79] transition-colors">
                <ShoppingBag className="w-6 h-6 text-[#b76e79] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-bold text-[#1a1a1a] mb-1">Produits</p>
                <p className="text-sm text-[#1a1a1a]/60">Gérer le catalogue</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/settings"
            className="bg-white rounded-2xl p-6 border border-[#f5f1e8] hover:shadow-lg hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#b76e79]/10 rounded-xl flex items-center justify-center group-hover:bg-[#b76e79] transition-colors">
                <AlertCircle className="w-6 h-6 text-[#b76e79] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-bold text-[#1a1a1a] mb-1">Paramètres</p>
                <p className="text-sm text-[#1a1a1a]/60">Configuration</p>
              </div>
            </div>
          </a>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#f5f1e8]">
          <div className="p-6 border-b border-[#f5f1e8]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1a1a1a]">Commandes récentes</h2>
              <a href="/admin/orders" className="text-sm text-[#b76e79] hover:underline font-medium">
                Voir tout →
              </a>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#faf9f6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1a1a1a]/60 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1e8]">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={`/admin/orders/${order.id}`} className="font-medium text-[#b76e79] hover:underline">
                        {order.orderNumber}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">{order.customerName}</p>
                        <p className="text-xs text-[#1a1a1a]/60">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1a1a1a]">
                      {order.total.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1a1a1a]/60">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}




// À SUIVRE: Page de gestion des commandes complète...
