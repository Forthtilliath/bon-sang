import type { useFormatter, useTranslations } from "next-intl";

import { collecteAddress } from "./normalize";
import type { Collecte } from "./types";

export type PopupHelpers = {
  t: ReturnType<typeof useTranslations<"Collectes">>;
  format: ReturnType<typeof useFormatter>;
};

function el(tag: string, className: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

/** Contenu DOM d'une bulle d'info de collecte (jamais de HTML brut : `textContent`). */
export function popupContent(collecte: Collecte, { t, format }: PopupHelpers): HTMLElement {
  const root = el("div", "ofm-popup");
  root.append(el("strong", "ofm-popup__title", collecte.nom || collecte.ville));

  const place = collecteAddress(collecte);
  if (place) root.append(el("span", "ofm-popup__muted", place));

  if (collecte.fixe) {
    root.append(el("span", "ofm-popup__accent", t("permanent")));
    if (collecte.horaires)
      root.append(el("span", "ofm-popup__muted ofm-popup__pre", collecte.horaires));
  } else if (collecte.date) {
    const when = format.dateTime(new Date(`${collecte.date}T12:00:00`), { dateStyle: "full" });
    const hours = collecte.heureDebut
      ? ` · ${collecte.heureDebut}${collecte.heureFin ? `–${collecte.heureFin}` : ""}`
      : "";
    root.append(el("span", "ofm-popup__accent", `${when}${hours}`));
  }

  if (collecte.typesDon.length > 0) {
    const tags = el("span", "ofm-popup__tags");
    for (const kind of collecte.typesDon) {
      tags.append(el("span", "ofm-popup__tag", t(`kinds.${kind}`)));
    }
    root.append(tags);
  }

  if (collecte.placesRestantes === 0) {
    root.append(el("span", "ofm-popup__accent", t("full")));
  } else if (typeof collecte.placesRestantes === "number") {
    root.append(
      el("span", "ofm-popup__muted", t("spotsLeft", { count: collecte.placesRestantes })),
    );
  }

  if (collecte.rdvUrl) {
    const link = el("a", "ofm-popup__link", t("book"));
    (link as HTMLAnchorElement).href = collecte.rdvUrl;
    (link as HTMLAnchorElement).target = "_blank";
    (link as HTMLAnchorElement).rel = "noopener noreferrer";
    root.append(link);
  }

  return root;
}
