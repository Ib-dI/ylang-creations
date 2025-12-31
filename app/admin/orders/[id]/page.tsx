"use client";

import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/lib/store/admin-store";
import type { Order, OrderStatus } from "@/types/admin";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Mail,
  MapPin,
  Package,
  Palette,
  Scissors,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const statuses: {
  value: OrderStatus;
  label: string;
  icon: any;
  description: string;
}[] = [
  {
    value: "pending",
    label: "En attente",
    icon: Clock,
    description: "Commande en attente de paiement",
  },
  {
    value: "paid",
    label: "Payée",
    icon: CheckCircle2,
    description: "Paiement confirmé",
  },
  {
    value: "in_production",
    label: "En production",
    icon: Scissors,
    description: "Confection en cours",
  },
  {
    value: "shipped",
    label: "Expédiée",
    icon: Truck,
    description: "Colis en route",
  },
  {
    value: "delivered",
    label: "Livrée",
    icon: Package,
    description: "Commande reçue",
  },
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { updateOrderStatus, addTrackingNumber } = useAdminStore();

  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [trackingNumber, setTrackingNumber] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    const fetchOrder = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/admin/orders/${params.id}`);
        if (!response.ok) throw new Error("Erreur chargement commande");
        const data = await response.json();
        setOrder(data.order);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Impossible de charger la commande");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="text-ylang-rose h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-ylang-charcoal text-2xl font-bold">
          Commande non trouvée
        </h2>
        <Button
          variant="link"
          onClick={() => router.push("/admin/orders")}
          className="mt-4"
        >
          Retour aux commandes
        </Button>
      </div>
    );
  }

  const currentStatusIndex = statuses.findIndex(
    (s) => s.value === order.status,
  );

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === order.status) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        updateOrderStatus(order.id, newStatus);
        setOrder({ ...order, status: newStatus });
        toast.success("Statut mis à jour");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur mise à jour statut");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTracking = async () => {
    if (!trackingNumber.trim()) return;

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber }),
      });

      if (response.ok) {
        addTrackingNumber(order.id, trackingNumber);
        setOrder({ ...order, trackingNumber });
        setTrackingNumber("");
        toast.success("Numéro de suivi ajouté");
      }
    } catch (error) {
      console.error("Error adding tracking:", error);
      toast.error("Erreur ajout numéro de suivi");
    }
  };

  const handleOpenMaps = () => {
    if (!order?.shippingAddress) return;
    const { address, city, postalCode, country } = order.shippingAddress;
    const query = encodeURIComponent(
      `${address}, ${postalCode} ${city}, ${country}`,
    );
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
    );
  };

  const handleGenerateInvoice = () => {
    window.open(`/admin/orders/${order.id}/invoice`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] p-8">
      {/* Back Button */}
      <Link
        href="/admin/orders"
        className="text-ylang-charcoal/60 hover:text-ylang-rose mb-6 flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux commandes
      </Link>

      <div className="overflow-hidden rounded-4xl bg-[#fdfaf6] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white px-8 pt-10 pb-8">
          <div className="from-ylang-rose/10 absolute top-0 right-0 h-64 w-64 rounded-full bg-linear-to-bl to-transparent blur-3xl" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="bg-ylang-rose/10 text-ylang-rose rounded-full px-4 py-1 text-sm font-bold tracking-wider uppercase">
                  Commande #{order.orderNumber}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <h1 className="text-ylang-charcoal text-3xl font-bold">
                Détails de la réservation
              </h1>
              <p className="text-ylang-charcoal/40 mt-1 font-medium italic">
                Émise le{" "}
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                à{" "}
                {new Date(order.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Status Stepper */}
          <div className="mt-10">
            <div className="relative flex justify-between">
              {/* Progress Line */}
              <div className="absolute top-[22px] left-0 h-0.5 w-full bg-[#eee]" />
              <motion.div
                className="bg-ylang-rose absolute top-[22px] left-0 h-0.5 transition-all duration-500"
                initial={{ width: "0%" }}
                animate={{
                  width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%`,
                }}
              />

              {statuses.map((status, index) => {
                const Icon = status.icon;
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div
                    key={status.value}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusChange(status.value)}
                      disabled={isUpdating}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? "border-ylang-rose text-ylang-rose bg-white shadow-[0_0_15px_rgba(183,110,121,0.3)]"
                          : "border-[#eee] bg-white text-[#ccc]"
                      } ${isCurrent ? "bg-ylang-rose scale-125 text-white!" : ""}`}
                    >
                      <Icon
                        className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`}
                      />
                    </motion.button>
                    <div className="mt-3 text-center">
                      <p
                        className={`text-xs font-bold tracking-tight ${isActive ? "text-ylang-charcoal" : "text-[#ccc]"}`}
                      >
                        {status.label}
                      </p>
                      {isCurrent && (
                        <motion.span
                          layoutId="active-pointer"
                          className="bg-ylang-rose mx-auto mt-1 block h-1 w-1 rounded-full"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column: Items */}
            <div className="space-y-6 lg:col-span-2">
              <div className="border-ylang-beige/50 rounded-3xl border bg-white p-6 shadow-sm">
                <h3 className="text-ylang-charcoal mb-6 flex items-center gap-2 text-xl font-bold">
                  <ShoppingBag className="text-ylang-rose h-6 w-6" />
                  Articles commandés
                </h3>

                <div className="space-y-6">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-ylang-cream/30 hover:bg-ylang-cream/50 relative flex gap-6 overflow-hidden rounded-2xl p-4 transition-all"
                    >
                      {/* Item Thumbnail */}
                      <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-inner">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            width={128}
                            height={128}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="bg-ylang-rose/5 flex h-full w-full items-center justify-center text-4xl">
                            👶
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h4 className="text-ylang-charcoal text-lg leading-tight font-bold">
                            {item.productName}
                          </h4>

                          {item.configuration ? (
                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div className="text-ylang-charcoal/60 flex items-center gap-2 text-sm">
                                <Palette className="h-4 w-4" />
                                <span>
                                  Tissu:{" "}
                                  <strong className="text-ylang-charcoal font-semibold">
                                    {item.configuration.fabricName}
                                  </strong>
                                </span>
                              </div>
                              {item.configuration.embroidery && (
                                <div className="text-ylang-charcoal/60 flex items-center gap-2 text-sm">
                                  <Scissors className="h-4 w-4" />
                                  <span>
                                    Broderie:{" "}
                                    <strong className="text-ylang-charcoal font-semibold">
                                      &quot;{item.configuration.embroidery}
                                      &quot;
                                    </strong>
                                  </span>
                                </div>
                              )}
                              {item.configuration.accessories.length > 0 && (
                                <div className="text-ylang-charcoal/60 col-span-full flex items-center gap-2 text-sm">
                                  <Sparkles className="h-4 w-4" />
                                  <span>
                                    Accessoires:{" "}
                                    <strong className="text-ylang-charcoal font-semibold">
                                      {item.configuration.accessories.join(
                                        ", ",
                                      )}
                                    </strong>
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-ylang-charcoal/40 mt-2 text-sm italic">
                              Modèle standard
                            </p>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-ylang-charcoal/60 text-sm font-medium">
                            Quantité: {item.quantity}
                          </span>
                          <span className="text-ylang-rose text-xl font-black">
                            {(item.price * item.quantity).toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-ylang-beige/50 mt-8 border-t-2 border-dashed pt-6">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-ylang-charcoal/60 font-bold">
                      Total de la commande
                    </span>
                    <span className="text-ylang-rose text-3xl font-black tracking-tight">
                      {order.total.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>

              {/* Tracking Section */}
              {order.status === "shipped" && (
                <div className="from-ylang-rose/10 border-ylang-rose/20 rounded-3xl border bg-linear-to-r to-transparent p-6">
                  <h3 className="text-ylang-charcoal mb-4 flex items-center gap-2 font-bold">
                    <Truck className="text-ylang-rose h-6 w-6" />
                    Suivi de livraison
                  </h3>
                  {order.trackingNumber ? (
                    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                      <div>
                        <p className="text-ylang-charcoal/40 text-xs font-bold tracking-widest uppercase">
                          Référence transporteur
                        </p>
                        <p className="text-ylang-rose font-mono text-xl font-bold">
                          {order.trackingNumber}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="border-ylang-rose/20 text-ylang-rose hover:bg-ylang-rose rounded-xl hover:text-white"
                      >
                        Suivre le colis
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="Entrez le numéro de suivi..."
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="border-ylang-beige focus:ring-ylang-rose focus:border-ylang-rose flex-1 rounded-2xl bg-white"
                      />
                      <Button
                        onClick={handleAddTracking}
                        variant="primary"
                        className="rounded-2xl px-8 shadow-md"
                      >
                        Valider
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Customer Details */}
            <div className="space-y-6">
              {/* Customer Card */}
              <div className="border-ylang-beige/50 rounded-3xl border bg-white p-6 shadow-sm">
                <h3 className="text-ylang-charcoal mb-5 flex items-center gap-2 font-bold">
                  <User className="text-ylang-rose h-5 w-5" />
                  Fiche Client
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-ylang-cream flex h-10 w-10 items-center justify-center rounded-xl">
                      <User className="text-ylang-charcoal/40 h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-ylang-charcoal/40 text-xs font-bold">
                        Nom complet
                      </p>
                      <p className="text-ylang-charcoal font-semibold">
                        {order.customerName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-ylang-cream flex h-10 w-10 items-center justify-center rounded-xl">
                      <Mail className="text-ylang-charcoal/40 h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-ylang-charcoal/40 text-xs font-bold">
                        Email
                      </p>
                      <p className="text-ylang-charcoal truncate font-semibold">
                        {order.customerEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="relative overflow-hidden rounded-3xl bg-[#1a1a1a] p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MapPin className="h-24 w-24" />
                </div>
                <h3 className="mb-5 flex items-center gap-2 font-bold text-white/90">
                  <MapPin className="text-ylang-rose h-5 w-5" />
                  Adresse de livraison
                </h3>
                <div className="relative z-10 space-y-1 text-sm leading-relaxed font-medium">
                  <p className="text-lg font-bold">{order.customerName}</p>
                  <p className="text-white/70">
                    {order.shippingAddress.address}
                  </p>
                  <p className="text-white/70">
                    {order.shippingAddress.postalCode}{" "}
                    {order.shippingAddress.city}
                  </p>
                  <p className="text-ylang-rose font-bold tracking-widest uppercase">
                    {order.shippingAddress.country}
                  </p>
                </div>

                <button
                  onClick={handleOpenMaps}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 text-xs font-bold transition-colors hover:bg-white/20"
                >
                  Ouvrir dans Maps
                </button>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="h-14 w-full rounded-2xl text-lg font-bold shadow-lg"
                  onClick={handleGenerateInvoice}
                >
                  <Download className="mr-3 h-5 w-5" />
                  Générer la facture
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
