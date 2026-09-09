import { expect, test } from "@playwright/test";

test("la page collectes affiche le formulaire de recherche", async ({ page }) => {
  await page.goto("/collectes");
  await expect(page.getByPlaceholder("Ville ou code postal")).toBeVisible();
  await expect(page.getByText(/Saisissez une ville/)).toBeVisible();
});

test("une recherche affiche des collectes et une carte qui charge ses tuiles", async ({ page }) => {
  test.slow(); // dépend de l'API EFS et des tuiles OpenFreeMap

  let vectorTiles = 0;
  page.on("requestfinished", (r) => {
    if (r.url().includes(".pbf")) vectorTiles += 1;
  });

  await page.goto("/collectes?ville=Paris");

  await expect(page.getByText(/collecte|Aucune collecte|indisponible/i).first()).toBeVisible({
    timeout: 20_000,
  });

  // La carte MapLibre monte et rend son canvas.
  await expect(page.locator(".maplibregl-canvas")).toBeVisible({ timeout: 15_000 });

  // Et elle charge bien des tuiles vectorielles (régression maplibre v6 / worker).
  await expect.poll(() => vectorTiles, { timeout: 15_000 }).toBeGreaterThan(0);
});
