/**
 * Typed mirrors of the token names in `@syn/config/tailwind/preset.css`.
 *
 * These are NAMES, not values. The hex lives in the preset and nowhere else;
 * this module exists so a story, a swatch grid, or a future Expo style map can
 * enumerate the scales without re-typing them, and so a renamed token breaks
 * the build rather than rendering an empty swatch.
 */

import type { CategoryKey } from "@syn/types";

export const NEUTRAL_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
] as const;

export const ACCENT_STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800,
] as const;

export const VIOLET_STEPS = ACCENT_STEPS;

/** Authored in the official spec §9.3. */
export const CATEGORY_AUTHORED_STEPS = [100, 500, 700] as const;

/** Derived by `color-mix` — [PROPOSED, needs sign-off] per handoff §11 Q2. */
export const CATEGORY_DERIVED_STEPS = [200, 800] as const;

export const CATEGORY_STEPS = [100, 200, 500, 700, 800] as const;

export const CATEGORY_KEYS = [
  "leaf",
  "sky",
  "clay",
  "rose",
  "amber",
  "slate",
  "plum",
  "moss",
] as const satisfies readonly CategoryKey[];

export type NeutralStep = (typeof NEUTRAL_STEPS)[number];
export type AccentStep = (typeof ACCENT_STEPS)[number];
export type CategoryStep = (typeof CATEGORY_STEPS)[number];

export function neutralToken(step: NeutralStep): string {
  return `--syn-neutral-${step}`;
}

export function accentToken(step: AccentStep): string {
  return `--syn-accent-${step}`;
}

export function violetToken(step: AccentStep): string {
  return `--syn-violet-${step}`;
}

export function categoryToken(key: CategoryKey, step: CategoryStep): string {
  return `--syn-cat-${key}-${step}`;
}

export const DESTRUCTIVE_TOKEN = "--syn-destructive-500";

/**
 * The semantic layer — the names components actually reference. Both themes
 * resolve through these, which is why no component writes a `dark:` colour.
 */
export const SEMANTIC_TOKENS = [
  "--paper",
  "--ink",
  "--surface",
  "--hairline",
  "--text-body",
  "--text-secondary",
  "--text-muted",
  "--text-disabled",
  "--accent-text",
  "--accent-hover-surface",
  "--violet-text",
  "--violet-band",
  "--violet-band-text",
  "--destructive",
] as const;
