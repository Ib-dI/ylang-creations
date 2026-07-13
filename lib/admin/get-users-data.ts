import { customer, order } from "@/db/schema";
import { db } from "@/lib/db";
import { cents, centsToEuros } from "@/lib/currency";
import { supabaseAdmin } from "@/utils/supabase/server";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  sumupCustomerId: string | null;
}

export async function getUsersData(): Promise<AdminUser[]> {
  if (!supabaseAdmin) {
    throw new Error("Serveur mal configuré : SUPABASE_SERVICE_ROLE_KEY manquant.");
  }

  const {
    data: { users },
    error: usersError,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    throw usersError;
  }

  const customers = await db.select().from(customer);
  const orders = await db.select().from(order);

  return users
    .filter((u) => u.app_metadata?.role !== "admin")
    .map((u) => {
      const customerRecord = customers.find((c) => c.userId === u.id);
      const userOrders = customerRecord
        ? orders.filter((o) => o.customerId === customerRecord.id)
        : [];
      const totalSpent = userOrders.reduce(
        (sum, o) => sum + centsToEuros(cents(o.totalAmount)),
        0,
      );

      const fullName = u.user_metadata?.full_name || u.user_metadata?.name || "Sans nom";

      return {
        id: u.id,
        name: fullName,
        email: u.email || "",
        emailVerified: !!u.email_confirmed_at,
        image: u.user_metadata?.avatar_url || null,
        createdAt: u.created_at,
        orderCount: userOrders.length,
        totalSpent,
        sumupCustomerId: customerRecord?.sumupCustomerId || null,
      };
    });
}
