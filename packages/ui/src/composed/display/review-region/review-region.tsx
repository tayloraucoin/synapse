/**
 * ReviewRegion — one panel on the Review index (v2 handoff §5.9).
 *
 * RV-00 is four of these: today, yesterday, this week, history. Each loads
 * independently and fails independently, which is why the error slot is a
 * `RegionRetry` inside the region and not a page-level error.
 *
 * The status line is a sentence about the region, never a count that grades
 * ("3 waiting" is a fact; "3 missed" is a verdict — official spec §2.4).
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";
import { RegionRetry } from "../../feedback/region-retry";
import { SkeletonRow } from "../../feedback/skeleton-row";

export interface ReviewRegionProps {
  title: string;
  status: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    emphasis: "default" | "ghost";
  };
  loading?: boolean;
  error?: { label: string; onRetry: () => void };
  className?: string;
}

export function ReviewRegion({
  title,
  status,
  action,
  loading = false,
  error,
  className,
}: ReviewRegionProps) {
  return (
    <section
      className={cn(
        "border-hairline flex flex-col gap-(--space-2) border-b py-(--space-4) last:border-b-0",
        className,
      )}
    >
      <Text as="h2" variant="row-title" weight={500}>
        {title}
      </Text>

      {error !== undefined ? (
        <RegionRetry label={error.label} onRetry={error.onRetry} />
      ) : loading ? (
        <SkeletonRow leading={false} lines={1} />
      ) : (
        <>
          <Text as="p" variant="secondary" tone="body">
            {status}
          </Text>
          {action === undefined ? null : (
            <Button
              variant={action.emphasis}
              onClick={action.onClick}
              className="self-start"
            >
              {action.label}
            </Button>
          )}
        </>
      )}
    </section>
  );
}
