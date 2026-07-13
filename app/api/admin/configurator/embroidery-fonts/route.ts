import { configuratorEmbroideryFont } from "@/db/schema";
import { db } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth/with-admin-auth";
import {
  createConfiguratorEmbroideryFontSchema,
  updateConfiguratorEmbroideryFontSchema,
  validateRequest,
  formatZodErrors,
} from "@/lib/validations";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// force-dynamic: uses request.url — see app/api/products/route.ts for why
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const fonts = activeOnly
      ? await db.select().from(configuratorEmbroideryFont).where(eq(configuratorEmbroideryFont.isActive, true))
      : await db.select().from(configuratorEmbroideryFont);

    return NextResponse.json({ fonts });
  } catch (error) {
    console.error("Error fetching embroidery fonts:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des polices de broderie" },
      { status: 500 },
    );
  }
}

async function handlePOST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validation = validateRequest(createConfiguratorEmbroideryFontSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.errors) }, { status: 400 });
    }

    const data = validation.data;
    await db.insert(configuratorEmbroideryFont).values({
      id: data.id,
      name: data.name,
      folder: data.folder,
      format: data.format,
      price: data.price,
      order: data.order,
      supportsThreadColor: data.supportsThreadColor,
      isActive: data.isActive,
    });

    revalidateTag("configurator", "max");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating embroidery font:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la police de broderie" },
      { status: 500 },
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
    const validation = validateRequest(updateConfiguratorEmbroideryFontSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.errors) }, { status: 400 });
    }

    if (Object.keys(validation.data).length === 0) {
      return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
    }

    await db
      .update(configuratorEmbroideryFont)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(eq(configuratorEmbroideryFont.id, id));

    revalidateTag("configurator", "max");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating embroidery font:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
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

    await db.delete(configuratorEmbroideryFont).where(eq(configuratorEmbroideryFont.id, id));

    revalidateTag("configurator", "max");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting embroidery font:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
export const DELETE = withAdminAuth(handleDELETE);
