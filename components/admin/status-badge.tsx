const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  pending:       { label: "En attente",    dot: "#94a3b8" },
  paid:          { label: "Payée",         dot: "#3b82f6" },
  in_production: { label: "En production", dot: "#f59e0b" },
  shipped:       { label: "Expédiée",      dot: "#8b5cf6" },
  delivered:     { label: "Livrée",        dot: "#22c55e" },
  cancelled:     { label: "Annulée",       dot: "#ef4444" },
};

export default function StatusBadge({ status }: { status: string }) {
  const { label, dot } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5"
      style={{ border: "var(--rule-soft)" }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: dot }}
      />
      <span className="type-overline" style={{ color: "var(--color-ink)" }}>
        {label}
      </span>
    </span>
  );
}
