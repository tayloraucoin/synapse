/**
 * DayCompleteAction — the end of the List (v2 handoff §5.6).
 *
 * *Day Complete*, centred, 24px above the safe area. A ghost button rather
 * than a filled one: closing the day is the person's own decision at their own
 * pace, and a primary button at the bottom of every list would read as
 * something the app wants.
 *
 * After the day closes it becomes a muted line with a *Review* link — the
 * button does not stay and grey out, because a disabled control at the end of
 * a finished day is a dead end.
 */
"use client";

import Link from "next/link";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";

export interface DayCompleteActionProps {
  /** Set once the day is closed — "Closed 10:14 PM". */
  closedAtLabel: string | null;
  onComplete: () => void;
  reviewHref: string;
  busy?: boolean;
  className?: string;
}

export function DayCompleteAction({
  closedAtLabel,
  onComplete,
  reviewHref,
  busy = false,
  className,
}: DayCompleteActionProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-(--space-2)",
        "pt-(--space-5) pb-[calc(var(--space-5)+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {closedAtLabel === null ? (
        <Button
          variant="ghost"
          busy={busy}
          onClick={onComplete}
          className="text-(length:--fs-row-title)"
        >
          Day Complete
        </Button>
      ) : (
        <Text as="p" variant="secondary" tone="secondary">
          {closedAtLabel}
          {" · "}
          <Link href={reviewHref} className="text-ink underline-offset-4 hover:underline">
            Review
          </Link>
        </Text>
      )}
    </div>
  );
}
