export default function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: "En attente", color: "bg-gray-100 border-gray-200 border text-gray-700" },
    paid: { label: "Payée", color: "bg-blue-100 border-blue-200 border text-blue-700" },
    in_production: {
      label: "En production",
      color: "bg-orange-100 border-orange-200 border text-orange-700",
    },
    shipped: { label: "Expédiée", color: "bg-purple-100 border-purple-200 border text-purple-700" },
    delivered: { label: "Livrée", color: "bg-green-100 border-green-200 border text-green-700" },
    cancelled: { label: "Annulée", color: "bg-red-100 border-red-200 border text-red-700" },
  };

  const { label, color } =
    config[status as keyof typeof config] || config.pending;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
