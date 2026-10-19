import {
  clockMinutes,
  fitInBlock,
  topMinutes,
  type WorkTier,
} from "@syn/utils";
import { SIZE_RANGE } from "@/components/work/add/new-task/form";
import { clockWords } from "./set-up-view";
import type { BlockView } from "./use-block-view";
import { SIZE_WORDS, TIER_WORDS } from "./week-view";

/**
 * A This week Work block in Block view's editing (USE-50; block-view/states/
 * work-tiers.md, D-USE-31): the date's work slots in this block on the four
 * tiers, Urgent kept even when it holds nothing (editing's Open default), and
 * the fit line, USE-8's `fitInBlock` at the top of every range with the
 * day's events busy. The line says where the plan ends in words: never a
 * count, never red (C-USE-block-view-work-tiers-4). Pure, so a test reads
 * what the view draws. Every word is printed here.
 */

const TIERS: readonly WorkTier[] = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
];

export const BLOCK_WORK_COPY = {
  /** "Primary fills to 12:00 at the top of its ranges. …" */
  fills: (lead: string, plural: boolean, at: string) =>
    `${lead} ${plural ? "fill" : "fills"} to ${at} at the top of ${plural ? "their" : "its"} ranges. Secondary and Stretch go in if there's room.`,
  /** [ASSUMPTION] Past the end: the same words, in ink, never red. */
  runsPast: (lead: string, plural: boolean, at: string, end: string) =>
    `${lead} ${plural ? "run" : "runs"} to ${at} at the top of ${plural ? "their" : "its"} ranges, past the end at ${end}. Secondary and Stretch go in if there's room.`,
  /** [ASSUMPTION] Nothing in Primary or Urgent. */
  nothingInPrimary:
    "Nothing in Primary yet. Work fills from Primary, then Secondary and Stretch if there's room.",
  /** [ASSUMPTION] An item with no length or size: no end to name. */
  noLength: (title: string) =>
    `${title} has no length yet, so where Primary ends can't be said.`,
  addTo: (tier: WorkTier) => `Add to ${TIER_WORDS[tier]}`,
  newItem: "New item",
  newItemLine: "Type a title and a length",
  fromPool: "From the pool",
  fromPoolLine: "Work saved for later, not on a day yet",
  fromLinear: "From Linear",
  /** Never "you" (work-add-to-a-tier.md). */
  fromLinearLine: (name: string) =>
    name === "" ? "Issues assigned in Linear" : `Issues assigned to ${name}`,
  rowName: (title: string, range: string | null) =>
    range === null ? title : `${title}, ${range}`,
} as const;

export interface BlockWorkRow {
  slotId: string;
  workItemId: string;
  title: string;
  /** A Linear row's "ENG-123 · 3 Medium"; null otherwise. */
  meta: string | null;
  /** "1 to 2 h", "30 min"; a size sets a range, a length alone stands. */
  range: string | null;
  sortOrder: number;
}

export interface BlockWorkTier {
  tier: WorkTier;
  word: string;
  rows: BlockWorkRow[];
}

/** A length in its own unit: "30 min", "1 h", "1 h 30 min". */
function lengthWords(min: number): string {
  if (min < 60) return `${min} min`;
  const rest = min % 60;
  return rest === 0 ? `${min / 60} h` : `${Math.floor(min / 60)} h ${rest} min`;
}

/**
 * A range as the frames draw it, each end in its own unit, the unit said once
 * when both share it: "1 to 2 h", "30 min to 1 h", "30 min"
 * (size-and-length.md).
 */
export function rangeWords(
  min: number | null,
  max: number | null,
): string | null {
  const low = min ?? max;
  const high = max ?? min;
  if (low === null || high === null) return null;
  if (low === high) return lengthWords(low);
  const hours = (n: number) => n >= 60 && n % 60 === 0;
  if (hours(low) && hours(high)) return `${low / 60} to ${high / 60} h`;
  if (low < 60 && high < 60) return `${low} to ${high} min`;
  return `${lengthWords(low)} to ${lengthWords(high)}`;
}

