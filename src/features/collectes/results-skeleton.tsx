/** Squelette animé du bloc de résultats, partagé par `loading.tsx` et le `<Suspense>` de la page. */
export function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <div className="bg-surface h-4 w-56 animate-pulse rounded" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border-border bg-surface h-28 animate-pulse rounded-2xl border-2"
            />
          ))}
        </div>
        <div className="border-ink bg-surface h-80 animate-pulse rounded-3xl border-2 lg:h-[70vh]" />
      </div>
    </div>
  );
}
