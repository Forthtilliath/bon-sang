import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const isCI = !!process.env.CI;
const externalBaseURL = process.env.E2E_BASE_URL || undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  use: {
    baseURL: externalBaseURL ?? `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: externalBaseURL
    ? undefined
    : {
        // Serveur de prod : bien plus stable que `next dev` sous charge parallèle.
        command: "npm run build && npm run start",
        port: PORT,
        env: { PORT: String(PORT) },
        reuseExistingServer: !isCI,
        timeout: 180_000,
      },
});
