"use client";

import { motion } from "framer-motion";
import { Calendar, Loader2, Mail, PenLine, Search, UserCheck, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Subscriber {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, activeCount: 0 });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setStats({ total: data.total || 0, activeCount: data.activeCount || 0 });
    } catch (error) {
      console.error("Erreur chargement abonnés:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter((s) => {
    const matchesSearch = s.email
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-ylang-charcoal mb-2 text-3xl font-bold">
            Newsletter
          </h1>
          <p className="text-ylang-charcoal/60">
            Gérez vos abonnés à la newsletter
          </p>
        </div>
        <Link
          href="/admin/newsletter/compose"
          className="flex items-center gap-2 rounded-xl bg-linear-to-r from-[#b76e79] to-[#d4a89a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <PenLine className="h-4 w-4" />
          Créer une campagne
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="border-ylang-terracotta rounded-2xl border bg-white p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 shadow-sm shadow-blue-200">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-ylang-charcoal/60 text-sm">Total abonnés</p>
              <p className="text-ylang-charcoal text-2xl font-bold">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="border-ylang-terracotta rounded-2xl border bg-white p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 shadow-sm shadow-green-200">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-ylang-charcoal/60 text-sm">Actifs</p>
              <p className="text-ylang-charcoal text-2xl font-bold">
                {stats.activeCount}
              </p>
            </div>
          </div>
        </div>

        <div className="border-ylang-terracotta rounded-2xl border bg-white p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-400 shadow-sm shadow-gray-200">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-ylang-charcoal/60 text-sm">Désinscrits</p>
              <p className="text-ylang-charcoal text-2xl font-bold">
                {stats.total - stats.activeCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-ylang-charcoal/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-ylang-terracotta text-ylang-charcoal w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-ylang-terracotta text-ylang-charcoal rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="unsubscribed">Désinscrits</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="text-ylang-charcoal/20 mb-4 h-12 w-12" />
            <p className="text-ylang-charcoal/60 text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Aucun abonné ne correspond à votre recherche."
                : "Aucun abonné pour le moment."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Date d'inscription
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSubscribers.map((subscriber, index) => (
                  <motion.tr
                    key={subscriber.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50">
                          <Mail className="text-ylang-rose h-4 w-4" />
                        </div>
                        <span className="text-ylang-charcoal text-sm font-medium">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          subscriber.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {subscriber.status === "active" ? "Actif" : "Désinscrit"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-ylang-charcoal/40 h-3.5 w-3.5" />
                        <span className="text-ylang-charcoal/60 text-sm">
                          {new Date(subscriber.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && filteredSubscribers.length > 0 && (
        <p className="text-ylang-charcoal/40 mt-4 text-center text-xs">
          {filteredSubscribers.length} abonné
          {filteredSubscribers.length > 1 ? "s" : ""} affiché
          {filteredSubscribers.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
