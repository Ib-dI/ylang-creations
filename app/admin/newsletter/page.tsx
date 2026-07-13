import { NewsletterClient } from "@/components/admin/newsletter-client";
import { getNewsletterData } from "@/lib/admin/get-newsletter-data";

export default async function NewsletterPage() {
  const subscribers = await getNewsletterData();

  return <NewsletterClient initialSubscribers={subscribers} />;
}
