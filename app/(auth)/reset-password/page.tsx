"use client";

import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Mot de passe mis à jour avec succès !" });
      setTimeout(() => router.push("/"), 2000);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-16"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <div className="relative mb-8 h-16 w-16">
            <Image src="/logo/ylang créations_6.png" alt="Ylang Créations" fill className="object-contain" />
          </div>
          <p className="type-overline mb-3" style={{ color: "var(--color-accent)" }}>
            Espace client
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-headline)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--color-ink)",
            }}
          >
            Nouveau mot de passe
          </h1>
          <p className="mt-3 font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
            Entrez votre nouveau mot de passe
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className="mb-6 flex items-start gap-3 px-4 py-3"
            style={{ background: "var(--color-paper-2)", border: "var(--rule-soft)" }}
            role="alert"
          >
            {message.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
            )}
            <p className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
              {message.text}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-8">
          <div className="space-y-6">
            {/* New password */}
            <div className="flex items-center" style={{ borderBottom: "var(--rule-soft)" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent py-3 font-body text-base outline-none placeholder:opacity-40 disabled:opacity-40"
                style={{ color: "var(--color-ink)" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pl-2 transition-opacity hover:opacity-60"
                style={{ color: "var(--color-ink-3)" }}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </div>

            {/* Confirm password */}
            <div style={{ borderBottom: "var(--rule-soft)" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent py-3 font-body text-base outline-none placeholder:opacity-40 disabled:opacity-40"
                style={{ color: "var(--color-ink)" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-body text-sm tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
          >
            {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
