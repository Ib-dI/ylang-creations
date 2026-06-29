"use client";

import { createClient } from "@/utils/supabase/client";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
      return;
    }

    setMessage({
      type: "success",
      text: "Compte créé ! Vérifiez votre email pour confirmer votre inscription.",
    });
    setLoading(false);
    setTimeout(() => router.push("/"), 2000);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
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
            Créer un compte
          </h1>
          <p className="mt-3 font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
            Rejoignez l'univers Ylang Créations
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className="mb-6 flex items-start gap-3 px-4 py-3"
            style={{ background: "var(--color-paper-2)", border: "var(--rule-soft)" }}
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
            <p className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
              {message.text}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-8">
          <div className="space-y-6">
            {/* Nom */}
            <div
              style={{ borderBottom: "var(--rule-soft)" }}
            >
              <input
                type="text"
                required
                placeholder="Nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent py-3 font-body text-base outline-none placeholder:opacity-40 disabled:opacity-40"
                style={{ color: "var(--color-ink)" }}
              />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="flex items-center" style={{ borderBottom: "var(--rule-soft)" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Mot de passe"
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-body text-sm tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
          >
            {loading ? "Création…" : "S'inscrire"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1" style={{ borderTop: "var(--rule-soft)" }} />
          <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>ou</span>
          <div className="flex-1" style={{ borderTop: "var(--rule-soft)" }} />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 py-3.5 font-body text-sm transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ border: "var(--rule-soft)", color: "var(--color-ink)" }}
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          S'inscrire avec Google
        </button>

        {/* Sign-in link */}
        <p className="mt-8 text-center font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
          Déjà un compte ?{" "}
          <Link
            href="/sign-in"
            className="transition-opacity hover:opacity-70"
            style={{ color: "var(--color-ink)", borderBottom: "1px solid var(--color-accent)" }}
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
