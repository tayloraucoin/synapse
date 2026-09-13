/**
 * BudgetLine — *68 chosen · 72 available* (UX v1.1 §5.3, §10.2, §10.4).
 *
 * Two tabular numbers and a middle dot. "Ticking one more turns it to
 * *83 chosen · 72 available*; nothing changes colour." The three states —
 * under, exact, over — render identically; the second number is the
 * feedback, and a line that turned red at 73 would be the product grading a
 * morning that has not happened yet (official spec §2.4).
 *
 * `state` exists for the sentence and for tests, never for the skin.
 *
 * ONE ANNOUNCEMENT PER PAUSE. The visible numbers update on every tick; the
 * live region's text follows after `BUDGET_LINE_ANNOUNCE_MS`, so tapping
 * three boxes in a row announces the last total once (§10.4) rather than
 * three sentences a screen reader would still be reading.
 */
"use client";

import { BUDGET_LINE_ANNOUNCE_MS } from "@syn/constants";
import type { BudgetState } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { BUDGET_LINE_COPY } from "./copy";

export interface BudgetLineProps {
  chosenMin: number;
  availableMin: number;
  /** Derived from the numbers when omitted. */
  state?: BudgetState;
  /** Sticks to the foot of its section (§5.3). */
  sticky?: boolean;
  className?: string;
}

export function budgetStateFor(chosenMin: number, availableMin: number): BudgetState {
  if (chosenMin === availableMin) return "exact";
  return chosenMin < availableMin ? "under" : "over";
}

export function BudgetLine({
  chosenMin,
  availableMin,
  state,
  sticky = false,
  className,
}: BudgetLineProps) {
  const resolved = state ?? budgetStateFor(chosenMin, availableMin);
  const sentence = BUDGET_LINE_COPY.sentence(chosenMin, availableMin);

  // The live region lags the numbers by the debounce, so a burst of ticks
  // announces once.
  const [announced, setAnnounced] = React.useState(sentence);
  React.useEffect(() => {
    const handle = window.setTimeout(() => setAnnounced(sentence), BUDGET_LINE_ANNOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [sentence]);

  return (
    <div
      data-budget-line
      data-budget-state={resolved}
      className={cn(
        "flex items-baseline gap-(--space-2) py-(--space-2)",
        sticky && "bg-paper sticky bottom-0",
        className,
      )}
    >
      <span aria-hidden="true" className="flex items-baseline gap-(--space-2)">
        <Text as="span" variant="secondary" className="tabular-nums">
          <span className="text-ink font-medium">{chosenMin}</span>{" "}
          <span className="text-text-secondary">{BUDGET_LINE_COPY.chosen}</span>
        </Text>
        <Text as="span" variant="secondary" tone="secondary">
          ·
        </Text>
        <Text as="span" variant="secondary" className="tabular-nums">
          <span className="text-ink font-medium">{availableMin}</span>{" "}
          <span className="text-text-secondary">{BUDGET_LINE_COPY.available}</span>
        </Text>
      </span>
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {announced}
      </span>
    </div>
  );
}
