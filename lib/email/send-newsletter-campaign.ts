import { NewsletterCampaignEmail } from "@/emails/newsletter-campaign";
import { sendEmailBatch } from "./brevo";
import { getEmailEnv } from "./env";
import { renderEmail } from "./render";

const BATCH_SIZE = 100;

export async function sendNewsletterCampaign(params: {
  subject: string;
  htmlContent: string;
  subscribers: Array<{ email: string; unsubscribeToken: string }>;
}): Promise<{ sent: number; failed: number }> {
  const { subject, htmlContent, subscribers } = params;
  const { NEXT_PUBLIC_APP_URL } = getEmailEnv();
  let sent = 0;
  let failed = 0;

  // Découper en lots de 100
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const batchNumber = i / BATCH_SIZE + 1;

    const versions = await Promise.all(
      batch.map(async (subscriber) => {
        const unsubscribeUrl = `${NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;
        return {
          to: { email: subscriber.email },
          html: await renderEmail(
            NewsletterCampaignEmail({ htmlContent, unsubscribeUrl }),
          ),
        };
      }),
    );

    const result = await sendEmailBatch({ subject, versions, tags: ["newsletter"] });

    if (result.success) {
      sent += batch.length;
      console.log(`✅ Lot ${batchNumber} envoyé : ${batch.length} emails`);
    } else {
      failed += batch.length;
      console.error(`❌ Erreur batch newsletter (lot ${batchNumber}):`, result.error);
    }
  }

  return { sent, failed };
}
