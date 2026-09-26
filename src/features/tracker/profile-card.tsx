"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";

import { inputClasses } from "@/components/ui/input";

import { Field, Section, type TrackerApi } from "./tracker-ui";
import { BLOOD_GROUPS, SEXES, type Sex } from "./types";

export function ProfileCard({ tracker }: { tracker: TrackerApi }) {
  const t = useTranslations("Tracker");
  const sexId = useId();
  const groupId = useId();

  return (
    <Section title={t("profile.title")}>
      <p className="text-muted text-sm">{t("profile.hint")}</p>
      <div className="flex flex-wrap gap-4">
        <Field label={t("profile.sex")} htmlFor={sexId}>
          <select
            id={sexId}
            value={tracker.state.profile.sex}
            onChange={(e) => tracker.setProfile({ sex: e.target.value as Sex })}
            className={inputClasses()}
          >
            {SEXES.map((option) => (
              <option key={option} value={option}>
                {t(`profile.sexes.${option}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("profile.bloodGroup")} htmlFor={groupId}>
          <select
            id={groupId}
            value={tracker.state.profile.bloodGroup}
            onChange={(e) =>
              tracker.setProfile({ bloodGroup: e.target.value as (typeof BLOOD_GROUPS)[number] })
            }
            className={inputClasses()}
          >
            {BLOOD_GROUPS.map((option) => (
              <option key={option} value={option}>
                {option === "unknown" ? t("profile.groupUnknown") : option}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </Section>
  );
}
