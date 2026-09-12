import { getTranslations } from "next-intl/server";

import { FocusOnMount } from "@forthtilliath/react-kit/focus-on-mount";
import { ExternalLink } from "@/components/ui/external-link";

import { CollectesExplorer } from "./collectes-explorer";
import { fetchCollectesByCity } from "./fetch-collectes";

const EFS_URL = "https://dondesang.efs.sante.fr/trouver-une-collecte";

/**
 * Récupère les collectes d'une ville (Server Component). Isolé dans son propre
 * fichier pour être enveloppé d'un `<Suspense>` : la recherche affiche alors le
 * squelette à chaque changement de ville, sans bloquer l'en-tête ni le formulaire.
 */
export async function CollectesResults({ query }: { query: string }) {
  const t = await getTranslations("Collectes");
  const result = await fetchCollectesByCity(query);

  return (
    <FocusOnMount label={t("resultsRegion")} className="scroll-mt-24 focus:outline-none">
      {result.status === "error" ? (
        <Fallback message={t("errorEfs")} label={t("openEfs")} />
      ) : result.collectes.length === 0 ? (
        <Fallback message={t("noResults", { query: result.query })} label={t("openEfs")} />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-muted text-sm">
            {t("resultsCount", { count: result.collectes.length, query: result.query })}
          </p>
          <CollectesExplorer collectes={result.collectes} />
        </div>
      )}
    </FocusOnMount>
  );
}

function Fallback({ message, label }: { message: string; label: string }) {
  return (
    <div className="border-border bg-surface flex max-w-2xl flex-col gap-2 rounded-2xl border p-5 text-sm">
      <p>{message}</p>
      <ExternalLink href={EFS_URL}>{label}</ExternalLink>
    </div>
  );
}
