/**
 * Typed mirrors of the token names in `@syn/config/tailwind/preset.css`.
 *
 * These are NAMES, not values. Every value lives in the preset and nowhere
 * else; this module exists so a story, a swatch grid, or a future Expo style
 * map can enumerate the brand kit's tokens without re-typing them, and so a
 * renamed token breaks the build rather than rendering an empty swatch.
 * `yarn check-brand docs` holds these lists, the preset and the brand docs
 * to one set of names.
 */

import type { CategoryKey } from "@syn/types";

/** The kit's four ramps; step 500 is the exact brand value in each hue. */
export const RAMPS = ["neutral", "brand", "violet", "red"] as const;

export const RAMP_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
] as const;

export type RampName = (typeof RAMPS)[number];
export type RampStep = (typeof RAMP_STEPS)[number];

/** A raw step. Components never reference one: they reach it through a role. */
export function rampToken(ramp: RampName, step: RampStep): string {
  return `--syn-${ramp}-${step}`;
}

/**
 * The kit's colour roles — the names components reference. Each flips under
 * `.dark`, which is why no component writes a `dark:` colour.
 */
export const ROLE_TOKENS = [
  "--background",
  "--surface",
  "--foreground",
  "--muted-foreground",
  "--border",
  "--input",
  "--primary",
  "--primary-foreground",
  "--now",
  "--link",
  "--off-schedule",
  "--off-schedule-text",
  "--destructive",
  "--destructive-foreground",
  "--destructive-text",
] as const;

export type RoleToken = (typeof ROLE_TOKENS)[number];

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

/** A category's chip fill; the name on it is `foreground`. */
export function categoryChipToken(key: CategoryKey): string {
  return `--category-${key}-chip`;
}

/** A category's dot, and a Schedule block's leading edge. */
export function categoryDotToken(key: CategoryKey): string {
  return `--category-${key}-dot`;
}

/**
 * Names from before the kit, kept as aliases of a role in the preset's
 * marked block until a codemod retires them (WEB-1). New code uses the role.
 */
export const LEGACY_ALIASES = {
  "--paper": "--background",
  "--ink": "--foreground",
  "--hairline": "--border",
  "--fill-muted": "--border",
  "--edge": "--input",
  "--text-body": "--foreground",
  "--text-secondary": "--muted-foreground",
  "--text-muted": "--muted-foreground",
  "--text-disabled": "--muted-foreground",
  "--accent-text": "--link",
  "--violet-text": "--off-schedule-text",
} as const satisfies Record<string, RoleToken>;
