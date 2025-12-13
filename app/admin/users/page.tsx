"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Euro,
  Eye,
  Loader2,
  Search,
  ShoppingBag,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  orderCount: number;
  totalSpent: number;
  stripeCustomerId: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  // Stats
  const totalUsers = users.length;
  const verifiedUsers = users.filter((u) => u.emailVerified).length;
  const activeCustomers = users.filter((u) => u.orderCount > 0).length;
  const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-ylang-charcoal">Clients</h1>
        <p className="text-ylang-charcoal/60">
          Gérez vos clients et consultez leurs informations
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-ylang-beige bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ylang-charcoal">{totalUsers}</p>
              <p className="text-sm text-ylang-charcoal/60">Total utilisateurs</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-ylang-beige bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ylang-charcoal">
                {verifiedUsers}
              </p>
              <p className="text-sm text-ylang-charcoal/60">Emails vérifiés</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-ylang-beige bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ylang-charcoal">
                {activeCustomers}
              </p>
              <p className="text-sm text-ylang-charcoal/60">Clients actifs</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-ylang-beige bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
              <Euro className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ylang-charcoal">
                {totalRevenue.toFixed(0)}€
              </p>
              <p className="text-sm text-ylang-charcoal/60">CA total clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ylang-charcoal/40" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-ylang-beige bg-white py-3 pr-4 pl-12 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Users table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-ylang-rose" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-ylang-beige bg-white py-20 text-center">
          <Users className="mx-auto mb-4 h-16 w-16 text-ylang-charcoal/20" />
          <h3 className="mb-2 text-xl font-semibold text-ylang-charcoal">
            Aucun client trouvé
          </h3>
          <p className="text-ylang-charcoal/60">
            {searchQuery
              ? "Essayez avec d'autres termes de recherche"
              : "Les clients apparaîtront ici après leur inscription"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ylang-beige bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ylang-cream">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-ylang-charcoal/60 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-ylang-charcoal/60 uppercase">
                    Email vérifié
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-ylang-charcoal/60 uppercase">
                    Commandes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-ylang-charcoal/60 uppercase">
                    Total dépensé
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-ylang-charcoal/60 uppercase">
                    Inscrit le
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-ylang-charcoal/60 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ylang-beige">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="transition-colors hover:bg-ylang-cream"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-ylang-rose to-ylang-terracotta font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-ylang-charcoal">
                            {user.name}
                          </p>
                          <p className="text-xs text-ylang-charcoal/60">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-ylang-charcoal/40" />
                        <span className="font-medium text-ylang-charcoal">
                          {user.orderCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-ylang-rose">
                        {user.totalSpent.toFixed(2)}€
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-ylang-charcoal/60">
                        <Calendar className="h-4 w-4" />
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-ylang-beige px-3 py-1.5 text-sm text-ylang-charcoal transition-colors hover:bg-[#e8dcc8]"
                      >
                        <Eye className="h-4 w-4" />
                        Voir
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
