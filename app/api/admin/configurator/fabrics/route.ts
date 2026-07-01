import { configuratorFabric } from "@/db/schema";
import { db } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth/with-admin-auth";
import {
  createConfiguratorFabricSchema,
  updateConfiguratorFabricSchema,
  validateRequest,
  formatZodErrors,
} from "@/lib/validations";
import { supabaseAdmin } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const fabrics = activeOnly
      ? await db.select().from(configuratorFabric).where(eq(configuratorFabric.isActive, true))
      : await db.select().from(configuratorFabric);

    return NextResponse.json({ fabrics });
  } catch (error) {
    console.error("Error fetching fabrics:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tissus" },
      { status: 500 }
    );
  }
}

async function handlePOST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validation = validateRequest(createConfiguratorFabricSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.errors) }, { status: 400 });
    }

    const data = validation.data;
    await db.insert(configuratorFabric).values({
      id: data.id,
      name: data.name,
      price: data.price,
      baseColor: data.baseColor,
      image: data.image,
      category: data.category,
      isActive: data.isActive,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating fabric:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du tissu" },
      { status: 500 }
    );
  }
}
export const POST = withAdminAuth(handlePOST);

async function handlePUT(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const body = await request.json();
    const validation = validateRequest(updateConfiguratorFabricSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.errors) }, { status: 400 });
    }

    if (Object.keys(validation.data).length === 0) {
      return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
    }

    await db.update(configuratorFabric)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(eq(configuratorFabric.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating fabric:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du tissu" }, { status: 500 });
  }
}
export const PUT = withAdminAuth(handlePUT);

async function handleDELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const fabricRecord = await db.select().from(configuratorFabric).where(eq(configuratorFabric.id, id)).limit(1);
    if (fabricRecord.length > 0) {
      const imageUrl = fabricRecord[0].image;
      if (imageUrl?.includes("/products/") && supabaseAdmin) {
        const parts = imageUrl.split("/products/");
        if (parts.length > 1) {
          const { error } = await supabaseAdmin.storage.from("products").remove([parts[1]]);
          if (error) console.error("Erreur suppression image storage:", error.message);
        }
      }
    }

    await db.delete(configuratorFabric).where(eq(configuratorFabric.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fabric:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du tissu" }, { status: 500 });
  }
}
export const DELETE = withAdminAuth(handleDELETE);
