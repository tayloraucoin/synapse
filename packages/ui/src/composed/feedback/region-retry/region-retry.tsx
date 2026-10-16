/**
 * RegionRetry — one region failed, the rest of the screen did not
 * (v2 handoff §5.3, reuse CC).
 *
 * Used by RV-00's regions and WR-01's. The point is containment: a failed
 * query for one panel must not replace the whole page with an error, because
 * the other panels loaded and are still true.
 *
 * The label says what didn't load, in the caller's words. No error code and no
 * stack (nav & system SY-05: the code is logged, not shown). An optional
 * detail line under it says what is still true, also in the caller's words.
 */
"use client";

import * as React from "react";
import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";

export interface RegionRetryProps {
  label: string;
  /** A muted second line under the label, small. */
  detail?: string;
  onRetry: () => void;
  className?: string;
}

export function RegionRetry({
  label,
  detail,
  onRetry,
  className,
}: RegionRetryProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center gap-(--space-3) py-(--space-3)",
        className,
      )}
    >
      <span className="flex flex-col gap-(--space-1)">
        <Text as="span" variant="secondary" tone="secondary">
          {label}
        </Text>
        {detail ? (
          <Text as="span" variant="caption" tone="secondary">
            {detail}
          </Text>
        ) : null}
      </span>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
