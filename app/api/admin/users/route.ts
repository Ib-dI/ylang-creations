import { customer, order } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient, supabaseAdmin } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Force Node.js runtime for database connections
export const runtime = "nodejs";

// GET all users
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérification authentification ET rôle admin
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Get all users from Supabase Auth
    // Note: listUsers defaults to page 1, limit 50. Adjust as needed for pagination.
    const {
      data: { users },
      error: usersError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      throw usersError;
    }

    // Get customer data and order counts
    const customers = await db.select().from(customer);
    const orders = await db.select().from(order);

    // Format users with additional data and filter out admins
    let formattedUsers = users
      .filter((u) => u.app_metadata?.role !== "admin")
      .map((u) => {
        // Logic to link Supabase auth user with app data (customer table) relies on matching ID
        const customerRecord = customers.find((c) => c.userId === u.id);
        const userOrders = customerRecord
          ? orders.filter((o) => o.customerId === customerRecord.id)
          : [];
        const totalSpent = userOrders.reduce((sum, o) => {
          return sum + parseFloat(o.totalAmount || "0") / 100;
        }, 0);

        const fullName =
          u.user_metadata?.full_name || u.user_metadata?.name || "Sans nom";

        return {
          id: u.id,
          name: fullName,
          email: u.email || "",
          emailVerified: !!u.email_confirmed_at,
          image: u.user_metadata?.avatar_url || null,
          createdAt: u.created_at,
          updatedAt: u.updated_at,
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
          u.email.toLowerCase().includes(searchLower),
      );
    }

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 },
    );
  }
}
