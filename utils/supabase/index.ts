/**
 * Exports centralisés pour les clients Supabase
 *
 * Utilisation :
 * - Côté client : import { supabase } from "@/utils/supabase"
 * - Côté serveur : import { supabaseAdmin, createServerClient } from "@/utils/supabase"
 * - Middleware : import { updateSession } from "@/utils/supabase"
 */

export { supabase } from "./client";
export { updateSession } from "./middleware";
export { createClient as createServerClient, supabaseAdmin } from "./server";
