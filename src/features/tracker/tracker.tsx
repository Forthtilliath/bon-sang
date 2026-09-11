"use client";

import { type FormEvent, useId, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { daysBetween, formatIsoDate, parseIsoDate } from "@/lib/dates";
import { downloadTextFile } from "@/lib/download";
import { buildIcs } from "@/lib/ics";

import { BADGES, type BadgeId } from "./badges";
import {
  BLOOD_GROUPS,
  DONATION_TYPES,
  SEXES,
  type Donation,
  type DonationType,
  type Sex,
} from "./types";
import { useTracker } from "./use-tracker";
import { MAX_IMPORT_BYTES } from "./validate";

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
      <p className="border-border text-muted border-t pt-4 text-xs">{t("privacyNote")}</p>
    </div>
  );
}

type TrackerApi = ReturnType<typeof useTracker>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function NextDonation({ tracker }: { tracker: TrackerApi }) {
  const t = useTranslations("Tracker");
  const format = useFormatter();
  const { date, reason } = tracker.nextEligible;
  const hasDonations = tracker.state.donations.length > 0;

  const handleIcs = () => {
    if (!date) return;
    const ics = buildIcs({
      uid: `bon-sang-${formatIsoDate(date)}@bon-sang`,
      title: t("ics.title"),
      description: t("ics.description"),
      start: date,
    });
    downloadTextFile("don-du-sang.ics", ics, "text/calendar");
  };

  return (
    <Section title={t("next.title")}>
      <div className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
        {date ? (
          <>
            <p className="text-primary text-2xl font-semibold tracking-tight">
              {format.dateTime(date, { dateStyle: "long" })}
            </p>
            <p className="text-muted text-sm">
              {t("next.inDays", { days: Math.max(0, daysBetween(new Date(), date)) })}
              {reason ? ` · ${t(`next.reason.${reason}`)}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <button type="button" onClick={handleIcs} className={buttonClasses({ size: "sm" })}>
                {t("next.addToCalendar")}
              </button>
              {tracker.state.reminder ? (
                <button
                  type="button"
                  onClick={tracker.clearReminder}
                  className={buttonClasses({ variant: "ghost", size: "sm" })}
                >
                  {t("next.clearReminder")}
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm">{hasDonations ? t("next.now") : t("next.unknown")}</p>
            <div className="mt-1 flex flex-wrap gap-3">
              <Link href="/collectes" className={buttonClasses({ variant: "outline", size: "sm" })}>
                {t("next.findDrive")}
              </Link>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}

function Journal({ tracker }: { tracker: TrackerApi }) {
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
        className="border-border flex flex-wrap items-end gap-3 rounded-2xl border p-4"
      >
        <Field label={t("journal.date")} htmlFor={dateId}>
          <input
            id={dateId}
            type="date"
            required
            max={formatIsoDate(new Date())}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-border bg-bg rounded-xl border px-3 py-2 text-sm"
          />
        </Field>
        <Field label={t("journal.type")} htmlFor={typeId}>
          <select
            id={typeId}
            value={type}
            onChange={(e) => setType(e.target.value as DonationType)}
            className="border-border bg-bg rounded-xl border px-3 py-2 text-sm"
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
            className="border-border bg-bg rounded-xl border px-3 py-2 text-sm"
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
                  "flex items-center justify-between gap-3 rounded-xl border p-3 text-sm",
                  donation.id === editingId ? "border-primary bg-primary-subtle" : "border-border",
                )}
              >
                <span>
                  <span className="font-medium">
                    {parsed ? format.dateTime(parsed, { dateStyle: "medium" }) : donation.date}
                  </span>{" "}
                  · {t(`journal.types.${donation.type}`)}
                  {donation.place ? <span className="text-muted"> · {donation.place}</span> : null}
                </span>
                <span className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(donation)}
                    className="text-muted hover:text-primary"
                  >
                    {t("journal.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      tracker.removeDonation(donation.id);
                      if (editingId === donation.id) resetForm();
                    }}
                    className="text-muted hover:text-primary"
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

const COUNT_BADGES: readonly { id: BadgeId; threshold: number }[] = [
  { id: "first", threshold: 1 },
  { id: "three", threshold: 3 },
  { id: "ten", threshold: 10 },
];

function Stats({ tracker }: { tracker: TrackerApi }) {
  const t = useTranslations("Tracker");
  const total = tracker.state.donations.length;
  const nextBadge = COUNT_BADGES.find((badge) => total < badge.threshold);

  return (
    <Section title={t("stats.title")}>
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label={t("stats.total")} value={total} />
        {DONATION_TYPES.map((type) => (
          <StatCard
            key={type}
            label={t(`journal.types.${type}`)}
            value={tracker.state.donations.filter((d) => d.type === type).length}
          />
        ))}
      </div>
      <p className="text-muted text-sm">
        {nextBadge
          ? t("stats.nextBadge", {
              remaining: nextBadge.threshold - total,
              badge: t(`badges.items.${nextBadge.id}.name`),
            })
          : t("stats.allBadges")}
      </p>
    </Section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-surface flex flex-col gap-1 rounded-xl border p-4">
      <span className="text-2xl font-semibold tracking-tight">{value}</span>
      <span className="text-muted text-xs">{label}</span>
    </div>
  );
}

function ProfileCard({ tracker }: { tracker: TrackerApi }) {
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
            className="border-border bg-bg rounded-xl border px-3 py-2 text-sm"
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
            className="border-border bg-bg rounded-xl border px-3 py-2 text-sm"
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

function Badges({ tracker }: { tracker: TrackerApi }) {
  const t = useTranslations("Tracker");

  return (
    <Section title={t("badges.title")}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((badge) => {
          const earned = tracker.badges.includes(badge.id);
          return (
            <li
              key={badge.id}
              className={cn(
                "flex flex-col gap-1 rounded-xl border p-4 text-sm",
                earned ? "border-primary/30 bg-primary-subtle" : "border-border bg-surface",
              )}
            >
              <span className="font-medium">{t(`badges.items.${badge.id}.name`)}</span>
              <span className="text-muted text-xs">
                {earned ? t(`badges.items.${badge.id}.hint`) : t("badges.locked")}
              </span>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function DataControls({ tracker }: { tracker: TrackerApi }) {
  const t = useTranslations("Tracker");
  const [error, setError] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    downloadTextFile(
      "bon-sang-suivi.json",
      JSON.stringify(tracker.state, null, 2),
      "application/json",
    );
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    const ok = file.size <= MAX_IMPORT_BYTES && tracker.importState(await file.text());
    setError(!ok);
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <Section title={t("data.title")}>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={exportJson}
          className={buttonClasses({ variant: "outline", size: "sm" })}
        >
          {t("data.export")}
        </button>
        <label className={cn(buttonClasses({ variant: "outline", size: "sm" }), "cursor-pointer")}>
          {t("data.import")}
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={(e) => importJson(e.target.files?.[0])}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t("data.resetConfirm"))) tracker.reset();
          }}
          className={buttonClasses({ variant: "ghost", size: "sm" })}
        >
          {t("data.reset")}
        </button>
      </div>
      {error ? <p className="text-primary text-sm">{t("data.importError")}</p> : null}
    </Section>
  );
}

function Field({
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
      <label htmlFor={htmlFor} className="text-muted text-xs font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
