"use client";

import * as React from "react";

import { useRunningTimer } from "@/lib/stores/use-timer-store";

/**
 * The elapsed time in the tab title while a timer runs.
 *
 * A BACKGROUNDED TAB STILL TELLS THE TIME. That is the whole point: someone
 * who started a timer and switched to another window can see how long they
 * have been at it without coming back.
 *
 * IT IS A TIME, NOT A NUMBER ABOUT THE DAY. The execution tabs may not carry a
 * count, a percentage or a progress mark (official spec §2.4) — this is the
 * same category as the clock on a row, and Vesper allowed it on that basis.
 *
 * IT LIVES IN THE SHELL, MOUNTED ONCE. Setting `document.title` from the sheet
 * would mean the title reverted whenever the sheet closed, which is exactly
 * the moment the timer is still running and the person has looked away.
 */
export function TimerTitle() {
  const running = useRunningTimer();
  const original = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (original.current === null) original.current = document.title;

    document.title =
      running === null
        ? original.current
        : `${formatElapsed(running.elapsedSec)} · Synapse`;
  }, [running]);

  // Restore the title on unmount, so a navigation away does not strand a
  // stopped timer's digits in the tab.
  React.useEffect(
    () => () => {
      if (original.current !== null) document.title = original.current;
    },
    [],
  );

  return null;
}

/** "7:04", and "1:07:04" once it passes an hour. */
function formatElapsed(totalSec: number): string {
  const seconds = Math.max(0, totalSec);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return h > 0
    ? `${h}:${mm}:${String(s).padStart(2, "0")}`
    : `${mm}:${String(s).padStart(2, "0")}`;
}
