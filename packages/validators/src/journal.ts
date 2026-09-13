import { z } from "zod";

import {
  JOURNAL_ANSWER_MAX,
  JOURNAL_PROMPT_MAX,
  JOURNAL_PROMPTS_MAX,
} from "@syn/constants";

import { dateKeySchema } from "./keys";

/**
 * The journal — UX v1.1 §7.2, §11.10 (TD-7).
 *
 * ONE KEY PER SAVE. The screen autosaves each field as the person pauses, and
 * the service merges one key into the day's row, so two fields written from
 * two devices never overwrite each other. A whole-entry save would be the
 * simpler schema and the wrong one.
 */
export const journalPromptKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[a-z][a-z0-9_]*$/);

export const journalSaveInput = z.object({
  date: dateKeySchema,
  key: journalPromptKeySchema,
  value: z.string().max(JOURNAL_ANSWER_MAX),
});

export type JournalSaveInput = z.infer<typeof journalSaveInput>;

export const journalGetInput = z.object({ date: dateKeySchema });

/**
 * The person's prompts — ordered, keys unique and stable (Settings → Closing
 * the day, v1.1 §4.10). A key is what the answers are stored under, so a
 * renamed prompt keeps its answers.
 */
export const journalPromptsSchema = z
  .array(
    z.object({
      key: journalPromptKeySchema,
      label: z.string().trim().min(1).max(JOURNAL_PROMPT_MAX),
    }),
  )
  .max(JOURNAL_PROMPTS_MAX)
  .refine(
    (prompts) => new Set(prompts.map((prompt) => prompt.key)).size === prompts.length,
    // [COPY — needs Vesper sign-off]
    { message: "Each prompt needs its own key." },
  );

export type JournalPromptsInput = z.infer<typeof journalPromptsSchema>;
