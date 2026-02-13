"use server";

import { settings } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

const SETTINGS_ID = "main-settings";

export const getCachedSettings = unstable_cache(
  async () => {
    return await db
      .select()
      .from(settings)
      .where(eq(settings.id, SETTINGS_ID))
      .limit(1);
  },
  ["main-settings"],
  {
    revalidate: 3600, // 1 hour
    tags: ["settings"],
  },
);
