import { customer, order } from "@/db/schema";
import { db } from "@/lib/db";
import { cents, centsToEuros } from "@/lib/currency";
import { desc, eq } from "drizzle-orm";
import type { Order } from "@/types/admin";

export async function getOrdersData(): Promise<Order[]> {
  const rows = await db
    .select({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      items: order.items,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customerEmail: customer.email,
      customerName: customer.name,
    })
    .from(order)
    .leftJoin(customer, eq(order.customerId, customer.id))
    .orderBy(desc(order.createdAt));

  return rows.map((o) => {
    let parsedItems: Order["items"] = [];
    try {
      const rawItems = (o.items as any[]) ?? [];
      parsedItems = rawItems.map((item: any) => ({
        productName: item.productName || item.name || "Produit",
        quantity: item.quantity,
        price: item.price,
        image: item.image || item.thumbnail || undefined,
        configuration: item.configuration || undefined,
      }));
    } catch {
      parsedItems = [];
    }

    let parsedAddress: Order["shippingAddress"];
    try {
      const rawAddress = (o.shippingAddress as Record<string, any>) ?? {};
      const stripeAddress = rawAddress.address || rawAddress;
      parsedAddress = {
        address:
          stripeAddress.line1 +
          (stripeAddress.line2 ? `, ${stripeAddress.line2}` : ""),
        city: stripeAddress.city || "",
        postalCode: stripeAddress.postal_code || "",
        country: stripeAddress.country || "",
      };
    } catch {
      parsedAddress = { address: "Inconnue", city: "", postalCode: "", country: "" };
    }

    return {
      id: o.id,
      orderNumber: `YC${o.id.slice(0, 8).toUpperCase()}`,
      customerName: o.customerName || "Client",
      customerEmail: o.customerEmail || "",
      items: parsedItems,
      total: centsToEuros(cents(o.totalAmount)),
      status: o.status as Order["status"],
      paymentStatus: o.status === "pending" ? "pending" : "paid",
      shippingAddress: parsedAddress,
      trackingNumber: o.trackingNumber ?? undefined,
      notes: o.notes ?? undefined,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  });
}
