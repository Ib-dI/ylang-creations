"use client";

import type { NewsletterSubscriber } from "@/lib/admin/get-newsletter-data";
import { motion } from "framer-motion";
import { Calendar, Mail, PenLine, Search, UserCheck, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface NewsletterClientProps {
  initialSubscribers: NewsletterSubscriber[];
}

export function NewsletterClient({ initialSubscribers }: NewsletterClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSubscribers = initialSubscribers.filter((s) => {
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = initialSubscribers.length;
  const activeCount = initialSubscribers.filter((s) => s.status === "active").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>Administration</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.75rem", color: "var(--color-ink)" }}>
            Newsletter
          </h1>
          <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
            Gérez vos abonnés à la newsletter
          </p>
        </div>
        <Link
          href="/admin/newsletter/compose"
          className="inline-flex shrink-0 items-center gap-2 px-5 py-2.5 font-body text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
        >
          <PenLine className="h-4 w-4" strokeWidth={1.5} />
          Créer une campagne
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        {[
          { label: "Total abonnés", value: total,                    icon: Users },
          { label: "Actifs",        value: activeCount,              icon: UserCheck },
          { label: "Désinscrits",   value: total - activeCount,      icon: XCircle },
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

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Rechercher un email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-body w-full py-2.5 pr-4 pl-9 text-sm outline-none"
            style={{ border: "var(--rule-soft)", background: "var(--color-paper)", color: "var(--color-ink)" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-body cursor-pointer appearance-none py-2.5 pr-10 pl-4 text-sm outline-none"
          style={{ border: "var(--rule-soft)", background: "var(--color-paper)", color: "var(--color-ink)", minWidth: "160px" }}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="unsubscribed">Désinscrits</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
        {filteredSubscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="mb-4 h-8 w-8" style={{ color: "var(--color-ink-3)", opacity: 0.3 }} strokeWidth={1} />
            <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
              {searchQuery || statusFilter !== "all"
                ? "Aucun abonné ne correspond à votre recherche."
                : "Aucun abonné pour le moment."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--color-paper-2)" }}>
                  {["Email", "Statut", "Date d'inscription"].map((th) => (
                    <th key={th} className="type-overline px-6 py-3 text-left" style={{ color: "var(--color-ink-3)" }}>
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber, index) => (
                  <motion.tr
                    key={subscriber.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="transition-colors hover:bg-[var(--color-paper-2)]"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 shrink-0" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                        <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5" style={{ border: "var(--rule-soft)" }}>
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: subscriber.status === "active" ? "#22c55e" : "#94a3b8" }}
                        />
                        <span className="type-overline" style={{ color: "var(--color-ink)" }}>
                          {subscriber.status === "active" ? "Actif" : "Désinscrit"}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                        <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                          {new Date(subscriber.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
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

      {filteredSubscribers.length > 0 && (
        <p className="mt-4 text-center font-body text-xs" style={{ color: "var(--color-ink-3)", opacity: 0.5 }}>
          {filteredSubscribers.length} abonné{filteredSubscribers.length > 1 ? "s" : ""} affiché{filteredSubscribers.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
