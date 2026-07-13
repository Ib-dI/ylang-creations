export default function Loading() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="mb-1 h-8 w-44 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="h-3 w-56 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          ))}
        </div>
      </div>

      <div className="mb-6 flex overflow-x-auto" style={{ borderBottom: "var(--rule-soft)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mx-3 my-3 h-4 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="h-11 flex-1 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        <div className="h-11 w-44 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
      </div>

      <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "var(--rule-soft)", background: "var(--color-paper-2)" }}>
          <div className="h-6 w-32 animate-pulse" style={{ background: "var(--color-paper-3, var(--color-paper))" }} />
        </div>
        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ border: "var(--rule-soft)" }}>
              <div className="aspect-square animate-pulse" style={{ background: "var(--color-paper-2)" }} />
              <div className="p-2.5">
                <div className="h-3 w-full animate-pulse" style={{ background: "var(--color-paper-2)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
