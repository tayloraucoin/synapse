"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SlotEventKind } from "@syn/types";
import {
  clockAt,
  clockFromMinutes,
  instantToWallClockMinutes,
  tookMinutes,
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
