"use client";

import { type FormEvent, useId, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { inputClasses } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { formatIsoDate, parseIsoDate } from "@/lib/dates";

import { Field, Section, type TrackerApi } from "./tracker-ui";
import { DONATION_TYPES, type Donation, type DonationType } from "./types";

export function Journal({ tracker }: { tracker: TrackerApi }) {
  const t = useTranslations("Tracker");
  const format = useFormatter();
  const dateId = useId();
  const typeId = useId();
  const placeId = useId();
  const [date, setDate] = useState("");
  const [type, setType] = useState<DonationType>("blood");
  const [place, setPlace] = useState("");
  // `null` = ajout d'un nouveau don ; sinon, id du don en cours de modification.
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setDate("");
    setType("blood");
    setPlace("");
  };

  const startEdit = (donation: Donation) => {
    setEditingId(donation.id);
    setDate(donation.date);
    setType(donation.type);
    setPlace(donation.place ?? "");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!parseIsoDate(date)) return;
    const payload = { date, type, place: place.trim() || undefined };
    if (editingId) tracker.updateDonation(editingId, payload);
    else tracker.addDonation(payload);
    resetForm();
  };

  return (
    <Section title={t("journal.title")}>
      <form
        onSubmit={submit}
        className={cardClasses({
          variant: "soft",
          className: "flex flex-wrap items-end gap-4 p-5",
        })}
      >
        <Field label={t("journal.date")} htmlFor={dateId}>
          <input
            id={dateId}
            type="date"
            required
            max={formatIsoDate(new Date())}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClasses()}
          />
        </Field>
        <Field label={t("journal.type")} htmlFor={typeId}>
          <select
            id={typeId}
            value={type}
            onChange={(e) => setType(e.target.value as DonationType)}
            className={inputClasses()}
          >
            {DONATION_TYPES.map((option) => (
              <option key={option} value={option}>
                {t(`journal.types.${option}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("journal.place")} htmlFor={placeId}>
          <input
            id={placeId}
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder={t("journal.placePlaceholder")}
            className={inputClasses()}
          />
        </Field>
        <button type="submit" className={buttonClasses({ size: "sm" })}>
          {editingId ? t("journal.save") : t("journal.submit")}
        </button>
        {editingId ? (
          <button
            type="button"
            onClick={resetForm}
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            {t("journal.cancel")}
          </button>
        ) : null}
      </form>

      {tracker.donations.length === 0 ? (
        <p className="text-muted text-sm">{t("journal.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tracker.donations.map((donation) => {
            const parsed = parseIsoDate(donation.date);
            return (
              <li
                key={donation.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-2xl border-2 p-4 text-sm",
                  donation.id === editingId
                    ? "border-ink bg-primary-subtle shadow-sticker-sm"
                    : "border-border bg-bg",
                )}
              >
                <span>
                  <span className="font-display text-base font-semibold">
                    {parsed ? format.dateTime(parsed, { dateStyle: "medium" }) : donation.date}
                  </span>{" "}
                  · {t(`journal.types.${donation.type}`)}
                  {donation.place ? <span className="text-muted"> · {donation.place}</span> : null}
                </span>
                <span className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(donation)}
                    className="text-muted hover:text-primary font-medium underline-offset-4 hover:underline"
                  >
                    {t("journal.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      tracker.removeDonation(donation.id);
                      if (editingId === donation.id) resetForm();
                    }}
                    className="text-muted hover:text-primary font-medium underline-offset-4 hover:underline"
                  >
                    {t("journal.delete")}
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
