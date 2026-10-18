import { defineConfig, devices } from "@playwright/test";

/**
 * The web app's journeys (USE-106; Taylor's gate, 2026-10-16): Playwright
 * over the local dev server, `yarn test:e2e`. The local tier only: nothing
 * here signs in to staging or writes to it. Specs live in `e2e/`, apart from
 * vitest's `*.test.ts`.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "yarn dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
