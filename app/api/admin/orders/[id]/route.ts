import { customer, order } from "@/db/schema";
import { db } from "@/lib/db";
import { formatZodErrors, updateOrderSchema } from "@/lib/validations";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Force Node.js runtime for database connections
export const runtime = "nodejs";

// GET single order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérification authentification ET rôle admin
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
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
      parsedItems = (o.items as any[]) ?? [];
    } catch {
      parsedItems = [];
    }

    try {
      const rawAddress = (o.shippingAddress as Record<string, any>) ?? {};
      // Handle Stripe structure where address is nested in 'address' property
      const addr = rawAddress.address || rawAddress;

      parsedAddress = {
        address: addr.line1 || "",
        city: addr.city || "",
        postalCode: addr.postal_code || "",
        country: addr.country || "",
      };
    } catch {
      parsedAddress = {
        address: "",
        city: "",
        postalCode: "",
        country: "",
      };
    }

    return NextResponse.json({
      order: {
        id: o.id,
        orderNumber: `YC${o.id.slice(0, 8).toUpperCase()}`,
        customerName: o.customerName || "Client",
        customerEmail: o.customerEmail || "",
        items: parsedItems,
        total: o.totalAmount / 100,
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérification authentification ET rôle admin
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validation avec Zod
    const validation = updateOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: formatZodErrors(validation.error) },
        { status: 400 },
      );
    }

    const { status, trackingNumber, notes } = validation.data;

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
