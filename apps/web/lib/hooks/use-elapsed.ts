/**
 * useElapsed — the running timer's seconds (adapt CC `use-capture-elapsed`).
 *
 * CC ticks at 500 ms so its capture clock never visibly skips. Synapse ticks
 * at 1 Hz (§10 D15, official spec §9.6): the display shows whole seconds, so a
 * second tick inside the same second is a re-render that changes nothing, and
 * this clock can be on screen for an hour.
 *
 * ALIGNED TO THE SECOND BOUNDARY. A plain 1000 ms interval started mid-second
 * drifts against the wall clock and can skip a displayed second entirely. The
 * first timeout lands on the next whole second, and the interval runs from
 * there.
 *
 * `pausedElapsedSec` carries the seconds already banked before a pause, so
 * resuming continues the count rather than restarting it.
 */
"use client";

import { useEffect, useState } from "react";

const TICK_MS = 1000;

export function useElapsed(
  startedAtMs: number | null,
  pausedElapsedSec = 0,
): number {
  const [elapsed, setElapsed] = useState(pausedElapsedSec);

  useEffect(() => {
    if (startedAtMs === null) {
      setElapsed(pausedElapsedSec);
      return;
    }

    const tick = () =>
      setElapsed(
        pausedElapsedSec +
          Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)),
      );

    tick();

    let interval: number | undefined;
    const alignMs = TICK_MS - ((Date.now() - startedAtMs) % TICK_MS);
    const align = window.setTimeout(() => {
      tick();
      interval = window.setInterval(tick, TICK_MS);
    }, alignMs);

    return () => {
      window.clearTimeout(align);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [pausedElapsedSec, startedAtMs]);

  return elapsed;
}
