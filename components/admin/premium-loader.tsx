"use client";

import { Loader2 } from "lucide-react";

export function PremiumLoader() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4"
      style={{ background: "var(--color-paper)", backdropFilter: "blur(4px)" }}
    >
      <Loader2
        className="h-8 w-8 animate-spin"
        style={{ color: "var(--color-ink-3)" }}
      />

      <div className="flex flex-col items-center gap-1">
        <p className="type-overline" style={{ color: "var(--color-ink)" }}>
          Ylang Admin
        </p>
        <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
          Chargement...
        </p>
      </div>
    </div>
  );
}
