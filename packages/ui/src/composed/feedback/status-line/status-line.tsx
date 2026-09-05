/**
 * StatusLine — one system or context message, at most (v2 handoff §5.2).
 *
 * Adapted from CC's `session-status-bar` (render nothing when there is nothing
 * to say; the caller picks the winning line) and `device-alerts-row` (the
 * permission union). The element itself is new, because CC's is an `Alert` and
 * this must never be one.
 *
 * NEVER AN ALERT, NEVER A COLOUR. Official spec §9.3: nothing amber or red
 * appears on the tabs, and colour never carries meaning alone. The line is a
 * neutral band whose words are the whole message — which is also why the
 * variant chooses copy, not a hue.
 *
 * `role="status"` with `aria-live="polite"`: the line announces when it
 * changes, and never interrupts what a person is doing.
 */
"use client";

import type { StatusLineVariant } from "@syn/types";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { STATUS_LINE_COPY } from "./copy";

export interface StatusLineProps {
  variant: StatusLineVariant;
  /** Defaults to the variant's line in `copy.ts`. */
  text?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  /** "Dismiss for today" | "Dismiss" — defaults to the variant's. */
  dismissLabel?: string;
  /** `shell` is full-width under the header; `inline` sits in the content. */
  placement?: "shell" | "inline";
  className?: string;
}

export function StatusLine({
  variant,
  text,
  action,
  onDismiss,
  dismissLabel,
  placement = "shell",
  className,
}: StatusLineProps) {
  const copy = STATUS_LINE_COPY[variant];
  const label = dismissLabel ?? copy.dismissLabel ?? "Dismiss";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-10 items-center gap-(--space-3)",
        "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
        "px-(--space-4) py-(--space-2)",
        placement === "shell" ? "w-full" : "rounded-(--radius)",
        className,
      )}
    >
      <Text as="span" variant="secondary" className="min-w-0 flex-1">
        {text ?? copy.text}
      </Text>

      {action === undefined ? null : (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            "shrink-0 text-[length:var(--fs-secondary)] font-medium text-ink",
            "min-h-(--target) underline-offset-4 hover:underline",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
        >
          {action.label}
        </button>
      )}

      {onDismiss === undefined ? null : (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={label}
          className={cn(
            "inline-flex size-(--target) shrink-0 items-center justify-center",
            "rounded-(--radius) text-text-secondary hover:text-ink",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
