import { z } from "zod";

/**
 * The icon and the category hue — one Zod home, moved here from `habit.ts`
 * in RUN-1 because UX v1.2 puts a glyph on a fixture (§3.6), a work-day type
 * (§3.8) and a day plan (§3.13), and `template.ts` cannot import `habit.ts`
 * without a cycle. `habit.ts` re-exports both so no caller changed.
 */

export const categoryKeySchema = z.enum([
  "leaf",
  "sky",
  "clay",
  "rose",
  "amber",
  "slate",
  "plum",
  "moss",
]);

/**
 * A palette key or a `#rrggbb` hex: the icon picker's colour, and a block's
 * Colour row (USE-2's `blocks.color`). The palette's keys belong to the
 * design layer, so this checks the shape only; hex is stored lowercase, as
 * `saved_colours` requires.
 */
export const colourValueSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^(#[0-9a-f]{6}|[a-z]+(_[a-z]+)*)$/, "Use a palette colour or #rrggbb.");

/**
 * `IconValue` as a discriminated union — the same four arms `@syn/types`
 * declares. Discriminated rather than a loose object so a caller cannot send
 * `{ kind: "emoji", colorKey: "leaf" }` and have it stored.
 */
export const iconValueSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("emoji"), value: z.string().min(1).max(16) }),
  z.object({
    kind: z.literal("curated"),
    value: z.string().min(1).max(64),
    colorKey: categoryKeySchema.nullable(),
  }),
  z.object({ kind: z.literal("image"), value: z.string().min(1).max(512) }),
  /** USE (USE-3): USE-2's fourth arm, a Lucide icon by name in a colour. */
  z.object({
    kind: z.literal("lucide"),
    value: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use a Lucide icon name.")
      .max(64),
    color: colourValueSchema,
  }),
]);

export type IconValueInput = z.infer<typeof iconValueSchema>;
