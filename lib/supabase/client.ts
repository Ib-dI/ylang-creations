/**
 * @deprecated Ce fichier est déprécié. Utilisez les nouveaux fichiers dans utils/supabase/
 * 
 * Migration :
 * - import { supabase } from "@/lib/supabase/client" 
 *   → import { supabase } from "@/utils/supabase/client"
 * 
 * - import { supabaseAdmin } from "@/lib/supabase/client"
 *   → import { supabaseAdmin } from "@/utils/supabase/server"
 * 
 * Ce fichier est conservé pour la rétrocompatibilité mais sera supprimé dans une future version.
 */

// Réexport depuis les nouveaux fichiers pour la rétrocompatibilité
export { supabase } from "@/utils/supabase/client";
export { supabaseAdmin } from "@/utils/supabase/server";