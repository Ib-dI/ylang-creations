"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useAdminStore } from "@/lib/store/admin-store"
import { X } from "lucide-react"
import React from "react"
import type { OrderStatus } from "@/types/admin"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Package, Truck, Download } from "lucide-react"
import StatusBadge from "@/components/admin/status-badge"


export default function OrderDetailModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { selectedOrder, updateOrderStatus, addTrackingNumber } = useAdminStore()
  const [trackingNumber, setTrackingNumber] = React.useState('')

  if (!selectedOrder) return null

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        updateOrderStatus(selectedOrder.id, newStatus)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleAddTracking = async () => {
    if (!trackingNumber.trim()) return

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber })
      })

      if (response.ok) {
        addTrackingNumber(selectedOrder.id, trackingNumber)
        setTrackingNumber('')
      }
    } catch (error) {
      console.error('Error adding tracking:', error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#b76e79] to-[#d4a89a] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Commande {selectedOrder.orderNumber}</h2>
                  <p className="text-sm opacity-90">
                    Créée le {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Status Update */}
              <div className="bg-[#faf9f6] rounded-xl p-6">
                <h3 className="font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#b76e79]" />
                  Changer le statut
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['confirmed', 'in_production', 'shipped', 'delivered'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status as OrderStatus)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        selectedOrder.status === status
                          ? 'bg-[#b76e79] text-white shadow-lg'
                          : 'bg-white hover:bg-[#e8dcc8]'
                      }`}
                    >
                      <StatusBadge status={status} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tracking Number */}
              {selectedOrder.status === 'shipped' && (
                <div className="bg-[#faf9f6] rounded-xl p-6">
                  <h3 className="font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#b76e79]" />
                    Numéro de suivi
                  </h3>
                  {selectedOrder.trackingNumber ? (
                    <div className="bg-white rounded-lg p-4">
                      <p className="font-mono text-lg font-bold text-[#b76e79]">
                        {selectedOrder.trackingNumber}
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="Ex: 1Z999AA10123456784"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleAddTracking} variant="primary">
                        Ajouter
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Info */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-[#faf9f6] rounded-xl p-6">
                  <h3 className="font-bold text-[#1a1a1a] mb-4">Client</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nom :</strong> {selectedOrder.customerName}</p>
                    <p><strong>Email :</strong> {selectedOrder.customerEmail}</p>
                  </div>
                </div>

                <div className="bg-[#faf9f6] rounded-xl p-6">
                  <h3 className="font-bold text-[#1a1a1a] mb-4">Livraison</h3>
                  <div className="text-sm">
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-[#faf9f6] rounded-xl p-6">
                <h3 className="font-bold text-[#1a1a1a] mb-4">Articles commandés</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-[#1a1a1a]">{item.productName}</p>
                          <p className="text-sm text-[#1a1a1a]/60 mt-1">
                            Tissu: {item.configuration.fabricName}
                          </p>
                          {item.configuration.embroidery && (
                            <p className="text-sm text-[#1a1a1a]/60">
                              Broderie: "{item.configuration.embroidery}"
                            </p>
                          )}
                          {item.configuration.accessories.length > 0 && (
                            <p className="text-sm text-[#1a1a1a]/60">
                              Accessoires: {item.configuration.accessories.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#b76e79] text-lg">
                            {(item.price * item.quantity).toFixed(2)}€
                          </p>
                          <p className="text-xs text-[#1a1a1a]/60">Qté: {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-[#e8dcc8]">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#b76e79]">{selectedOrder.total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                  Fermer
                </Button>
                <Button variant="primary" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger facture
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
