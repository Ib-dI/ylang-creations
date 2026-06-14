import { customer, order, product } from "@/db/schema";
import { db } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth/with-admin-auth";
import { NextResponse } from "next/server";

async function handlePOST(request: Request): Promise<Response> {
  try {
    const { resetProducts } = await request.json();

    // Transaction pour tout effacer en une fois
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
export const POST = withAdminAuth(handlePOST);
