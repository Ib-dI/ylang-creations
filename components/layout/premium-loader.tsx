"use client";

import { Loader2 } from "lucide-react";

interface PremiumLoaderProps {
  title?: string;
  subtitle?: string;
}

export function PremiumLoader({
  title = "Ylang Creations",
  subtitle = "Chargement...",
}: PremiumLoaderProps) {
  return (
    <div className="bg-ylang-beige/80 fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        <div className="border-ylang-rose/20 absolute h-24 w-24 rounded-full border-4"></div>
        <div className="border-ylang-rose h-24 w-24 animate-spin rounded-full border-t-4 shadow-lg"></div>
        <Loader2 className="text-ylang-rose absolute h-10 w-10 animate-pulse" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="font-display text-ylang-charcoal text-lg font-semibold tracking-widest uppercase">
          {title}
        </p>
        <p className="font-body text-ylang-charcoal/50 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}
