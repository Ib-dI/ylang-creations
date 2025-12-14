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
  const isSupabase = dbUrl.includes("supabase");
  const isPooler = dbUrl.includes("pooler") || urlObj.port === "6543";
  
  console.log("📊 Database connection info:", {
    host: urlObj.hostname,
    port: urlObj.port || "5432 (default)",
    database: urlObj.pathname.replace("/", ""),
    sslMode: urlObj.searchParams.get("sslmode") || "not specified",
    isSupabase,
    isPooler,
    recommendation: isSupabase && !isPooler 
      ? "⚠️ Consider using Supabase connection pooler (port 6543) for better serverless compatibility"
      : undefined,
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

// Create pool with optimized settings for Vercel serverless
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  // Vercel serverless functions work better with limited connections
  max: 1,
  // Timeouts optimized for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // Increased for Supabase pooler
  // SSL configuration for Supabase and cloud databases
  ssl: getSSLConfig(),
  // Keep-alive for better connection reuse
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // Statement timeout to prevent hanging queries
  statement_timeout: 30000,
});

// Type for PostgreSQL connection errors
interface PostgresError extends Error {
  code?: string;
  errno?: number | string;
  syscall?: string;
  hostname?: string;
}

// Handle pool errors with detailed logging
pool.on("error", (err: PostgresError) => {
  console.error("❌ Unexpected database pool error:", {
    message: err.message,
    code: err.code,
    errno: err.errno,
    syscall: err.syscall,
    hostname: err.hostname,
  });
  
  // If it's a connection error, provide helpful guidance
  if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
    const dbUrl = process.env.DATABASE_URL || "";
    if (dbUrl.includes("supabase") && !dbUrl.includes("pooler")) {
      console.error("💡 Tip: For Supabase on Vercel, use the connection pooler:");
      console.error("   - Port 6543 (Transaction mode) or 5432 (Session mode)");
      console.error("   - Format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require");
    }
  }
});

export const db = drizzle(pool, { schema });
