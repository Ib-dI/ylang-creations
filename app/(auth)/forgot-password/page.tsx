"use client";

import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";
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

    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
      });
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
            Mot de passe oublié
          </h1>
          <p className="mt-3 font-body text-sm text-center" style={{ color: "var(--color-ink-3)" }}>
            Entrez votre email pour recevoir un lien de réinitialisation
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
        <form onSubmit={handleResetPassword} className="space-y-8">
          <div style={{ borderBottom: "var(--rule-soft)" }}>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-transparent py-3 font-body text-base outline-none placeholder:opacity-40 disabled:opacity-40"
              style={{ color: "var(--color-ink)" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-body text-sm tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
          >
            {loading ? "Envoi…" : "Envoyer le lien"}
          </button>
        </form>

        {/* Back link */}
        <p className="mt-8 text-center font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
          <Link
            href="/sign-in"
            className="transition-opacity hover:opacity-70"
            style={{ color: "var(--color-ink)", borderBottom: "1px solid var(--color-accent)" }}
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
