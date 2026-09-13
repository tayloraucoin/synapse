"use client";

import * as React from "react";

import type { Decision } from "@syn/ui";

import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { REVIEW_COPY as COPY } from "./copy";

type ReviewDay = RouterOutputs["review"]["day"];

/**
 * DR-01's behaviour, in both of its modes.
 *
 * DECISIONS WRITE AS THEY ARE MADE — IN LIVE MODE. *Finish later* is then a
 * navigation rather than a save, which is exactly what the document promises:
 * leaving keeps what was decided and marks nothing missed. Nothing is queued,
 * so nothing can be lost by closing a tab.
 *
 * EDIT MODE IS THE OPPOSITE, AND DELIBERATELY SO. A reviewed day offers
 * *Discard changes?*, and a change that can be discarded cannot already be in
 * the database — so edit mode collects decisions in `batch` and writes the
 * whole thing on *Save changes*, in one transaction, with one stamp. The two
 * behaviours share this hook because they share a screen; the mode is what
 * decides which one a tap gets. Logged in the track's `TECHNICAL-DECISIONS.md`.
 *
 * THE FINISH BUTTON IS DISABLED, NOT VALIDATED. Every panel that is still
 * undecided is its own explanation; a sentence saying "you have two left"
 * would be the screen telling someone what it can already see they can see.
 *
 * A FAILED WRITE KEEPS THE PANEL'S STATE. The optimistic UI here is the
 * panel's own — it shows the decision it was given — and a failure surfaces
 * the sentence without resetting anything, so a retry is one tap rather than
 * three.
 */
export function useReviewDay(dateKey: string, initial: ReviewDay) {
  const utils = trpc.useUtils();
  const [error, setError] = React.useState<string | null>(null);

  const query = trpc.review.day.useQuery(
    { date: dateKey },
    { initialData: initial },
  );
  const reasons = trpc.reason.list.useQuery();

  const decideMutation = trpc.review.decide.useMutation();
  const finishMutation = trpc.review.finish.useMutation();
  const saveMutation = trpc.review.saveChanges.useMutation();
  const lastNightMutation = trpc.review.confirmLastNight.useMutation();

  const day = query.data ?? initial;
  const editing = day.mode === "edit" && day.result !== null;

  /**
   * Edit mode's unwritten changes, by item.
   *
   * A `Map` rather than an array: a person who changes their mind twice about
   * one item has made one change, and a list would send both — the second
   * overwriting the first in a transaction that then claims two changes.
   */
  const [batch, setBatch] = React.useState<Map<string, Decision>>(new Map());

  // Leaving edit mode — or the day being re-read as something else — must not
  // leave a batch behind for a screen that no longer offers to save it.
  React.useEffect(() => {
    if (!editing) setBatch(new Map());
  }, [editing]);

  const refresh = React.useCallback(async () => {
    await utils.review.day.invalidate({ date: dateKey });
    await utils.review.pendingDays.invalidate();
    await utils.shell.status.invalidate();
  }, [utils, dateKey]);

  const decide = React.useCallback(
    (itemId: string, decision: Decision) => {
      setError(null);

      // In edit mode the tap changes the batch and nothing else. The panel
      // reads the batch first, so the decided line updates immediately — the
      // change is visible and still discardable, which is the whole point.
      if (editing) {
        setBatch((current) => new Map(current).set(itemId, decision));
        return;
      }

      decideMutation.mutate(
        { itemId, decision: toWire(decision) },
        {
          onError: () => setError(COPY.saveError),
          onSettled: () => void refresh(),
        },
      );
    },
    [decideMutation, refresh, editing],
  );

  /** *Save changes* — the batch, in one transaction, stamped once. */
  const saveChanges = React.useCallback(
    (onSaved: () => void) => {
      setError(null);
      saveMutation.mutate(
        {
          date: dateKey,
          changes: [...batch.entries()].map(([itemId, decision]) => ({
            itemId,
            decision: toWire(decision),
          })),
        },
        {
          onSuccess: (result) => {
            // The batch is only cleared once the server has it. A failed save
            // keeps every change, so a retry is one tap rather than redoing
            // the work.
            setBatch(new Map());
            utils.review.day.setData({ date: dateKey }, result);
            onSaved();
          },
          onError: () => setError(COPY.saveError),
          onSettled: () => void refresh(),
        },
      );
    },
    [saveMutation, dateKey, batch, utils, refresh],
  );

  const discardChanges = React.useCallback(() => {
    setBatch(new Map());
  }, []);

  const finish = React.useCallback(
    (onFinished: () => void) => {
      setError(null);
      finishMutation.mutate(
        { date: dateKey },
        {
          onSuccess: (result) => {
            // The response is the whole view with `result` on it, so DR-07
            // renders from what finish already returned.
            utils.review.day.setData({ date: dateKey }, result);
            onFinished();
          },
          onError: () => setError(COPY.saveError),
          onSettled: () => void refresh(),
        },
      );
    },
    [finishMutation, dateKey, utils, refresh],
  );

  /**
   * UX v1.1 §7.3 (DYN-19): the review's own *Last night* write, for a day
   * whose after-devices-off items the morning never confirmed. One call —
   * the ticked ids are done, the rest *not confirmed*; nothing asks why.
   */
  const confirmLastNight = React.useCallback(
    (doneItemIds: string[]) => {
      setError(null);
      lastNightMutation.mutate(
        { date: dateKey, doneItemIds },
        {
          onError: () => setError(COPY.saveError),
          onSettled: () => void refresh(),
        },
      );
    },
    [lastNightMutation, dateKey, refresh],
  );

  /**
   * Every panel that still owes an answer. `deciding` counts as undecided:
   * a chooser left open is a decision not yet made.
   */
  const undecidedCount = day.toDecide.filter(
    (entry) => entry.state === "undecided" || entry.state === "deciding",
  ).length;

  return {
    day,
    reasons: reasons.data ?? null,
    error,
    finishing: finishMutation.isPending,
    canFinish: undecidedCount === 0,
    undecidedCount,
    decide,
    finish,
    refresh,
    editing,
    batch,
    dirty: batch.size > 0,
    saving: saveMutation.isPending,
    saveChanges,
    discardChanges,
    confirmLastNight,
    confirmingLastNight: lastNightMutation.isPending,
  };
}

/**
 * `Decision` is the panel's shape; the mutation's is the wire's. They differ in
 * one field name and one nullable, so the translation lives here rather than in
 * either of them — and in one place, so live mode and the batch cannot send
 * subtly different payloads for the same decision.
 */
function toWire(decision: Decision) {
  return decision.kind === "carry"
    ? ({ kind: "carry" } as const)
    : ({
        kind: "missed",
        tier: decision.tier,
        reasonKey: decision.reasonKey,
        reasonText: decision.reasonText,
        tradedUpItemId: decision.tradedUpItemId,
      } as const);
}

export type ReviewDayController = ReturnType<typeof useReviewDay>;
export type { ReviewDay };
