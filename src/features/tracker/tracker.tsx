"use client";

import { useTranslations } from "next-intl";

import { Badges } from "./badges-section";
import { DataControls } from "./data-controls";
import { Journal } from "./journal";
import { NextDonation } from "./next-donation";
import { ProfileCard } from "./profile-card";
import { Stats } from "./stats";
import { useTracker } from "./use-tracker";

export function Tracker() {
  const t = useTranslations("Tracker");
  const tracker = useTracker();

  if (!tracker.hydrated) {
    return <p className="text-muted py-12 text-sm">{t("loading")}</p>;
  }

  return (
    <div className="flex flex-col gap-12">
      <NextDonation tracker={tracker} />
      <Journal tracker={tracker} />
      <Stats tracker={tracker} />
      <ProfileCard tracker={tracker} />
      <Badges tracker={tracker} />
      <DataControls tracker={tracker} />
      <p className="border-border text-muted border-t-2 border-dashed pt-4 text-xs">
        {t("privacyNote")}
      </p>
    </div>
  );
}
