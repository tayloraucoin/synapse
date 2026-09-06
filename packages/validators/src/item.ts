import { z } from "zod";

/** LS-01's two writes. */

export const itemIdInput = z.object({ id: z.string().uuid() });

/**
 * Mark done, or undo.
 *
 * `at` IS SENT BY THE CLIENT, which is unusual and deliberate: it is the
 * instant the checkbox was tapped, not the instant the request arrived. A slow
 * network must not move when something happened, and on undo this carries the
 * ORIGINAL `done_at` back so restoring a record does not rewrite it.
 *
 * It is coerced rather than parsed as a string because superjson already gives
 * the resolver a `Date`; the coercion is what makes the schema honest about
 * both call sites, the HTTP one and the server caller.
 */
export const setDoneInput = z.object({
  id: z.string().uuid(),
  done: z.boolean(),
  at: z.coerce.date(),
});

export type SetDoneInput = z.infer<typeof setDoneInput>;
