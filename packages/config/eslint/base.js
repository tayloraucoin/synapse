import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

import { noEmojiRules } from "./no-emoji.js";
import { processEnvConfig } from "./process-env.js";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    // UX v1.2 R29 — no emoji in any string the app speaks (see no-emoji.js).
    files: ["**/copy.ts"],
    rules: noEmojiRules,
  },
  ...processEnvConfig,
  {
    ignores: ["dist/**"],
  },
];
