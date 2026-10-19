"use client";

import { AuthShell, authPrimaryButtonClass, authPrimaryButtonStyle } from "@/components/auth/auth-shell";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const REDIRECT_DELAY_MS = 4000;

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nextParam = searchParams.get("next") ?? "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  useEffect(() => {
    const timeout = setTimeout(() => router.push(next), REDIRECT_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [next, router]);

  return (
    <AuthShell
      title="Email confirmé"
      subtitle="Votre compte est activé. Bienvenue chez Ylang Créations !"
    >
      <div className="mb-8 flex justify-center">
        <CheckCircle2 className="h-12 w-12" style={{ color: "var(--color-accent)" }} strokeWidth={1.25} />
      </div>
      <Link href={next} className={authPrimaryButtonClass} style={authPrimaryButtonStyle}>
        Continuer
      </Link>
      <p className="mt-6 text-center font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
        Redirection automatique dans quelques secondes…
      </p>
    </AuthShell>
  );
}

export default function AuthConfirmedPage() {
  return (
    <Suspense fallback={<AuthShell title="Email confirmé" />}>
      <ConfirmedContent />
    </Suspense>
  );
}
