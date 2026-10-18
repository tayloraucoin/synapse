/**
 * The journeys' env seam (USE-113): the one `process.env` reader under
 * `e2e/`, named in packages/config/eslint/process-env.js.
 *
 * Playwright loads the specs as CommonJS (apps/web has no `"type": "module"`),
 * and the app's `env.ts` reads `import.meta.url`, which CommonJS cannot parse.
 * So the specs read the test account here, loading the same `.env*` files
 * from the app's root with `@next/env`, and import nothing of the app's.
 *
 * Local tier only: a shell that names another tier stops here, so no spec
 * signs in to staging or writes to it.
 */

import path from "node:path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(path.resolve(__dirname, ".."));

const tier = process.env.DATABASE_ENVIRONMENT ?? "local";
if (tier !== "local") {
  throw new Error(
    `The journeys run on the local tier only; DATABASE_ENVIRONMENT is "${tier}".`,
  );
}

/** Unset, the journeys that need the account skip (see .env.example). */
export const env = {
  e2e: {
    email: process.env.E2E_EMAIL || undefined,
    password: process.env.E2E_PASSWORD || undefined,
  },
};

/** The journeys' own dev server, apart from anything else on :3000. */
export const E2E_PORT = 3100;
