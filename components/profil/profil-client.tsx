"use client";

import { AvatarUpload } from "@/components/ui/avatar-upload";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  CheckCircle2,
  Lock,
  LogOut,
  Mail,
  Save,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfilClientProps {
  initialUser: User;
}

export default function ProfilClient({ initialUser }: ProfilClientProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(
    user.user_metadata?.full_name || user.user_metadata?.name || "",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      const updates: { data?: { full_name: string }; password?: string } = {};

      if (fullName !== user?.user_metadata?.full_name) {
        updates.data = { full_name: fullName };
      }

      if (password) {
        if (password.length < 6) {
          throw new Error("Le mot de passe doit faire au moins 6 caractères");
        }
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas");
        }
        updates.password = password;
      }

      if (Object.keys(updates).length === 0) {
        setUpdating(false);
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      showMessage("success", "Profil mis à jour avec succès");
      setPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
      showMessage("error", msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    setMessage(null);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) throw updateError;

      setUser({
        ...user,
        user_metadata: { ...user.user_metadata, avatar_url: publicUrl },
      });
      showMessage("success", "Photo de profil mise à jour");
    } catch {
      showMessage(
        "error",
        "Erreur lors de l'upload de l'image (Vérifiez que le bucket 'avatars' existe)",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div
      className="min-h-screen px-4 py-16 sm:px-6 lg:px-8"
      style={{ background: "var(--color-paper-2)" }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>
            Mon compte
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "1.75rem",
              color: "var(--color-ink)",
            }}
          >
            Mon Profil
          </h1>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div
              className="p-6"
              style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}
            >
              <AvatarUpload
                value={user?.user_metadata?.avatar_url}
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />

              <div className="mt-6 text-center">
                <h2
                  className="text-lg"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    color: "var(--color-ink)",
                  }}
                >
                  {fullName || "Utilisateur"}
                </h2>
                <p
                  className="font-body mt-1 break-all text-sm"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  {user?.email}
                </p>
              </div>

              <div className="mt-8 pt-6" style={{ borderTop: "var(--rule-soft)" }}>
                <button
                  onClick={handleSignOut}
                  className="font-body flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6 md:col-span-2">
            <form
              onSubmit={handleUpdateProfile}
              className="p-8"
              style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}
            >
              {/* Section informations */}
              <div
                className="mb-6 flex items-center gap-3 pb-4"
                style={{ borderBottom: "var(--rule-soft)" }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center"
                  style={{ border: "var(--rule-soft)" }}
                >
                  <UserIcon className="h-5 w-5" style={{ color: "var(--color-ink-3)" }} />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: "1rem",
                      color: "var(--color-ink)",
                    }}
                  >
                    Informations personnelles
                  </h3>
                  <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                    Mettez à jour vos informations de base
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="font-body text-xs uppercase tracking-wide"
                    style={{ color: "var(--color-ink-3)" }}
                  >
                    Nom complet
                  </label>
                  <input
                    id="fullName"
                    value={fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFullName(e.target.value)
                    }
                    placeholder="Votre nom"
                    className="font-body flex h-11 w-full border border-gray-200 bg-white px-4 text-sm text-gray-800 placeholder:text-gray-300 transition-[border-color] duration-200 hover:border-gray-300 focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="font-body text-xs uppercase tracking-wide"
                    style={{ color: "var(--color-ink-3)" }}
                  >
                    Adresse Email
                  </label>
                  <div className="relative">
                    <input
                      disabled
                      value={user?.email}
                      readOnly
                      className="font-body flex h-11 w-full cursor-not-allowed border border-gray-200 bg-gray-50 px-4 pr-10 text-sm text-gray-400"
                    />
                    <Mail className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-300" />
                  </div>
                </div>
              </div>

              {/* Section sécurité */}
              <div
                className="mb-6 mt-10 flex items-center gap-3 pb-4"
                style={{ borderBottom: "var(--rule-soft)" }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center"
                  style={{ border: "var(--rule-soft)" }}
                >
                  <Lock className="h-5 w-5" style={{ color: "var(--color-ink-3)" }} />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: "1rem",
                      color: "var(--color-ink)",
                    }}
                  >
                    Sécurité
                  </h3>
                  <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                    Modifiez votre mot de passe
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="font-body text-xs uppercase tracking-wide"
                    style={{ color: "var(--color-ink-3)" }}
                  >
                    Nouveau mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    className="font-body flex h-11 w-full border border-gray-200 bg-white px-4 text-sm text-gray-800 placeholder:text-gray-300 transition-[border-color] duration-200 hover:border-gray-300 focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="font-body text-xs uppercase tracking-wide"
                    style={{ color: "var(--color-ink-3)" }}
                  >
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    className="font-body flex h-11 w-full border border-gray-200 bg-white px-4 text-sm text-gray-800 placeholder:text-gray-300 transition-[border-color] duration-200 hover:border-gray-300 focus:border-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`mt-6 flex items-center gap-3 p-4 ${
                    message.type === "success"
                      ? "border border-green-100 bg-green-50 text-green-700"
                      : "border border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  ) : (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center border-2 border-current font-bold text-xs">
                      !
                    </div>
                  )}
                  <p className="font-body text-sm font-medium">{message.text}</p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={updating || uploadingAvatar}
                  className="font-body inline-flex h-11 items-center gap-2 px-8 text-sm tracking-wide transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
                  style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
                >
                  <Save className="h-4 w-4" />
                  {updating ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
