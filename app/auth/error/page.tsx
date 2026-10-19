"use client";

import { AuthShell, authPrimaryButtonClass, authPrimaryButtonStyle } from "@/components/auth/auth-shell";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// Lien expiré ou déjà utilisé : on propose d'en recevoir un nouveau
function ErrorContent() {
  const searchParams = useSearchParams();
  const isRecovery = searchParams.get("reason") === "recovery";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const supabase = createClient();

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = isRecovery
      ? await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
      : await supabase.auth.resend({ type: "signup", email });

    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: "Impossible d'envoyer le lien. Réessayez dans quelques minutes." });
    } else {
      setMessage({
        type: "success",
        text: "Si un compte existe avec cet email, un nouveau lien vient de vous être envoyé.",
      });
    }
  };

  return (
    <AuthShell
      title="Lien expiré"
      subtitle={
        isRecovery
          ? "Ce lien de réinitialisation n'est plus valide. Recevez-en un nouveau ci-dessous."
          : "Ce lien de confirmation n'est plus valide ou a déjà été utilisé. Recevez-en un nouveau ci-dessous."
      }
    >
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

      <form onSubmit={handleResend} className="space-y-8">
        <div style={{ borderBottom: "var(--rule-soft)" }}>
          <input
            type="email"
            required
            placeholder="Email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full bg-transparent py-3 font-body text-base outline-none placeholder:opacity-40 disabled:opacity-40"
            style={{ color: "var(--color-ink)" }}
          />
        </div>

        <button type="submit" disabled={loading} className={authPrimaryButtonClass} style={authPrimaryButtonStyle}>
          {loading ? "Envoi…" : "Renvoyer le lien"}
        </button>
      </form>

      <p className="mt-8 text-center font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
        <Link
          href="/sign-in"
          className="transition-opacity hover:opacity-70"
          style={{ color: "var(--color-ink)", borderBottom: "1px solid var(--color-accent)" }}
        >
          Retour à la connexion
        </Link>
      </p>
    </AuthShell>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthShell title="Lien expiré" />}>
      <ErrorContent />
    </Suspense>
  );
}
