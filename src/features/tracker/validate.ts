import {
  BLOOD_GROUPS,
  DONATION_TYPES,
  SEXES,
  type Donation,
  type Profile,
  type Reminder,
  type TrackerState,
} from "./types";

/**
 * Taille maximale d'un fichier de suivi importé (100 Kio). Un suivi réaliste pèse
 * quelques Kio ; au-delà, on refuse sans même parser le JSON.
 */
export const MAX_IMPORT_BYTES = 100 * 1024;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function isDonation(value: unknown): value is Donation {
  if (!isObject(value)) return false;
  if (typeof value.id !== "string" || value.id.length === 0) return false;
  if (!isIsoDate(value.date)) return false;
  if (!DONATION_TYPES.includes(value.type as Donation["type"])) return false;
  if (value.place !== undefined && typeof value.place !== "string") return false;
  return true;
}

function isProfile(value: unknown): value is Profile {
  if (!isObject(value)) return false;
  if (!SEXES.includes(value.sex as Profile["sex"])) return false;
  if (!BLOOD_GROUPS.includes(value.bloodGroup as Profile["bloodGroup"])) return false;
  return true;
}

function isReminder(value: unknown): value is Reminder {
  if (!isObject(value)) return false;
  if (!isIsoDate(value.date)) return false;
  if (value.note !== undefined && typeof value.note !== "string") return false;
  return true;
}

/** Valide en profondeur un état de suivi désérialisé (types, énums, dates). */
export function isTrackerState(value: unknown): value is TrackerState {
  if (!isObject(value)) return false;
  if (!isProfile(value.profile)) return false;
  if (!Array.isArray(value.donations) || !value.donations.every(isDonation)) return false;
  if (value.reminder != null && !isReminder(value.reminder)) return false;
  return true;
}

/**
 * Parse et valide le contenu d'un fichier de suivi. Renvoie un état propre
 * (sans champs superflus) ou `null` si la taille, le JSON ou la forme est invalide.
 */
export function parseTrackerState(raw: string): TrackerState | null {
  if (raw.length > MAX_IMPORT_BYTES) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isTrackerState(parsed)) return null;
  return {
    profile: { sex: parsed.profile.sex, bloodGroup: parsed.profile.bloodGroup },
    donations: parsed.donations.map((d) => ({
      id: d.id,
      date: d.date,
      type: d.type,
      ...(d.place !== undefined ? { place: d.place } : {}),
    })),
    reminder: parsed.reminder
      ? {
          date: parsed.reminder.date,
          ...(parsed.reminder.note !== undefined ? { note: parsed.reminder.note } : {}),
        }
      : null,
  };
}
