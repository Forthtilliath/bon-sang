import { describe, expect, it } from "vitest";

import { buildIcs } from "./ics";

const NOW = new Date("2026-06-01T00:00:00");

describe("buildIcs", () => {
  const ics = buildIcs(
    {
      uid: "reminder-1@bon-sang",
      title: "Don du sang possible",
      description: "Vous pouvez à nouveau donner.",
      start: new Date("2026-09-01T00:00:00"),
    },
    NOW,
  );

  it("produit un VCALENDAR valide", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
  });

  it("pose un événement journée entière à la bonne date", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20260901");
  });

  it("reprend le titre et l'UID", () => {
    expect(ics).toContain("SUMMARY:Don du sang possible");
    expect(ics).toContain("UID:reminder-1@bon-sang");
  });

  it("échappe les caractères spéciaux", () => {
    const withComma = buildIcs(
      { uid: "u", title: "A, B; C", start: new Date("2026-01-01T00:00:00") },
      NOW,
    );
    expect(withComma).toContain("SUMMARY:A\\, B\\; C");
  });

  it("sépare les lignes par CRLF", () => {
    expect(ics.split("\r\n").length).toBeGreaterThan(8);
  });
});
