import { newsletterSubscriber } from "@/db/schema";
import { db } from "@/lib/db";
import { desc } from "drizzle-orm";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getNewsletterData(): Promise<NewsletterSubscriber[]> {
  return db
    .select({
      id: newsletterSubscriber.id,
      email: newsletterSubscriber.email,
      status: newsletterSubscriber.status,
      createdAt: newsletterSubscriber.createdAt,
      updatedAt: newsletterSubscriber.updatedAt,
    })
    .from(newsletterSubscriber)
    .orderBy(desc(newsletterSubscriber.createdAt));
}
