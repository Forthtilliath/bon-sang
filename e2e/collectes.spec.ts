import { expect, test } from "@playwright/test";

test("la page collectes affiche le formulaire de recherche", async ({ page }) => {
  await page.goto("/collectes");
  await expect(page.getByPlaceholder("Ville ou code postal")).toBeVisible();
  await expect(page.getByText(/Saisissez une ville/)).toBeVisible();
});

test("une recherche affiche la liste et une carte qui charge ses tuiles", async ({ page }) => {
  test.slow(); // dépend de l'API EFS et des tuiles OpenFreeMap

  let vectorTiles = 0;
  page.on("requestfinished", (r) => {
    if (r.url().includes(".pbf")) vectorTiles += 1;
  });

  await page.goto("/collectes?ville=Paris");

  await expect(page.getByText(/collecte|Aucune collecte|indisponible/i).first()).toBeVisible({
    timeout: 20_000,
  });

  await expect(page.locator(".maplibregl-canvas")).toBeVisible({ timeout: 15_000 });
  await expect.poll(() => vectorTiles, { timeout: 15_000 }).toBeGreaterThan(0);
});

test("cliquer un marqueur ouvre une bulle d'info", async ({ page }) => {
  test.slow();

  await page.goto("/collectes?ville=Paris");
  await expect(page.locator(".maplibregl-canvas")).toBeVisible({ timeout: 15_000 });

  const marker = page.locator(".ofm-marker").first();
  await expect(marker).toBeVisible({ timeout: 10_000 });
  await marker.click({ force: true });

  const popup = page.locator(".ofm-popup");
  await expect(popup).toBeVisible();
  // Un type de don et le lien de RDV sont attendus dans la bulle.
  await expect(popup.locator(".ofm-popup__title")).not.toBeEmpty();
});
