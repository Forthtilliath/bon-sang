import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/**
 * Règles connues comme non respectées, suivies dans AMELIORATIONS.md (section
 * « Accessibilité / UX »). À retirer de cette liste au fur et à mesure des
 * correctifs pour que la régression soit détectée.
 */
const KNOWN_ISSUES: string[] = [
  // Contraste AA insuffisant sur `text-muted text-xs` / badges `opacity-60`.
  "color-contrast",
  // `role="progressbar"` du quiz sans nom accessible.
  "aria-progressbar-name",
  // Champs nombre / date du quiz sans <label> associé (seule la <legend> décrit).
  "label",
];

async function scan(page: Page) {
  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(KNOWN_ISSUES)
    .analyze();
}

const PAGES = ["/", "/comprendre", "/qui-ca-aide", "/eligibilite", "/collectes", "/mon-suivi"];

for (const path of PAGES) {
  test(`axe : ${path} sans violation`, async ({ page }) => {
    await page.goto(path);
    const results = await scan(page);
    expect(results.violations).toEqual([]);
  });
}
