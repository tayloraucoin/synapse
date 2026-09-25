/**
 * StepFrameSkeleton — the frame, waiting (UX v1.3 R63, §2 guardrail 6,
 * §10.2, §10.4; DAY-1).
 *
 * "The sequence never blanks. A route transition shows the frame's skeleton;
 * a list fetching shows skeleton rows in the list's own shape; the primary
 * shows its pending state while the next screen loads." The v1.2 build
 * showed a white screen while a step's Server Component awaited its queries
 * (T10.4, T13.1); a `/setup/*` `loading.tsx` renders this instead.
 *
 * `StepFrame`'s geometry, from the same class strings (`step-frame.classes`):
 * the header line (the caption where the progress sits), a heading bar, an
 * optional body line, three `SkeletonRow`s at `--row-min`, and the action row
 * — pinned, with a block where the primary will be. It reads as waiting, not
 * as a screen: no words, no controls, nothing focusable.
 *
 * `aria-busy` on the region, named *Loading*; no live region, so nothing is
 * announced. The skeleton primitives do not animate at all, so reduced
 * motion has nothing to still.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { SkeletonBlock, SkeletonRow } from "../../feedback/skeleton-row";
import { STEP_FRAME_SKELETON_COPY } from "./copy";
import { STEP_FRAME_ACTIONS, STEP_FRAME_ACTIONS_STICKY, STEP_FRAME_ROOT } from "./step-frame.classes";

export interface StepFrameSkeletonProps {
  /** A body line under the heading, where the arriving screen has one. */
  body?: boolean;
  /** Rows in the arriving list's shape. Default three. */
  rows?: number;
  /** As `StepFrame`'s. Default true. */
  stickyActions?: boolean;
  className?: string;
}

export function StepFrameSkeleton({
  body = false,
  rows = 3,
  stickyActions = true,
  className,
}: StepFrameSkeletonProps) {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={STEP_FRAME_SKELETON_COPY.label}
      data-step-frame-skeleton
      className={cn(STEP_FRAME_ROOT, className)}
    >
      {/* The header line: the caption where the progress sits. */}
      <div className="flex min-h-(--target) items-center">
        <SkeletonBlock heightPx={16} className="w-16" />
      </div>

      <SkeletonBlock heightPx={28} className="w-3/5" />

      {body ? <SkeletonBlock heightPx={16} className="w-4/5" /> : null}

      <div className="-mx-(--space-4) flex flex-col">
        {Array.from({ length: rows }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>

      <div className={cn(STEP_FRAME_ACTIONS, stickyActions && STEP_FRAME_ACTIONS_STICKY)}>
        <SkeletonBlock heightPx={44} className="w-30" />
      </div>
    </div>
  );
}
