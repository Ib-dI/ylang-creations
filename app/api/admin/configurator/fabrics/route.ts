import { configuratorFabric } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient, supabaseAdmin } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";


// Public GET: List all fabrics
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

// Admin POST: Add a new fabric
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    
    if (!body.id || !body.name || !body.baseColor || !body.image || !body.category) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    await db.insert(configuratorFabric).values({
      id: body.id,
      name: body.name,
      price: body.price || 0,
      baseColor: body.baseColor,
      image: body.image,
      category: body.category,
      isActive: body.isActive ?? true,
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

// Admin PUT: Update a fabric
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const body = await request.json();
    console.log("Updating fabric with ID:", id, "payload:", body);
    const { id: _, updatedAt: __, createdAt: ___, ...updateData } = body;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
    }

    const result = await db.update(configuratorFabric)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(configuratorFabric.id, id));

    console.log("Update result:", result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating fabric:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du tissu" }, { status: 500 });
  }
}

// Admin DELETE: Remove a fabric
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
       return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    // 1. Fetch fabric to get image URL
    const fabricRecord = await db.select().from(configuratorFabric).where(eq(configuratorFabric.id, id)).limit(1);
    if (fabricRecord.length > 0) {
      const imageUrl = fabricRecord[0].image;
      // 2. Supprimer les images du stockage Supabase (bucket "products")
      if (imageUrl && imageUrl.includes("/products/") && supabaseAdmin) {
        const parts = imageUrl.split("/products/");
        if (parts.length > 1) {
          const relativePath = parts[1];
          const { error } = await supabaseAdmin.storage.from("products").remove([relativePath]);
          if (error) {
            console.error("Erreur lors de la suppression de l'image du storage:", error.message);
          } else {
            console.log("Image du tissu supprimée:", relativePath);
          }
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
