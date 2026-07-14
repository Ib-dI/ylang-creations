"use client";

import { Button } from "@/components/ui/button";
import { DEFAULT_BROWSE, useNavigationStore } from "@/lib/store/navigation-store";
import { Package } from "lucide-react";
import Link from "next/link";

export function OrdersEmptyState() {
  const lastBrowse = useNavigationStore((state) => state.lastBrowse) ?? DEFAULT_BROWSE;

  return (
    <div className="border-ylang-beige flex flex-col items-center justify-center rounded-2xl border bg-white/50 p-12 text-center backdrop-blur-sm">
      <div className="bg-ylang-cream mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <Package className="text-ylang-charcoal/30 h-10 w-10" />
      </div>
      <h2 className="text-ylang-charcoal mb-2 text-xl font-semibold">
        Vous n'avez pas encore passé de commande
      </h2>
      <p className="text-ylang-charcoal/60 mb-8 max-w-md">
        Dès que vous aurez passé votre première commande, elle apparaîtra
        ici avec tous les détails de son suivi.
      </p>
      <Button variant="luxury" asChild>
        <Link href={lastBrowse.path}>{lastBrowse.label}</Link>
      </Button>
    </div>
  );
}
