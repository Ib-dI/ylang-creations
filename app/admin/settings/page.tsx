import {
  SettingsClient,
  type SettingsState,
} from "@/components/admin/settings-client";
import { settings } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

const SETTINGS_ID = "main-settings";

async function getSettings(): Promise<Partial<SettingsState> | null> {
  try {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.id, SETTINGS_ID))
      .limit(1);

    if (result.length === 0) return null;

    const s = result[0];
    return {
      ...s,
      emailTemplates: s.emailTemplates ?? {},
      notifications: s.notifications ?? {},
      heroSlides: s.heroSlides ?? [],
      testimonials: s.testimonials ?? [],
    } as any; // Cast as any temporarily to avoid deep object parsing issues if any
  } catch (error) {
    console.error("Error fetching settings server-side:", error);
    return null;
  }
}

export default async function SettingsPage() {
  const initialSettings = await getSettings();

  return <SettingsClient initialSettings={initialSettings} />;
}
