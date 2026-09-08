import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <p className="text-sm font-medium tracking-wide text-red-600 uppercase">{t("eyebrow")}</p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {t("title")}
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        <Link
          href="/eligibilite"
          className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          {t("ctaEligibility")}
        </Link>
        <Link
          href="/collectes"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {t("ctaCollections")}
        </Link>
      </div>
    </main>
  );
}
