import { expect, test } from "@playwright/test";

test("un don ajouté est listé, persiste au rechargement et débloque un badge", async ({ page }) => {
  await page.goto("/mon-suivi");

  await page.getByLabel("Date").fill("2026-05-01");
  await page.getByLabel("Type").selectOption("blood");
  await page.getByRole("button", { name: "Ajouter" }).click();

  const item = page.getByRole("listitem").filter({ hasText: "Sang total" });
  await expect(item).toBeVisible();
  await expect(page.getByText("Premier don", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("listitem").filter({ hasText: "Sang total" })).toBeVisible();

  await page.getByRole("button", { name: "Supprimer" }).first().click();
  await expect(page.getByText("Aucun don enregistré")).toBeVisible();
});
