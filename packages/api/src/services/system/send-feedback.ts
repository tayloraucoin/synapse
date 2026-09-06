import { feedbackMessages, type RlsClient } from "@syn/db";
import type { FeedbackInput } from "@syn/validators";

/**
 * SY-01's *Send* — cross-cutting §10.
 *
 * THE ROW IS THE INBOX. Phase 1 has no ticketing and no email pipeline: a
 * message lands in `feedback_messages` and the person who builds this reads the
 * table. That is the whole system, and saying so is better than a queue nobody
 * drains.
 *
 * NOTHING FROM THE LIST IS WRITTEN. Three content columns — the message, the
 * screen path, the version — and the schema refuses a path carrying anything
 * after the `?`, which is where an item id would live if one ever leaked. There
 * is no code path here that reads a day, an item, or a title.
 *
 * THE SWITCH IS OBEYED LITERALLY. Off means both context columns are stored
 * NULL, not "stored but ignored". The helper says *Nothing from your list is
 * included*, and a person who turns the switch off is asking for less than
 * that, so the row has to actually hold less.
 *
 * INSERT-ONLY, EVEN FOR ITS AUTHOR. `feedback_messages` has an owner `INSERT`
 * policy and no `SELECT` policy at all (SET-1), so this writes through the RLS
 * bridge like everything else and cannot read back what it wrote — which is
 * why it returns nothing but a flag.
 */
export async function sendFeedback(
  rls: RlsClient,
  userId: string,
  input: FeedbackInput,
): Promise<{ sent: true }> {
  await rls.execute((tx) =>
    tx.insert(feedbackMessages).values({
      userId,
      message: input.message,
      screenPath: input.includeContext ? (input.screenPath ?? null) : null,
      appVersion: input.includeContext ? (input.appVersion ?? null) : null,
    }),
  );

  return { sent: true };
}
