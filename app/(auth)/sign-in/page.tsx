"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [loadingProvider, setLoadingProvider] = useState<
    "email" | "google" | null
  >(null);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const router = useRouter();
  const supabase = createClient();

  const showToast = (message: string, type: "error" | "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 5000);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "L'email est requis";
    }
    if (!emailRegex.test(email)) {
      return "L'email n'est pas valide";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Le mot de passe est requis";
    }
    if (password.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères";
    }
    return "";
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "", general: "" }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "", general: "" }));
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation côté client
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
        general: "",
      });
      return;
    }

    setLoadingProvider("email");
    setErrors({ email: "", password: "", general: "" });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoadingProvider(null);

      // Messages d'erreur personnalisés et sécurisés
      let errorMessage = "Impossible de se connecter. Veuillez réessayer.";

      // Utilisation du code d'erreur plutôt que du message
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Veuillez confirmer votre email avant de vous connecter";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Trop de tentatives. Veuillez réessayer plus tard";
      }

      setErrors((prev) => ({ ...prev, general: errorMessage }));
      showToast(errorMessage, "error");
      return;
    }

    showToast("Connexion réussie ! Redirection...", "success");

    // Check role and redirect
    const userRole = data.user?.app_metadata?.role;
    const searchParams = new URLSearchParams(window.location.search);
    const next = searchParams.get("next");

    setTimeout(() => {
      if (next) {
        router.replace(next);
      } else if (userRole === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }, 1000);
  };

  const handleGoogleSignIn = async () => {
    setLoadingProvider("google");
    setErrors({ email: "", password: "", general: "" });

    const searchParams = new URLSearchParams(window.location.search);
    const next = searchParams.get("next") ?? "/";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setLoadingProvider(null);
      const errorMessage =
        "Erreur lors de la connexion avec Google. Veuillez réessayer.";
      setErrors((prev) => ({ ...prev, general: errorMessage }));
      showToast(errorMessage, "error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ylang-terracotta/30 px-4 py-12 sm:px-6 lg:px-8">
      {/* Toast Notification avec aria-live pour l'accessibilité */}
      {toast.show && (
        <div
          className="animate-in slide-in-from-top-5 fixed top-4 right-4 z-50 duration-300"
          role="alert"
          aria-live="assertive"
        >
          <div
            className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${
              toast.type === "error"
                ? "border border-red-200 bg-red-50"
                : "border border-green-200 bg-green-50"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            <p
              className={`text-sm font-medium ${
                toast.type === "error" ? "text-red-800" : "text-green-800"
              }`}
            >
              {toast.message}
            </p>
          </div>
        </div>
      )}

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
          <h2 className="font-abramo-script mt-6 text-center text-6xl tracking-tight text-[#1A1A1A]">
            Bienvenue
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Connectez-vous à votre compte
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Message d'erreur général avec aria-live */}
          {errors.general && (
            <div
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Formulaire avec balise form pour la soumission au clavier */}
          <div className="space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  className={
                    errors.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                  placeholder="Email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  disabled={loadingProvider !== null}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="mt-1 flex items-center gap-1 text-xs text-red-600"
                    role="alert"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className={`pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    disabled={loadingProvider !== null}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSignIn(e as any);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-ylang-rose absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-colors"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    disabled={loadingProvider !== null}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="mt-1 flex items-center gap-1 text-xs text-red-600"
                    role="alert"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-ylang-rose text-sm font-medium hover:text-[#8D5E50]"
                  tabIndex={loadingProvider !== null ? -1 : 0}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loadingProvider !== null}
                onClick={handleSignIn}
                className="group bg-ylang-rose focus-visible:outline-ylang-rose relative flex w-full justify-center rounded-lg px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8D5E50] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingProvider === "email" ? "Connexion..." : "Se connecter"}
              </Button>
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Ou continuer avec
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loadingProvider !== null}
              className="flex w-full transform items-center justify-center gap-2 rounded-xl border-2 border-gray-100 py-3 text-gray-700 transition-all ease-in-out hover:scale-[1.01] active:scale-[.98] active:duration-75 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {loadingProvider === "google"
                ? "Connexion..."
                : "Se connecter avec Google"}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link
              href="/sign-up"
              className="text-ylang-rose font-medium hover:text-[#8D5E0]"
              tabIndex={loadingProvider !== null ? -1 : 0}
            >
              Pas encore de compte ? Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
