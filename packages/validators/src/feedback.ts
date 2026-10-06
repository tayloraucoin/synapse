import { z } from "zod";

import { FEEDBACK_MAX } from "@syn/constants";

/**
 * SY-01's message — cross-cutting §10.
 *
 * THREE CONTENT FIELDS AND NO MORE. The non-negotiable of this slice is that
 * nothing from a person's list reaches `feedback_messages`: a message they
 * typed, the screen they were on, and the app version. There is no item id, no
 * day key, and no title anywhere in this schema, and the shape is the reason a
 * later change cannot quietly add one.
 *
 * **`screenPath` REJECTS A QUERY STRING.** `/day/2026-09-04?item=<uuid>` names
 * an item; `/day/2026-09-04` names a screen. The sheet state in this app lives
 * in the query string (SYS-1's rule), so the query is exactly where list data
 * would leak from — and stripping it on the client is a courtesy, while
 * refusing it here is the control. A path with `?` or `#` is a bug in the
 * caller, not something to sanitise silently.
 */
export const feedbackInput = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Write something first.")
    .max(FEEDBACK_MAX, `Keep it under ${FEEDBACK_MAX} characters.`),
  /** The switch. Off means the two context columns are stored null. */
  includeContext: z.boolean(),
  /**
   * Where they were. Only stored when `includeContext` is true, and only ever
   * a path — the refinement is what makes that a guarantee.
   */
  screenPath: z
    .string()
    .max(512)
    .refine((value) => value.startsWith("/"), {
      message: "A screen path starts with a slash.",
    })
    .refine((value) => !value.includes("?") && !value.includes("#"), {
      message: "A screen path carries no query string.",
    })
    .optional(),
  appVersion: z.string().max(64).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackInput>;
