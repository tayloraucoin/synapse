"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SlotEventKind } from "@syn/types";
import {
  clockAt,
  clockFromMinutes,
  formatCountdown,
  instantToWallClockMinutes,
  overBand,
  runningBand,
  tookMinutes,
  type OverBand,
  type SlotClock,
} from "@syn/utils";
import type { SlotEventInput } from "@syn/validators";
import type { Today } from "./derive-today";
import { useDataSource } from "./source";
import type { NowItemView, NowView } from "./use-now";
import { todayQueryKey, useToday } from "./use-today";

/**
 * Running on Now (USE-23; day/running): what the running card reads beside
 * Now's view, and Start, Pause, Resume and a timed Done. Every figure comes
 * from `deriveClock`'s slot clock (USE-5) read at the screen's one tick; the
 * events are the record, so a reopened app reads start minus paused spans.
 */

export interface RunningView {
  /** Each item's slot clock, by Now's item id; absent until it has events. */
  clocks: Map<string, SlotClock>;
  /** The day's close: nothing counts past it (C11). */
  dayEnd: Date;
  timeZone: string;
  /**
   * The lifted item's planned start, never before the last Done ahead of it
   * in the block: after a timed Done at 7:26 the next reads "· 7:26".
   * [ASSUMPTION: the boards' 7:26; an untouched order keeps its own plan.]
   */
  liftedAt: string | null;
}

/** An instant to the day's "HH:MM" in its zone. */
export function wallClock(at: Date, timeZone: string): string {
  return clockFromMinutes(instantToWallClockMinutes(at, timeZone));
}

export function deriveRunning(today: Today, now: NowView): RunningView {
  const { records, clock } = today;
  const clocks = new Map<string, SlotClock>();
  for (const item of now.items) {
    const slotClock = item.slotId ? clock.slots.get(item.slotId) : undefined;
    if (slotClock) clocks.set(item.id, slotClock);
  }
  const current = now.current;
  let liftedAt = current?.plannedAt ?? null;
  if (current && liftedAt !== null) {
    const ahead = now.items.slice(0, now.items.indexOf(current));
    for (const item of ahead) {
      if (item.doneAt === null) continue;
      const doneAt = wallClock(new Date(item.doneAt), records.timeZone);
      if (doneAt > liftedAt) liftedAt = doneAt;
    }
  }
  return {
    clocks,
    dayEnd: records.dayWindow.end,
    timeZone: records.timeZone,
    liftedAt,
  };
}

/** Running beside Now's view, from the same day query. */
export function useRunningView(
  dateKey: string,
  now: NowView | undefined,
): RunningView | null {
  const { today } = useToday(dateKey);
  return useMemo(
    () => (today && now ? deriveRunning(today, now) : null),
    [today, now],
  );
}

/** A Done that ran a timer: its row shows the time taken, no Change. */
export function isTimedDone(
  running: RunningView | null,
  item: NowItemView,
): boolean {
  const slotClock = running?.clocks.get(item.id);
  return (
    item.done && item.tookMin !== null && (slotClock?.work.length ?? 0) > 0
  );
}

/** The card shows for a slot whose clock has run and is not done. */
export function isRunningCard(slotClock: SlotClock | undefined): boolean {
  return (
    slotClock !== undefined &&
    (slotClock.state === "running" || slotClock.state === "paused")
  );
}

/** When the first work span opened: the card's "Started 7:14". */
export function startedAt(slotClock: SlotClock): Date | null {
  return slotClock.work[0]?.start ?? null;
}

/** One row under "Running" (USE-24): a running item not in focus. */
export interface RunningRowView {
  item: NowItemView;
  slotClock: SlotClock;
  /** Done a moment ago: shown settled, then back in its place, checked. */
  settled: boolean;
}

/**
 * Several running in a non-work block (USE-24; D-USE-27, D-USE-72): the card
 * is the item in focus when it runs, and every other item whose clock runs
 * or holds is a row under "Running", in the block's order. A row Done a
 * moment ago (`settledIds`) stays a row until the screen lets it go.
 */
export interface RunningGroupView {
  /** The card's item when it runs; null while the lifted card is not running. */
  focusedId: string | null;
  rows: RunningRowView[];
}

/**
 * The Running group, or null when there is none: one running item is
 * USE-23's card in its place, and a Work block never has the group (one in
 * hand, the rest fire in their tier: D-USE-43, D-USE-44, D-USE-49).
 * Focus is Now's current item (the row the person last made current, held
 * on the device by `useChosenItem`), so lifting a row writes no event.
 */
