import { configuratorFabric, configuratorFabricCategory } from "@/db/schema";
import { db } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth/with-admin-auth";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// force-dynamic: PUT/DELETE below use request.url — see app/api/products/route.ts for why
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await db
      .select()
      .from(configuratorFabricCategory)
      .orderBy(configuratorFabricCategory.order);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

async function handlePOST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { id, title, description, order, isActive } = body;

    const [newCategory] = await db
      .insert(configuratorFabricCategory)
      .values({
        id,
        title,
        description,
        order: order || 0,
        isActive: isActive !== false,
      })
      .returning();

    revalidateTag("configurator", "max");

    return NextResponse.json({ category: newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}

async function handlePUT(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de la catégorie requis" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    updateData.updatedAt = new Date();

    const [updatedCategory] = await db
      .update(configuratorFabricCategory)
      .set(updateData)
      .where(eq(configuratorFabricCategory.id, id))
      .returning();

    if (!updatedCategory) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    revalidateTag("configurator", "max");

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la catégorie" },
      { status: 500 }
    );
  }
}

async function handleDELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de la catégorie requis" },
        { status: 400 }
      );
    }

    await db
      .delete(configuratorFabric)
      .where(eq(configuratorFabric.category, id));

    const [deletedCategory] = await db
      .delete(configuratorFabricCategory)
      .where(eq(configuratorFabricCategory.id, id))
      .returning();

    if (!deletedCategory) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    revalidateTag("configurator", "max");

    return NextResponse.json({ success: true, category: deletedCategory });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la catégorie" },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(handlePOST);
export const PUT = withAdminAuth(handlePUT);
export const DELETE = withAdminAuth(handleDELETE);
