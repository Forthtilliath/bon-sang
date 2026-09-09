import { formatIsoDate } from "./dates";

type IcsEvent = {
  uid: string;
  title: string;
  description?: string;
  /** Jour de l'événement (all-day). */
  start: Date;
};

function icsDate(date: Date): string {
  return formatIsoDate(date).replace(/-/g, "");
}

function escapeText(value: string): string {
  return value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

function fold(line: string): string {
  // RFC 5545 : lignes de 75 octets max, repli avec espace en tête.
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  for (let i = 0; i < line.length; i += 74) {
    chunks.push((i === 0 ? "" : " ") + line.slice(i, i + 74));
  }
  return chunks.join("\r\n");
}

/** Construit un fichier `.ics` avec un événement journée entière. */
export function buildIcs(event: IcsEvent, now: Date = new Date()): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bon Sang//Rappel don du sang//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${icsDate(now)}T000000Z`,
    `DTSTART;VALUE=DATE:${icsDate(event.start)}`,
    `SUMMARY:${escapeText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeText(event.description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);

  return lines.map(fold).join("\r\n");
}
