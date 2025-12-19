"use client";

import StatusBadge from "@/components/admin/status-badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
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
  stripeCustomerId: string | null;
  orders: Order[];
}

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${id}`);
      if (!response.ok) {
        throw new Error("Impossible de récupérer les détails de l'utilisateur");
      }
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
        <Loader2 className="text-ylang-rose h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
          <XCircle className="mx-auto mb-4 h-12 w-12" />
          <h2 className="mb-2 text-xl font-bold">Erreur</h2>
          <p>{error || "Utilisateur non trouvé"}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 font-medium hover:underline"
          >
            ← Retour aux clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-ylang-charcoal/60 hover:text-ylang-rose mb-4 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux clients
        </button>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-ylang-charcoal text-3xl font-bold">
                {user.name}
              </h1>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Vérifié
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                  <XCircle className="h-3 w-3" />
                  Non vérifié
                </span>
              )}
            </div>
            <p className="text-ylang-charcoal/60 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-ylang-charcoal/40 text-sm font-medium tracking-wider uppercase">
                ID Utilisateur
              </p>
              <p className="text-ylang-charcoal/60 font-mono text-xs">
                {user.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Card & Stats */}
        <div className="space-y-8 lg:col-span-1">
          {/* Main Profile Info */}
          <div className="border-ylang-beige overflow-hidden rounded-2xl border bg-white shadow-xs">
            <div className="from-ylang-rose to-ylang-terracotta bg-linear-to-br p-8 text-center text-white">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-4xl font-bold backdrop-blur-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-white/80">{user.email}</p>
            </div>
            <div className="space-y-4 p-6">
              <div className="border-ylang-beige flex items-center justify-between border-b py-2">
                <span className="text-ylang-charcoal/60 text-sm">
                  Inscrit le
                </span>
                <span className="text-ylang-charcoal font-medium">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="border-ylang-beige flex items-center justify-between border-b py-2">
                <span className="text-ylang-charcoal/60 text-sm">
                  Dernière connexion
                </span>
                <span className="text-ylang-charcoal font-medium">
                  {user.lastSignInAt
                    ? new Date(user.lastSignInAt).toLocaleDateString("fr-FR")
                    : "Jamais"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-ylang-charcoal/60 text-sm">
                  Stripe Customer ID
                </span>
                <span className="text-ylang-charcoal/60 font-mono text-xs">
                  {user.stripeCustomerId || "Aucun"}
                </span>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="border-ylang-beige rounded-2xl border bg-white p-6 shadow-xs">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-ylang-charcoal text-2xl font-bold">
                {user.orderCount}
              </p>
              <p className="text-ylang-charcoal/60 text-sm">
                Commandes totales
              </p>
            </div>
            <div className="border-ylang-beige rounded-2xl border bg-white p-6 shadow-xs">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-ylang-charcoal text-2xl font-bold">
                {user.totalSpent.toFixed(2)}€
              </p>
              <p className="text-ylang-charcoal/60 text-sm">
                Total dépensé (LTV)
              </p>
            </div>
          </div>
        </div>

        {/* Orders History */}
        <div className="lg:col-span-2">
          <div className="border-ylang-beige overflow-hidden rounded-2xl border bg-white shadow-xs">
            <div className="border-ylang-beige bg-ylang-cream/30 border-b p-6">
              <h2 className="text-ylang-charcoal text-xl font-bold">
                Historique des commandes
              </h2>
            </div>
            {user.orders.length === 0 ? (
              <div className="text-ylang-charcoal/60 p-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <p>Aucune commande passée par ce client.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ylang-cream/50 text-left">
                    <tr>
                      <th className="text-ylang-charcoal/60 px-6 py-4 text-xs font-medium tracking-wider uppercase">
                        Commande
                      </th>
                      <th className="text-ylang-charcoal/60 px-6 py-4 text-xs font-medium tracking-wider uppercase">
                        Status
                      </th>
                      <th className="text-ylang-charcoal/60 px-6 py-4 text-xs font-medium tracking-wider uppercase">
                        Date
                      </th>
                      <th className="text-ylang-charcoal/60 px-6 py-4 text-xs font-medium tracking-wider uppercase">
                        Montant
                      </th>
                      <th className="text-ylang-charcoal/60 px-6 py-4 text-right text-xs font-medium tracking-wider uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-ylang-beige divide-y">
                    {user.orders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-ylang-cream/30 transition-colors"
                      >
                        <td className="text-ylang-charcoal px-6 py-4 font-medium">
                          {order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="text-ylang-charcoal/60 px-6 py-4 text-sm">
                          {new Date(order.createdAt).toLocaleDateString(
                            "fr-FR",
                          )}
                        </td>
                        <td className="text-ylang-rose px-6 py-4 font-bold">
                          {order.totalAmount.toFixed(2)}€
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-ylang-rose hover:bg-ylang-rose/10 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium"
                          >
                            Détails
                            <ExternalLink className="h-3 w-3" />
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
