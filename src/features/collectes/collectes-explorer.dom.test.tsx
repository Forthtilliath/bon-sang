import { describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen, userEvent } from "@/test/render";

import type { Collecte, DonKind } from "./types";

vi.mock("./collectes-map", () => ({
  CollectesMap: () => <div data-testid="map" />,
}));

import { CollectesExplorer } from "./collectes-explorer";

let seq = 0;
function collecte(nom: string, typesDon: DonKind[]): Collecte {
  seq += 1;
  return {
    id: `c${seq}`,
    nom,
    ville: nom,
    codePostal: "31000",
    adresse: "1 rue du Don",
    lat: 43.6,
    lng: 1.44,
    fixe: true,
    date: null,
    heureDebut: null,
    heureFin: null,
    horaires: null,
    typesDon,
    rdvUrl: null,
    placesRestantes: null,
  };
}

const SAMPLE = [
  collecte("Maison du don Toulouse", ["blood"]),
  collecte("Site Bordeaux", ["plasma"]),
  collecte("Site Lyon", ["platelets"]),
];

describe("<CollectesExplorer>", () => {
  it("liste toutes les collectes et annonce leur nombre", () => {
    renderWithIntl(<CollectesExplorer collectes={SAMPLE} />);
    expect(screen.getByText("3 collectes affichées")).toBeInTheDocument();
    for (const name of ["Maison du don Toulouse", "Site Bordeaux", "Site Lyon"]) {
      expect(screen.getByRole("button", { name: new RegExp(name) })).toBeInTheDocument();
    }
  });

  it("filtre par type de don et bascule aria-pressed", async () => {
    const user = userEvent.setup();
    renderWithIntl(<CollectesExplorer collectes={SAMPLE} />);

    const plasma = screen.getByRole("button", { name: "Plasma" });
    expect(plasma).toHaveAttribute("aria-pressed", "false");
    await user.click(plasma);

    expect(plasma).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1 collecte affichée")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Maison du don Toulouse/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Site Bordeaux/ })).toBeInTheDocument();
  });

  it("marque la fiche sélectionnée avec aria-current", async () => {
    const user = userEvent.setup();
    renderWithIntl(<CollectesExplorer collectes={SAMPLE} />);
    const card = screen.getByRole("button", { name: /Site Lyon/ });
    expect(card).not.toHaveAttribute("aria-current");
    await user.click(card);
    expect(screen.getByRole("button", { name: /Site Lyon/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("affiche un message quand aucun résultat ne correspond aux filtres", async () => {
    const user = userEvent.setup();
    renderWithIntl(<CollectesExplorer collectes={[collecte("Site unique", ["blood"])]} />);
    await user.click(screen.getByRole("button", { name: "Plasma" }));
    expect(screen.getByText("Aucune collecte ne correspond à ces filtres.")).toBeInTheDocument();
  });

  it("bascule la période sélectionnée", async () => {
    const user = userEvent.setup();
    renderWithIntl(<CollectesExplorer collectes={SAMPLE} />);
    const week = screen.getByRole("button", { name: "7 jours" });
    expect(week).toHaveAttribute("aria-pressed", "false");
    await user.click(week);
    expect(week).toHaveAttribute("aria-pressed", "true");
    // Sites fixes : la période ne les masque pas.
    expect(screen.getByText("3 collectes affichées")).toBeInTheDocument();
  });
});
