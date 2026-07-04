export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-paper)" }}>
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
      />
    </div>
  );
}
