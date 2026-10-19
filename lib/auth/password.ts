import { getPasswordError } from "@/lib/validations";
import type { SupabaseClient, User } from "@supabase/supabase-js";

// Un compte créé uniquement via Google n'a pas de mot de passe
export function hasPasswordLogin(user: User): boolean {
  return user.identities?.some((identity) => identity.provider === "email") ?? false;
}

// Changement de mot de passe depuis une session ouverte : on revérifie
// d'abord le mot de passe actuel pour qu'une session laissée ouverte
// ne suffise pas à prendre le contrôle du compte.
export async function changePassword(
  supabase: SupabaseClient,
  params: { email: string; currentPassword: string; newPassword: string },
): Promise<{ error: string | null }> {
  if (!params.currentPassword) {
    return { error: "Le mot de passe actuel est requis" };
  }

  const validationError = getPasswordError(params.newPassword);
  if (validationError) return { error: validationError };

  if (params.newPassword === params.currentPassword) {
    return { error: "Le nouveau mot de passe doit être différent de l'actuel" };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.currentPassword,
  });
  if (signInError) return { error: "Mot de passe actuel incorrect" };

  const { error } = await supabase.auth.updateUser({ password: params.newPassword });
  if (error) return { error: error.message };

  return { error: null };
}
