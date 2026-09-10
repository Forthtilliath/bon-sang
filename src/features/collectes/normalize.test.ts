import { describe, expect, it } from "vitest";

import { EFS_SAMPLE_RESPONSE } from "./fixtures";
import {
  collecteAddress,
  normalizeCollectes,
  parseEfsDate,
  parseEfsTime,
  upcomingCollectes,
} from "./normalize";

describe("parseEfsDate", () => {
  it("accepte le format ISO", () => {
    expect(parseEfsDate("2026-09-10T00:00:00")).toBe("2026-09-10");
  });
  it("accepte le format FR", () => {
    expect(parseEfsDate("10/09/2026 00:00:00")).toBe("2026-09-10");
  });
  it("rejette le vide", () => {
    expect(parseEfsDate(null)).toBeNull();
    expect(parseEfsDate("")).toBeNull();
  });
});

describe("parseEfsTime", () => {
  it("tronque aux minutes", () => {
    expect(parseEfsTime("08:30:00")).toBe("08:30");
  });
  it("renvoie null pour vide", () => {
    expect(parseEfsTime("")).toBeNull();
    expect(parseEfsTime(null)).toBeNull();
  });
});

describe("normalizeCollectes", () => {
  const collectes = normalizeCollectes(EFS_SAMPLE_RESPONSE);

  it("écarte les collectes non publiables", () => {
    expect(collectes.find((c) => c.id === "1130246")).toBeUndefined();
  });

  it("normalise un site fixe", () => {
    const mdd = collectes.find((c) => c.fixe);
    expect(mdd).toMatchObject({
      nom: "Maison du don",
      ville: "Toulouse",
      codePostal: "31000",
      fixe: true,
      date: null,
      typesDon: ["blood", "plasma"],
      rdvUrl: "https://efs.link/n7yjA",
    });
    expect(mdd?.horaires).toContain("lundi");
  });

  it("normalise une collecte mobile", () => {
    const mobile = collectes.find((c) => c.id === "1130244");
    expect(mobile).toMatchObject({
      nom: "SALLE COMMINGES",
      ville: "TOULOUSE",
      codePostal: "31400",
      fixe: false,
      date: "2026-09-10",
      heureDebut: "08:30",
      heureFin: "13:30",
      typesDon: ["blood"],
      placesRestantes: 27,
    });
  });

  it("préfixe une URL de RDV sans schéma", () => {
    expect(collectes.find((c) => c.id === "1130244")?.rdvUrl).toBe("https://efs.link/dcjkW");
  });

  it("combine matin et après-midi", () => {
    const span = collectes.find((c) => c.id === "1130245");
    expect(span).toMatchObject({ heureDebut: "09:00", heureFin: "18:00" });
  });
});

describe("collecteAddress", () => {
  it("combine adresse et ligne ville quand l'adresse ne contient pas le code postal", () => {
    expect(
      collecteAddress({ adresse: "12 rue des Lilas", codePostal: "31000", ville: "Toulouse" }),
    ).toBe("12 rue des Lilas · 31000 Toulouse");
  });

  it("ne répète pas la ligne ville si l'adresse contient déjà le code postal", () => {
    expect(
      collecteAddress({ adresse: "12 rue des Lilas, 31000 Toulouse", codePostal: "31000", ville: "Toulouse" }),
    ).toBe("12 rue des Lilas, 31000 Toulouse");
  });

  it("se rabat sur la ligne ville quand l'adresse est vide", () => {
    expect(collecteAddress({ adresse: "", codePostal: "31000", ville: "Toulouse" })).toBe(
      "31000 Toulouse",
    );
  });
});

describe("upcomingCollectes", () => {
  it("écarte les collectes passées, garde les sites fixes, trie par date", () => {
    const result = upcomingCollectes(normalizeCollectes(EFS_SAMPLE_RESPONSE), "2026-09-01");
    expect(result.map((c) => c.id)).toEqual(["sf-327116", "1130245", "1130244"]);
  });

  it("écarte une collecte mobile dont la date est dépassée", () => {
    const result = upcomingCollectes(normalizeCollectes(EFS_SAMPLE_RESPONSE), "2026-09-15");
    expect(result.map((c) => c.id)).toEqual(["sf-327116"]);
  });
});
