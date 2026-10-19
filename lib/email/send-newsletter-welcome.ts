import { NewsletterWelcomeEmail } from "@/emails/newsletter-welcome";
import { sendEmail } from "./brevo";
import { getEmailEnv } from "./env";
import { renderEmail } from "./render";

export async function sendNewsletterWelcomeEmail(params: {
  to: string;
  unsubscribeToken: string;
}) {
  const { NEXT_PUBLIC_APP_URL } = getEmailEnv();
  const unsubscribeUrl = `${NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?token=${params.unsubscribeToken}`;

  return sendEmail({
    to: [{ email: params.to }],
    subject: "Bienvenue dans l'univers Ylang Créations ✨",
    html: await renderEmail(NewsletterWelcomeEmail({ unsubscribeUrl })),
    tags: ["newsletter"],
  });
}
