"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      setMessage({
        type: "success",
        text: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
      });
      setLoading(false);
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
            Mot de passe oublié
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                required
                className=""
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Envoi..." : "Envoyer le lien"}
            </Button>
          </div>
          <div className="text-center text-sm">
            <Link
              href="/sign-in"
              className="text-ylang-rose font-medium hover:text-[#8D5E50]"
            >
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
