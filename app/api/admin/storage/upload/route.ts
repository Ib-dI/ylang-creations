// app/api/admin/storage/upload/route.ts
import {
  ADMIN_IMAGE_ALLOWED_MIME_TYPES,
  ADMIN_IMAGE_MAX_SIZE,
  toStoragePath,
} from "@/lib/admin/image-storage";
import { withAdminAuth } from "@/lib/auth/with-admin-auth";
import { supabaseAdmin } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_MIME_TYPES: readonly string[] = ADMIN_IMAGE_ALLOWED_MIME_TYPES;
const MAX_FILE_SIZE = ADMIN_IMAGE_MAX_SIZE;

async function handlePOST(request: Request): Promise<Response> {
  try {
    console.log("✅ Utilisateur authentifié via withAdminAuth");

    // Récupérer le fichier et le chemin
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

    // Validation du type de fichier
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.error("❌ Type de fichier non autorisé:", file.type);
      return NextResponse.json(
        {
          error:
            "Type de fichier non autorisé. Formats acceptés: PNG, JPEG, GIF, WebP",
        },
        { status: 400 },
      );
    }

    // Validation de la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      console.error("❌ Fichier trop volumineux:", file.size);
      return NextResponse.json(
        { error: "Le fichier ne doit pas dépasser 5MB" },
        { status: 400 },
      );
    }

    // Validation du chemin (éviter les attaques de traversée de répertoire)
    const sanitizedPath = path.replace(/\.\./g, "").replace(/\/\//g, "/");
    if (sanitizedPath !== path) {
      console.error("❌ Chemin suspect détecté:", path);
      return NextResponse.json(
        { error: "Chemin de fichier invalide" },
        { status: 400 },
      );
    }

    console.log("📤 Uploading file:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      path: sanitizedPath,
    });

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload vers Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("products")
      .upload(sanitizedPath, buffer, {
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

    // Obtenir l'URL publique
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
export const POST = withAdminAuth(handlePOST);

// Route DELETE pour supprimer les images
async function handleDELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Chemin du fichier requis" },
        { status: 400 },
      );
    }

    // Accepte une URL publique complète ou un chemin déjà relatif
    const relativePath = toStoragePath(path);

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
export const DELETE = withAdminAuth(handleDELETE);
