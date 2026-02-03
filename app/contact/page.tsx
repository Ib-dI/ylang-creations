import { ContactClient } from "@/components/contact/contact-client";
import { settings } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

const SETTINGS_ID = "main-settings";

async function getSettings() {
  try {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.id, SETTINGS_ID))
      .limit(1);

    if (result.length === 0) return null;
    return result[0];
  } catch (error) {
    console.error("Error fetching settings server-side:", error);
    return null;
  }
}

export default async function ContactPage() {
  const settingsData = await getSettings();

  return <ContactClient settings={settingsData} />;
}
