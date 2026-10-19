import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { sendEmail } from "./brevo";
import { renderEmail } from "./render";

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
      embroideryFont?: string;
      embroideryColor?: string;
      embroideryColorName?: string;
    };
  }>;
  total: number;
  shipping: number;
  shippingAddress?: {
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
  return sendEmail({
    to: [{ email: params.to, name: params.customerName }],
    subject: `✨ Commande confirmée ${params.orderNumber}`,
    html: await renderEmail(
      OrderConfirmationEmail({
        orderNumber: params.orderNumber,
        customerName: params.customerName,
        items: params.items,
        total: params.total,
        shipping: params.shipping,
        shippingAddress: params.shippingAddress,
      }),
    ),
    tags: ["commande"],
  });
}
