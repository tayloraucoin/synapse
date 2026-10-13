import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * The web app's unit tests (USE-7): node only, no DOM library. `@/` is the
 * app root, as in `tsconfig.json`; the old app under `_legacy/` is not run.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "_legacy/**", ".next/**"],
  },
});
