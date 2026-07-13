export default function Loading() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="mb-1 h-8 w-32 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="h-3 w-28 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
        <div className="h-10 w-44 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-10 flex-1 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        <div className="h-10 w-40 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
            <div className="aspect-square animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="p-3">
              <div className="mb-2 h-2.5 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
              <div className="mb-3 h-4 w-full animate-pulse" style={{ background: "var(--color-paper-2)" }} />
              <div className="h-4 w-14 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
