import type { CartItem } from "@/types/cart";
import { sendEmail } from "./brevo";
import { getEmailEnv } from "./env";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatItemDetails(item: CartItem): string {
  const { configuration } = item;
  return [
    `Tissu : ${escapeHtml(configuration.fabricName)}`,
    configuration.size && `Taille : ${escapeHtml(configuration.size)}`,
    configuration.selectedColorName &&
      `Couleur : ${escapeHtml(configuration.selectedColorName)}`,
    configuration.embroidery &&
      `Broderie : "${escapeHtml(configuration.embroidery)}"`,
    configuration.embroideryFont &&
      `Police : ${escapeHtml(configuration.embroideryFont)}`,
    configuration.embroideryColor &&
      `Fil : ${escapeHtml(configuration.embroideryColorName ?? configuration.embroideryColor)}`,
  ]
    .filter(Boolean)
    .join(" — ");
}

// Notification envoyée à l'atelier à chaque commande payée
export async function sendAdminOrderNotification(params: {
  orderId: string;
  orderNumber: string;
  amount: number;
  items: CartItem[];
}) {
  const env = getEmailEnv();

  const itemsHtml = params.items
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.productName)}</strong> (x${item.quantity})<br/>${formatItemDetails(item)}</li>`,
    )
    .join("");

  return sendEmail({
    to: [{ email: env.ADMIN_EMAIL }],
    subject: `Nouvelle commande ! (${params.orderNumber})`,
    html: `
      <div style="font-family: Inter, Helvetica, Arial, sans-serif; padding: 24px; color: #1f1718; background-color: #fdf4f1;">
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 400; font-size: 26px; margin: 0 0 12px;">Nouvelle commande reçue</h2>
        <p>Commande <strong>${params.orderNumber}</strong> reçue via SumUp. Montant : ${params.amount} EUR.</p>
        <ul>${itemsHtml}</ul>
        <p><a href="${env.NEXT_PUBLIC_APP_URL}/admin/orders/${params.orderId}" style="display: inline-block; padding: 14px 28px; background-color: #1f1718; color: #fdf4f1; text-decoration: none; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;">Voir la commande</a></p>
      </div>
    `,
    tags: ["admin"],
  });
}
