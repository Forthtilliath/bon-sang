import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen, userEvent } from "@/test/render";

import { Quiz } from "./quiz";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

/** Répond à la question courante (champ nombre ou boutons radio). */
async function answer(user: ReturnType<typeof userEvent.setup>, label: string) {
  const spin = screen.queryByRole("spinbutton");
  if (spin) {
    await user.clear(spin);
    await user.type(spin, label);
  } else {
    await user.click(screen.getByRole("radio", { name: label }));
  }
}

/** Répond puis clique « Suivant ». */
async function advance(user: ReturnType<typeof userEvent.setup>, label: string) {
  await answer(user, label);
  await user.click(screen.getByRole("button", { name: "Suivant" }));
}

/** Déroule tout le quiz : « Suivant » à chaque étape, « Voir le résultat » à la fin. */
async function run(user: ReturnType<typeof userEvent.setup>, labels: string[]) {
  for (let i = 0; i < labels.length - 1; i += 1) await advance(user, labels[i]);
  await answer(user, labels[labels.length - 1]);
  await user.click(screen.getByRole("button", { name: "Voir le résultat" }));
}

const HEALTHY = [
  "30",
  "70",
  "Oui",
  "Non",
  "Non, aucun",
  "Non",
  "Non",
  "Non",
  "Non",
  "Non",
  "Non",
  "Non",
  "Jamais",
];

beforeEach(() => {
  window.localStorage.clear();
});

describe("<Quiz>", () => {
  it("affiche la progression et la première question", () => {
    renderWithIntl(<Quiz />);
    expect(screen.getByText("Question 1 sur 13")).toBeInTheDocument();
    expect(screen.getByRole("group")).toHaveTextContent("Quel âge avez-vous ?");
  });

  it("désactive « Suivant » tant que la question n'a pas de réponse", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Quiz />);
    const next = screen.getByRole("button", { name: "Suivant" });
    expect(next).toBeDisabled();
    await user.type(screen.getByRole("spinbutton"), "30");
    expect(next).toBeEnabled();
  });

  it("désactive « Précédent » sur la première étape", () => {
    renderWithIntl(<Quiz />);
    expect(screen.getByRole("button", { name: "Précédent" })).toBeDisabled();
  });

  it("insère une question conditionnelle quand on déclare un tatouage", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Quiz />);
    for (const label of ["30", "70", "Oui", "Non", "Non, aucun"]) await advance(user, label);
    // Étape 6 : question « tatouage ». Répondre « Oui » doit révéler la date.
    expect(screen.getByText("Question 6 sur 13")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Oui" }));
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    expect(screen.getByText("Question 7 sur 14")).toBeInTheDocument();
    expect(screen.getByRole("group")).toHaveTextContent("À quelle date ?");
  });

  it("conclut un parcours sans obstacle par un verdict « éligible »", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Quiz />);
    await run(user, HEALTHY);
    expect(screen.getByRole("status")).toHaveTextContent("Vous semblez pouvoir donner");
  });

  it("signale une contre-indication définitive après une transfusion", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Quiz />);
    const answers = [...HEALTHY];
    answers[9] = "Oui"; // question « transfusion déjà reçue »
    await run(user, answers);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Le don n'est pas possible");
    expect(status).toHaveTextContent("contre-indication définitive");
  });
});
