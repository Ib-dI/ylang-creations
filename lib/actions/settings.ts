"use server";

import { settings } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

const SETTINGS_ID = "main-settings";

export async function getCachedSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");

  return await db
    .select()
    .from(settings)
    .where(eq(settings.id, SETTINGS_ID))
    .limit(1);
}
