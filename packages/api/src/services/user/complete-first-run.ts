import { eq } from "drizzle-orm";

import { users, type RlsClient } from "@syn/db";
import type { OverflowMode } from "@syn/types";
import { weekKeyOf } from "@syn/utils";

import { prefillWeek } from "../day/prefill-week";
import { resolveTodayFor } from "../day/today";

/**
 * *Open today* / *Plan this week first* — the one write that ends the
 * sequence (UX v1.1 §4.12; FR-05 under v1.0).
 *
 * IT IS CALLED ON THE BUTTON, NOT ON ARRIVAL AT THE LAST SCREEN. A person who
 * reloads the fit screen should still see it; marking completion when the
 * screen renders would replace the room they have with a redirect to today,
 * which is the one screen they have not asked for yet.
 *
 * BOTH COLUMNS MOVE IN ONE WRITE. `first_run_completed_at` set and
 * `first_run_step` nulled are the same fact stated twice; written separately,
 * a failure between them leaves an account that is finished and still owes
 * step 12, and the entry tree would send it back into a sequence it has
 * completed. `overflow_mode` rides in the same write (§4.12: "Stores
 * `users.overflow_mode`") when the screen asked the question.
 *
 * THEN THE WEEK IS PRE-FILLED (§4.13: "The first week after first run is
 * pre-filled from typical days and counts, so the week build's first job is
 * reading, not authoring"). `prefillWeek` skips days that already carry a
 * block, so a re-run — a double submit, a retry — plans nothing twice. The
 * week is the person's current one in their own zone (`resolveTodayFor`),
 * never the server's.
 *
 * IT IS IDEMPOTENT. `completed_at` is written unconditionally rather than only
 * when null, because a second call means a double submit or a retry, and
 * refusing it would surface an error for something that already succeeded.
 * The cost is a moved timestamp on a re-run, which nothing reads for meaning.
 */
export async function completeFirstRun(
  rls: RlsClient,
  userId: string,
  input: { overflowMode?: OverflowMode } = {},
): Promise<{ completedAt: Date; planned: number }> {
  const completedAt = new Date();

  await rls.execute((tx) =>
    tx
      .update(users)
      .set({
        firstRunCompletedAt: completedAt,
        firstRunStep: null,
        ...(input.overflowMode === undefined ? {} : { overflowMode: input.overflowMode }),
        updatedAt: completedAt,
      })
      .where(eq(users.id, userId)),
  );

  const resolved = await resolveTodayFor(rls, userId, completedAt);
  const planned =
    resolved === null
      ? 0
      : (await prefillWeek(rls, userId, weekKeyOf(resolved.todayKey))).planned;

  return { completedAt, planned };
}
