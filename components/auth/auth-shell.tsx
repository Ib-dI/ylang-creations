import Image from "next/image";

// Mise en page commune des pages d'espace client (logo + titre + contenu)
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-16"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center">
          <div className="relative mb-8 h-16 w-16">
            <Image src="/logo/ylang créations_6.png" alt="Ylang Créations" fill className="object-contain" />
          </div>
          <p className="type-overline mb-3" style={{ color: "var(--color-accent)" }}>
            Espace client
          </p>
          <h1
            className="text-center"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-headline)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--color-ink)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 font-body text-sm text-center" style={{ color: "var(--color-ink-3)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export const authPrimaryButtonClass =
  "block w-full py-4 text-center font-body text-sm tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-40";

export const authPrimaryButtonStyle = {
  background: "var(--color-ink)",
  color: "var(--color-paper)",
};
