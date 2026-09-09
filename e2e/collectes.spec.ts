import { expect, test } from "@playwright/test";

test("la page collectes affiche le formulaire de recherche", async ({ page }) => {
  await page.goto("/collectes");
  await expect(page.getByPlaceholder("Ville ou code postal")).toBeVisible();
  await expect(page.getByText(/Saisissez une ville/)).toBeVisible();
});

test("une recherche renvoie des collectes ou un message clair", async ({ page }) => {
  test.slow(); // dépend de l'API EFS
  await page.goto("/collectes?ville=Paris");
  await expect(page.getByText(/collecte|Aucune collecte|indisponible/i).first()).toBeVisible({
    timeout: 20_000,
  });
});
