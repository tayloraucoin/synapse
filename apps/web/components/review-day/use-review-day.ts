"use client";

import * as React from "react";

import type { Decision } from "@syn/ui";

import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { REVIEW_COPY as COPY } from "./copy";

type ReviewDay = RouterOutputs["review"]["day"];

/**
 * DR-01's behaviour.
 *
 * DECISIONS WRITE AS THEY ARE MADE. *Finish later* is then a navigation rather
 * than a save — which is exactly what the document promises: leaving keeps
 * what was decided and marks nothing missed. Nothing is queued, so nothing can
 * be lost by closing a tab.
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

  const day = query.data ?? initial;

  const refresh = React.useCallback(async () => {
    await utils.review.day.invalidate({ date: dateKey });
    await utils.review.pendingDays.invalidate();
    await utils.shell.status.invalidate();
  }, [utils, dateKey]);

  /**
   * `Decision` is the panel's shape; the mutation's is the wire's. They differ
   * in one field name and one nullable, so the translation lives here rather
   * than in either of them.
   */
  const decide = React.useCallback(
    (itemId: string, decision: Decision) => {
      setError(null);
      decideMutation.mutate(
        {
          itemId,
          decision:
            decision.kind === "carry"
              ? { kind: "carry" }
              : {
                  kind: "missed",
                  tier: decision.tier,
                  reasonKey: decision.reasonKey,
                  reasonText: decision.reasonText,
                  tradedUpItemId: decision.tradedUpItemId,
                },
        },
        {
          onError: () => setError(COPY.saveError),
          onSettled: () => void refresh(),
        },
      );
    },
    [decideMutation, refresh],
  );

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
  };
}

export type ReviewDayController = ReturnType<typeof useReviewDay>;
export type { ReviewDay };
