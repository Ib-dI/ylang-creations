import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Client Supabase pour le serveur (Server Components, API Routes)
 * Utilise la Service Role Key pour les opérations admin
 * Ne jamais utiliser ce client dans les composants client !
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Forward cookies if needed
        cookie: cookieStore.toString(),
      },
    },
  });
}

/**
 * Client admin Supabase pour les opérations backend
 * À utiliser UNIQUEMENT dans les API routes
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

