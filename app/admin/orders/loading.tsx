export default function Loading() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="mb-1 h-8 w-40 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="h-3 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="h-9 w-28 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="h-9 w-28 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
      </div>

      <div className="mb-6" style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "var(--rule-hair)" }}>
          <div className="h-9 w-full max-w-sm animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
        <div className="flex gap-0 overflow-x-auto px-2 py-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mx-3 h-4 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          ))}
        </div>
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
            <div className="h-4 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-32 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
