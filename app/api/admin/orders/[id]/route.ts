import { customer, order } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET single order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const orders = await db
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
      .where(eq(order.id, id))
      .limit(1);

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 },
      );
    }

    const o = orders[0];
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

    return NextResponse.json({
      order: {
        id: o.id,
        orderNumber: `YC${o.id.slice(0, 8).toUpperCase()}`,
        customerName: o.customerName || "Client",
        customerEmail: o.customerEmail || "",
        items: parsedItems,
        total: parseFloat(o.totalAmount) / 100,
        status: o.status,
        paymentStatus: o.status === "pending" ? "pending" : "paid",
        shippingAddress: parsedAddress,
        trackingNumber: o.trackingNumber,
        notes: o.notes,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH update order
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, notes } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (trackingNumber !== undefined)
      updateData.trackingNumber = trackingNumber;
    if (notes !== undefined) updateData.notes = notes;

    await db.update(order).set(updateData).where(eq(order.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
