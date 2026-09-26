import type { useTracker } from "./use-tracker";

export type TrackerApi = ReturnType<typeof useTracker>;

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-muted font-mono text-xs tracking-[0.12em] uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}
