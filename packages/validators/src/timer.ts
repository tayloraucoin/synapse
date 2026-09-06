import { z } from "zod";

/**
 * IT-02's inputs — Epic 2 §4.
 *
 * THE TWO CLIENT-CHECKABLE ERRORS ARE HERE; the third is not. Order is a fact
 * about the two values in front of you, and so is "not in the future", so both
 * are refusals the form can make before a request leaves. OVERLAP is a
 * question about the item's other sessions, which the browser does not have —
 * it is the server's answer, and the sheet renders the sentence it returns.
 */
export const manualSessionInput = z
  .object({
    itemId: z.string().uuid(),
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date(),
  })
  .superRefine((value, ctx) => {
    if (value.endedAt.getTime() <= value.startedAt.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endedAt"],
        message: '"To" should be after "from".',
      });
    }
  });

export const updateSessionInput = z
  .object({
    id: z.string().uuid(),
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date(),
  })
  .superRefine((value, ctx) => {
    if (value.endedAt.getTime() <= value.startedAt.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endedAt"],
        message: '"To" should be after "from".',
      });
    }
  });

export const sessionIdInput = z.object({ id: z.string().uuid() });

/**
 * A removed row, handed back for its undo.
 *
 * It is `unknown` on purpose: the client never reads it, only carries it. A
 * typed shape here would be a second declaration of the row that could drift
 * from the schema, for the sake of code that treats it as opaque.
 */
export const restorePayloadInput = z.object({ payload: z.unknown() });
