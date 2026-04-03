export default function PLPGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-7"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)]"
        >
          <div className="aspect-[3/4] animate-pulse bg-[var(--surface-muted)]" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-[72%] animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="h-3 w-[48%] animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="h-5 w-[36%] animate-pulse rounded bg-[var(--surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
