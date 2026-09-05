/**
 * GroupHeading — the small heading over a section of rows (v2 handoff §5.5).
 *
 * Used in LB-01, TP-01, ST-06 and the Day Review's sections. The count is
 * optional and is a fact about the group, never a score — it reads "Habits 12",
 * not "12 habits done" (official spec §2.4: no numbers that grade a day).
 *
 * `as` defaults to `h2`. A screen has exactly one `h1` (the AppHeader's title),
 * so a group heading is never `h1`; the caller drops to `h3` when the group
 * already sits under an `h2`.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export interface GroupHeadingProps {
  children: string;
  count?: number;
  as?: "h2" | "h3";
  className?: string;
}

export function GroupHeading({
  children,
  count,
  as = "h2",
  className,
}: GroupHeadingProps) {
  return (
    <Text
      as={as}
      variant="secondary"
      tone="secondary"
      weight={500}
      className={cn("pt-(--space-5) pb-(--space-2)", className)}
    >
      {children}
      {count === undefined ? null : (
        <span className="ps-(--space-2) tabular-nums">{count}</span>
      )}
    </Text>
  );
}
