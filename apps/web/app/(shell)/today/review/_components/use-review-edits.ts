"use client";

import * as React from "react";
import { instantToWallClockMinutes } from "@syn/utils";
import { nextFreeTimeMin } from "@/lib/data/next-free-time";
import {
  dismissesRailHint,
  FIRST_CHANGE,
  RAIL_HINT,
  showsFirstChangeLine,
  type RailHintAction,
} from "@/lib/data/review-first-times";
import { useDataSource } from "@/lib/data/source";
import { useDayEdits } from "@/lib/data/use-day-edits";
import { useFirstTime } from "@/lib/data/use-first-time";
import type { ReviewDayView } from "@/lib/data/use-review-day";
import { useUndoToast } from "@/lib/hooks/use-undo-toast";
import { REVIEW_EDITS_COPY as COPY } from "./edits-copy";

/**
 * Review the day's edits on the frame (USE-37): every change goes through
 * `useDayEdits` (today only, with Undo in the Toaster above Ready, go); the
 * first change ever shows the first-change line; the rail + sits at the next
 * free time with its hint until Got it or the first drag.
 *
 * A scenario's `view.staged` swap is the Item sheet's landing, run once
 * when the day has read, its Toaster held for the capture.
 */
export function useReviewEdits(
  dateKey: string,
  view: ReviewDayView | undefined,
) {
  const source = useDataSource();
  const showToast = useUndoToast();
  const [changeSeen, markChangeSeen] = useFirstTime(FIRST_CHANGE);
  const [hintSeen, markHintSeen] = useFirstTime(RAIL_HINT);
  const [changed, setChanged] = React.useState(false);
  // Whether a change was ever made here, as it stood when this visit's first came.
  const [seenBefore, setSeenBefore] = React.useState(true);
  const seenRef = React.useRef(changeSeen);
  seenRef.current = changeSeen;

  const edits = useDayEdits(dateKey, {
    onEdit: () => {
      if (changed) return;
      setSeenBefore(seenRef.current);
      setChanged(true);
      markChangeSeen();
    },
  });

  const staged = source.scenario.view?.staged;
  const stagedRun = React.useRef(false);
  React.useEffect(() => {
    if (!staged || view === undefined || stagedRun.current) return;
    stagedRun.current = true;
    void edits
      .swap(staged.swap.id, staged.swap.withId)
      .then(({ token, swapped }) => {
        if (!staged.toast || !swapped) return;
        showToast({
          text: COPY.swapped(swapped.item, swapped.block, swapped.endsAt),
          onUndo: () => void edits.undo(token),
          durationMs: Infinity,
        });
      });
  }, [staged, view, edits, showToast]);

  function swipeAway(blockId: string) {
    return edits
      .remove({ kind: "block", blockId })
      .then(({ token, removed }) => {
        showToast({
          text: COPY.offToday(removed ?? ""),
          onUndo: () => void edits.undo(token),
        });
      });
  }

  const plusAtMin =
    view === undefined
      ? null
      : nextFreeTimeMin({
          fromMin: Math.max(
            instantToWallClockMinutes(source.now(), view.timeZone),
            view.orient
              ? view.orient.atMin + view.orient.lengthMin
              : view.startMin,
          ),
          blocks: view.blocks,
        });

  return {
    edits,
    swipeAway,
    firstChangeLine: showsFirstChangeLine({
      seenBefore,
      changedThisVisit: changed,
    }),
    plusAtMin,
    hint: {
      show: !hintSeen,
      onHint: (action: RailHintAction) => {
        if (dismissesRailHint(action)) markHintSeen();
      },
    },
  };
}
