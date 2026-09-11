import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithIntl, screen, userEvent, within } from "@/test/render";

import { TRACKER_STORAGE_KEY } from "./types";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const downloadTextFile = vi.fn();
vi.mock("@/lib/download", () => ({
  downloadTextFile: (...args: unknown[]) => downloadTextFile(...args),
}));

import { Tracker } from "./tracker";

function addDonation({ date, type, place }: { date: string; type?: string; place?: string }) {
  fireEvent.change(screen.getByLabelText("Date"), { target: { value: date } });
  if (type) fireEvent.change(screen.getByLabelText("Type"), { target: { value: type } });
  if (place) fireEvent.change(screen.getByLabelText("Lieu"), { target: { value: place } });
  fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));
}

beforeEach(() => {
  window.localStorage.clear();
  downloadTextFile.mockClear();
});

describe("<Tracker>", () => {
  it("affiche les sections du suivi", () => {
    renderWithIntl(<Tracker />);
    for (const title of [
      "Prochain don",
      "Journal de dons",
      "Statistiques",
      "Profil",
      "Badges",
      "Vos données",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });

  it("ajoute puis supprime un don du journal", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Tracker />);
    expect(screen.getByText("Aucun don enregistré pour l'instant.")).toBeInTheDocument();

    addDonation({ date: "2026-01-15", type: "plasma", place: "Toulouse" });

    const list = screen.getAllByRole("list")[0]; // journal, rendu avant les badges
    expect(within(list).getByText(/Toulouse/)).toBeInTheDocument();
    expect(within(list).getByText(/Plasma/)).toBeInTheDocument();
    expect(screen.queryByText("Aucun don enregistré pour l'instant.")).not.toBeInTheDocument();

    await user.click(within(list).getByRole("button", { name: "Supprimer" }));
    expect(screen.getByText("Aucun don enregistré pour l'instant.")).toBeInTheDocument();
  });

  it("modifie un don existant", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Tracker />);
    addDonation({ date: "2026-01-15", type: "plasma", place: "Toulouse" });

    const list = screen.getAllByRole("list")[0];
    await user.click(within(list).getByRole("button", { name: "Modifier" }));
    expect(screen.getByLabelText("Date")).toHaveValue("2026-01-15");

    fireEvent.change(screen.getByLabelText("Lieu"), { target: { value: "Bordeaux" } });
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(within(list).getByText(/Bordeaux/)).toBeInTheDocument();
    expect(within(list).queryByText(/Toulouse/)).not.toBeInTheDocument();
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
  });

  it("met à jour les statistiques et le compte à rebours du prochain badge", () => {
    renderWithIntl(<Tracker />);
    expect(screen.getByText("Encore 1 don avant le badge « Premier don ».")).toBeInTheDocument();

    addDonation({ date: "2026-02-01" });

    expect(screen.getByText("Encore 2 dons avant le badge « Trois dons ».")).toBeInTheDocument();
    const stats = screen.getByRole("heading", { name: "Statistiques" }).closest("section")!;
    expect(within(stats).getByText("Dons enregistrés")).toBeInTheDocument();
  });

  it("débloque le badge « Premier don » dès le premier don", () => {
    renderWithIntl(<Tracker />);
    const badge = screen.getByText("Premier don").closest("li")!;
    expect(within(badge).getByText("À débloquer")).toBeInTheDocument();

    addDonation({ date: "2026-02-01" });

    const earned = screen.getByText("Premier don").closest("li")!;
    expect(within(earned).getByText("Vous avez enregistré votre premier don.")).toBeInTheDocument();
  });

  it("persiste le profil saisi", () => {
    renderWithIntl(<Tracker />);
    fireEvent.change(screen.getByLabelText("Sexe"), { target: { value: "female" } });
    fireEvent.change(screen.getByLabelText("Groupe sanguin"), { target: { value: "O-" } });

    const stored = JSON.parse(window.localStorage.getItem(TRACKER_STORAGE_KEY)!);
    expect(stored.profile).toEqual({ sex: "female", bloodGroup: "O-" });
  });

  it("rejette un fichier d'import invalide", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Tracker />);
    const input = screen.getByLabelText("Importer (JSON)");
    await user.upload(
      input,
      new File(["{ pas du json"], "suivi.json", { type: "application/json" }),
    );
    expect(await screen.findByText("Fichier invalide : rien n'a été importé.")).toBeInTheDocument();
  });

  it("importe un suivi valide et remplace l'état", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Tracker />);
    const payload = JSON.stringify({
      profile: { sex: "male", bloodGroup: "A+" },
      donations: [{ id: "x1", date: "2025-12-01", type: "blood", place: "Nantes" }],
      reminder: null,
    });
    await user.upload(
      screen.getByLabelText("Importer (JSON)"),
      new File([payload], "suivi.json", { type: "application/json" }),
    );
    expect(await screen.findByText(/Nantes/)).toBeInTheDocument();
  });
});
