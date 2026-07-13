export default function Loading() {
  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        <div className="mb-1 h-8 w-28 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        <div className="h-3 w-56 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5" style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}>
            <div className="mb-3 h-3 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-6 w-12 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="h-10 w-full max-w-sm animate-pulse" style={{ background: "var(--color-paper-2)" }} />
      </div>

      <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
        <div className="px-6 py-3" style={{ background: "var(--color-paper-2)" }}>
          <div className="h-3 w-full animate-pulse" style={{ background: "var(--color-paper-3, var(--color-paper))" }} />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: i === 0 ? "none" : "var(--rule-soft)" }}
          >
            <div className="h-4 w-32 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
