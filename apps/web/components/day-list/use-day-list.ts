"use client";

import * as React from "react";

import { UNDO_SHORT_MS } from "@syn/constants";
import { useDerivedItems } from "@syn/hooks";
import type { DayItemView } from "@syn/types";
import { deriveItemState } from "@syn/utils";

import { useNow } from "@/lib/hooks/use-now";
import { useUndoWindow } from "@/lib/hooks/use-undo-window";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { DAY_LIST_COPY as COPY } from "./copy";

type DayView = RouterOutputs["day"]["get"];

/**
 * The List's behaviour — everything that is not layout.
 *
 * DONE IS INSTANT (Epic 2 §0.1). The cache is patched before the request
 * leaves, so the checkmark, the title's tone and the state word all change in
 * the same frame as the tap. There is no spinner and no disabled state,
 * because a checkbox that waits is a checkbox that makes a person wait to find
 * out whether they did the thing they just did.
 *
 * THE PATCH RE-DERIVES THE STATE with the same function the server uses.
 * Setting `doneAt` alone would leave a row reading *now* with a checkmark on
 * it until the refetch landed; `deriveItemState` is what makes the optimistic
 * row indistinguishable from the real one.
 *
 * UNDO RESTORES THE ORIGINAL `done_at`. The window holds it, and sends it
 * back. A person who un-ticks and re-ticks inside five seconds has changed
 * nothing, and the record should say so rather than claiming they finished
 * five seconds later than they did.
 *
 * A FAILED WRITE REVERTS AND SAYS SO. Offline, the tap still applies, still
 * fails, and still reverts with a sentence — this screen never disables a
 * control, because faded is not disabled and neither is offline (§2.4).
 *
 * ONE MUTATION PER ROW AT A TIME. A double tap inside 300 ms would otherwise
 * send two writes whose order decides the outcome; the in-flight guard drops
 * the second, and the row keeps whatever the first was.
 */
export function useDayList(dateKey: string, initial: DayView) {
  const now = useNow();
  const utils = trpc.useUtils();

  const [error, setError] = React.useState<string | null>(null);
  const inFlight = React.useRef(new Set<string>());

  const query = trpc.day.get.useQuery(
    { date: dateKey },
    { initialData: initial },
  );

  /** The undo window carries the `done_at` the row had before the tap. */
  const undo = useUndoWindow<{ doneAt: Date | null }>(UNDO_SHORT_MS);

  const setDone = trpc.item.setDone.useMutation();
  const bringBack = trpc.item.bringBack.useMutation();
  const doAnyway = trpc.item.doAnyway.useMutation();

  const raw = query.data ?? initial;
  const key = React.useMemo(() => ({ date: dateKey }), [dateKey]);

  /**
   * Every row's state, recomputed against the current minute.
   *
   * THE ROW DERIVES NOTHING — this does, once, with the same function the
   * server used for the first paint. Without it a row that arrived *soon*
   * would still say *soon* twenty minutes later, because `state` is a fact
   * about a clock and the server's clock stopped when it answered.
   *
   * `useDerivedItems` RETURNS THE SAME OBJECT when a state has not changed, so
   * a minute tick re-renders only the rows that actually moved. That identity
   * is the whole re-render budget: rebuilding every row each minute would make
   * a list of thirty items repaint sixty times an hour for nothing.
   */
  const flat = React.useMemo(
    () => [
      ...raw.parts.flatMap((part) => part.items),
      ...raw.notAssigned,
      ...raw.cutByShift,
    ],
    [raw],
  );

  const derived = useDerivedItems(
    React.useMemo(
      () => ({ mode: raw.mode, closedAt: raw.closedAt, items: flat }),
      [raw.mode, raw.closedAt, flat],
    ),
    now,
  );

  const day = React.useMemo(
    () => reassemble(raw, derived),
    [raw, derived],
  );

  /** Patch one item in the cached day, re-deriving its state. */
  const patchItem = React.useCallback(
    (id: string, doneAt: Date | null) => {
      utils.day.get.setData(key, (current) => {
        if (!current) return current;
        return mapItems(current, (item) =>
          item.id === id ? withDone(item, doneAt, current, now) : item,
        );
      });
    },
    [utils, key, now],
  );

  const toggleDone = React.useCallback(
    (item: DayItemView) => {
      if (inFlight.current.has(item.id)) return;
      inFlight.current.add(item.id);
      setError(null);

      const wasDoneAt = item.doneAt;
      const nextDone = item.doneAt === null;
      // Undoing sends the original instant back; completing stamps this one.
      const at = nextDone ? new Date() : (wasDoneAt ?? new Date());

      patchItem(item.id, nextDone ? at : null);
      undo.start(item.id, { doneAt: wasDoneAt });

      setDone.mutate(
        { id: item.id, done: nextDone, at },
        {
          onError: () => {
            patchItem(item.id, wasDoneAt);
            undo.close(item.id);
            setError(COPY.saveError);
          },
          onSettled: () => {
            inFlight.current.delete(item.id);
            void utils.day.get.invalidate(key);
          },
        },
      );
    },
    [patchItem, setDone, undo, utils, key],
  );

  /**
   * The *Undo* in a row's state slot. It re-sends the write with the payload
   * the window kept, so undoing a completion restores the instant it had
   * rather than the instant of the undo.
   */
  const undoRow = React.useCallback(
    (item: DayItemView) => {
      const previous = undo.payloadFor(item.id);
      if (previous === undefined) return;

      undo.close(item.id);
      patchItem(item.id, previous.doneAt);

      setDone.mutate(
        {
          id: item.id,
          done: previous.doneAt !== null,
          at: previous.doneAt ?? new Date(),
        },
        {
          onError: () => setError(COPY.saveError),
          onSettled: () => {
            void utils.day.get.invalidate(key);
          },
        },
      );
    },
    [undo, patchItem, setDone, utils, key],
  );

  const onBringBack = React.useCallback(
    (item: DayItemView) => {
      bringBack.mutate(
        { id: item.id },
        {
          onError: () => setError(COPY.saveError),
          onSettled: () => void utils.day.get.invalidate(key),
        },
      );
    },
    [bringBack, utils, key],
  );

  const onDoAnyway = React.useCallback(
    (item: DayItemView) => {
      doAnyway.mutate(
        { id: item.id },
        {
          onError: () => setError(COPY.saveError),
          onSettled: () => void utils.day.get.invalidate(key),
        },
      );
    },
    [doAnyway, utils, key],
  );

  const refresh = React.useCallback(
    () => utils.day.get.invalidate(key),
    [utils, key],
  );

  return {
    day,
    now,
    error,
    isError: query.isError,
    hasUndo: (id: string) => undo.open.has(id),
    toggleDone,
    undoRow,
    onBringBack,
    onDoAnyway,
    refresh,
  };
}

