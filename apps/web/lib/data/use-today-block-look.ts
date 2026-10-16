"use client";

import type { IconValue } from "@syn/types";
import { colourValueSchema, type BlockChangeInput } from "@syn/validators";
import { usePlannerWrites } from "./use-planner-writes";

/**
 * A block's own name, icon and colour for one date (USE-88; header-menu.md:
 * Rename and Icon and colour, "today only"): the date's `block_changes` row
 * (`0015`), so it syncs and reaches every reader of the day through
 * `readDay`. The usual block is never written. The row carries the
 * occurrence's times, as `block_changes_skipped_or_times_check` asks; a look
 * at the block's own times is no move.
 */
export interface TodayBlockLook {
  name?: string;
  icon?: IconValue;
}

export interface TodayBlockPlace {
  blockId: string;
  date: string;
  /** The occurrence's times on the date (its change's, when moved). */
  startsAt: string;
  endsAt: string;
}

/** The colour an icon was picked in, as `block_changes.color` takes it. */
export function colourOfIcon(icon: IconValue): string | null {
  const colour =
    icon.kind === "curated"
      ? icon.colorKey
      : icon.kind === "lucide"
        ? icon.color
        : null;
  return colour !== null && colourValueSchema.safeParse(colour).success
    ? colour
    : null;
}

/** The date's change a look writes; what it leaves out stays as it was. */
export function todayLookInput(
  place: TodayBlockPlace,
  next: TodayBlockLook,
): BlockChangeInput {
  return {
    blockId: place.blockId,
    onDate: place.date,
    startsAt: place.startsAt,
    endsAt: place.endsAt,
    ...(next.name === undefined ? {} : { name: next.name }),
    ...(next.icon === undefined
      ? {}
      : { icon: next.icon, color: colourOfIcon(next.icon) }),
  };
}

/** Writes the look for the date; nothing while the occurrence is not read. */
export function useTodayBlockLook(place: TodayBlockPlace | null) {
  const planner = usePlannerWrites();
  return (next: TodayBlockLook) =>
    place === null
      ? Promise.resolve(null)
      : planner.writeBlockChange(todayLookInput(place, next));
}
