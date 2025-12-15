// app/api/admin/storage/upload/route.ts
import { createClient, supabaseAdmin } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Force Node.js runtime for database connections
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // 1. Vérifier l'authentification
    // 1. Vérifier l'authentification
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("❌ Utilisateur non authentifié");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("✅ Utilisateur authentifié:", user.email);

    // 2. Récupérer le fichier et le chemin
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;

    if (!file || !path) {
      console.error("❌ Fichier ou chemin manquant:", {
        hasFile: !!file,
        hasPath: !!path,
      });
      return NextResponse.json(
        { error: "Fichier ou chemin manquant" },
        { status: 400 },
      );
    }

    console.log("📤 Uploading file:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      path: path,
    });

    // 3. Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload vers Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("products")
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Supabase storage upload error:", {
        message: error.message,
        error: error,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Upload successful:", data);

    // 5. Obtenir l'URL publique
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("products")
      .getPublicUrl(data.path);

    console.log("🔗 Public URL:", publicUrlData.publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
    });
  } catch (error: any) {
    console.error("💥 Upload handler error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur lors de l'upload" },
      { status: 500 },
    );
  }
}

// Bonus: Route DELETE pour supprimer les images
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Chemin du fichier requis" },
        { status: 400 },
      );
    }

    // Extraire le chemin relatif
    const relativePath = path.includes("/products/")
      ? path.split("/products/")[1]
      : path;

    console.log("🗑️ Deleting file:", relativePath);

    const { error } = await supabaseAdmin.storage
      .from("products")
      .remove([relativePath]);

    if (error) {
      console.error("❌ Delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ File deleted");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("💥 Delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
