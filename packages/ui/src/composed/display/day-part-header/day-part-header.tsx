/**
 * DayPartHeader — morning / afternoon / evening / anytime (v2 handoff §5.6).
 *
 * A quiet divider in the List, not a control and not a section a person can
 * collapse: the parts are how a day reads, not how it is organised.
 *
 * The optional span shows the part's own hours in tabular figures, so the
 * boundary between "morning" and "afternoon" is a fact rather than a feeling.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export type DayPart = "morning" | "afternoon" | "evening" | "anytime";

const LABELS: Record<DayPart, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  anytime: "Anytime",
};

export interface DayPartHeaderProps {
  part: DayPart;
  span?: { startLabel: string; endLabel: string };
  className?: string;
}

export function DayPartHeader({ part, span, className }: DayPartHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-baseline gap-(--space-2) px-(--space-4) pt-(--space-6) pb-(--space-2)",
        className,
      )}
    >
      <Text as="h2" variant="secondary" tone="secondary" weight={500}>
        {LABELS[part]}
      </Text>
      {span === undefined ? null : (
        <Text
          as="span"
          variant="secondary"
          tone="secondary"
          className="tabular-nums"
        >
          {`${span.startLabel}–${span.endLabel}`}
        </Text>
      )}
    </div>
  );
}
