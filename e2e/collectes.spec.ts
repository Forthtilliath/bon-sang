import { expect, test } from "@playwright/test";

test("la page collectes affiche le formulaire de recherche", async ({ page }) => {
  await page.goto("/collectes");
  await expect(page.getByPlaceholder("Ville ou code postal")).toBeVisible();
  await expect(page.getByText(/Saisissez une ville/)).toBeVisible();
});

test("une recherche affiche la liste et une carte qui charge ses tuiles", async ({ page }) => {
  test.slow(); // dépend de l'API EFS et des tuiles vectorielles CARTO

  let vectorTiles = 0;
  page.on("requestfinished", (r) => {
    if (/\.(pbf|mvt)(\?|$)/.test(r.url())) vectorTiles += 1;
  });

  await page.goto("/collectes?ville=Paris");

  await expect(page.getByText(/collecte|Aucune collecte|indisponible/i).first()).toBeVisible({
    timeout: 20_000,
  });

  await expect(page.locator(".maplibregl-canvas")).toBeVisible({ timeout: 15_000 });
  await expect.poll(() => vectorTiles, { timeout: 15_000 }).toBeGreaterThan(0);
});

test("sélectionner une collecte dans la liste ouvre sa bulle sur la carte", async ({ page }) => {
  test.slow();

  await page.goto("/collectes?ville=Paris");
  await expect(page.locator(".maplibregl-canvas")).toBeVisible({ timeout: 15_000 });

  // La liste des fiches est la porte d'entrée clavier ; la carte est clusterisée.
  const card = page.locator("main ul li button").first();
  await expect(card).toBeVisible({ timeout: 10_000 });
  await card.click();

  const popup = page.locator(".ofm-popup");
  await expect(popup).toBeVisible();
  await expect(popup.locator(".ofm-popup__title")).not.toBeEmpty();
});
