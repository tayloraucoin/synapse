/**
 * FiringMark — the 10px accent mark that says a prompt is running (Workflow
 * UX v0.1 §3.3, §9; W5, TD-42).
 *
 * THE ONE THING ON THE BOARD THAT MOVES. Breathing, its opacity runs
 * 1 → 0.35 → 1 over `--dur-breathe` (2.4s), ease-in-out, for as long as the
 * task fires. The breath is attached `motion-safe:` ONLY: under reduced motion
 * no animation is attached at all, so the mark is still and at full opacity —
 * never frozen dim. The word *firing* beside it carries the state either way.
 *
 * Decorative: `aria-hidden`. `accent-mark` is the theme-independent 500 (a
 * non-text marker); the words use `accent-text`.
 *
 * Used alone in a folded lane's head, and inside `FiringToggle`.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";

export interface FiringMarkProps {
  /** The prompt is running: the mark breathes (when motion is allowed). */
  breathing?: boolean;
  className?: string;
}

export function FiringMark({ breathing = false, className }: FiringMarkProps) {
  return (
    <span
      aria-hidden="true"
      data-breathing={breathing || undefined}
      className={cn(
        "bg-accent-mark inline-block size-2.5 shrink-0 rounded-(--radius-full)",
        breathing && "motion-safe:animate-breathe",
        className,
      )}
    />
  );
}
