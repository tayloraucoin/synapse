import { addDays, type WorkTier } from "@syn/utils";
import type { SlotRecord } from "@syn/validators";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import type { WorkServer } from "@/lib/fixtures/work";
import { nextSortOrder, weekdayOf, workBlocksOf, writePlace } from "./place";
import type { SetUpDay } from "./use-set-up-day";
import { TIER_WORDS } from "./week-view";

/**
 * Today with nothing slotted (USE-82; work/today/states/nothing-planned.md,
 * no-work-slotted.md). What was left open is read from the last workday's
 * work slots, never stored: the last date before today with a Work block
 * (Friday on a Monday), its sessions not done, of items still open. With
 * something left open the day is "nothing planned" and offers it at its old
 * tier (D-USE-42); with nothing, it is "no work slotted" (D-USE-65). No
 * count and no word for missed: what is not brought stays in the pool.
 */

export interface LeftOpenItem {
  /** The last workday's slot: the key a check and Bring these in use. */
  slotId: string;
  workItemId: string;
  tier: WorkTier;
  /** "Primary". */
  tierWord: string;
  title: string;
  emoji: string | null;
}

export interface LeftOpen {
  dateKey: string;
  /** "Friday". */
  weekday: string;
  items: LeftOpenItem[];
}

export type TodayEmpty =
  { kind: "nothing-planned"; leftOpen: LeftOpen } | { kind: "no-work-slotted" };

const TIER_ORDER: WorkTier[] = ["urgent", "primary", "secondary", "stretch"];

const workSlotsOf = (day: SetUpDay): SlotRecord[] =>
  workBlocksOf(day).flatMap((b) =>
    b.slots.filter((slot) => slot.workItemId !== null),
  );

/** The last date before `todayKey` holding a Work block, among `days`; a week back at most. */
export function lastWorkday(
  todayKey: string,
  days: readonly SetUpDay[],
): SetUpDay | null {
  for (let back = 1; back <= 7; back++) {
    const dateKey = addDays(todayKey, -back);
    const day = days.find((entry) => entry.date === dateKey);
    if (day && workBlocksOf(day).length > 0) return day;
  }
  return null;
}

/**
 * The last workday's undone sessions of open items, with their tiers, in
 * the tiers' order; null when that day left nothing open. A weekend has no
 * Work block, so it is never the last workday.
 */
export function leftOpen(
  todayKey: string,
  days: readonly SetUpDay[],
): LeftOpen | null {
  const day = lastWorkday(todayKey, days);
  if (!day?.date) return null;
  const items = new Map(day.records.workItems.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const open = workSlotsOf(day)
    .filter((slot) => slot.doneAt === null)
    .sort(
      (a, b) =>
        TIER_ORDER.indexOf(a.tier ?? "primary") -
          TIER_ORDER.indexOf(b.tier ?? "primary") || a.sortOrder - b.sortOrder,
    )
    .flatMap((slot): LeftOpenItem[] => {
      const item = items.get(slot.workItemId!);
      if (!item || item.doneAt !== null || item.archivedAt !== null) return [];
      // One item sits once a day: its first session that day speaks for it.
      if (seen.has(item.id)) return [];
      seen.add(item.id);
      const tier = slot.tier ?? "primary";
      return [
        {
          slotId: slot.id,
          workItemId: item.id,
          tier,
          tierWord: TIER_WORDS[tier],
          title: item.title,
          emoji: item.icon?.kind === "emoji" ? item.icon.value : null,
        },
      ];
    });
  return open.length > 0
    ? { dateKey: day.date, weekday: weekdayOf(day.date), items: open }
    : null;
}

/**
 * Today's empty state: null when the date holds no Work block or any work
 * slotted; else nothing planned with what was left open, or no work slotted.
 */
export function todayEmpty(
  todayKey: string,
  days: readonly SetUpDay[],
): TodayEmpty | null {
  const today = days.find((day) => day.date === todayKey);
  if (!today || workBlocksOf(today).length === 0) return null;
  if (workSlotsOf(today).length > 0) return null;
  const open = leftOpen(todayKey, days);
  return open
    ? { kind: "nothing-planned", leftOpen: open }
    : { kind: "no-work-slotted" };
}

/**
 * Bring these in (C-USE-today-nothing-planned-2): each checked item placed
 * today at its old tier, in the left-open order, after the block's own
 * slots; the unchecked stay in the pool. One write each, so each has its
 * Undo; Bring these in itself is never stored.
 */
export async function writeBringIn(
  server: Pick<WorkServer, "placeWork" | "placeIssues">,
  open: LeftOpen,
  slotIds: ReadonlySet<string>,
  to: { dateKey: string; blockId: string },
  slots: readonly Pick<SlotRecord, "blockId" | "onDate" | "sortOrder">[],
): Promise<PlannerWrite[]> {
  const first = nextSortOrder(slots, to.blockId, to.dateKey);
  const chosen = open.items.filter((item) => slotIds.has(item.slotId));
  const writes: PlannerWrite[] = [];
  for (const [index, item] of chosen.entries()) {
    writes.push(
      await writePlace(
        server,
        { workItemId: item.workItemId },
        { ...to, tier: item.tier, sortOrder: first + index },
        slots,
      ),
    );
  }
  return writes;
}