export function runningGroup(
  now: NowView,
  running: RunningView | null,
  settledIds: ReadonlySet<string> = new Set(),
): RunningGroupView | null {
  const { block, current } = now;
  if (!running || !block || block.kind === "work" || block.form !== "items") {
    return null;
  }
  const focusedId =
    current && !current.done && isRunningCard(running.clocks.get(current.id))
      ? current.id
      : null;
  const rows = now.items.flatMap((item): RunningRowView[] => {
    const slotClock = running.clocks.get(item.id);
    if (item.id === focusedId || !slotClock) return [];
    if (!item.done && isRunningCard(slotClock)) {
      return [{ item, slotClock, settled: false }];
    }
    if (item.done && settledIds.has(item.id)) {
      return [{ item, slotClock, settled: true }];
    }
    return [];
  });
  return rows.length === 0 ? null : { focusedId, rows };
}

/** A running row's figure at an instant: its count, band and ring. */
export interface RunningRowFigure {
  /** "12:04 of 30 min"; past the plan "0:40 over", "4 min over". */
  count: string;
  /** Past the plan, Done's percent band; null under it (muted). */
  band: OverBand | null;
  /** Elapsed over plan, capped at 1: past the plan the ring stays full. */
  ring: number;
  /** Paused: the count holds. */
  held: boolean;
}

export function runningRowFigure(
  slotClock: SlotClock,
  planMin: number,
  at: Date,
  dayEnd: Date,
): RunningRowFigure {
  const { workMs, running } = clockAt(slotClock, at, dayEnd);
  const planMs = planMin * 60_000;
  const clock = formatCountdown(planMs, workMs);
  return {
    count: clock.over ? clock.text : `${clock.figure} of ${planMin} min`,
    band: clock.over ? runningBand(planMin, workMs) : null,
    ring: planMs > 0 ? Math.min(1, workMs / planMs) : 1,
    held: !running,
  };
}

/**
 * A settled row's done line (D-USE-29): its band, and the plan to name
 * beside the time from warning up ("Done · 34 min of 30"); ink names none.
 */
export function settledLine(
  tookMin: number,
  planMin: number,
): { band: OverBand; ofPlan: number | null } {
  const band = overBand(planMin, tookMin);
  return { band, ofPlan: band === "ink" ? null : planMin };
}

/**
 * The slot change a timed Done makes (D-USE-13, no Change): done at `at`,
 * the work time to the nearest minute, at least 1, without paused spans.
 */
export function timedDoneChange(slotClock: SlotClock, at: Date, dayEnd: Date) {
  const { workMs } = clockAt(slotClock, at, dayEnd);
  return { doneAt: at.toISOString(), tookMin: tookMinutes(workMs) };
}

/** One slot event at an instant, with a fresh id the server dedupes on. */
export function slotEventFor(
  slotId: string,
  kind: SlotEventKind,
  at: Date,
): SlotEventInput {
  return {
    slotId,
    kind,
    clientEventId: crypto.randomUUID(),
    at: at.toISOString(),
  };
}

/**
 * The timer's writes on Now: a set item's slot is placed on first touch,
 * then one slot event per action; a timed Done writes `done` and then the
 * slot's `doneAt` and `tookMin` from the same instant. The day is invalidated
 * after each and the clock derived again; nothing is set by hand.
 */
export function useRunningWrites(dateKey: string, blockId: string | null) {
  const source = useDataSource();
  const queryClient = useQueryClient();

  async function slotFor(item: NowItemView): Promise<string> {
    if (item.slotId !== null) return item.slotId;
    if (blockId === null || item.blockItemId === null) {
      throw new Error("A set item needs its block to be placed.");
    }
    const placed = await source.server.writeSlots({
      blockId,
      onDate: dateKey,
      sortOrder: item.sortOrder,
      blockItemId: item.blockItemId,
    });
    return placed.id;
  }

  const mutation = useMutation<
    unknown,
    Error,
    {
      item: NowItemView;
      kind: SlotEventKind;
      /** Done's: the clock as it stood, read to the same instant. */
      done?: { slotClock: SlotClock; dayEnd: Date };
    }
  >({
    mutationFn: async ({ item, kind, done }) => {
      const slotId = await slotFor(item);
      const at = source.now();
      await source.server.writeSlotEvents([slotEventFor(slotId, kind, at)]);
      if (!done) return;
      await source.server.writeSlots({
        id: slotId,
        ...timedDoneChange(done.slotClock, at, done.dayEnd),
      });
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: todayQueryKey(source.scenario.name),
      }),
  });

  const write = (kind: SlotEventKind) => (item: NowItemView) =>
    mutation.mutateAsync({ item, kind });

  return {
    ...mutation,
    start: write("started"),
    pause: write("paused"),
    resume: write("resumed"),
    /** Done on the running card: the time worked, no Change. */
    done: (item: NowItemView, slotClock: SlotClock, dayEnd: Date) =>
      mutation.mutateAsync({ item, kind: "done", done: { slotClock, dayEnd } }),
  };
}
