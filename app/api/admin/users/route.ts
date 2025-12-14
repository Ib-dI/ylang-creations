import { db } from "@/lib/db";
import { user, customer, order } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Force Node.js runtime for database connections
export const runtime = "nodejs";

// GET all users
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Get all users with order count
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt));

    // Get customer data and order counts
    const customers = await db.select().from(customer);
    const orders = await db.select().from(order);

    // Format users with additional data
    let formattedUsers = users.map((u) => {
      const customerRecord = customers.find((c) => c.userId === u.id);
      const userOrders = customerRecord
        ? orders.filter((o) => o.customerId === customerRecord.id)
        : [];
      const totalSpent = userOrders.reduce((sum, o) => {
        return sum + parseFloat(o.totalAmount || "0") / 100;
      }, 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: u.emailVerified,
        image: u.image,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        orderCount: userOrders.length,
        totalSpent,
        stripeCustomerId: customerRecord?.stripeCustomerId || null,
      };
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      formattedUsers = formattedUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}
