import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";

if (!process.env.DATABASE_URL) {
  // Warn or throw? Throwing ensures we fail fast if config is missing.
  // However, during build time it might fail if env is not loaded.
  // For now, let's just create it.
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });
