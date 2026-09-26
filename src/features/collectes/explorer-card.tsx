"use client";

import { useEffect, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { LABEL_RADIUS } from "@/components/ui/card";
import { ExternalLink } from "@/components/ui/external-link";
import { cn } from "@/lib/cn";

import type { Collecte } from "./types";

export function ExplorerCard({
  collecte,
  distanceKm,
  active,
  onSelect,
  shareUrl,
}: {
  collecte: Collecte;
  distanceKm: number | null;
  active: boolean;
  onSelect: () => void;
  shareUrl: string;
}) {
  const t = useTranslations("Collectes");
  const format = useFormatter();
  const ref = useRef<HTMLDivElement>(null);
  const full = collecte.placesRestantes === 0;
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const data = { title: collecte.nom || collecte.ville, url: shareUrl };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // Partage annulé par l'utilisateur : rien à faire.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé, permission refusée).
    }
  };

  // Sélection depuis la carte : ramène la fiche correspondante dans la liste.
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div
      ref={ref}
      className={cn(
        LABEL_RADIUS,
        "flex flex-col gap-2 border-2 p-4 text-sm transition-[background-color,border-color,box-shadow]",
        active
          ? "border-ink bg-primary-subtle shadow-sticker"
          : "border-border bg-bg hover:border-ink",
      )}
    >
      {full ? (
        <span className="border-ink bg-warn-subtle text-fg w-fit rounded-full border-2 px-2 py-0.5 font-mono text-[11px] uppercase">
          {t("full")}
        </span>
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="flex flex-col gap-1.5 text-left"
      >
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span className="font-display text-base font-semibold">
            {collecte.nom || collecte.ville}
          </span>
          {collecte.fixe ? (
            <span className="text-primary font-mono text-xs">{t("permanent")}</span>
          ) : collecte.date ? (
            <span className="text-primary font-mono text-xs">
              {format.dateTime(new Date(`${collecte.date}T12:00:00`), { dateStyle: "medium" })}
              {collecte.heureDebut ? ` · ${collecte.heureDebut}` : ""}
            </span>
          ) : null}
        </span>
        <span className="text-muted">
          {[collecte.codePostal, collecte.ville].filter(Boolean).join(" ")}
          {distanceKm !== null ? ` · ${t("distance", { km: Math.round(distanceKm) })}` : ""}
        </span>
      </button>
      <span className="flex flex-wrap gap-1.5">
        {collecte.typesDon.map((kind) => (
          <span
            key={kind}
            className="border-border text-muted rounded-full border-2 px-2 py-0.5 font-mono text-[11px] uppercase"
          >
            {t(`kinds.${kind}`)}
          </span>
        ))}
      </span>
      <span className="flex flex-wrap items-center gap-3">
        {collecte.rdvUrl ? (
          <ExternalLink href={collecte.rdvUrl} className="text-xs">
            {t("book")}
          </ExternalLink>
        ) : null}
        <button
          type="button"
          onClick={share}
          className="text-primary text-xs font-medium underline-offset-2 hover:underline"
        >
          {copied ? t("shareCopied") : t("share")}
        </button>
      </span>
    </div>
  );
}
