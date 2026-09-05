/**
 * BigNumber · FormulaSentence · FactLine — the review's arithmetic
 * (v2 handoff §5.9).
 *
 * Three exports from one folder, following CC's precedent of
 * `Headline/Sub/Microcopy` from `text/`: they are never used apart, and
 * splitting them would mean three imports to render one paragraph.
 *
 * WHY THE SERIF. Newsreader is the reflective register (official spec §9.4).
 * The number and the sentence explaining it are the one place a person is
 * asked to sit with a result rather than act on it.
 *
 * THE FORMULA IS SHOWN, NOT JUST THE ANSWER. This is the product's whole
 * position on scoring: a percentage on its own is a grade, and a percentage
 * with its terms spelled out is a reckoning a person can argue with. Terms
 * with a zero count are omitted — "0 missed" is a sentence about nothing.
 *
 * `BigNumber` renders nothing at null rather than "—": a day with nothing
 * counted has no number, and a placeholder would imply one is coming.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";

export interface BigNumberProps {
  value: number | null;
  size: "day" | "week";
  className?: string;
}

export function BigNumber({ value, size, className }: BigNumberProps) {
  if (value === null) return null;

  return (
    <p
      className={cn(
        "text-ink font-serif leading-(--lh-review-headline) tabular-nums",
        size === "week"
          ? "text-[length:var(--fs-review-headline)] wide:text-[length:var(--fs-review-headline-wide)]"
          : "text-[length:var(--fs-review-headline)]",
        className,
      )}
    >
      {`${value}%`}
    </p>
  );
}

export interface FormulaTerm {
  count: number;
  label: string;
  weight?: "½" | "0" | "not counted";
}

export interface FormulaSentenceProps {
  terms: readonly FormulaTerm[];
  credit: number;
  counted: number;
  percent: number | null;
  className?: string;
}

export function FormulaSentence({
  terms,
  credit,
  counted,
  percent,
  className,
}: FormulaSentenceProps) {
  const shown = terms.filter((term) => term.count > 0);

  const body =
    counted === 0
      ? "Nothing was counted today."
      : `${shown
          .map((term) =>
            term.weight === undefined
              ? `${term.count} ${term.label}`
              : `${term.count} ${term.label} (${term.weight})`,
          )
          .join(", ")} — ${credit} of ${counted}${
          percent === null ? "" : `, ${percent}%`
        }.`;

  return (
    <p
      className={cn(
        "text-text-body max-w-(--measure) font-serif text-[length:var(--fs-body)] leading-(--lh-body)",
        className,
      )}
    >
      {body}
    </p>
  );
}

export interface FactLineProps {
  children: React.ReactNode;
  className?: string;
}

export function FactLine({ children, className }: FactLineProps) {
  return (
    <p
      className={cn(
        "text-text-body font-sans text-[length:var(--fs-secondary)] leading-(--lh-secondary)",
        className,
      )}
    >
      {children}
    </p>
  );
}
