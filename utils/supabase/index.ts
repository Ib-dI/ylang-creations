/**
 * Exports centralisés pour les clients Supabase
 *
 * Utilisation :
 * - Côté client : import { supabase } from "@/utils/supabase"
 * - Côté serveur : import { supabaseAdmin, createServerClient } from "@/utils/supabase"
 * - Middleware : import { createMiddlewareClient } from "@/utils/supabase"
 */

export { supabase } from "./client";
export { createClient as createMiddlewareClient } from "./middleware";
export { createClient as createServerClient, supabaseAdmin } from "./server";
