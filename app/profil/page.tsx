"use client";

import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form states
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setUser(user);
      setFullName(
        user.user_metadata?.full_name || user.user_metadata?.name || "",
      );
      setLoading(false);
    };

    getUser();
  }, [router, supabase]);

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
    } catch (error: any) {
      showMessage("error", error.message || "Erreur lors de la mise à jour");
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
        .from("avatars") // Ensure this bucket exists or use 'public' if previously configured
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
    } catch (error: any) {
      console.error("Avatar upload error:", error);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F6F3]">
        <div className="border-ylang-rose h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F3] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-abramo-script text-ylang-charcoal mb-2 text-5xl">
            Mon Profil
          </h1>
          <p className="text-ylang-charcoal/60">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Sidebar / User Card */}
          <div className="md:col-span-1">
            <div className="shadow-card hover:shadow-elevated rounded-3xl bg-white p-6 transition-shadow duration-300">
              <AvatarUpload
                value={user?.user_metadata?.avatar_url}
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />

              <div className="mt-6 text-center">
                <h2 className="text-ylang-charcoal text-xl font-bold">
                  {fullName || "Utilisateur"}
                </h2>
                <p className="text-ylang-charcoal/40 text-sm break-all">
                  {user?.email}
                </p>
              </div>

              <div className="border-ylang-beige mt-8 border-t border-dashed pt-6">
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start gap-2 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content / Forms */}
          <div className="space-y-6 md:col-span-2">
            <form
              onSubmit={handleUpdateProfile}
              className="shadow-card rounded-3xl bg-white p-8"
            >
              <div className="border-ylang-beige mb-6 flex items-center gap-3 border-b pb-4">
                <div className="bg-ylang-rose/10 text-ylang-rose flex h-10 w-10 items-center justify-center rounded-xl">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-ylang-charcoal text-lg font-bold">
                    Informations personnelles
                  </h3>
                  <p className="text-ylang-charcoal/50 text-sm">
                    Mettez à jour vos informations de base
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="fullName"
                    className="text-ylang-charcoal/80 text-sm font-medium"
                  >
                    Nom complet
                  </label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFullName(e.target.value)
                    }
                    className="border-ylang-beige bg-ylang-cream/50 focus:border-ylang-rose focus:ring-ylang-rose rounded-xl"
                    placeholder="Votre nom"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-ylang-charcoal/80 text-sm font-medium">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <Input
                      disabled
                      value={user?.email}
                      className="border-ylang-beige rounded-xl bg-gray-50 pr-10 text-gray-500"
                    />
                    <Mail className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="border-ylang-beige mt-10 mb-6 flex items-center gap-3 border-b pb-4">
                <div className="bg-ylang-rose/10 text-ylang-rose flex h-10 w-10 items-center justify-center rounded-xl">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-ylang-charcoal text-lg font-bold">
                    Sécurité
                  </h3>
                  <p className="text-ylang-charcoal/50 text-sm">
                    Modifiez votre mot de passe
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-ylang-charcoal/80 text-sm font-medium"
                  >
                    Nouveau mot de passe
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    className="border-ylang-beige bg-ylang-cream/50 focus:border-ylang-rose focus:ring-ylang-rose rounded-xl"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-ylang-charcoal/80 text-sm font-medium"
                  >
                    Confirmer le mot de passe
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="border-ylang-beige bg-ylang-cream/50 focus:border-ylang-rose focus:ring-ylang-rose rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`mt-6 flex items-center gap-3 rounded-xl p-4 ${
                    message.type === "success"
                      ? "border border-green-100 bg-green-50 text-green-700"
                      : "border border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  ) : (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-current font-bold">
                      !
                    </div>
                  )}
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <Button
                  type="submit"
                  disabled={updating || uploadingAvatar}
                  className="bg-ylang-rose rounded-xl px-8 py-6 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#8D5E50] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {updating ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
