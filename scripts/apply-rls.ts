import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function applyRLS() {
  // Import db dynamically after dotenv loads
  const { db } = await import("../lib/db");

  try {
    const migrationPath = path.join(
      process.cwd(),
      "drizzle",
      "rls_policies.sql",
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    console.log("Applying RLS policies from:", migrationPath);

    // Execute raw SQL
    await db.execute(sql.raw(migrationSQL));

    console.log("✅ RLS policies applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error applying RLS policies:", error);
    process.exit(1);
  }
}

applyRLS();
