import { customer, order, product } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // 1. Authentification & Autorisation
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { resetProducts } = await request.json();

    // 2. Transaction pour tout effacer en une fois
    await db.transaction(async (tx) => {
      // Supprimer toutes les commandes
      await tx.delete(order);

      // Supprimer tous les clients (mais pas les comptes utilisateurs)
      await tx.delete(customer);

      // Optionnel : Remettre les stocks à zéro
      if (resetProducts === true) {
        await tx.update(product).set({
          stock: 0,
          updatedAt: new Date(),
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Données réinitialisées avec succès",
    });
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json(
      { error: "Erreur lors de la réinitialisation" },
      { status: 500 },
    );
  }
}
