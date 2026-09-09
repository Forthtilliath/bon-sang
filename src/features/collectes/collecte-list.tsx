import { getFormatter, getTranslations } from "next-intl/server";

import { ExternalLink } from "@/components/ui/external-link";

import type { Collecte } from "./types";

export async function CollecteList({ collectes }: { collectes: Collecte[] }) {
  const t = await getTranslations("Collectes");
  const format = await getFormatter();

  return (
    <ul className="flex flex-col gap-3">
      {collectes.map((collecte) => (
        <li
          key={collecte.id}
          className="border-border flex flex-col gap-2 rounded-2xl border p-5 text-sm"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-base font-medium">{collecte.nom || collecte.ville}</h3>
            {collecte.fixe ? (
              <span className="bg-primary-subtle text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                {t("permanent")}
              </span>
            ) : collecte.date ? (
              <span className="text-primary font-medium">
                {format.dateTime(new Date(`${collecte.date}T12:00:00`), { dateStyle: "full" })}
                {collecte.heureDebut ? (
                  <>
                    {" · "}
                    {collecte.heureDebut}
                    {collecte.heureFin ? `–${collecte.heureFin}` : ""}
                  </>
                ) : null}
              </span>
            ) : null}
          </div>

          <p className="text-muted">
            {[collecte.adresse, [collecte.codePostal, collecte.ville].filter(Boolean).join(" ")]
              .filter(Boolean)
              .join(" · ")}
          </p>

          {collecte.horaires ? (
            <p className="text-muted whitespace-pre-line">{collecte.horaires}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {collecte.typesDon.map((kind) => (
              <span
                key={kind}
                className="border-border text-muted rounded-full border px-2 py-0.5 text-xs"
              >
                {t(`kinds.${kind}`)}
              </span>
            ))}
            {typeof collecte.placesRestantes === "number" ? (
              <span className="text-muted text-xs">
                {t("spotsLeft", { count: collecte.placesRestantes })}
              </span>
            ) : null}
          </div>

          {collecte.rdvUrl ? (
            <ExternalLink href={collecte.rdvUrl} className="text-sm">
              {t("book")}
            </ExternalLink>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
