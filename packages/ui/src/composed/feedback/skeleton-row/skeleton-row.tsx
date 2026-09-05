/**
 * SkeletonRow / SkeletonBlock — the shape of what is loading (v2 handoff §5.3).
 *
 * Over the `Skeleton` primitive, which already had its shimmer removed: a
 * pulsing list is motion that carries no information, and the official spec's
 * motion rule (§9.6 — digits change, nothing else moves) applies to waiting as
 * much as to running.
 *
 * The row is 56px with a 24px leading square and two bars, so the list does
 * not resize when the real rows arrive. `aria-hidden` comes from `Skeleton`;
 * the loading state is announced by the region that owns it, not by every bar.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Skeleton } from "../../../primitives/display/skeleton";

export interface SkeletonRowProps {
  leading?: boolean;
  lines?: 1 | 2;
  className?: string;
}

export function SkeletonRow({
  leading = true,
  lines = 2,
  className,
}: SkeletonRowProps) {
  return (
    <div
      className={cn(
        "flex min-h-(--row-min) items-center gap-(--space-3) px-(--space-4) py-(--space-2)",
        className,
      )}
    >
      {leading ? <Skeleton className="size-6 shrink-0 rounded-(--radius)" /> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-(--space-2)">
        <Skeleton className="h-4 w-1/2" />
        {lines === 2 ? <Skeleton className="h-3 w-1/3" /> : null}
      </div>
    </div>
  );
}

export interface SkeletonBlockProps {
  heightPx: number;
  className?: string;
}

export function SkeletonBlock({ heightPx, className }: SkeletonBlockProps) {
  return (
    <Skeleton
      style={{ height: `${heightPx}px` }}
      className={cn("w-full rounded-(--radius)", className)}
    />
  );
}
