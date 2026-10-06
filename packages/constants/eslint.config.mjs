import { config } from "@syn/config/eslint/base";
import { EMOJI_SEED_FILES, noEmojiRules } from "@syn/config/eslint/no-emoji";

/**
 * UX v1.2 R29 (TD-20): a glyph lives only in a seed's `icon.value`. The base
 * config already covers every `copy.ts`; this package's whole `src/` gets the
 * rule too, with the seed files excepted — RUN-1's acceptance greps their
 * titles for the part the selector cannot express.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  ...config,
  {
    files: ["src/**/*.ts"],
    ignores: EMOJI_SEED_FILES,
    rules: noEmojiRules,
  },
];
