import { defineConfig, devices } from "@playwright/test";

import { E2E_PORT } from "./e2e/env";

const baseURL = `http://localhost:${E2E_PORT}`;

/**
 * The web app's journeys (USE-106; Taylor's gate, 2026-10-16): Playwright
 * over the local dev server, `yarn test:e2e`. The local tier only: nothing
 * here signs in to staging or writes to it. Specs live in `e2e/`, apart from
 * vitest's `*.test.ts`.
 *
 * The server runs on its own port (USE-113): `reuseExistingServer` on :3000
 * picked up whatever else was listening there. It builds into `.next/e2e`,
 * because Next allows one dev server per build folder.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `yarn next dev --port ${E2E_PORT}`,
    url: baseURL,
    env: { DATABASE_ENVIRONMENT: "local", E2E_DIST_DIR: ".next/e2e" },
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
