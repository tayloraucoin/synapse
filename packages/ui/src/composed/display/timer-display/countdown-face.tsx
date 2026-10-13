/**
 * CountdownFace — the running card's clock face (D-USE-29, D-USE-42,
 * D-USE-47; USE-10).
 *
 * It counts down from the top of the range; the caller passes the figure
 * already formatted ("1:24:10") and owns the tick, so this is a pure render.
 * Past the range the caller passes `over`: the figure ("0:42", "12 min") and
 * the word ("over") sit side by side in `warning-text` under a minute over,
 * in `destructive-text` from a minute on. The word is always there, so the
 * colour never carries the state alone (P-A03); both colours are named bends
 * of "nothing red on the tabs" (D-USE-29).
 *
 * Tabular, like `TimerDisplay`: digits change, nothing else moves.
 * `aria-live="off"`: the card's line under it carries the announced value.
 */
import * as React from "react";
import { cn } from "../../../lib/cn";

export type CountdownOverLevel = "warning" | "danger";

export interface CountdownFaceProps {
  /** The time left, or past the range the time over. */
  figure: string;
  /** Past the range: the word beside the figure and how far over. */
  over?: { word: string; level: CountdownOverLevel } | null;
  className?: string;
}

const OVER_TONE: Record<CountdownOverLevel, string> = {
  warning: "text-warning-text",
  danger: "text-destructive-text",
};

export function CountdownFace({
  figure,
  over = null,
  className,
}: CountdownFaceProps) {
  return (
    <p
      aria-live="off"
      data-countdown-face
      data-over={over?.level}
      className={cn(
        "m-0 inline-flex items-baseline gap-(--space-2) leading-none font-medium tabular-nums",
        over ? OVER_TONE[over.level] : "text-foreground",
        className,
      )}
    >
      <span className="text-(length:--fs-timer)">{figure}</span>
      {over ? (
        <span className="text-(length:--fs-body)">{over.word}</span>
      ) : null}
    </p>
  );
}
