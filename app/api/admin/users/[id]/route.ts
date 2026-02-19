import { customer, order as orderTable } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient, supabaseAdmin } from "@/utils/supabase/server";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Verification
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id: userId } = await params;
    console.log("Fetching details for userId:", userId, "Type:", typeof userId);

    // Get user from Supabase Auth
    if (!supabaseAdmin) {
      throw new Error(
        "Serveur mal configuré : SUPABASE_SERVICE_ROLE_KEY manquant.",
      );
    }
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    // Get customer data
    const customerRecord = await db.query.customer.findFirst({
      where: eq(customer.userId, userId),
    });

    const orders = customerRecord
      ? await db.query.order.findMany({
          where: eq(orderTable.customerId, customerRecord.id),
          orderBy: [desc(orderTable.createdAt)],
        })
      : [];

    const totalSpent = orders.reduce((sum, o) => {
      return sum + o.totalAmount / 100;
    }, 0);

    const formattedUser = {
      id: authUser.user.id,
      name:
        authUser.user.user_metadata?.full_name ||
        authUser.user.user_metadata?.name ||
        "Sans nom",
      email: authUser.user.email || "",
      emailVerified: !!authUser.user.email_confirmed_at,
      image: authUser.user.user_metadata?.avatar_url || null,
      createdAt: authUser.user.created_at,
      updatedAt: authUser.user.updated_at,
      lastSignInAt: authUser.user.last_sign_in_at,
      orderCount: orders.length,
      totalSpent,
      stripeCustomerId: customerRecord?.stripeCustomerId || null,
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        totalAmount: o.totalAmount / 100,
        createdAt: o.createdAt,
        items: (o.items as any[]) ?? [],
      })),
    };

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des détails de l'utilisateur" },
      { status: 500 },
    );
  }
}
