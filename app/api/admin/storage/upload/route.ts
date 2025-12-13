// app/api/admin/storage/upload/route.ts
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.error("❌ Utilisateur non authentifié");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("✅ Utilisateur authentifié:", session.user.email);

    // 2. Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("❌ Variables d'environnement manquantes:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceRoleKey,
      });
      return NextResponse.json(
        { error: "Configuration Supabase manquante (URL ou Service Role Key)" },
        { status: 500 },
      );
    }

    console.log("✅ Configuration Supabase OK");

    // 3. Récupérer le fichier et le chemin
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

    // 4. Créer le client Supabase avec Service Role Key
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 5. Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Upload vers Supabase Storage
    const { data, error } = await supabase.storage
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

    // 7. Obtenir l'URL publique
    const { data: publicUrlData } = supabase.storage
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Extraire le chemin relatif
    const relativePath = path.includes("/products/")
      ? path.split("/products/")[1]
      : path;

    console.log("🗑️ Deleting file:", relativePath);

    const { error } = await supabase.storage
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
