import type { IconValue, WorkTier } from "@syn/types";
import {
  clockFromMinutes,
  clockToMinutes,
  reflowItems,
  weekdayForDayKey,
} from "@syn/utils";
import type { RoomAddition } from "@/lib/data/room";
import type { AppRoomDay } from "@/lib/data/room-day";
import { clockLabel } from "../day-column/copy";
import { ADD_SHEET_COPY as COPY } from "./copy";

/**
 * The add sheet's rules (USE-54; add-from-the-rail/states/add-sheet.md;
 * D-USE-11, D-USE-16, D-USE-19, D-USE-22). Pure: the block a time lands in,
 * the full line from `reflowItems`, Tier only in Work, and whether Add
 * writes at once (room) or goes to Make room (none). Today only.
 */

export type AddKind = "item" | "block";

export interface AddForm {
  kind: AddKind;
  title: string;
  icon: IconValue | null;
  /** "HH:MM"; null when opened from a block's Add row (D-USE-22). */
  startsAt: string | null;
  lengthMin: number;
  /** At a set time: it stays at Starts when things move. */
  pinned: boolean;
  tier: WorkTier;
  notes: string;
}

/** Where the sheet was opened: a time (the rail), or a block and its tier. */
export interface AddStart {
  at?: string;
  blockId?: string;
  tier?: WorkTier;
}

export interface AddLanding {
  blockId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  /** A Work block: the addition is a work item with a tier. */
  work: boolean;
}

/** Length's start and steps (the capture's "15 min"). */
export const ADD_LENGTH_MIN = 15;
export const ADD_LENGTH_MAX = 480;

/**
 * [ASSUMPTION] A time opens on Secondary, as the board draws it; a block's
 * Add row presets its own tier.
 */
const DEFAULT_TIER: WorkTier = "secondary";

export function openAddForm(start: AddStart): AddForm {
  return {
    kind: "item",
    title: "",
    icon: null,
    startsAt: start.at ?? null,
    lengthMin: ADD_LENGTH_MIN,
    pinned: false,
    tier: start.tier ?? DEFAULT_TIER,
    notes: "",
  };
}

/**
 * The block the addition lands in: the one named, or the one the time
 * falls in (its start inside, its end outside). None outside every block.
 */
export function landingOf(
  day: AppRoomDay,
  form: Pick<AddForm, "startsAt">,
  blockId?: string,
): AddLanding | null {
  const at = form.startsAt === null ? null : clockToMinutes(form.startsAt);
  const occurrence = day.blocks.find((one) =>
    blockId !== undefined
      ? one.block.id === blockId
      : at !== null &&
        clockToMinutes(one.startsAt) <= at &&
        at < clockToMinutes(one.endsAt),
  );
  if (!occurrence) return null;
  return {
    blockId: occurrence.block.id,
    name: occurrence.block.name,
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt,
    work: occurrence.block.kind === "work",
  };
}

/** Tier shows only when the addition lands in a Work block (D-USE-16). */
export function showsTier(landing: AddLanding | null): boolean {
  return landing?.work ?? false;
}

/** A name is the only thing Add waits on; a time outside every block can't take an item. */
export function canAdd(form: AddForm, landing: AddLanding | null): boolean {
  return form.title.trim() !== "" && landing !== null;
}

/**
 * Whether the block is full with the addition in it: its rows on the date
 * and the new one, laid by `reflowItems` around the day's events, run past
 * its end. A set time pins the new one at Starts.
 */
export function isFull(
  day: AppRoomDay,
  landing: AddLanding,
  form: Pick<AddForm, "startsAt" | "lengthMin" | "pinned">,
): boolean {
  const occurrence = day.blocks.find((one) => one.block.id === landing.blockId);
  if (!occurrence) return false;
  const start = clockToMinutes(occurrence.startsAt);
  const end = clockToMinutes(occurrence.endsAt);
  const rows = occurrence.slots
    .filter((slot) => slot.doneAt === null)
    .map((slot) => ({
      id: slot.id,
      lengthMin: slot.lengthMin,
      atTime: slot.atTime,
    }));
  const bands = day.events.filter(
    (event) =>
      clockToMinutes(event.startsAt) < end &&
      clockToMinutes(event.endsAt) > start,
  );
  const reflow = reflowItems({
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt,
    items: [
      ...rows,
      {
        id: "new",
        lengthMin: form.lengthMin,
        atTime: form.pinned && form.startsAt !== null ? form.startsAt : null,
      },
    ],
    bands,
  });
  return reflow.overMin > 0;
}

/** "Monday · lands in Work, 9:30 to 12:00"; outside every block, "Monday · no block at 6:30". */
export function scopeLine(
  dateKey: string,
  landing: AddLanding | null,
  form: Pick<AddForm, "startsAt">,
): string {
  const weekday = weekdayForDayKey(dateKey);
  if (landing === null) {
    return COPY.noBlock(
      weekday,
      form.startsAt ? clockLabel(form.startsAt) : null,
    );
  }
  return COPY.scope(
    weekday,
    landing.name,
    clockLabel(landing.startsAt),
    clockLabel(landing.endsAt),
  );
}

/** "Work is full at 10:15. Adding asks where the 15 min comes from." Only when full. */
export function footLine(
  landing: AddLanding | null,
  form: AddForm,
  full: boolean,
): string | null {
  if (landing === null || !full) return null;
  return COPY.full(
    landing.name,
    form.startsAt === null ? null : clockLabel(form.startsAt),
    form.lengthMin,
  );
}

/** What Add does: write at once with room, or hand Make room the addition. */
export type AddPlan =
  | { kind: "write"; landing: AddLanding; form: AddForm }
  | { kind: "room"; addition: RoomAddition };

export function planAdd(
  day: AppRoomDay,
  landing: AddLanding,
  form: AddForm,
): AddPlan {
  const clean = { ...form, title: form.title.trim() };
  if (!isFull(day, landing, clean)) {
    return { kind: "write", landing, form: clean };
  }
  return {
    kind: "room",
    addition: {
      blockId: landing.blockId,
      title: clean.title,
      lengthMin: clean.lengthMin,
      at: clean.startsAt,
    },
  };
}

/** Starts as minutes, or the block's start when there is none. */
export function startsMin(form: AddForm, landing: AddLanding | null): number {
  if (form.startsAt !== null) return clockToMinutes(form.startsAt);
  return landing === null ? 0 : clockToMinutes(landing.startsAt);
}

/** A typed or stepped Starts, back to "HH:MM". */
export const clockOf = clockFromMinutes;
