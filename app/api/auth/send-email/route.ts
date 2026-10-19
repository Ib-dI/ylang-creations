import {
  sendAuthEmail,
  type SupabaseEmailHookPayload,
} from "@/lib/email/send-auth-email";
import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";

// Supabase Send Email Hook : Supabase Auth nous délègue l'envoi de tous ses
// emails (confirmation, réinitialisation, notifications de sécurité).
// À configurer dans Supabase > Authentication > Hooks > Send Email (HTTPS).

function hookError(httpCode: number, message: string) {
  return NextResponse.json(
    { error: { http_code: httpCode, message } },
    { status: httpCode },
  );
}

export async function POST(request: Request) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;
  if (!secret) {
    console.error("[Auth email hook] SEND_EMAIL_HOOK_SECRET manquant");
    return hookError(500, "Hook non configuré");
  }

  // La signature porte sur le corps brut : ne pas parser avant de vérifier
  const rawBody = await request.text();
  let payload: SupabaseEmailHookPayload;
  try {
    const webhook = new Webhook(secret.replace("v1,whsec_", ""));
    payload = webhook.verify(
      rawBody,
      Object.fromEntries(request.headers),
    ) as SupabaseEmailHookPayload;
  } catch {
    return hookError(401, "Signature invalide");
  }

  const result = await sendAuthEmail(payload);
  if (!result.success) {
    // Supabase remonte l'erreur à l'utilisateur (ex : inscription échouée)
    return hookError(500, "L'email n'a pas pu être envoyé");
  }

  return NextResponse.json({});
}
