"use client";

import type { AdminUser } from "@/lib/admin/get-users-data";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Euro,
  Eye,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface UsersClientProps {
  initialUsers: AdminUser[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = initialUsers.filter((user) => {
    const q = searchQuery.toLowerCase();
    return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
  });

  const totalUsers = initialUsers.length;
  const verifiedUsers = initialUsers.filter((u) => u.emailVerified).length;
  const activeCustomers = initialUsers.filter((u) => u.orderCount > 0).length;
  const totalRevenue = initialUsers.reduce((sum, u) => sum + u.totalSpent, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>Administration</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.75rem", color: "var(--color-ink)" }}>
          Clients
        </h1>
        <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
          Gérez vos clients et consultez leurs informations
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Utilisateurs",   value: totalUsers,                      icon: Users },
          { label: "Vérifiés",       value: verifiedUsers,                   icon: CheckCircle },
          { label: "Clients actifs", value: activeCustomers,                  icon: ShoppingBag },
          { label: "CA clients",     value: `${totalRevenue.toFixed(0)} €`,  icon: Euro },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-start justify-between p-5" style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}>
            <div>
              <p className="type-overline mb-3" style={{ color: "var(--color-ink-3)" }}>{label}</p>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "var(--text-title)", color: "var(--color-ink)", lineHeight: 1 }}>
                {value}
              </p>
            </div>
            <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-body w-full py-2.5 pr-4 pl-9 text-sm outline-none"
            style={{ border: "var(--rule-soft)", background: "var(--color-paper)", color: "var(--color-ink)" }}
          />
        </div>
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="py-20 text-center" style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
          <Users className="mx-auto mb-4 h-8 w-8" style={{ color: "var(--color-ink-3)", opacity: 0.3 }} strokeWidth={1} />
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1rem", color: "var(--color-ink)", marginBottom: "0.25rem" }}>
            Aucun client trouvé
          </p>
          <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
            {searchQuery ? "Essayez d'autres termes" : "Les clients apparaîtront après leur inscription"}
          </p>
        </div>
      ) : (
        <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--color-paper-2)" }}>
                  {["Client", "Email vérifié", "Commandes", "Total dépensé", "Inscrit le", ""].map((th) => (
                    <th key={th} className={`type-overline px-6 py-3 ${th === "" ? "text-right" : "text-left"}`} style={{ color: "var(--color-ink-3)" }}>
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="transition-colors hover:bg-[var(--color-paper-2)]"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center font-body text-sm font-medium"
                          style={{ background: "var(--color-paper-3)", color: "var(--color-ink)" }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-body font-medium" style={{ color: "var(--color-ink)" }}>{user.name}</p>
                          <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-3.5 w-3.5" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                        <span
                          style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "0.9375rem", color: "var(--color-ink)" }}
                        >
                          {user.orderCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "0.9375rem", color: "var(--color-ink)" }}>
                        {user.totalSpent.toFixed(2)} €
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                        <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-opacity hover:opacity-70"
                        style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
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
