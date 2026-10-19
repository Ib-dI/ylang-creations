import { createClient } from "@/utils/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Lien des emails de compte : vérifie le token_hash et ouvre la session.
// Contrairement au flux PKCE (/auth/callback), le lien fonctionne même s'il
// est ouvert sur un autre appareil que celui de la demande.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/";
  // Chemins internes uniquement
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      // Après une réinitialisation, on va directement au formulaire
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}${next}`);
      }
      return NextResponse.redirect(
        `${origin}/auth/confirmed?next=${encodeURIComponent(next)}`,
      );
    }

    console.error("[Auth confirm] verifyOtp:", error.message);
  }

  const reason = type === "recovery" ? "recovery" : "signup";
  return NextResponse.redirect(`${origin}/auth/error?reason=${reason}`);
}
