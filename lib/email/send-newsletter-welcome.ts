import { NewsletterWelcomeEmail } from "@/emails/newsletter-welcome";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

// ============================================
// CONFIGURATION EXPÉDITEUR
// ============================================
// 🧪 Mode Sandbox (actif) - Pour les tests avec Resend
const FROM_EMAIL_NEWSLETTER = "Ylang Créations <onboarding@resend.dev>";

// 🚀 Mode Production (à activer quand le domaine sera vérifié)
// const FROM_EMAIL_NEWSLETTER = 'Ylang Créations <newsletter@ylang-creations.fr>'
// ============================================

export async function sendNewsletterWelcomeEmail(params: {
  to: string;
  unsubscribeToken: string;
}) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?token=${params.unsubscribeToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL_NEWSLETTER,
      to: [params.to],
      subject: "Bienvenue dans l'univers Ylang Créations ✨",
      react: NewsletterWelcomeEmail({ unsubscribeUrl }),
    });

    if (error) {
      console.error("❌ Erreur envoi email newsletter:", error);
      return { success: false, error };
    }

    console.log("✅ Email bienvenue newsletter envoyé:", data?.id);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Erreur Resend newsletter:", error);
    return { success: false, error };
  }
}
