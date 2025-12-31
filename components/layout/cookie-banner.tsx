"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ylang-cookie-consent");
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ylang-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("ylang-cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 bottom-4 left-4 z-100 md:right-8 md:bottom-8 md:left-auto md:max-w-md">
      <div className="border-ylang-beige/50 animate-in fade-in slide-in-from-bottom-10 rounded-2xl border bg-white/95 p-6 shadow-2xl backdrop-blur-md duration-700 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h3 className="font-display text-ylang-charcoal text-xl font-semibold">
              🍪 Un petit cookie ?
            </h3>
            <p className="font-body text-ylang-charcoal/70 text-sm leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience,
              analyser notre trafic et mémoriser vos préférences. Certains sont
              essentiels au bon fonctionnement de la boutique.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <Button
              onClick={handleAccept}
              className="bg-ylang-charcoal hover:bg-ylang-charcoal/90 flex-1 text-white transition-all"
            >
              Accepter tout
            </Button>
            <Button
              variant="secondary"
              onClick={handleDecline}
              className="border-ylang-beige hover:bg-ylang-beige/10 text-ylang-charcoal flex-1 transition-all"
            >
              Refuser
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/cookies"
              className="text-ylang-charcoal/50 hover:text-ylang-rose text-xs underline underline-offset-4 transition-colors"
              onClick={() => setIsVisible(false)}
            >
              En savoir plus sur notre politique de cookies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
