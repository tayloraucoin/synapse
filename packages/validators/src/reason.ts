import { z } from "zod";

import { REASON_LABEL_MAX } from "@syn/constants";

/**
 * ST-06a's form — Epic 1 §9.
 *
 * The uniqueness message is here for the client's benefit, but uniqueness
 * itself cannot be checked by a schema: it is a question about the person's
 * other rows, so the service raises it and the sheet renders this sentence.
 * One string, two places it can surface, one definition.
 */
export const missTierSchema = z.enum([
  "circumstance",
  "scoping",
  "chose_not_to",
]);

export const reasonFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Give it a name.")
    .max(REASON_LABEL_MAX, "Give it a name."),
  tier: missTierSchema,
});

export type ReasonFormInput = z.infer<typeof reasonFormSchema>;

/** Editing addresses a row by its stable key, never by its label. */
export const reasonUpdateInput = reasonFormSchema.extend({
  key: z.string().min(1).max(64),
});

export const reasonKeyInput = z.object({ key: z.string().min(1).max(64) });

export const reasonArchiveInput = z.object({
  key: z.string().min(1).max(64),
  archived: z.boolean(),
});
