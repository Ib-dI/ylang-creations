import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Please configure it in your environment variables.");
  // Don't throw during build time, but log the error
} else {
  // Log connection info (without sensitive data) for debugging
  const dbUrl = process.env.DATABASE_URL;
  const urlObj = new URL(dbUrl);
  console.log("📊 Database connection info:", {
    host: urlObj.hostname,
    port: urlObj.port || "5432 (default)",
    database: urlObj.pathname.replace("/", ""),
    sslMode: urlObj.searchParams.get("sslmode") || "not specified",
  });
}

// Determine SSL configuration based on connection string
function getSSLConfig() {
  const connectionString = process.env.DATABASE_URL || "";
  
  // Supabase and most cloud databases require SSL
  if (
    connectionString.includes("supabase") ||
    connectionString.includes("neon.tech") ||
    connectionString.includes("vercel-storage.com") ||
    connectionString.includes("railway.app") ||
    connectionString.includes("render.com")
  ) {
    return {
      rejectUnauthorized: false, // Required for Supabase and most cloud providers
    };
  }
  
  // Check if connection string explicitly requires SSL
  if (
    connectionString.includes("sslmode=require") ||
    connectionString.includes("ssl=true")
  ) {
    return {
      rejectUnauthorized: false,
    };
  }
  
  // Default: no SSL for local development
  return false;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  // Add connection pool configuration for better reliability on Vercel
  max: 1, // Vercel serverless functions work better with limited connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000, // Increased timeout for Supabase
  // SSL configuration for Supabase and cloud databases
  ssl: getSSLConfig(),
  // Additional options for better connection handling
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("❌ Unexpected database pool error:", err);
});

export const db = drizzle(pool, { schema });
