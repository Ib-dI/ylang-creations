import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

// ============================================
// CONFIGURATION EXPÉDITEUR
// ============================================
// 🧪 Mode Sandbox (actif) - Pour les tests avec Resend
const FROM_EMAIL_ORDERS = "Ylang Créations <onboarding@resend.dev>";
const FROM_EMAIL_NOTIFICATIONS = "Ylang Créations <onboarding@resend.dev>";

// 🚀 Mode Production (à activer quand le domaine sera vérifié)
// Décommentez les lignes ci-dessous et commentez les lignes sandbox ci-dessus
// const FROM_EMAIL_ORDERS = 'Ylang Créations <commandes@ylang-creations.fr>'
// const FROM_EMAIL_NOTIFICATIONS = 'Ylang Créations <notifications@ylang-creations.fr>'
// ============================================

interface SendOrderConfirmationParams {
  to: string;
  orderNumber: string;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    configuration: {
      fabricName: string;
      embroidery?: string;
    };
  }>;
  total: number;
  shipping: number;
  shippingAddress: {
    address: string;
    addressComplement?: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationParams,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL_ORDERS,
      to: [params.to],
      subject: `✨ Commande confirmée ${params.orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber: params.orderNumber,
        customerName: params.customerName,
        items: params.items,
        total: params.total,
        shipping: params.shipping,
        shippingAddress: params.shippingAddress,
      }),
    });

    if (error) {
      console.error("❌ Erreur envoi email:", error);
      return { success: false, error };
    }

    console.log("✅ Email de confirmation envoyé:", data?.id);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Erreur Resend:", error);
    return { success: false, error };
  }
}

// Fonction utilitaire pour envoyer un email de notification admin
export async function sendAdminNotificationEmail(
  adminEmail: string,
  orderNumber: string,
  customerName: string,
  total: number,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL_NOTIFICATIONS,
      to: [adminEmail],
      subject: `🎉 Nouvelle commande ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #b76e79;">Nouvelle commande reçue !</h2>
          <p><strong>Numéro :</strong> ${orderNumber}</p>
          <p><strong>Client :</strong> ${customerName}</p>
          <p><strong>Montant :</strong> ${total.toFixed(2)}€</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${orderNumber}" style="display: inline-block; padding: 12px 24px; background-color: #b76e79; color: white; text-decoration: none; border-radius: 8px; margin-top: 10px;">Voir la commande</a></p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Erreur notification admin:", error);
      return { success: false, error };
    }

    console.log("✅ Notification admin envoyée");
    return { success: true, data };
  } catch (error) {
    console.error("❌ Erreur notification admin:", error);
    return { success: false, error };
  }
}
