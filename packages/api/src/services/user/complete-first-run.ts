import { eq } from "drizzle-orm";

import { users, type RlsClient } from "@syn/db";

/**
 * FR-05's *Open today* — the one write that ends the sequence.
 *
 * IT IS CALLED ON *OPEN TODAY*, NOT ON ARRIVAL AT STEP 5 (Epic 1 FR-05). A
 * person who reloads the last screen should still see it; marking completion
 * when the screen renders would replace *Your list is ready* with a redirect
 * to today, which is the one screen they have not asked for yet.
 *
 * BOTH COLUMNS MOVE IN ONE WRITE. `first_run_completed_at` set and
 * `first_run_step` nulled are the same fact stated twice; written separately,
 * a failure between them leaves an account that is finished and still owes
 * step 5, and the entry tree would send it back into a sequence it has
 * completed.
 *
 * IT IS IDEMPOTENT. `completed_at` is written unconditionally rather than only
 * when null, because a second call means a double submit or a retry, and
 * refusing it would surface an error for something that already succeeded.
 * The cost is a moved timestamp on a re-run, which nothing reads for meaning.
 */
export async function completeFirstRun(
  rls: RlsClient,
  userId: string,
): Promise<{ completedAt: Date }> {
  const completedAt = new Date();

  await rls.execute((tx) =>
    tx
      .update(users)
      .set({
        firstRunCompletedAt: completedAt,
        firstRunStep: null,
        updatedAt: completedAt,
      })
      .where(eq(users.id, userId)),
  );

  return { completedAt };
}
