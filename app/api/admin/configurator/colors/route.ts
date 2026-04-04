import { configuratorColor } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

// GET: List colors (optionally filtered by type and/or active)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "product" | "embroidery"
    const activeOnly = searchParams.get("active") === "true";

    let query = db.select().from(configuratorColor).$dynamic();

    if (type && activeOnly) {
      query = query.where(and(eq(configuratorColor.type, type), eq(configuratorColor.isActive, true)));
    } else if (type) {
      query = query.where(eq(configuratorColor.type, type));
    } else if (activeOnly) {
      query = query.where(eq(configuratorColor.isActive, true));
    }

    const colors = await query.orderBy(configuratorColor.order, configuratorColor.createdAt);
    return NextResponse.json({ colors });
  } catch (error) {
    console.error("Error fetching colors:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des couleurs" }, { status: 500 });
  }
}

// POST: Create a new color
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await request.json();
    const { id, name, hex, type, order, isActive } = body;

    if (!id || !name || !hex || !type) {
      return NextResponse.json({ error: "Champs obligatoires manquants (id, name, hex, type)" }, { status: 400 });
    }
    if (type !== "product" && type !== "embroidery") {
      return NextResponse.json({ error: "type doit être 'product' ou 'embroidery'" }, { status: 400 });
    }

    const [color] = await db.insert(configuratorColor).values({
      id,
      name,
      hex,
      type,
      order: order ?? 0,
      isActive: isActive ?? true,
    }).returning();

    return NextResponse.json({ color }, { status: 201 });
  } catch (error) {
    console.error("Error creating color:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la couleur" }, { status: 500 });
  }
}

// PUT: Update a color
export async function PUT(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const body = await request.json();
    const { id: _id, createdAt: _ca, ...updates } = body;

    const [color] = await db
      .update(configuratorColor)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(configuratorColor.id, id))
      .returning();

    if (!color) return NextResponse.json({ error: "Couleur introuvable" }, { status: 404 });
    return NextResponse.json({ color });
  } catch (error) {
    console.error("Error updating color:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE: Delete a color
export async function DELETE(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    await db.delete(configuratorColor).where(eq(configuratorColor.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting color:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
