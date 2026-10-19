/**
 * The emoji register rule — UX v1.2 R29, §12.1 (TD-20).
 *
 * "The product's copy never contains one; a thing the person owns may carry
 * one as its icon." A glyph is `IconValue` data on a habit, a step, a workout,
 * a focus, a fixture, a passage, a day plan, the two evening times, or the four
 * archetype cards — never a character in a string the app speaks.
 *
 * Enforced as lint rather than review: it runs inside `yarn lint`, so the
 * spine's verify line does not change, and a violation is a red line in the
 * editor, which is the cheapest enforcement point (Mason's §2.3). The base
 * config applies it to every `copy.ts`; `packages/constants` applies it to its
 * whole `src/` with the five seed files excepted — and those carry a glyph
 * only in `icon.value` (RUN-1's acceptance greps the titles).
 *
 * It is an error, and every package lints with `--max-warnings 0`, so it
 * fails the build either way.
 */

const MESSAGE =
  "No emoji in copy (UX v1.2 R29). A glyph is IconValue data on the person's nouns, never a character in a string the app speaks.";

/** Extended pictographs cover every emoji; variation selectors and ZWJ ride along. */
const EMOJI = "/\\p{Extended_Pictographic}/u";

export const noEmojiRules = {
  "no-restricted-syntax": [
    "error",
    { selector: `Literal[value=${EMOJI}]`, message: MESSAGE },
    { selector: `TemplateElement[value.raw=${EMOJI}]`, message: MESSAGE },
  ],
};

/** The seed files that legitimately carry a glyph in `icon.value` (v1.2 §12.4). */
export const EMOJI_SEED_FILES = [
  "src/starter-library.ts",
  "src/workout-types.ts",
  "src/fixture-kinds.ts",
  "src/work-day-kinds.ts",
  "src/schedule-shapes.ts",
  "src/placed-rows.ts",
];
