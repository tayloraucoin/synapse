"use client";

import * as React from "react";

import { UNDO_SHORT_MS } from "@syn/constants";
import { toastUndo } from "@syn/ui";

import { useElapsedSec, useTimerStore } from "@/lib/stores/use-timer-store";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { ITEM_COPY as COPY } from "./copy";

type ItemDetail = RouterOutputs["item"]["get"];

/**
 * IT-01's behaviour.
 *
 * THE TIMER'S DISPLAY COMES FROM THE STORE AND ITS EXISTENCE FROM THE QUERY.
 * `runningSince` on the read model says whether a session is open; the store
 * says what number to draw. Every refetch re-seeds the store, so a timer
 * stopped on another device, or closed by the auto-close pass, stops here too
 * without this hook having to notice.
 *
 * QUANTITY AND NOTE SAVE ON BLUR AND ON CLOSE; RATINGS SAVE ON CHANGE. A
 * stepper is one tap and its value is complete the moment it moves; a number
 * or a sentence is not complete until someone stops typing. There is no
 * discard prompt on this sheet because there is nothing unsaved to discard —
 * which is only true because closing flushes.
 *
 * STOP NEVER MARKS DONE and *Done* ends a running session. Two different
 * facts, and the mutation for done is USE-2's, so there is one write path for
 * it everywhere in the app.
 */
