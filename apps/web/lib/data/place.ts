import { TIER_USUAL } from "@syn/constants";
import {
  clockMinutes,
  firstTierWithRoom,
  fitInBlock,
  topMinutes,
  weekdayIndex,
  type WorkSize,
  type WorkTier,
} from "@syn/utils";
import type { SlotRecord } from "@syn/validators";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import type { WorkServer } from "@/lib/fixtures/work";
import type { SetUpDay } from "./use-set-up-day";
import { TIER_WORDS } from "./week-view";

/**
 * Placing from the pool (USE-75; interactions/place-from-the-pool): a pool
 * item or a Linear issue onto a day's tier, through USE-55's work writes.
 * A second day is a session of the one item, never a copy (D-USE-40,
 * D-USE-42); one item sits once a day (the server refuses the second); a
 * Linear issue joins the pool as a work item and nothing reaches Linear
 * (D-USE-57). Pure over the server, so the test drives the same calls.
 */

export type PlaceSource = { workItemId: string } | { issueId: string };

export interface PlaceTo {
  dateKey: string;
  blockId: string;
  tier: WorkTier;
  /** After the block's own slots on the date when left out. */
  sortOrder?: number;
}

const WEEKDAY_NAME = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const weekdayOf = (dateKey: string) =>
  WEEKDAY_NAME[weekdayIndex(dateKey)]!;

export const PLACE_WORDS = {
  addedSession: (n: number, of: number) => `Added as session ${n} of ${of}.`,
  /** A first placing [ASSUMPTION, as the index]. */
  addedTo: (weekday: string, tier: WorkTier) =>
    `Added to ${weekday} · ${TIER_WORDS[tier]}.`,
  /** [ASSUMPTION] A chip carried to another cell. */
  movedTo: (weekday: string, tier: WorkTier) =>
    `Moved to ${weekday} · ${TIER_WORDS[tier]}.`,
  /** [ASSUMPTION] A chip carried back onto the pool. */
  backInPool: (title: string) => `${title} is back in the pool.`,
  /** [ASSUMPTION] A drop on a day that holds it: refused, its chip ringed. */
  alreadyOn: (title: string, weekday: string) =>
    `${title} is already on ${weekday}.`,
  /** [ASSUMPTION] A Time lens drop where no tier has room. */
  full: (weekday: string) =>
    `Work is full on ${weekday} at the top of the ranges. Nothing placed.`,
  undo: "Undo",
  undone: "Undone",
  announceAdded: (
    title: string,
    weekday: string,
    tier: WorkTier,
    session: { n: number; of: number } | null,
  ) =>
    [
      `Added ${title} to ${weekday}, ${TIER_WORDS[tier]}`,
      session ? `session ${session.n} of ${session.of}` : null,
    ]
      .filter(Boolean)
      .join(", "),
} as const;

/** The new session's place among the item's dates; null when it is the only one. */
export function sessionAfterPlacing(
  dates: readonly string[],
  dateKey: string,
): { n: number; of: number } | null {
  const all = [...new Set([...dates, dateKey])].sort();
  return all.length > 1
    ? { n: all.indexOf(dateKey) + 1, of: all.length }
    : null;
}

/** After every slot the block holds on the date. */
export function nextSortOrder(
  slots: readonly Pick<SlotRecord, "blockId" | "onDate" | "sortOrder">[],
  blockId: string,
  dateKey: string,
): number {
  return (
    slots
      .filter((slot) => slot.blockId === blockId && slot.onDate === dateKey)
      .reduce((top, slot) => Math.max(top, slot.sortOrder), -1) + 1
  );
}

/**
 * One placing through the work writes: a pool item is a slot (a session when
 * it sits on another day), a Linear issue its work item and a slot in one
 * journal, so one Undo takes it all back. `slots` lends the sort order.
 */
export function writePlace(
  server: Pick<WorkServer, "placeWork" | "placeIssues">,
  source: PlaceSource,
  to: PlaceTo,
  slots: readonly Pick<SlotRecord, "blockId" | "onDate" | "sortOrder">[],
): Promise<PlannerWrite> {
  if ("issueId" in source) {
    return server.placeIssues({
      issueIds: [source.issueId],
      dateKey: to.dateKey,
      blockId: to.blockId,
      tier: to.tier,
    });
  }
  return server.placeWork({
    workItemId: source.workItemId,
    dateKey: to.dateKey,
    blockId: to.blockId,
    tier: to.tier,
    sortOrder: to.sortOrder ?? nextSortOrder(slots, to.blockId, to.dateKey),
  });
}

