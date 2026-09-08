export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <p className="text-sm font-medium tracking-wide text-red-600 uppercase">Don du sang</p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Comprendre, se tester, trouver une collecte.
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Site en cours de construction. Voir <code className="font-mono">ROADMAP.md</code> pour le
        plan de développement.
      </p>
    </main>
  );
}
