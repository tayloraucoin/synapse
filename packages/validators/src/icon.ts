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
 * `IconValue` as a discriminated union — the same three arms `@syn/types`
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
]);

export type IconValueInput = z.infer<typeof iconValueSchema>;
