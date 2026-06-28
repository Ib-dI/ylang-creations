"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { name: "Guide des tailles", href: "/aide/tailles" },
  { name: "Comment personnaliser", href: "/aide/personnalisation" },
  { name: "Livraison & Retours", href: "/aide/livraison" },
  { name: "Entretien des produits", href: "/aide/entretien" },
  { name: "FAQ", href: "/aide/faq" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-52 shrink-0 mr-16">
        <div className="sticky top-28">
          <p className="type-overline mb-5" style={{ color: "var(--color-ink-3)" }}>
            Navigation
          </p>
          <nav>
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between py-3 text-sm transition-opacity duration-200"
                  style={{
                    borderBottom: "var(--rule-soft)",
                    color: isActive ? "var(--color-accent)" : "var(--color-ink-3)",
                    opacity: isActive ? 1 : undefined,
                  }}
                >
                  <span className={isActive ? "font-medium" : ""}>{item.name}</span>
                  {isActive && (
                    <span style={{ color: "var(--color-accent)" }} aria-hidden>
                      —
                    </span>
                  )}
                </Link>
              );
            })}
            <div style={{ borderBottom: "var(--rule-soft)" }} />
          </nav>
        </div>
      </aside>

      {/* Mobile nav */}
      <nav className="lg:hidden mb-10" style={{ borderTop: "var(--rule-hair)" }}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between py-4 text-sm transition-opacity duration-200"
              style={{
                borderBottom: "var(--rule-soft)",
                color: isActive ? "var(--color-accent)" : "var(--color-ink-3)",
              }}
            >
              <span className={isActive ? "font-medium" : ""}>{item.name}</span>
              {isActive && <span style={{ color: "var(--color-accent)" }} aria-hidden>—</span>}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
