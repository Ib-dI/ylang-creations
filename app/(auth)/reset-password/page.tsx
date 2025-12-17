"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      setMessage({
        type: "success",
        text: "Mot de passe mis à jour avec succès !",
      });
      setLoading(false);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F6F3] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-xs">
        <div className="flex flex-col items-center">
          <div className="relative h-24 w-24">
            <Image
              src="/logo/ylang créations_6.png"
              alt="Ylang Créations"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="font-abramo-script mt-6 text-center text-4xl tracking-tight text-[#1A1A1A]">
            Nouveau mot de passe
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Entrez votre nouveau mot de passe
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                className="pr-10"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-ylang-rose absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                className="pr-10"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div
              className={`text-center text-sm ${
                message.type === "success" ? "text-green-600" : "text-red-500"
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group bg-ylang-rose focus-visible:outline-ylang-rose relative flex w-full justify-center rounded-lg px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8D5E50] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
