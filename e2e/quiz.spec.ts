import { expect, type Page, test } from "@playwright/test";

/** Répond à la question courante puis passe à la suivante (ou affiche le résultat). */
async function step(page: Page, label: string, isLast = false) {
  const number = page.getByRole("spinbutton");
  if (await number.count()) {
    await number.fill(label);
  } else {
    await page.getByRole("radio", { name: label, exact: true }).check();
  }
  await page.getByRole("button", { name: isLast ? "Voir le résultat" : "Suivant" }).click();
}

async function run(page: Page, answers: string[]) {
  await page.goto("/eligibilite");
  for (let i = 0; i < answers.length; i += 1) {
    await step(page, answers[i], i === answers.length - 1);
  }
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
  "Non précisé",
  "0",
];

test("un profil sans obstacle est déclaré éligible", async ({ page }) => {
  await run(page, HEALTHY);
  await expect(page.getByRole("status")).toContainText("Vous semblez pouvoir donner");
});

test("une transfusion déjà reçue est une contre-indication", async ({ page }) => {
  const answers = [...HEALTHY];
  answers[9] = "Oui"; // question « transfusion déjà reçue »
  await run(page, answers);
  await expect(page.getByRole("status")).toContainText("Le don n'est pas possible");
  await expect(page.getByRole("status")).toContainText("contre-indication définitive");
});

test("un mineur doit patienter", async ({ page }) => {
  const answers = [...HEALTHY];
  answers[0] = "16";
  await run(page, answers);
  await expect(page.getByRole("status")).toContainText("Vous devez patienter");
});

test("le retour arrière fonctionne", async ({ page }) => {
  await page.goto("/eligibilite");
  await step(page, "30");
  await expect(page.getByText("Question 2 sur 15")).toBeVisible();
  await page.getByRole("button", { name: "Précédent" }).click();
  await expect(page.getByText("Question 1 sur 15")).toBeVisible();
});
