/**
 * TimerDisplay — the running clock (v2 handoff §5.6).
 *
 * 2rem tabular digits, ink while running, `neutral-500` while idle at 0:00.
 * Tabular is not decoration here: proportional digits make the whole number
 * shuffle sideways every second, which is exactly the motion official spec
 * §9.6 rules out ("digits change, nothing else moves").
 *
 * `aria-live="off"` — deliberately. A clock that announced itself every second
 * would make the screen unusable with a screen reader. The state line beside
 * it carries the announced value, on change, once.
 *
 * The 1 Hz tick belongs to the parent's `useElapsed`; this component is a pure
 * render of a number it is given (§10 D15: 1 Hz, not CC's 500 ms).
 */
import type { TimerStatus } from "@syn/types";
import { formatElapsed } from "@syn/utils";
import * as React from "react";

import { cn } from "../../../lib/cn";

export interface TimerDisplayProps {
  elapsedSec: number;
  status: TimerStatus;
  className?: string;
}

export function TimerDisplay({
  elapsedSec,
  status,
  className,
}: TimerDisplayProps) {
  const idle = status === "idle" && elapsedSec === 0;

  return (
    <p
      aria-live="off"
      className={cn(
        "text-[length:var(--fs-timer)] leading-none font-medium tabular-nums",
        idle ? "text-text-secondary" : "text-ink",
        className,
      )}
    >
      {formatElapsed(elapsedSec)}
    </p>
  );
}
