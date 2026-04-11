import { NewsletterCampaignEmail } from "@/emails/newsletter-campaign";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

// 🧪 Mode Sandbox
const FROM_EMAIL = "Ylang Créations <onboarding@resend.dev>";
// 🚀 Production : "Ylang Créations <newsletter@ylang-creations.fr>"

const BATCH_SIZE = 100; // Limite Resend batch

export async function sendNewsletterCampaign(params: {
  subject: string;
  htmlContent: string;
  subscribers: Array<{ email: string; unsubscribeToken: string }>;
}): Promise<{ sent: number; failed: number }> {
  const { subject, htmlContent, subscribers } = params;
  let sent = 0;
  let failed = 0;

  // Découper en lots de 100
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    const emails = batch.map((subscriber) => {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;
      return {
        from: FROM_EMAIL,
        to: [subscriber.email],
        subject,
        react: NewsletterCampaignEmail({ htmlContent, unsubscribeUrl }),
      };
    });

    try {
      const { data, error } = await resend.batch.send(emails);

      if (error) {
        console.error(`❌ Erreur batch newsletter (lot ${i / BATCH_SIZE + 1}):`, error);
        failed += batch.length;
      } else {
        const batchSent = data?.data?.length ?? batch.length;
        sent += batchSent;
        console.log(`✅ Lot ${i / BATCH_SIZE + 1} envoyé : ${batchSent} emails`);
      }
    } catch (err) {
      console.error(`❌ Exception batch newsletter (lot ${i / BATCH_SIZE + 1}):`, err);
      failed += batch.length;
    }
  }

  return { sent, failed };
}
