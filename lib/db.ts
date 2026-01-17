import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";

// 1. Connection string setup
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(
    "❌ DATABASE_URL is not set. Please configure it in your environment variables.",
  );
}

// 2. SSL configuration helper
function getSSLConfig() {
  const connectionString = DATABASE_URL || "";
  if (
    connectionString.includes("supabase") ||
    connectionString.includes("neon.tech") ||
    connectionString.includes("vercel-storage.com") ||
    connectionString.includes("railway.app") ||
    connectionString.includes("render.com") ||
    connectionString.includes("sslmode=require") ||
    connectionString.includes("ssl=true")
  ) {
    return { rejectUnauthorized: false };
  }
  return false;
}

// 3. Singleton pattern for Global Object (Prevents multiple pools in dev)
const globalForDb = global as unknown as {
  pool: Pool | undefined;
};

// 4. Create or reuse pool
export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: DATABASE_URL,
    max: process.env.NODE_ENV === "development" ? 10 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
    ssl: getSSLConfig(),
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    statement_timeout: 30000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

// 5. Handle pool errors
pool.on("error", (err: any) => {
  console.error("❌ Unexpected database pool error:", err);
});

// 6. Export Drizzle instance
export const db = drizzle(pool, { schema });
