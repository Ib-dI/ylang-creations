import { customer, order } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Force Node.js runtime for database connections
export const runtime = "nodejs";

// GET all orders
export async function GET(request: Request) {
  try {
    // Check admin authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Fetch orders with customer info
    const orders = await db
      .select({
        id: order.id,
        stripeSessionId: order.stripeSessionId,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
        shippingAddress: order.shippingAddress,
        items: order.items,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        customerId: order.customerId,
        customerEmail: customer.email,
        customerName: customer.name,
      })
      .from(order)
      .leftJoin(customer, eq(order.customerId, customer.id))
      .orderBy(desc(order.createdAt));

    // Format orders for frontend
    const formattedOrders = orders.map((o) => {
      let parsedItems = [];
      let parsedAddress = null;

      try {
        parsedItems = JSON.parse(o.items || "[]");
      } catch {
        parsedItems = [];
      }

      try {
        parsedAddress = JSON.parse(o.shippingAddress || "{}");
      } catch {
        parsedAddress = {};
      }

      return {
        id: o.id,
        orderNumber: `YC${o.id.slice(0, 8).toUpperCase()}`,
        customerName: o.customerName || "Client",
        customerEmail: o.customerEmail || "",
        items: parsedItems,
        total: parseFloat(o.totalAmount) / 100, // Convert from cents
        status: o.status,
        paymentStatus: o.status === "pending" ? "pending" : "paid",
        shippingAddress: parsedAddress,
        trackingNumber: o.trackingNumber,
        notes: o.notes,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      };
    });

    // Filter by status if provided
    let filteredOrders = formattedOrders;
    if (status && status !== "all") {
      filteredOrders = formattedOrders.filter((o) => o.status === status);
    }

    return NextResponse.json({ orders: filteredOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 },
    );
  }
}