export function useItemSheet(itemId: string | null, dayKey: string) {
  const utils = trpc.useUtils();
  const seed = useTimerStore((state) => state.seed);
  const startLocal = useTimerStore((state) => state.start);
  const stopLocal = useTimerStore((state) => state.stop);

  const [error, setError] = React.useState<string | null>(null);

  const query = trpc.item.get.useQuery(
    { id: itemId ?? "" },
    { enabled: itemId !== null },
  );

  const item = query.data ?? null;
  const elapsedSec = useElapsedSec(itemId);

  const start = trpc.timer.start.useMutation();
  const stop = trpc.timer.stop.useMutation();
  const pause = trpc.timer.pause.useMutation();
  const resume = trpc.timer.resume.useMutation();
  const setDone = trpc.item.setDone.useMutation();
  const defer = trpc.item.defer.useMutation();
  const setQuantity = trpc.item.setQuantity.useMutation();
  const setNote = trpc.item.setNote.useMutation();
  const rate = trpc.item.rate.useMutation();
  const doNow = trpc.item.doNow.useMutation();
  const chooseAlternate = trpc.item.chooseAlternate.useMutation();

  /**
   * Keep the store in step with the server's answer for THIS item.
   *
   * Seeding replaces the whole map, so this only runs for the sheet's own
   * item; the list's refetch is what re-seeds everything else.
   */
  React.useEffect(() => {
    if (item === null) return;
    if (item.runningSince === null) {
      stopLocal(item.id);
      return;
    }
    startLocal(item.id, item.runningSince, item.loggedSec);
  }, [item, startLocal, stopLocal]);

  const refresh = React.useCallback(async () => {
    if (itemId !== null) await utils.item.get.invalidate({ id: itemId });
    await utils.day.get.invalidate({ date: dayKey });
  }, [utils, itemId, dayKey]);

  const onStart = React.useCallback(() => {
    if (item === null) return;
    setError(null);

    // Optimistic: the digits move in this frame, and the server's `startedAt`
    // replaces this one on the response.
    startLocal(item.id, new Date(), item.loggedSec);

    start.mutate(
      { id: item.id },
      {
        onSuccess: (result) => {
          startLocal(result.itemId, result.startedAt, item.loggedSec);
          if (result.stopped) {
            const displaced = result.stopped;
            stopLocal(displaced.itemId);
            // Five seconds to say "no, the other one".
            toastUndo({
              text: COPY.stoppedOther(displaced.title),
              durationMs: UNDO_SHORT_MS,
              onUndo: () => {
                // Starting the displaced item stops this one, by the same rule.
                start.mutate(
                  { id: displaced.itemId },
                  { onSettled: () => void refresh() },
                );
              },
            });
          }
        },
        onError: () => {
          stopLocal(item.id);
          setError(COPY.saveError);
        },
        onSettled: () => void refresh(),
      },
    );
  }, [item, start, startLocal, stopLocal, refresh]);

  const onStop = React.useCallback(() => {
    if (item === null) return;
    setError(null);
    stopLocal(item.id);
    stop.mutate(
      { id: item.id },
      {
        onError: () => {
          if (item.runningSince !== null) {
            startLocal(item.id, item.runningSince, item.loggedSec);
          }
          setError(COPY.saveError);
        },
        onSettled: () => void refresh(),
      },
    );
  }, [item, stop, startLocal, stopLocal, refresh]);

  /**
   * Pause ends the open session and holds the display; resume opens a new one.
   *
   * The store stops ticking for this id on a pause, so the row's elapsed holds
   * at what was logged — the number stays visible and stops moving, which is
   * what "paused" looks like.
   */
  const onPause = React.useCallback(() => {
    if (item === null) return;
    setError(null);
    stopLocal(item.id);
    pause.mutate(
      { id: item.id },
      {
        onError: () => setError(COPY.saveError),
        onSettled: () => void refresh(),
      },
    );
  }, [item, pause, stopLocal, refresh]);

  const onResume = React.useCallback(() => {
    if (item === null) return;
    setError(null);
    startLocal(item.id, new Date(), item.loggedSec);
    resume.mutate(
      { id: item.id },
      {
        onSuccess: (result) => {
          startLocal(item.id, result.startedAt, item.loggedSec);
        },
        onError: () => {
          stopLocal(item.id);
          setError(COPY.saveError);
        },
        onSettled: () => void refresh(),
      },
    );
  }, [item, resume, startLocal, stopLocal, refresh]);

  const onToggleDone = React.useCallback(() => {
    if (item === null) return;
    setError(null);
    const nextDone = item.doneAt === null;
    setDone.mutate(
      {
        id: item.id,
        done: nextDone,
        at: nextDone ? new Date() : (item.doneAt ?? new Date()),
      },
      {
        onError: () => setError(COPY.saveError),
        onSettled: () => {
          // Done ends a running session; the store follows the refetch.
          if (nextDone) stopLocal(item.id);
          void refresh();
        },
      },
    );
  }, [item, setDone, stopLocal, refresh]);

  const onToggleDeferred = React.useCallback(() => {
    if (item === null) return;
    setError(null);
    defer.mutate(
      { id: item.id, deferred: item.deferredAt === null },
      {
        onError: () => setError(COPY.saveError),
        onSettled: () => void refresh(),
      },
    );
  }, [item, defer, refresh]);

  const onSaveQuantity = React.useCallback(
    (value: number | null) => {
      if (item === null) return;
      if (value === item.quantityValue) return;
      setQuantity.mutate(
        { id: item.id, value },
        {
          onError: () => setError(COPY.saveError),
          onSettled: () => void refresh(),
        },
      );
    },
    [item, setQuantity, refresh],
  );

  const onSaveNote = React.useCallback(
    (note: string) => {
      if (item === null) return;
      const next = note.trim() === "" ? null : note;
      if (next === item.notesReflection) return;
      setNote.mutate(
        { id: item.id, note: next },
        {
          onError: () => setError(COPY.saveError),
          onSettled: () => void refresh(),
        },
      );
    },
    [item, setNote, refresh],
  );

  const onRate = React.useCallback(
    (axis: string, value: number | null) => {
      if (item === null) return;
      rate.mutate(
        { id: item.id, axis, value },
        {
          onError: () => setError(COPY.saveError),
          onSettled: () => void refresh(),
        },
      );
    },
    [item, rate, refresh],
  );

  /**
   * `paused` is a session-shaped fact, not a flag: there is time logged, no
   * open session, and the item is still `active`. Only a pause produces that
   * combination — a stop returns the item to `upcoming`.
   */
  const paused =
    item !== null &&
    item.runningSince === null &&
    item.state === "active" &&
    item.loggedSec > 0;

  /*
   * UX v1.1 §6.3 (DYN-15). *Do now*: to now, started, the rest slid by the
   * minimum; when the slide would push something into a pin or past the
   * anchor nothing is written and `overflow` names it — the sheet offers
   * *Do now anyway* or *Adjust instead*. The one-of switch rewrites the row
   * to the other member and re-flows prep.
   */
  const [overflow, setOverflow] = React.useState<{ title: string } | null>(null);

  const onDoNow = React.useCallback(
    async (anyway = false): Promise<void> => {
      if (item === null) return;
      setError(null);
      try {
        const result = await doNow.mutateAsync({ itemId: item.id, anyway });
        if (!result.applied && result.overflow !== null) {
          setOverflow({ title: result.overflow.title });
          return;
        }
        setOverflow(null);
        if (result.startedAt !== null) startLocal(item.id, result.startedAt, item.loggedSec);
        await refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : COPY.saveError);
      }
    },
    [item, doNow, startLocal, refresh],
  );

  const onChooseAlternate = React.useCallback(async (): Promise<void> => {
    if (item === null) return;
    setError(null);
    try {
      await chooseAlternate.mutateAsync({ id: item.id });
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : COPY.saveError);
    }
  }, [item, chooseAlternate, refresh]);

  return {
    item,
    elapsedSec,
    error,
    overflow,
    clearOverflow: () => setOverflow(null),
    onDoNow,
    doingNow: doNow.isPending,
    onChooseAlternate,
    choosing: chooseAlternate.isPending,
    refresh,
    /** The store's answer, not the query's — it ticks. */
    running: elapsedSec !== null,
    paused,
    busy:
      start.isPending ||
      stop.isPending ||
      pause.isPending ||
      resume.isPending ||
      setDone.isPending,
    onStart,
    onStop,
    onPause,
    onResume,
    onToggleDone,
    onToggleDeferred,
    onSaveQuantity,
    onSaveNote,
    onRate,
    seedFromDay: seed,
  };
}

export type ItemSheetController = ReturnType<typeof useItemSheet>;
export type { ItemDetail };