/**
 * Put the derived rows back where they came from, in the same order.
 *
 * The flatten and this walk the three collections in one fixed order, so an
 * index is a reliable address. It returns the ORIGINAL day object when nothing
 * changed identity, so a minute that moved no row produces no new day and
 * nothing below re-renders at all.
 */
function reassemble(day: DayView, derived: readonly DayItemView[]): DayView {
  let index = 0;
  let changed = false;

  const take = (count: number): DayItemView[] => {
    const slice = derived.slice(index, index + count);
    index += count;
    return slice;
  };

  const parts = day.parts.map((part) => {
    const items = take(part.items.length);
    if (items.every((item, i) => item === part.items[i])) return part;
    changed = true;
    return { ...part, items };
  });

  const notAssigned = take(day.notAssigned.length);
  if (!notAssigned.every((item, i) => item === day.notAssigned[i])) {
    changed = true;
  }

  const cutByShift = take(day.cutByShift.length);
  if (!cutByShift.every((item, i) => item === day.cutByShift[i])) {
    changed = true;
  }

  if (!changed) return day;
  return { ...day, parts, notAssigned, cutByShift };
}

/** Apply `fn` to every item in the day, in every place items live. */
function mapItems(
  day: DayView,
  fn: (item: DayItemView) => DayItemView,
): DayView {
  return {
    ...day,
    parts: day.parts.map((part) => ({ ...part, items: part.items.map(fn) })),
    notAssigned: day.notAssigned.map(fn),
    cutByShift: day.cutByShift.map(fn),
  };
}

/**
 * The optimistic row. `deriveItemState` runs over the patched fields so the
 * state word is right before the server answers — the row must not read *now*
 * with a checkmark on it for the length of a round trip.
 */
function withDone(
  item: DayItemView,
  doneAt: Date | null,
  day: DayView,
  now: Date,
): DayItemView {
  const state = deriveItemState(
    {
      assignmentState: "assigned",
      completionState: doneAt === null ? "upcoming" : "done",
      timeMode: item.timeMode,
      scheduledStart: item.scheduledStart,
      scheduledEnd: item.scheduledEnd,
      originalScheduledStart: item.originalScheduledStart,
      doneAt,
      deferredAt: null,
      hasRunningSession: false,
    },
    { closedAt: day.closedAt, mode: day.mode },
    now,
  );

  return {
    ...item,
    doneAt,
    state,
    // Done ends a running timer, so its elapsed count goes with it.
    timerElapsedSec: doneAt === null ? item.timerElapsedSec : null,
  };
}
