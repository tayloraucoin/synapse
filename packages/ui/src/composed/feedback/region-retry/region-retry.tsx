/**
 * RegionRetry — one region failed, the rest of the screen did not
 * (v2 handoff §5.3, reuse CC).
 *
 * Used by RV-00's regions and WR-01's. The point is containment: a failed
 * query for one panel must not replace the whole page with an error, because
 * the other panels loaded and are still true.
 *
 * The label says what didn't load, in the caller's words. No error code and no
 * stack (nav & system SY-05: the code is logged, not shown).
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";

export interface RegionRetryProps {
  label: string;
  onRetry: () => void;
  className?: string;
}

export function RegionRetry({ label, onRetry, className }: RegionRetryProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center gap-(--space-3) py-(--space-3)",
        className,
      )}
    >
      <Text as="span" variant="secondary" tone="secondary">
        {label}
      </Text>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
