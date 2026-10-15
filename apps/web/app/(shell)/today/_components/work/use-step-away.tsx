"use client";

import * as React from "react";
import { StepAwayBar } from "@/components/work";
import type { TodayWorkView } from "@/lib/data/today-work";
import type { useWorkLoop } from "@/lib/data/use-today-work";
import { WORK_COPY as COPY } from "./copy";

/**
 * Step away on Today (USE-60; step-away.md, D-USE-46, D-USE-52): the header's
 * Step away while a work timer runs and none is held, else the stepped-away
 * bar while Step away holds work time. The desk puts the button left of + Add
 * and the bar under the title; the phone the pill beside ··· and the bar
 * under the block header. Nothing is asked on a return past the block's end:
 * the bar just waits (D-USE-62).
 *
 * "Stepped away at 10:42" and "Work time resumed." are said politely; focus
 * moves to Resume all on press and back to Step away on Resume all.
 */
export function useStepAway(
  view: TodayWorkView | null,
  loop: ReturnType<typeof useWorkLoop>,
) {
  const [said, setSaid] = React.useState("");
  const [pressed, setPressed] = React.useState(false);
  const [resumed, setResumed] = React.useState(false);

  const held = view?.steppedAway ?? null;
  const shows = view !== null && held === null && view.workRunning;

  React.useEffect(() => {
    if (held) setSaid(held.words);
  }, [held]);
  React.useEffect(() => {
    if (!resumed || !shows) return;
    setResumed(false);
    document.querySelector<HTMLElement>("[data-step-away-button]")?.focus();
  }, [resumed, shows]);

  const stepAway = shows
    ? {
        label: COPY.stepAway,
        name: COPY.stepAwayName,
        onPress: () => {
          setPressed(true);
          void loop.stepAway();
        },
      }
    : null;

  const bar = held ? (
    <StepAwayBar
      title={held.words}
      held={COPY.heldLine}
      resumeAll={COPY.resumeAll}
      focusOnMount={pressed}
      onResumeAll={() => {
        setPressed(false);
        setResumed(true);
        setSaid(COPY.saidResumed);
        void loop.resumeAll(held.id);
      }}
    />
  ) : null;

  const live = (
    <p aria-live="polite" className="sr-only">
      {said}
    </p>
  );

  return { stepAway, bar, live };
}
