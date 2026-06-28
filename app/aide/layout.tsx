import { SidebarNav } from "@/components/aide/sidebar-nav";

export default function AideLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--color-paper)" }}>

      {/* Hero */}
      <section className="py-20 lg:py-24" style={{ borderBottom: "var(--rule-hair)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="type-overline mb-5" style={{ color: "var(--color-accent)" }}>
            Aide &amp; Informations
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-headline)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--color-ink)",
            }}
          >
            Comment pouvons-nous<br className="hidden sm:block" /> vous aider ?
          </h1>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-16 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="flex flex-col lg:flex-row lg:gap-20">
          <SidebarNav />
          <main className="flex-1 min-w-0 pt-10 lg:pt-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