/** The block's work slots on the date, tier by tier, each in its order. */
export function blockWorkTiers(view: BlockView): BlockWorkTier[] {
  const items = new Map(view.day.records.workItems.map((i) => [i.id, i]));
  const slots = view.block.slots
    .filter((slot) => slot.workItemId !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return TIERS.map((tier) => ({
    tier,
    word: TIER_WORDS[tier],
    rows: slots
      .filter((slot) => (slot.tier ?? "primary") === tier)
      .flatMap((slot): BlockWorkRow[] => {
        const item = items.get(slot.workItemId!);
        if (!item) return [];
        const meta = item.linearIdentifier
          ? [item.linearIdentifier, item.size ? SIZE_WORDS[item.size] : null]
              .filter(Boolean)
              .join(" · ")
          : null;
        return [
          {
            slotId: slot.id,
            workItemId: item.id,
            title: item.title,
            meta,
            // A size sets a range; a length alone stands (D-USE-81).
            range:
              slot.lengthMin !== null
                ? rangeWords(slot.lengthMin, slot.lengthMin)
                : rangeWords(
                    item.lengthMinMin ??
                      (item.size ? SIZE_RANGE[item.size].min : null),
                    item.lengthMaxMin ??
                      (item.size ? SIZE_RANGE[item.size].max : null),
                  ),
            sortOrder: slot.sortOrder,
          },
        ];
      }),
  }));
}

/** "09:30" as a Date on one clock, for `fitInBlock`. */
function at(time: string): Date {
  return new Date(clockMinutes(time) * 60_000);
}

function wall(date: Date): string {
  const min = Math.round(date.getTime() / 60_000);
  return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;
}

/**
 * The fit line: where Urgent and Primary end at the top of their ranges,
 * the day's events busy (D-USE-31). Secondary and Stretch are named as
 * going in if there's room, never counted.
 */
export function blockFitLine(view: BlockView): string {
  const items = new Map(view.day.records.workItems.map((i) => [i.id, i]));
  const slots = view.block.slots.flatMap((slot) => {
    const item = slot.workItemId ? items.get(slot.workItemId) : undefined;
    if (!item) return [];
    return [
      {
        title: item.title,
        tier: slot.tier ?? "primary",
        topMin: topMinutes({
          lengthMin: slot.lengthMin,
          lengthMaxMin: item.lengthMaxMin,
          size: item.size,
        }),
      },
    ];
  });
  const first = slots.filter(
    (slot) => slot.tier === "urgent" || slot.tier === "primary",
  );
  if (first.length === 0) return BLOCK_WORK_COPY.nothingInPrimary;
  const unknown = first.find((slot) => slot.topMin === null);
  if (unknown) return BLOCK_WORK_COPY.noLength(unknown.title);

  const urgent = first.some((slot) => slot.tier === "urgent");
  const primary = first.some((slot) => slot.tier === "primary");
  const lead =
    urgent && primary
      ? "Urgent and Primary"
      : urgent
        ? TIER_WORDS.urgent
        : TIER_WORDS.primary;
  const plural = urgent && primary;
  const fit = fitInBlock({
    block: { start: at(view.block.startsAt), end: at(view.block.endsAt) },
    slots: first.map((slot) => ({ tier: slot.tier, topMin: slot.topMin })),
    busy: view.events.map((event) => ({
      start: at(event.startsAt),
      end: at(event.endsAt),
    })),
    tier: "primary",
    topMin: 0,
  });
  if (fit.runsTo === null) return BLOCK_WORK_COPY.nothingInPrimary;
  const to = wall(fit.runsTo);
  return fit.fits
    ? BLOCK_WORK_COPY.fills(lead, plural, to)
    : BLOCK_WORK_COPY.runsPast(lead, plural, to, clockWords(view.block.endsAt));
}
