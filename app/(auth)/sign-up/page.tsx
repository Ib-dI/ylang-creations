"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff } from "lucide-react";
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
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F6F3] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="relative h-24 w-24">
            <Image
              src="/logo/ylang créations_6.png"
              alt="Ylang Créations"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="mt-6 text-center font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Rejoignez l'univers Ylang Créations
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                required
                className="focus:border-ylang-rose focus:ring-ylang-rose block w-full rounded-lg border-gray-300 bg-gray-50 py-3 text-gray-900"
                placeholder="Nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="email"
                required
                className="focus:border-ylang-rose focus:ring-ylang-rose block w-full rounded-lg border-gray-300 bg-gray-50 py-3 text-gray-900"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                className="focus:border-ylang-rose focus:ring-ylang-rose block w-full rounded-lg border-gray-300 bg-gray-50 py-3 pr-10 text-gray-900"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group bg-ylang-rose focus-visible:outline-ylang-rose relative flex w-full justify-center rounded-lg px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8D5E50] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {loading ? "Création..." : "S'inscrire"}
            </Button>
          </div>
          <div className="text-center text-sm">
            <Link
              href="/sign-in"
              className="text-ylang-rose font-medium hover:text-[#8D5E50]"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
