import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonths,
  daysBetween,
  formatIsoDate,
  latestDate,
  parseIsoDate,
  startOfDay,
} from "./dates";

const at = (iso: string) => new Date(`${iso}T00:00:00`);

describe("startOfDay", () => {
  it("remet l'heure à minuit sans muter l'entrée", () => {
    const input = new Date("2026-03-10T14:30:00");
    const result = startOfDay(input);
    expect(result.getHours()).toBe(0);
    expect(input.getHours()).toBe(14);
  });
});

describe("addDays", () => {
  it("ajoute des jours et change de mois", () => {
    expect(formatIsoDate(addDays(at("2026-01-30"), 5))).toBe("2026-02-04");
  });
});

describe("addMonths", () => {
  it("ajoute des mois simples", () => {
    expect(formatIsoDate(addMonths(at("2026-01-15"), 4))).toBe("2026-05-15");
  });

  it("clampe quand le mois cible est plus court", () => {
    expect(formatIsoDate(addMonths(at("2026-01-31"), 1))).toBe("2026-02-28");
  });

  it("passe l'année", () => {
    expect(formatIsoDate(addMonths(at("2026-11-10"), 4))).toBe("2027-03-10");
  });
});

describe("daysBetween", () => {
  it("compte les jours entiers", () => {
    expect(daysBetween(at("2026-03-01"), at("2026-03-15"))).toBe(14);
  });

  it("est négatif si la cible est passée", () => {
    expect(daysBetween(at("2026-03-15"), at("2026-03-01"))).toBe(-14);
  });
});

describe("latestDate", () => {
  it("renvoie la date la plus tardive en ignorant les null", () => {
    const a = at("2026-01-01");
    const b = at("2026-06-01");
    expect(latestDate([a, null, b, null])).toBe(b);
  });

  it("renvoie null si tout est null", () => {
    expect(latestDate([null, null])).toBeNull();
  });
});

describe("parseIsoDate / formatIsoDate", () => {
  it("fait un aller-retour stable", () => {
    expect(formatIsoDate(parseIsoDate("2026-04-09")!)).toBe("2026-04-09");
  });

  it("rejette les formats invalides", () => {
    expect(parseIsoDate("09/04/2026")).toBeNull();
    expect(parseIsoDate("")).toBeNull();
    expect(parseIsoDate(42)).toBeNull();
    expect(parseIsoDate(undefined)).toBeNull();
  });
});
