import { expect, test } from "@playwright/test";

test("l'accueil présente le pitch et les CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Comprendre");
  await expect(page.getByRole("link", { name: "Puis-je donner ?" }).first()).toBeVisible();
});

test("le CTA mène au quiz d'éligibilité", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Puis-je donner ?" }).first().click();
  await expect(page).toHaveURL(/\/eligibilite$/);
  await expect(page.getByRole("group")).toContainText("âge");
});

test("le sélecteur de langue bascule en anglais", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Understand");
});

test("le squelette a11y est présent", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Aller au contenu principal" })).toBeAttached();
  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});
