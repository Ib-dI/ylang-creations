"use client";

import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"email" | "google" | null>(null);
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const router = useRouter();
  const supabase = createClient();

  const showToast = (message: string, type: "error" | "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 5000);
  };

  const validateEmail = (v: string) => {
    if (!v) return "L'email est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "L'email n'est pas valide";
    return "";
  };

  const validatePassword = (v: string) => {
    if (!v) return "Le mot de passe est requis";
    if (v.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";
    return "";
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError, general: "" });
      return;
    }

    setLoadingProvider("email");
    setErrors({ email: "", password: "", general: "" });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoadingProvider(null);
      let msg = "Impossible de se connecter. Veuillez réessayer.";
      if (error.message.includes("Invalid login credentials")) msg = "Email ou mot de passe incorrect";
      else if (error.message.includes("Email not confirmed")) msg = "Veuillez confirmer votre email avant de vous connecter";
      else if (error.message.includes("Too many requests")) msg = "Trop de tentatives. Veuillez réessayer plus tard";
      setErrors((p) => ({ ...p, general: msg }));
      showToast(msg, "error");
      return;
    }

    showToast("Connexion réussie ! Redirection…", "success");
    const userRole = data.user?.app_metadata?.role;
    const next = new URLSearchParams(window.location.search).get("next");
    setTimeout(() => {
      if (next) router.replace(next);
      else if (userRole === "admin") router.replace("/admin");
      else router.replace("/");
    }, 1000);
  };

  const handleGoogleSignIn = async () => {
    setLoadingProvider("google");
    setErrors({ email: "", password: "", general: "" });
    const next = new URLSearchParams(window.location.search).get("next") ?? "/";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setLoadingProvider(null);
      const msg = "Erreur lors de la connexion avec Google. Veuillez réessayer.";
      setErrors((p) => ({ ...p, general: msg }));
      showToast(msg, "error");
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-16"
      style={{ background: "var(--color-paper)" }}
    >
      {/* Toast */}
      {toast.show && (
        <div
          className="fixed top-4 right-4 z-50"
          role="alert"
          aria-live="assertive"
        >
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{
              background: "var(--color-paper-2)",
              border: "var(--rule-soft)",
              color: "var(--color-ink)",
            }}
          >
            {toast.type === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
            )}
            <p className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
              {toast.message}
            </p>
          </div>
        </div>
      )}

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
            Connexion
          </h1>
          <p className="mt-3 font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
            Accédez à votre compte Ylang Créations
          </p>
        </div>

        {/* General error */}
        {errors.general && (
          <div
            className="mb-6 flex items-start gap-3 px-4 py-3"
            style={{ background: "var(--color-paper-2)", border: "var(--rule-soft)" }}
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
            <p className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
              {errors.general}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-8">
          <div className="space-y-6">
            {/* Email */}
            <div>
              <div
                className="flex items-center"
                style={{ borderBottom: errors.email ? "1px solid var(--color-accent)" : "var(--rule-soft)" }}
              >
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: "", general: "" }));
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  disabled={loadingProvider !== null}
                  className="w-full bg-transparent py-3 font-body text-base outline-none placeholder:opacity-40 disabled:opacity-40"
                  style={{ color: "var(--color-ink)" }}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1.5 flex items-center gap-1.5 font-body text-xs" role="alert" style={{ color: "var(--color-accent)" }}>
                  <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div
                className="flex items-center"
                style={{ borderBottom: errors.password ? "1px solid var(--color-accent)" : "var(--rule-soft)" }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: "", general: "" }));
                  }}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  disabled={loadingProvider !== null}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleSignIn(e as any); }
                  }}
                  className="flex-1 bg-transparent py-3 font-body text-base outline-none placeholder:opacity-40 disabled:opacity-40"
                  style={{ color: "var(--color-ink)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pl-2 transition-opacity hover:opacity-60"
                  style={{ color: "var(--color-ink-3)" }}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  disabled={loadingProvider !== null}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 flex items-center gap-1.5 font-body text-xs" role="alert" style={{ color: "var(--color-accent)" }}>
                  <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="font-body text-xs transition-opacity hover:opacity-60"
                style={{ color: "var(--color-ink-3)" }}
                tabIndex={loadingProvider !== null ? -1 : 0}
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loadingProvider !== null}
            className="w-full py-4 font-body text-sm tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              background: "var(--color-ink)",
              color: "var(--color-paper)",
            }}
          >
            {loadingProvider === "email" ? "Connexion…" : "Se connecter"}
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
          disabled={loadingProvider !== null}
          className="flex w-full items-center justify-center gap-3 py-3.5 font-body text-sm transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ border: "var(--rule-soft)", color: "var(--color-ink)" }}
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {loadingProvider === "google" ? "Connexion…" : "Continuer avec Google"}
        </button>

        {/* Sign-up link */}
        <p className="mt-8 text-center font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
          Pas encore de compte ?{" "}
          <Link
            href="/sign-up"
            className="transition-opacity hover:opacity-70"
            style={{ color: "var(--color-ink)", borderBottom: "1px solid var(--color-accent)" }}
            tabIndex={loadingProvider !== null ? -1 : 0}
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
