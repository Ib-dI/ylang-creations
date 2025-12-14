import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Crée un client Supabase pour le middleware
 * Gère les cookies et les sessions pour les requêtes middleware
 */
export function createMiddlewareClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Créer le client Supabase avec les headers de la requête
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Forward cookies from request
        cookie: request.headers.get("cookie") || "",
      },
    },
  });

  return { supabase, response };
}

