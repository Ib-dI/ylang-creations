"use client";

import StatusBadge from "@/components/admin/status-badge";
import { EASE_OUT } from "@/lib/motion-tokens";
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
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const STATUS_STEPS: {
  value: OrderStatus;
  label: string;
  icon: React.ElementType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { value: "pending", label: "En attente", icon: Clock },
  { value: "paid", label: "Payée", icon: CheckCircle2 },
  { value: "in_production", label: "En production", icon: Scissors },
  { value: "shipped", label: "Expédiée", icon: Truck },
  { value: "delivered", label: "Livrée", icon: Package },
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
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: "var(--color-ink-3)" }}
          strokeWidth={1.5}
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "1.25rem",
            color: "var(--color-ink)",
            marginBottom: "1rem",
          }}
        >
          Commande introuvable
        </p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="font-body text-sm transition-opacity hover:opacity-70"
          style={{
            color: "var(--color-ink-3)",
            borderBottom: "1px solid var(--color-accent)",
          }}
        >
          Retour aux commandes
        </button>
      </div>
    );
  }

  const currentStatusIndex = STATUS_STEPS.findIndex(
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

  return (
    <div>
      {/* Back */}
      <Link
        href="/admin/orders"
        className="font-body mb-8 flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
        style={{ color: "var(--color-ink-3)" }}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Retour aux commandes
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="type-overline mb-2"
            style={{ color: "var(--color-accent)" }}
          >
            Commande {order.orderNumber}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "1.75rem",
              color: "var(--color-ink)",
            }}
          >
            Détails de la commande
          </h1>
          <p
            className="font-body mt-1 text-sm"
            style={{ color: "var(--color-ink-3)" }}
          >
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
        <StatusBadge status={order.status} />
      </div>

      {/* Status stepper */}
      <div
        className="mb-8 overflow-x-auto px-6 py-6"
        style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}
      >
        <div className="relative flex min-w-[480px] justify-between">
          <div
            className="absolute top-[18px] left-0 h-px w-full"
            style={{ background: "var(--color-ink-2)", opacity: 0.15 }}
          />
          <motion.div
            className="absolute top-[18px] left-0 h-px"
            style={{ background: "var(--color-accent)" }}
            initial={{ width: "0%" }}
            animate={{
              width: `${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          />

          {STATUS_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isInactive = index > currentStatusIndex;

            return (
              <div
                key={step.value}
                className="relative z-10 flex flex-col items-center"
              >
                <button
                  onClick={() => handleStatusChange(step.value)}
                  disabled={isUpdating}
                  className="flex h-9 w-9 items-center justify-center transition-colors"
                  style={{
                    background: isCurrent
                      ? "var(--color-ink)"
                      : isCompleted
                        ? "var(--color-accent)"
                        : "var(--color-paper)",
                    border: isInactive ? "var(--rule-soft)" : "none",
                    color:
                      isCurrent || isCompleted
                        ? "var(--color-paper)"
                        : "var(--color-ink-3)",
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <p
                  className="font-body mt-3 text-center text-xs whitespace-nowrap"
                  style={{
                    color: isInactive
                      ? "var(--color-ink-3)"
                      : "var(--color-ink)",
                    opacity: isInactive ? 0.4 : 1,
                  }}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <motion.span
                    layoutId="status-indicator"
                    className="mt-1 block h-1 w-1 rounded-full"
                    style={{ background: "var(--color-accent)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items */}
        <div className="space-y-6 lg:col-span-2">
          <div
            style={{
              border: "var(--rule-hair)",
              background: "var(--color-paper)",
            }}
          >
            <div
              className="flex items-center gap-3 px-6 py-4"
              style={{ borderBottom: "var(--rule-hair)" }}
            >
              <ShoppingBag
                className="h-4 w-4"
                style={{ color: "var(--color-ink-3)" }}
                strokeWidth={1.5}
              />
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "1rem",
                  color: "var(--color-ink)",
                }}
              >
                Articles commandés
              </h2>
            </div>

            <div
              className="divide-y"
              style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}
            >
              {order.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="flex gap-5 p-6"
                  style={{ borderTop: index > 0 ? "var(--rule-soft)" : "none" }}
                >
                  <div
                    className="h-24 w-24 shrink-0 overflow-hidden"
                    style={{ border: "var(--rule-soft)" }}
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ background: "var(--color-paper-2)" }}
                      >
                        <Package
                          className="h-6 w-6"
                          style={{ color: "var(--color-ink-3)", opacity: 0.3 }}
                          strokeWidth={1}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 400,
                          fontSize: "1rem",
                          color: "var(--color-ink)",
                        }}
                      >
                        {item.productName}
                      </p>

                      {item.configuration ? (
                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Palette
                              className="h-3.5 w-3.5"
                              style={{ color: "var(--color-ink-3)" }}
                              strokeWidth={1.5}
                            />
                            <span
                              className="font-body text-sm"
                              style={{ color: "var(--color-ink-3)" }}
                            >
                              Tissu :{" "}
                              <span style={{ color: "var(--color-ink)" }}>
                                {item.configuration.fabricName}
                              </span>
                            </span>
                          </div>
                          {item.configuration.size && (
                            <div className="flex items-center gap-2">
                              <Package
                                className="h-3.5 w-3.5"
                                style={{ color: "var(--color-ink-3)" }}
                                strokeWidth={1.5}
                              />
                              <span
                                className="font-body text-sm"
                                style={{ color: "var(--color-ink-3)" }}
                              >
                                Taille :{" "}
                                <span style={{ color: "var(--color-ink)" }}>
                                  {item.configuration.size}
                                </span>
                              </span>
                            </div>
                          )}
                          {item.configuration.selectedColor && (
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3.5 w-3.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    item.configuration.selectedColor,
                                  border: "var(--rule-soft)",
                                }}
                              />
                              <span
                                className="font-body text-sm"
                                style={{ color: "var(--color-ink-3)" }}
                              >
                                Couleur :{" "}
                                <span style={{ color: "var(--color-ink)" }}>
                                  {item.configuration.selectedColorName ??
                                    item.configuration.selectedColor}
                                </span>
                              </span>
                            </div>
                          )}
                          {item.configuration.embroidery && (
                            <div className="flex items-center gap-2">
                              <Scissors
                                className="h-3.5 w-3.5"
                                style={{ color: "var(--color-ink-3)" }}
                                strokeWidth={1.5}
                              />
                              <span
                                className="font-body text-sm"
                                style={{ color: "var(--color-ink-3)" }}
                              >
                                Broderie :{" "}
                                <span style={{ color: "var(--color-ink)" }}>
                                  &ldquo;{item.configuration.embroidery}&rdquo;
                                </span>
                                {item.configuration.embroideryColor && (
                                  <>
                                    <span
                                      className="ml-2 inline-block h-3 w-3 rounded-full align-middle"
                                      style={{
                                        backgroundColor:
                                          item.configuration.embroideryColor,
                                        border: "var(--rule-soft)",
                                      }}
                                    />
                                    <span
                                      className="font-body text-xs"
                                      style={{ color: "var(--color-ink-3)" }}
                                    >
                                      {" "}
                                      {item.configuration.embroideryColorName ??
                                        item.configuration.embroideryColor}
                                    </span>
                                  </>
                                )}
                                {item.configuration.embroideryFont && (
                                  <span
                                    className="font-body text-xs"
                                    style={{ color: "var(--color-ink-3)" }}
                                  >
                                    {" "}
                                    ({item.configuration.embroideryFont})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p
                          className="font-body mt-2 text-sm italic"
                          style={{ color: "var(--color-ink-3)", opacity: 0.5 }}
                        >
                          Modèle standard
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className="font-body text-sm"
                        style={{ color: "var(--color-ink-3)" }}
                      >
                        Qté : {item.quantity}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 400,
                          fontSize: "1.125rem",
                          color: "var(--color-ink)",
                        }}
                      >
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: "var(--rule-hair)" }}
            >
              <span
                className="font-body text-sm font-medium"
                style={{ color: "var(--color-ink-3)" }}
              >
                Total de la commande
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "var(--text-title)",
                  color: "var(--color-ink)",
                }}
              >
                {order.total.toFixed(2)} €
              </span>
            </div>
          </div>

          {/* Tracking */}
          {order.status === "shipped" && (
            <div
              style={{
                border: "var(--rule-hair)",
                background: "var(--color-paper)",
              }}
            >
              <div
                className="flex items-center gap-3 px-6 py-4"
                style={{ borderBottom: "var(--rule-hair)" }}
              >
                <Truck
                  className="h-4 w-4"
                  style={{ color: "var(--color-ink-3)" }}
                  strokeWidth={1.5}
                />
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "1rem",
                    color: "var(--color-ink)",
                  }}
                >
                  Suivi de livraison
                </h2>
              </div>
              <div className="p-6">
                {order.trackingNumber ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="type-overline mb-1"
                        style={{ color: "var(--color-ink-3)" }}
                      >
                        Référence transporteur
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 400,
                          fontSize: "1.125rem",
                          color: "var(--color-ink)",
                        }}
                      >
                        {order.trackingNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Numéro de suivi transporteur..."
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="font-body flex-1 px-4 py-2.5 text-sm outline-none"
                      style={{
                        border: "var(--rule-soft)",
                        color: "var(--color-ink)",
                        background: "var(--color-paper)",
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddTracking()
                      }
                    />
                    <button
                      onClick={handleAddTracking}
                      className="font-body px-5 py-2.5 text-sm transition-opacity hover:opacity-80"
                      style={{
                        background: "var(--color-ink)",
                        color: "var(--color-paper)",
                      }}
                    >
                      Valider
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: customer + address + actions */}
        <div className="space-y-6">
          {/* Customer */}
          <div
            style={{
              border: "var(--rule-hair)",
              background: "var(--color-paper)",
            }}
          >
            <div
              className="flex items-center gap-3 px-6 py-4"
              style={{ borderBottom: "var(--rule-hair)" }}
            >
              <User
                className="h-4 w-4"
                style={{ color: "var(--color-ink-3)" }}
                strokeWidth={1.5}
              />
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "1rem",
                  color: "var(--color-ink)",
                }}
              >
                Fiche client
              </h2>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <p
                  className="type-overline mb-1"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  Nom complet
                </p>
                <p
                  className="font-body text-sm font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  {order.customerName}
                </p>
              </div>
              <div>
                <p
                  className="type-overline mb-1"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  Adresse email
                </p>
                <p
                  className="font-body text-sm"
                  style={{ color: "var(--color-ink)" }}
                >
                  {order.customerEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div style={{ background: "var(--color-ink)", border: "none" }}>
            <div
              className="flex items-center gap-3 px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <MapPin
                className="h-4 w-4"
                style={{ color: "var(--color-paper)", opacity: 0.5 }}
                strokeWidth={1.5}
              />
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "1rem",
                  color: "var(--color-paper)",
                  opacity: 0.7,
                }}
              >
                Adresse de livraison
              </h2>
            </div>
            <div className="p-6">
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "1rem",
                  color: "var(--color-paper)",
                  marginBottom: "0.75rem",
                }}
              >
                {order.customerName}
              </p>
              <div
                className="font-body space-y-1 text-sm"
                style={{ color: "var(--color-paper)", opacity: 0.6 }}
              >
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.postalCode}{" "}
                  {order.shippingAddress.city}
                </p>
                <p
                  className="type-overline"
                  style={{ color: "var(--color-paper)", opacity: 1 }}
                >
                  {order.shippingAddress.country}
                </p>
              </div>
              <button
                onClick={handleOpenMaps}
                className="font-body mt-5 flex w-full items-center justify-center gap-2 py-2.5 text-xs transition-colors"
                style={{
                  color: "var(--color-paper)",
                  opacity: 0.5,
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                Ouvrir dans Maps
              </button>
            </div>
          </div>

          {/* Invoice */}
          <button
            onClick={() =>
              window.open(`/admin/orders/${order.id}/invoice`, "_blank")
            }
            className="font-body flex w-full items-center justify-center gap-3 py-3.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-ink)",
              color: "var(--color-paper)",
            }}
          >
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Générer la facture
          </button>
        </div>
      </div>
    </div>
  );
}
