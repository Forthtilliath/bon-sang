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

  describe("repli de lignes (RFC 5545)", () => {
    const encoder = new TextEncoder();
    // Description longue et fortement accentuée : chaque « é » pèse 2 octets,
    // donc une frontière calculée en unités UTF-16 tomberait au milieu d'un caractère.
    const longAccented = `Pensez à réserver un créneau : ${"éàçùî ".repeat(20)}`;
    const foldedIcs = buildIcs(
      { uid: "u", title: "t", description: longAccented, start: new Date("2026-01-01T00:00:00") },
      NOW,
    );

    it("ne produit aucune ligne de plus de 75 octets", () => {
      for (const line of foldedIcs.split("\r\n")) {
        expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
      }
    });

    it("ne coupe jamais un caractère (pas de U+FFFD, contenu intact au dépliage)", () => {
      expect(foldedIcs).not.toContain("�");
      const unfolded = foldedIcs.replace(/\r\n /g, "");
      expect(unfolded).toContain(`DESCRIPTION:${longAccented}`);
    });

    it("laisse intacte une ligne courte, même accentuée", () => {
      const short = buildIcs(
        { uid: "u", title: "Café & thé à Nîmes", start: new Date("2026-01-01T00:00:00") },
        NOW,
      );
      expect(short).toContain("SUMMARY:Café & thé à Nîmes");
    });
  });
});
