"use client";

import StatusBadge from "@/components/admin/status-badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Euro,
  ExternalLink,
  Loader2,
  Mail,
  Package,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: any[];
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string | null;
  orderCount: number;
  totalSpent: number;
  sumupCustomerId: string | null;
  orders: Order[];
}

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${id}`);
      if (!response.ok) throw new Error("Impossible de récupérer les détails de l'utilisateur");
      const data = await response.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8">
        <div className="border p-8 text-center" style={{ border: "var(--rule-hair)" }}>
          <XCircle className="mx-auto mb-4 h-10 w-10" style={{ color: "var(--color-ink-3)", opacity: 0.4 }} strokeWidth={1} />
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1rem", color: "var(--color-ink)" }}>
            {error || "Utilisateur non trouvé"}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 font-body text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--color-ink-3)" }}
          >
            ← Retour aux clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 font-body text-sm transition-opacity hover:opacity-70"
          style={{ color: "var(--color-ink-3)" }}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Retour aux clients
        </button>

        <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>Administration</p>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex items-center gap-4">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.75rem", color: "var(--color-ink)" }}>
              {user.name}
            </h1>
            {user.emailVerified ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5" style={{ border: "var(--rule-soft)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#22c55e" }} />
                <span className="type-overline" style={{ color: "var(--color-ink)" }}>Vérifié</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5" style={{ border: "var(--rule-soft)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#f59e0b" }} />
                <span className="type-overline" style={{ color: "var(--color-ink)" }}>Non vérifié</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2" style={{ color: "var(--color-ink-3)" }}>
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            <span className="font-body text-sm">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card + Stats */}
        <div className="space-y-4 lg:col-span-1">
          {/* Profile card */}
          <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
            {/* Dark header */}
            <div className="flex flex-col items-center gap-3 p-8 text-center" style={{ background: "var(--color-ink)" }}>
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center font-body text-3xl font-medium"
                style={{ background: "rgba(255,255,255,0.1)", color: "var(--color-paper)" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.125rem", color: "var(--color-paper)" }}>
                  {user.name}
                </p>
                <p className="font-body text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{user.email}</p>
              </div>
            </div>
            {/* Info rows */}
            <div className="divide-y px-6" style={{ borderTop: "var(--rule-soft)" }}>
              {[
                { label: "Inscrit le", value: new Date(user.createdAt).toLocaleDateString("fr-FR") },
                { label: "Dernière connexion", value: user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString("fr-FR") : "Jamais" },
                { label: "SumUp ID", value: user.sumupCustomerId || "—" },
                { label: "ID Utilisateur", value: user.id.slice(0, 8).toUpperCase(), mono: true },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>{label}</span>
                  <span
                    className={mono ? "font-mono text-xs" : "font-body text-sm font-medium"}
                    style={{ color: "var(--color-ink)" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Commandes", value: user.orderCount.toString(), icon: ShoppingBag },
              { label: "Total dépensé", value: `${user.totalSpent.toFixed(2)} €`, icon: Euro },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start justify-between p-4" style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}>
                <div>
                  <p className="type-overline mb-2" style={{ color: "var(--color-ink-3)" }}>{label}</p>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "var(--text-title)", color: "var(--color-ink)", lineHeight: 1 }}>
                    {value}
                  </p>
                </div>
                <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
              </div>
            ))}
          </div>
        </div>

        {/* Order history */}
        <div className="lg:col-span-2">
          <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
            {/* Table header */}
            <div className="px-6 py-4" style={{ borderBottom: "var(--rule-soft)", background: "var(--color-paper-2)" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.125rem", color: "var(--color-ink)" }}>
                Historique des commandes
              </p>
            </div>

            {user.orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="mb-4 h-8 w-8" style={{ color: "var(--color-ink-3)", opacity: 0.3 }} strokeWidth={1} />
                <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                  Aucune commande passée par ce client.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "var(--color-paper-2)" }}>
                      {["Commande", "Statut", "Date", "Montant", ""].map((th) => (
                        <th
                          key={th}
                          className={`type-overline px-6 py-3 ${th === "" ? "text-right" : "text-left"}`}
                          style={{ color: "var(--color-ink-3)" }}
                        >
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {user.orders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                        className="transition-colors hover:bg-[var(--color-paper-2)]"
                        style={{ borderTop: "var(--rule-soft)" }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-body font-medium" style={{ color: "var(--color-ink)" }}>
                            {order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                            {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "0.9375rem", color: "var(--color-ink)" }}>
                            {order.totalAmount.toFixed(2)} €
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-opacity hover:opacity-70"
                            style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
                          >
                            Détails
                            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
