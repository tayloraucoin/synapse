import type { RlsClient } from "@syn/db";

/**
 * The block-boundary pushes — UX v1.1 §9 (N10 *block_start*, N11
 * *fixture_start*, N12 *devices_off*).
 *
 * THIS IS THE NAMED SEAM DYN-20 FILLS. `confirmDay` calls it at the moment
 * v1.1 §5.4 says the transition pushes are enqueued, so that DYN-20 changes
 * one file and no caller. Until then it enqueues nothing, and says so.
 *
 * WHY NOTHING IS ENQUEUED TODAY. Phase 1's notifications are not a queue:
 * USE-8's scheduler scans each fifteen-minute window and `deliverOnce` keys
 * each delivery on `(kind, target, scheduled_for)`, so a fixture pinned at
 * 9:30 is already found by the *item_start* scan the minute it starts. The
 * three v1.1 kinds need their own scans over `day_blocks` and the marker,
 * and those scans are DYN-20's — a queue would be a second delivery model.
 */
export async function enqueueBlockPushes(
  rls: RlsClient,
  userId: string,
  dayId: string,
): Promise<{ enqueued: number; dayId: string }> {
  // TODO(DYN-20): the three scans over `day_blocks` and the marker, keyed by
  // `deliverOnce`. The arguments are the ones they need; nothing runs yet.
  void rls;
  void userId;
  return { enqueued: 0, dayId };
}
