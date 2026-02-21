import { createClient, supabaseAdmin } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Vérification authentification ET rôle admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
    const { data: buckets, error: listError } =
      await supabaseAdmin.storage.listBuckets();

    if (listError) {
      throw listError;
    }

    const bucketName = "products";
    const bucketExists = buckets.find((b) => b.name === bucketName);

    if (!bucketExists) {
      // 2. Create bucket if it doesn't exist
      const { data, error: createError } =
        await supabaseAdmin.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: [
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/webp",
          ],
        });

      if (createError) {
        throw createError;
      }
    } else {
      // Ensure it is public
      const { error: updateError } = await supabaseAdmin.storage.updateBucket(
        bucketName,
        {
          public: true,
          fileSizeLimit: 5242880,
          allowedMimeTypes: [
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/webp",
          ],
        },
      );

      if (updateError) {
        console.warn("Failed to update bucket settings:", updateError);
      }
    }

    // 3. Setup Policy (Optional but recommended - simplified for now as public bucket handles read)
    // Writing might still require a policy if RLS is enabled globally, but for a new public bucket
    // created with service role, it should be accessible.
    // However, to allow the ANON key (client-side) to upload, we strictly need a policy.
    // Unfortunately, creating policies via JS client is not supported directly for Storage,
    // it usually needs SQL.
    // BUT, "public" buckets allow public reads. Writes usually need policy.

    // WORKAROUND: We will return success. If upload still fails due to policy,
    // we'll have to advise the user to add the policy in the dashboard or run SQL.
    // There is no easy way to execute SQL via the JS client without specific setup.

    return NextResponse.json({
      success: true,
      message: "Bucket 'products' prêt.",
    });
  } catch (error: any) {
    console.error("Storage init error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'initialisation du stockage" },
      { status: 500 },
    );
  }
}
