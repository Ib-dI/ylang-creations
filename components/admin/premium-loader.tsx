"use client";

import { Loader2 } from "lucide-react";

export function PremiumLoader() {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-4 bg-ylang-terracotta/30 backdrop-blur-sm">
      <Loader2 className="h-12 w-12 animate-spin text-ylang-rose" />
      
      <div className="flex flex-col items-center gap-1">
        <p className="font-display text-sm font-semibold uppercase tracking-wider text-ylang-charcoal">
          Ylang Admin
        </p>
        <p className="font-body text-xs text-ylang-charcoal/50">
          Chargement...
        </p>
      </div>
    </div>
  );
}