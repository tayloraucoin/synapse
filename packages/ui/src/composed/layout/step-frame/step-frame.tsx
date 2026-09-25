/**
 * StepFrame — the frame every first-run screen sits in (UX v1.1 §4, "the
 * frame, once"; Epic 1 §2).
 *
 * "A caption top-left (*3 of 12*), *Finish later* top-right as ghost text,
 * the heading at 1.375rem, at most one paragraph of body under it, the
 * content, and the primary button pinned above the safe area with *Skip for
 * now* as ghost text beside it where skipping is allowed."
 *
 * PRESENTATIONAL. It used to live in the app with the router, tRPC and the
 * online hook inside it; DYN-7 moved the frame here and left the binding in
 * `apps/web/app/(setup)/_components/step-frame.tsx`, because Settings → Your
 * day reuses the twelve screens without the sequence (v1.1 §4). The frame
 * takes callbacks and a `copy` object; it navigates nothing and reads
 * nothing.
 *
 * BACK NEVER LEAVES THE SEQUENCE (cross-cutting §1.3): back is the previous
 * step, *Finish later* is the exit — two intentions, two controls. Focus
 * moves to the heading on every step change: a sequence advancing in place
 * is not a page load, so nothing would announce the new step otherwise.
 *
 * IT ADDS NO `main`; the layout around it does.
 *
 * UX v1.2 §4, R43 (RUN-7): `stickyActions` (default true) pins the action row
 * "above the safe area at every scroll position — a hairline above it,
 * `bg-paper` behind it"; the content scrolls beneath it with 96px of bottom
 * padding so the last row is reachable. The row is `position: sticky` inside
 * the frame, so the layout's own scroll container is the one that scrolls
 * and nothing here reads the viewport.
 */
"use client";

import { ArrowLeft } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { HelperText } from "../../../primitives/display/helper-text";
import { Heading, Text } from "../../../primitives/typography/text";
import { STEP_FRAME_ACTIONS, STEP_FRAME_ACTIONS_STICKY, STEP_FRAME_ROOT } from "./step-frame.classes";

export interface StepFrameCopy {
  /** "3 of 12" */
  progress: (step: number, total: number) => string;
  back: string;
  finishLater: string;
  skip: string;
  offline: string;
}

export interface StepFrameProps {
  step: number;
  total: number;
  heading: string;
  body?: string;
  children?: React.ReactNode;
  primary: { label: string; onClick: () => void; busy?: boolean; disabled?: boolean };
  /** *Skip for now*, ghost text beside the primary, where skipping is allowed. */
  skip?: { label?: string; onSkip: () => void; busy?: boolean };
  /** Absent on the first step. */
  onBack?: () => void;
  onFinishLater: () => void;
  /** Disables the actions and shows the standard line. */
  offline?: boolean;
  error?: string | null;
  copy: StepFrameCopy;
  /** The action row pinned above the safe area (v1.2 §4). Default true. */
  stickyActions?: boolean;
  /**
   * A second caption under the progress line — the day builder's *Day A ·
   * 3 of 9* (v1.2 §4.13). Read as it changes: the caller passes a node with
   * its own `aria-live`, or a string, which the frame announces politely.
   */
  caption?: React.ReactNode;
  /**
   * UX v1.3 R63 (DAY-2): the header control whose move is out. *Back* dims
   * and carries `aria-busy`; *Finish later* shows the button's own pending.
   * The primary and *Skip* take theirs through `busy`.
   */
  pending?: "back" | "finishLater" | null;
  /**
   * UX v1.3 §4 (the frame, amended; DAY-9): *Back* as ghost text on the
   * action row's left, beside the header arrow and doing the same, so forward
   * and back are both in thumb reach. The builder's screens set it.
   */
  backOnActionRow?: boolean;
  className?: string;
}

export function StepFrame({
  step,
  total,
  heading,
  body,
  children,
  primary,
  skip,
  onBack,
  onFinishLater,
  offline = false,
  error,
  copy,
  stickyActions = true,
  caption,
  pending = null,
  backOnActionRow = false,
  className,
}: StepFrameProps) {
  const frameRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    frameRef.current?.querySelector<HTMLElement>("h1")?.focus();
  }, [step]);

  return (
    <div
      ref={frameRef}
      data-step-frame
      className={cn(STEP_FRAME_ROOT, className)}
    >
      <div className="flex items-center gap-(--space-3)">
        {onBack === undefined ? null : (
          <Button
            variant="ghost"
            size="icon"
            aria-label={copy.back}
            aria-busy={pending === "back" || undefined}
            className={cn("shrink-0", pending === "back" && "opacity-60")}
            onClick={onBack}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Button>
        )}
        <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
          {copy.progress(step, total)}
        </Text>
        <Button variant="ghost" className="ml-auto" busy={pending === "finishLater"} onClick={onFinishLater}>
          {copy.finishLater}
        </Button>
      </div>

      {caption === undefined || caption === null ? null : typeof caption === "string" ? (
        <Text as="p" variant="caption" tone="secondary" aria-live="polite" className="-mt-(--space-3) tabular-nums">
          {caption}
        </Text>
      ) : (
        caption
      )}

      {/* `tabIndex={-1}`: focusable by the step change, not in the tab order. */}
      <Heading tabIndex={-1}>{heading}</Heading>

      {body === undefined ? null : (
        <Text as="p" tone="secondary">
          {body}
        </Text>
      )}

      {children}

      {error ? <HelperText error>{error}</HelperText> : null}
      {offline ? <HelperText>{copy.offline}</HelperText> : null}

      {/* The actions are last in the DOM as well as on the screen (§2). */}
      <div
        data-step-actions
        className={cn(STEP_FRAME_ACTIONS, stickyActions && STEP_FRAME_ACTIONS_STICKY)}
      >
        {backOnActionRow && onBack !== undefined ? (
          <Button
            variant="ghost"
            aria-busy={pending === "back" || undefined}
            className={cn("me-auto", pending === "back" && "opacity-60")}
            onClick={onBack}
          >
            {copy.back}
          </Button>
        ) : null}
        {skip === undefined ? null : (
          <Button variant="ghost" busy={skip.busy} disabled={offline} onClick={skip.onSkip}>
            {skip.label ?? copy.skip}
          </Button>
        )}
        <Button
          busy={primary.busy}
          disabled={offline || primary.disabled}
          onClick={primary.onClick}
        >
          {primary.label}
        </Button>
      </div>
    </div>
  );
}
