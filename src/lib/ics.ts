import { addDays, formatIsoDate } from "./dates";

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

const encoder = new TextEncoder();

function fold(line: string): string {
  // RFC 5545 : lignes de 75 octets max (espace de repli inclus), sans jamais
  // couper un caractère multi-octets — d'où le comptage en octets UTF-8.
  if (encoder.encode(line).length <= 75) return line;

  const chunks: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    const max = chunks.length === 0 ? 75 : 74; // repli : l'espace en tête compte
    if (current !== "" && bytes + charBytes > max) {
      chunks.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += charBytes;
  }
  if (current !== "") chunks.push(current);

  return chunks.map((chunk, i) => (i === 0 ? chunk : ` ${chunk}`)).join("\r\n");
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
    // Événement journée entière : DTEND est exclusif (RFC 5545), donc le lendemain.
    `DTEND;VALUE=DATE:${icsDate(addDays(event.start, 1))}`,
    `SUMMARY:${escapeText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeText(event.description)}` : null,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(event.title)}`,
    // Rappel la veille à la même heure de calendrier que la génération du fichier.
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);

  return lines.map(fold).join("\r\n");
}
