import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

// Get base URL - prioritize explicit config, then Vercel URL, then default to origin
function getBaseURL(): string | undefined {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  // On Vercel, use the production URL
  if (process.env.VERCEL) {
    return `https://${process.env.VERCEL_URL || "ylang-creations.vercel.app"}`;
  }
  return undefined; // Will default to origin
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: getBaseURL(),
  basePath: "/api/auth",
  trustedOrigins: process.env.VERCEL 
    ? [
        `https://${process.env.VERCEL_URL || "ylang-creations.vercel.app"}`,
        "https://ylang-creations.vercel.app",
      ]
    : undefined,
});
