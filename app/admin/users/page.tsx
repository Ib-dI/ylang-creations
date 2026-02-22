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
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-ylang-charcoal mb-2 text-3xl font-bold">Clients</h1>
        <p className="text-ylang-charcoal/60">
          Gérez vos clients et consultez leurs informations
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-ylang-terracotta rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-ylang-charcoal text-2xl font-bold">
                {totalUsers}
              </p>
              <p className="text-ylang-charcoal/60 text-sm">
                Total utilisateurs
              </p>
            </div>
          </div>
        </div>

        <div className="border-ylang-terracotta rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-ylang-charcoal text-2xl font-bold">
                {verifiedUsers}
              </p>
              <p className="text-ylang-charcoal/60 text-sm">Emails vérifiés</p>
            </div>
          </div>
        </div>

        <div className="border-ylang-terracotta rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-ylang-charcoal text-2xl font-bold">
                {activeCustomers}
              </p>
              <p className="text-ylang-charcoal/60 text-sm">Clients actifs</p>
            </div>
          </div>
        </div>

        <div className="border-ylang-terracotta rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
              <Euro className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-ylang-charcoal text-2xl font-bold">
                {totalRevenue.toFixed(0)}€
              </p>
              <p className="text-ylang-charcoal/60 text-sm">CA total clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="text-ylang-charcoal/40 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-ylang-beige focus:ring-ylang-rose/20 w-full rounded-xl border bg-white py-3 pr-4 pl-12 focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Users table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="border-ylang-terracotta rounded-2xl border bg-white py-20 text-center">
          <Users className="text-ylang-charcoal/20 mx-auto mb-4 h-16 w-16" />
          <h3 className="text-ylang-charcoal mb-2 text-xl font-semibold">
            Aucun client trouvé
          </h3>
          <p className="text-ylang-charcoal/60">
            {searchQuery
              ? "Essayez avec d'autres termes de recherche"
              : "Les clients apparaîtront ici après leur inscription"}
          </p>
        </div>
      ) : (
        <div className="border-ylang-terracotta overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ylang-cream">
                <tr>
                  <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                    Client
                  </th>
                  <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                    Email vérifié
                  </th>
                  <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                    Commandes
                  </th>
                  <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                    Total dépensé
                  </th>
                  <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                    Inscrit le
                  </th>
                  <th className="text-ylang-charcoal/60 px-6 py-4 text-right text-xs font-medium tracking-wider uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-ylang-beige divide-y">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-ylang-cream transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="from-ylang-rose to-ylang-terracotta flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-ylang-charcoal font-medium">
                            {user.name}
                          </p>
                          <p className="text-ylang-charcoal/60 text-xs">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Vérifié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                          <XCircle className="h-3 w-3" />
                          Non vérifié
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="text-ylang-charcoal/40 h-4 w-4" />
                        <span className="text-ylang-charcoal font-medium">
                          {user.orderCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-ylang-rose font-bold">
                        {user.totalSpent.toFixed(2)}€
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-ylang-charcoal/60 flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="bg-ylang-beige text-ylang-charcoal inline-flex items-center gap-1 rounded-lg px-3 py-1 text-sm transition-colors hover:bg-[#e8dcc8]"
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
