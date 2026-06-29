"use client";

import type { Order } from "@/types/admin";
import { Loader2, Printer } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export default function OrderInvoicePage() {
  const params = useParams();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="font-body" style={{ color: "var(--color-ink-3)" }}>Commande introuvable</p>
      </div>
    );
  }

  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = order.total - subtotal;

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 md:p-16 print:p-0">
      {/* Print button */}
      <button
        onClick={() => window.print()}
        className="mb-10 flex items-center gap-2 px-4 py-2 font-body text-sm transition-opacity hover:opacity-70 print:hidden"
        style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
      >
        <Printer className="h-4 w-4" strokeWidth={1.5} />
        Imprimer la facture
      </button>

      {/* Header */}
      <div className="mb-12 flex items-start justify-between" style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "2rem" }}>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "2.5rem",
              color: "#111",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginBottom: "0.75rem",
            }}
          >
            Facture
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#6b7280" }}>
            N° {order.orderNumber}
          </p>
          <div style={{ marginTop: "1rem", fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "#9ca3af", lineHeight: 1.6 }}>
            <p>Émise le {new Date().toLocaleDateString("fr-FR")}</p>
            <p>Commande du {new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.125rem", color: "#111" }}>
            Ylang Créations
          </p>
          <div style={{ marginTop: "0.5rem", fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "#9ca3af", lineHeight: 1.6 }}>
            <p>123 Rue de la Couture</p>
            <p>75001 Paris, France</p>
            <p>contact@ylang-creations.com</p>
            <p>SIRET : 123 456 789 00012</p>
          </div>
        </div>
      </div>

      {/* Client & Shipping */}
      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9ca3af",
              marginBottom: "0.75rem",
            }}
          >
            Facturé à
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1rem", color: "#111", marginBottom: "0.25rem" }}>
            {order.customerName}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#6b7280" }}>{order.customerEmail}</p>
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9ca3af",
              marginBottom: "0.75rem",
            }}
          >
            Adresse de livraison
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#374151", lineHeight: 1.6 }}>
            {order.shippingAddress.address}<br />
            {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
            {order.shippingAddress.country}
          </p>
        </div>
      </div>

      {/* Items */}
      <table className="mb-12 w-full text-left">
        <thead>
          <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
            {["Description", "Qté", "Prix unit.", "Total"].map((th, i) => (
              <th
                key={th}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                  paddingBottom: "0.75rem",
                  textAlign: i > 0 ? "right" : "left",
                }}
              >
                {th}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #f9fafb" }}>
              <td style={{ padding: "1rem 0" }}>
                <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.9375rem", color: "#111" }}>
                  {item.productName}
                </p>
                {item.configuration && (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "#9ca3af", marginTop: "0.125rem" }}>
                    {item.configuration.fabricName}
                    {item.configuration.embroidery ? ` — ${item.configuration.embroidery}` : ""}
                  </p>
                )}
              </td>
              <td style={{ padding: "1rem 0", textAlign: "right", fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#6b7280" }}>
                {item.quantity}
              </td>
              <td style={{ padding: "1rem 0", textAlign: "right", fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#6b7280" }}>
                {item.price.toFixed(2)} €
              </td>
              <td style={{ padding: "1rem 0", textAlign: "right", fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "0.9375rem", color: "#111" }}>
                {(item.price * item.quantity).toFixed(2)} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div style={{ width: "280px" }}>
          <div className="flex justify-between py-2" style={{ borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#6b7280" }}>Sous-total</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#374151" }}>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between py-2" style={{ borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#6b7280" }}>Livraison</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#374151" }}>{shipping.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between py-3">
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1rem", color: "#111" }}>Total</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.375rem", color: "#111" }}>
              {order.total.toFixed(2)} €
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "5rem", borderTop: "1px solid #f3f4f6", paddingTop: "2rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "0.9375rem", color: "#9ca3af" }}>
          Merci de votre confiance.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "#d1d5db", marginTop: "0.5rem" }}>
          Conditions de paiement : paiement dû à réception.
        </p>
      </div>
    </div>
  );
}
