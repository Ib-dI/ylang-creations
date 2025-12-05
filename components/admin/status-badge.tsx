export default function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: 'En attente', color: 'bg-gray-100 text-gray-700' },
    confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
    in_production: { label: 'En production', color: 'bg-orange-100 text-orange-700' },
    shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700' }
  }

  const { label, color } = config[status as keyof typeof config] || config.pending

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}