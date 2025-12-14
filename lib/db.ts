import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Please configure it in your environment variables.");
  // Don't throw during build time, but log the error
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  // Add connection pool configuration for better reliability on Vercel
  max: 1, // Vercel serverless functions work better with limited connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });
