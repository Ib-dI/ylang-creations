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
        <Loader2 className="text-ylang-rose h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Commande introuvable</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl bg-white p-8 md:p-12 print:p-0">
      {/* Print Button (Hidden when printing) */}
      <button
        onClick={() => window.print()}
        className="bg-ylang-rose hover:bg-ylang-rose/90 mb-8 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors print:hidden"
      >
        <Printer className="h-4 w-4" />
        Imprimer la facture
      </button>

      {/* Header */}
      <div className="mb-12 flex justify-between border-b pb-8">
        <div>
          <h1 className="text-ylang-charcoal font-display text-4xl font-bold">
            FACTURE
          </h1>
          <p className="text-ylang-charcoal/60 mt-2">N° {order.orderNumber}</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Date d'émission : {new Date().toLocaleDateString("fr-FR")}</p>
            <p>
              Date de commande :{" "}
              {new Date(order.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-ylang-charcoal text-xl font-bold">
            Ylang Créations
          </h2>
          <div className="mt-2 text-sm text-gray-500">
            <p>123 Rue de la Couture</p>
            <p>75001 Paris, France</p>
            <p>contact@ylang-creations.com</p>
            <p>SIRET: 123 456 789 00012</p>
          </div>
        </div>
      </div>

      {/* Client & Shipping */}
      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-ylang-charcoal mb-4 text-sm font-bold tracking-wider text-gray-400 uppercase">
            Facturé à
          </h3>
          <p className="text-lg font-bold">{order.customerName}</p>
          <p className="text-gray-600">{order.customerEmail}</p>
        </div>
        <div>
          <h3 className="text-ylang-charcoal mb-4 text-sm font-bold tracking-wider text-gray-400 uppercase">
            Adresse de livraison
          </h3>
          <p className="font-medium">{order.shippingAddress.address}</p>
          <p className="text-gray-600">
            {order.shippingAddress.postalCode} {order.shippingAddress.city}
          </p>
          <p className="text-gray-600">{order.shippingAddress.country}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="mb-12 w-full text-left">
        <thead>
          <tr className="border-b-2 border-gray-100">
            <th className="py-4 font-bold text-gray-500 uppercase">
              Description
            </th>
            <th className="py-4 text-right font-bold text-gray-500 uppercase">
              Quantité
            </th>
            <th className="py-4 text-right font-bold text-gray-500 uppercase">
              Prix unitaire
            </th>
            <th className="py-4 text-right font-bold text-gray-500 uppercase">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {order.items.map((item, index) => (
            <tr key={index}>
              <td className="py-4">
                <p className="font-bold text-gray-800">{item.productName}</p>
                {item.configuration && (
                  <p className="text-sm text-gray-500">
                    {item.configuration.fabricName}
                    {item.configuration.embroidery
                      ? ` - ${item.configuration.embroidery}`
                      : ""}
                  </p>
                )}
              </td>
              <td className="py-4 text-right text-gray-600">{item.quantity}</td>
              <td className="py-4 text-right text-gray-600">
                {item.price.toFixed(2)}€
              </td>
              <td className="py-4 text-right font-medium text-gray-800">
                {(item.price * item.quantity).toFixed(2)}€
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>
              {order.items
                .reduce((acc, item) => acc + item.price * item.quantity, 0)
                .toFixed(2)}
              €
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Livraison</span>
            <span>
              {(
                order.total -
                order.items.reduce(
                  (acc, item) => acc + item.price * item.quantity,
                  0,
                )
              ).toFixed(2)}
              €
            </span>
          </div>
          <div className="text-ylang-rose flex justify-between border-t pt-3 text-xl font-bold">
            <span>Total</span>
            <span>{order.total.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 border-t pt-8 text-center text-sm text-gray-400">
        <p>Merci de votre confiance !</p>
        <p className="mt-2">
          Conditions de paiement : Paiement dû à réception.
        </p>
      </div>
    </div>
  );
}
