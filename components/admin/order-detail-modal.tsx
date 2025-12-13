"use client";

import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/lib/store/admin-store";
import type { OrderStatus } from "@/types/admin";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Package, Truck, X } from "lucide-react";
import React from "react";

export default function OrderDetailModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { selectedOrder, updateOrderStatus, addTrackingNumber } =
    useAdminStore();
  const [trackingNumber, setTrackingNumber] = React.useState("");

  if (!selectedOrder) return null;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        updateOrderStatus(selectedOrder.id, newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAddTracking = async () => {
    if (!trackingNumber.trim()) return;

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber }),
      });

      if (response.ok) {
        addTrackingNumber(selectedOrder.id, trackingNumber);
        setTrackingNumber("");
      }
    } catch (error) {
      console.error("Error adding tracking:", error);
    }
  };

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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="from-ylang-rose to-ylang-terracotta sticky top-0 bg-linear-to-r p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mb-1 text-2xl font-bold">
                    Commande {selectedOrder.orderNumber}
                  </h2>
                  <p className="text-sm opacity-90">
                    Créée le{" "}
                    {new Date(selectedOrder.createdAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Status Update */}
              <div className="bg-ylang-cream rounded-xl p-6">
                <h3 className="text-ylang-charcoal mb-4 flex items-center gap-2 font-bold">
                  <Package className="text-ylang-rose h-5 w-5" />
                  Changer le statut
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {["paid", "in_production", "shipped", "delivered"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleStatusChange(status as OrderStatus)
                        }
                        className={`rounded-lg p-3 text-sm font-medium transition-all ${
                          selectedOrder.status === status
                            ? "bg-ylang-rose text-white shadow-lg"
                            : "bg-white hover:bg-[#e8dcc8]"
                        }`}
                      >
                        <StatusBadge status={status} />
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Tracking Number */}
              {selectedOrder.status === "shipped" && (
                <div className="bg-ylang-cream rounded-xl p-6">
                  <h3 className="text-ylang-charcoal mb-4 flex items-center gap-2 font-bold">
                    <Truck className="text-ylang-rose h-5 w-5" />
                    Numéro de suivi
                  </h3>
                  {selectedOrder.trackingNumber ? (
                    <div className="rounded-lg bg-white p-4">
                      <p className="text-ylang-rose font-mono text-lg font-bold">
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
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="bg-ylang-cream rounded-xl p-6">
                  <h3 className="text-ylang-charcoal mb-4 font-bold">Client</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Nom :</strong> {selectedOrder.customerName}
                    </p>
                    <p>
                      <strong>Email :</strong> {selectedOrder.customerEmail}
                    </p>
                  </div>
                </div>

                <div className="bg-ylang-cream rounded-xl p-6">
                  <h3 className="text-ylang-charcoal mb-4 font-bold">
                    Livraison
                  </h3>
                  <div className="text-sm">
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>
                      {selectedOrder.shippingAddress.postalCode}{" "}
                      {selectedOrder.shippingAddress.city}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-ylang-cream rounded-xl p-6">
                <h3 className="text-ylang-charcoal mb-4 font-bold">
                  Articles commandés
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="rounded-lg bg-white p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-ylang-charcoal font-bold">
                            {item.productName}
                          </p>
                          <p className="text-ylang-charcoal/60 mt-1 text-sm">
                            Tissu: {item.configuration.fabricName}
                          </p>
                          {item.configuration.embroidery && (
                            <p className="text-ylang-charcoal/60 text-sm">
                              Broderie: "{item.configuration.embroidery}"
                            </p>
                          )}
                          {item.configuration.accessories.length > 0 && (
                            <p className="text-ylang-charcoal/60 text-sm">
                              Accessoires:{" "}
                              {item.configuration.accessories.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-ylang-rose text-lg font-bold">
                            {(item.price * item.quantity).toFixed(2)}€
                          </p>
                          <p className="text-ylang-charcoal/60 text-xs">
                            Qté: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-[#e8dcc8] pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-ylang-rose">
                      {selectedOrder.total.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                >
                  Fermer
                </Button>
                <Button variant="primary" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger facture
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
