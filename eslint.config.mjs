/**
 * Root ESLint config — import-boundary enforcement only.
 *
 * Per-package eslint.config.mjs files handle code quality (TypeScript, React, Next).
 * This config runs once from the repo root so eslint-plugin-boundaries can assign
 * zones from repo-root-relative paths (packages/hooks/src/… → hooks).
 */

import { boundariesConfig } from "@syn/config/eslint/boundaries";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/storybook-static/**",
      "**/dist/**",
      "**/.turbo/**",
    ],
  },
  {
    // Disable comments in source target per-package rules (react-hooks,
    // turbo, …) that this boundaries-only config never loads; reporting them
    // as unused here would make the two lint passes fight each other.
    linterOptions: { reportUnusedDisableDirectives: "off" },
  },
  ...boundariesConfig,
];
