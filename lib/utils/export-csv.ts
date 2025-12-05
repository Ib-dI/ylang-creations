import { Order } from "@/types/admin"

export function exportOrdersToCSV(orders: Order[]) {
  const headers = ['N° Commande', 'Client', 'Email', 'Montant', 'Statut', 'Date']
  
  const rows = orders.map(order => [
    order.orderNumber,
    order.customerName,
    order.customerEmail,
    `${order.total}€`,
    order.status,
    new Date(order.createdAt).toLocaleDateString('fr-FR')
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `commandes-${Date.now()}.csv`
  a.click()
}