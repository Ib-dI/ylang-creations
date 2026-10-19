import { AccountActionEmail } from "@/emails/account-action";
import { PasswordChangedEmail } from "@/emails/password-changed";
import { sendEmail, type SendEmailResult } from "./brevo";
import { getEmailEnv } from "./env";
import { renderEmail } from "./render";

// ============================================
// EMAILS DE COMPTE (Supabase Send Email Hook)
// https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
// ============================================

export interface SupabaseEmailHookPayload {
  user: { email: string; user_metadata?: { full_name?: string } };
  email_data: {
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
  };
}

// Types acceptés par supabase.auth.verifyOtp() sur la route /auth/confirm
const VERIFY_TYPES: Record<string, string> = {
  signup: "email",
  magiclink: "email",
  email: "email",
  invite: "invite",
  recovery: "recovery",
};

const ACTION_COPY: Record<
  string,
  { subject: string; title: string; intro: string; ctaLabel: string; ignoreNote: string; defaultNext: string }
> = {
  signup: {
    subject: "Confirmez votre adresse email ✨",
    title: "Bienvenue chez Ylang Créations !",
    intro:
      "Merci pour votre inscription. Confirmez votre adresse email pour activer votre compte et suivre vos commandes.",
    ctaLabel: "Confirmer mon email",
    ignoreNote:
      "Vous n'avez pas créé de compte ? Ignorez simplement cet email, aucun compte ne sera activé.",
    defaultNext: "/",
  },
  recovery: {
    subject: "Réinitialisation de votre mot de passe",
    title: "Réinitialisez votre mot de passe",
    intro:
      "Vous avez demandé à réinitialiser le mot de passe de votre compte. Cliquez sur le bouton ci-dessous pour en choisir un nouveau. Ce lien est valable pendant une heure.",
    ctaLabel: "Choisir un nouveau mot de passe",
    ignoreNote:
      "Vous n'êtes pas à l'origine de cette demande ? Ignorez cet email, votre mot de passe actuel reste inchangé.",
    defaultNext: "/reset-password",
  },
  magiclink: {
    subject: "Votre lien de connexion",
    title: "Connexion à votre compte",
    intro: "Cliquez sur le bouton ci-dessous pour vous connecter à votre compte Ylang Créations.",
    ctaLabel: "Me connecter",
    ignoreNote: "Vous n'avez pas demandé ce lien ? Ignorez simplement cet email.",
    defaultNext: "/",
  },
  invite: {
    subject: "Vous êtes invité(e) sur Ylang Créations",
    title: "Vous avez été invité(e)",
    intro: "Un compte Ylang Créations a été créé pour vous. Cliquez ci-dessous pour l'activer.",
    ctaLabel: "Activer mon compte",
    ignoreNote: "Vous n'attendiez pas cette invitation ? Ignorez simplement cet email.",
    defaultNext: "/",
  },
};
ACTION_COPY.email = ACTION_COPY.magiclink;

// N'accepte que des chemins internes, pour éviter toute redirection ouverte
function safeNextPath(redirectTo: string, appUrl: string, fallback: string): string {
  try {
    const url = new URL(redirectTo, appUrl);
    if (url.origin !== new URL(appUrl).origin) return fallback;
    const path = `${url.pathname}${url.search}`;
    return path === "/" ? fallback : path;
  } catch {
    return fallback;
  }
}

export async function sendAuthEmail(
  payload: SupabaseEmailHookPayload,
): Promise<SendEmailResult> {
  const env = getEmailEnv();
  const { user, email_data } = payload;
  const actionType = email_data.email_action_type;
  const to = [{ email: user.email, name: user.user_metadata?.full_name }];

  if (actionType === "password_changed_notification") {
    return sendEmail({
      to,
      subject: "Votre mot de passe a été modifié",
      html: await renderEmail(
        PasswordChangedEmail({
          forgotPasswordUrl: `${env.NEXT_PUBLIC_APP_URL}/forgot-password`,
          contactEmail: env.EMAIL_REPLY_TO ?? env.EMAIL_FROM,
        }),
      ),
      tags: ["compte"],
    });
  }

  const copy = ACTION_COPY[actionType];
  const verifyType = VERIFY_TYPES[actionType];
  if (!copy || !verifyType) {
    // Changement d'email, réauthentification, autres notifications :
    // fonctionnalités non utilisées par le site pour l'instant.
    console.warn(`[Auth email] Type non géré, email ignoré : ${actionType}`);
    return { success: true, messageIds: [] };
  }

  const confirmUrl = new URL("/auth/confirm", env.NEXT_PUBLIC_APP_URL);
  confirmUrl.searchParams.set("token_hash", email_data.token_hash);
  confirmUrl.searchParams.set("type", verifyType);
  confirmUrl.searchParams.set(
    "next",
    safeNextPath(email_data.redirect_to, env.NEXT_PUBLIC_APP_URL, copy.defaultNext),
  );

  return sendEmail({
    to,
    subject: copy.subject,
    html: await renderEmail(
      AccountActionEmail({
        title: copy.title,
        intro: copy.intro,
        ctaLabel: copy.ctaLabel,
        actionUrl: confirmUrl.toString(),
        ignoreNote: copy.ignoreNote,
      }),
    ),
    tags: ["compte"],
  });
}
