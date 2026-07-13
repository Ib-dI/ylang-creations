export default function Loading() {
  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        <div className="h-8 w-40 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5" style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}>
            <div className="mb-3 h-3 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-6 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          </div>
        ))}
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-5" style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}>
            <div className="h-5 w-5 shrink-0 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="flex-1">
              <div className="mb-1 h-4 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
              <div className="h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "var(--rule-hair)" }}>
          <div className="h-4 w-32 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: i === 0 ? "none" : "var(--rule-soft)" }}
          >
            <div className="h-4 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-32 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
