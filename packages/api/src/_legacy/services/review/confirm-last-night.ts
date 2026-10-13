import { eq } from "drizzle-orm";

import { dayItems, type RlsClient } from "@syn/db";

import { readDay, readDayBlocks } from "../day/materialize-day";
import { afterDevicesOff } from "../day/wind-down";

/**
 * Confirm yesterday, from the review — UX v1.1 §7.3, R16 (DYN-18): "If the
 * Day Review is opened before the morning … the same panel is the first
 * section of the review. Confirming writes done for ticked items. Unticked
 * items become not confirmed."
 *
 * THE SAME RULE `confirmDay` USES AT THE PICK, on the review's own day: the
 * wind-down items at or after the marker that are still waiting — `upcoming`,
 * or already `not_confirmed` (R16: "resolvable there with one tap") — are
 * written done when ticked and *not confirmed* otherwise. Done and running
 * rows are the record and are never touched; nothing is pre-ticked here
 * because nothing is decided here — the panel sends only what was ticked.
 */
export async function confirmLastNight(
  rls: RlsClient,
  userId: string,
  input: { date: string; doneItemIds: readonly string[] },
  now: Date = new Date(),
): Promise<{ done: number; notConfirmed: number }> {
  const ticked = new Set(input.doneItemIds);
  return rls.execute(async (tx) => {
    const day = await readDay(tx, userId, input.date);
    if (!day) return { done: 0, notConfirmed: 0 };
    const blocks = await readDayBlocks(tx, userId, day.id);
    const windDown = blocks.find((block) => block.kind === "wind_down");
    if (!windDown) return { done: 0, notConfirmed: 0 };

    const pending = afterDevicesOff(windDown.items).filter(
      (item) =>
        item.assignmentState === "assigned" &&
        item.doneAt === null &&
        (item.completionState === "upcoming" || item.completionState === "not_confirmed"),
    );

    let done = 0;
    let notConfirmed = 0;
    for (const item of pending) {
      if (ticked.has(item.id)) {
        await tx
          .update(dayItems)
          .set({ completionState: "done", doneAt: now, updatedAt: now })
          .where(eq(dayItems.id, item.id));
        done += 1;
      } else if (item.completionState !== "not_confirmed") {
        await tx
          .update(dayItems)
          .set({ completionState: "not_confirmed", updatedAt: now })
          .where(eq(dayItems.id, item.id));
        notConfirmed += 1;
      }
    }
    return { done, notConfirmed };
  });
}