/** The day's Work blocks, by start: a Priority cell lands in the first. */
export function workBlocksOf(day: SetUpDay): SetUpDay["blocks"] {
  return day.blocks
    .filter((b) => b.block.kind === "work" && !b.block.checklist)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

const MIN_MS = 60_000;
const at = (time: string) => new Date(clockMinutes(time) * MIN_MS);

/**
 * A Time lens drop on a Work block (step 2t): the day's first tier below its
 * usual number (counted over the day's Work blocks) in which the item fits
 * this block at the top of its range; never Urgent; null when none has room.
 */
export function timeDropTier(input: {
  day: SetUpDay;
  blockId: string;
  item: { size: WorkSize | null; lengthMaxMin: number | null };
}): WorkTier | null {
  const { day } = input;
  const items = new Map(day.records.workItems.map((item) => [item.id, item]));
  const work = workBlocksOf(day);
  const target = work.find((b) => b.block.id === input.blockId);
  if (!target) return null;
  const tierOf = (slot: SlotRecord): WorkTier => slot.tier ?? "primary";
  const workSlots = (b: SetUpDay["blocks"][number]) =>
    b.slots.filter((slot) => slot.workItemId !== null);
  const count = (tier: WorkTier) =>
    work.flatMap(workSlots).filter((slot) => tierOf(slot) === tier).length;
  const topMin = topMinutes({ lengthMin: null, ...input.item });
  const held = workSlots(target).map((slot) => {
    const item = items.get(slot.workItemId!);
    return {
      tier: tierOf(slot),
      topMin: topMinutes({
        lengthMin: slot.lengthMin,
        lengthMaxMin: item?.lengthMaxMin ?? null,
        size: item?.size ?? null,
      }),
    };
  });
  const fits = (tier: WorkTier) =>
    fitInBlock({
      block: { start: at(target.startsAt), end: at(target.endsAt) },
      slots: held,
      busy: day.events.map((e) => ({
        start: at(e.startsAt),
        end: at(e.endsAt),
      })),
      tier,
      topMin,
    }).fits;
  const usual: Record<WorkTier, number | null> = {
    urgent: null,
    primary: TIER_USUAL.primary,
    secondary: TIER_USUAL.secondary,
    stretch: null,
  };
  return firstTierWithRoom({
    tiers: (["primary", "secondary", "stretch"] as const).map((tier) => ({
      tier,
      count: count(tier),
      usual: usual[tier],
      fits: fits(tier),
    })),
  });
}

/**
 * The desk's drag ids (DragToPlace's): a pool row by its key (a work item's
 * id, or `issue:<connection>:<issue>`), a placed chip by its slot, a Priority
 * cell by date and tier, a Time lens Work block by date and block, the pool.
 */
export const PLACE_IDS = {
  row: (key: string) => `row:${key}`,
  chip: (slotId: string) => `chip:${slotId}`,
  cell: (dateKey: string, tier: WorkTier) => `cell:${dateKey}:${tier}`,
  block: (dateKey: string, blockId: string) => `block:${dateKey}:${blockId}`,
  pool: "pool",
} as const;

export type PlaceId =
  | { kind: "row"; source: PlaceSource }
  | { kind: "chip"; slotId: string }
  | { kind: "cell"; dateKey: string; tier: WorkTier }
  | { kind: "block"; dateKey: string; blockId: string }
  | { kind: "pool" };

export function readPlaceId(id: string): PlaceId | null {
  if (id === PLACE_IDS.pool) return { kind: "pool" };
  const [kind, ...rest] = id.split(":");
  const tail = rest.join(":");
  if (kind === "row") {
    // `issue:<connection>:<issue>`: the issue's own id is the last part.
    return tail.startsWith("issue:")
      ? { kind: "row", source: { issueId: tail.split(":").at(-1)! } }
      : { kind: "row", source: { workItemId: tail } };
  }
  if (kind === "chip") return { kind: "chip", slotId: tail };
  if (kind === "cell" && rest.length === 2) {
    return { kind: "cell", dateKey: rest[0]!, tier: rest[1] as WorkTier };
  }
  if (kind === "block" && rest.length === 2) {
    return { kind: "block", dateKey: rest[0]!, blockId: rest[1]! };
  }
  return null;
}
