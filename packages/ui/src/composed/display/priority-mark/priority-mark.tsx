/**
 * PriorityMark — the matters number, as the chosen cell in miniature
 * (UX v1.3 R59, §10.2, §10.4; DAY-1).
 *
 * "The `Stepper17` row cell at 24px: `bg-primary`, `text-primary-foreground`,
 * the number in caption size, tabular. It is never interactive; the card's
 * *Edit* is. Colour is not the carrier — the number is." It sits beside the
 * `EmojiSlot` on a collapsed habit or activity card and on the routine's rows.
 *
 * ONE SOURCE FOR THE FILL. The class is `stepper17CellVariants` with
 * `state: "selected"` and `size: "mark"`, so the mark and the control it
 * miniaturises cannot disagree on the fill or the radius.
 *
 * `role="img"` with *matters n* as its name; never focusable. A value outside
 * 1–7 is refused by the type, not by a runtime branch.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import type { Stepper17Value } from "../../control/stepper-17/stepper-17";
import { stepper17CellVariants } from "../../control/stepper-17/stepper-17.variants";
import { PRIORITY_MARK_COPY } from "./copy";

/** The seven the control offers — the mark shows the one chosen. */
export type PriorityMarkValue = Stepper17Value;

export interface PriorityMarkProps {
  value: PriorityMarkValue;
  className?: string;
}

export function PriorityMark({ value, className }: PriorityMarkProps) {
  return (
    <span
      role="img"
      aria-label={PRIORITY_MARK_COPY.label(value)}
      data-priority-mark
      className={cn(stepper17CellVariants({ size: "mark", state: "selected" }), "tabular-nums", className)}
    >
      <span aria-hidden="true">{value}</span>
    </span>
  );
}
