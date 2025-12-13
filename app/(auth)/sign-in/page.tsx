"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          router.refresh();
          router.push("/");
        },
        onError: (ctx) => {
          alert(ctx.error.message);
          setLoading(false);
        },
      },
    );
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
            Bienvenue
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Connectez-vous à votre compte
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                required
                className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 text-gray-900 focus:border-ylang-rose focus:ring-ylang-rose"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="password"
                required
                className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 text-gray-900 focus:border-ylang-rose focus:ring-ylang-rose"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-ylang-rose px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8D5E50] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ylang-rose"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </div>
          <div className="text-center text-sm">
            <Link
              href="/sign-up"
              className="font-medium text-ylang-rose hover:text-[#8D5E50]"
            >
              Pas encore de compte ? Créer un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
