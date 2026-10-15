/**
 * LoadingText — an inline wait that isn't on a button (v2 handoff §5.3, reuse CC).
 *
 * ST-10's *Preparing your export*, and anywhere else a person is waiting for
 * something that has no button to spin on. `role="status"` so the wait is
 * announced once, `aria-live="polite"` so it never interrupts.
 *
 * No ellipsis animation — the words say it. No spinner by default either;
 * `spinner` adds the small one beside the words where a board draws it (the
 * Profile sheet's "Uploading", USE-84), and it stops under reduced motion.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Spinner } from "../../../primitives/feedback/spinner";
import { Text } from "../../../primitives/typography/text";

export interface LoadingTextProps {
  label?: string;
  /** The small spinner before the words, decorative: the words are announced. */
  spinner?: boolean;
  className?: string;
}

export function LoadingText({
  label = "Loading",
  spinner = false,
  className,
}: LoadingTextProps) {
  if (spinner) {
    return (
      <Text
        as="p"
        role="status"
        aria-live="polite"
        variant="secondary"
        tone="secondary"
        className={cn("inline-flex items-center gap-(--space-2)", className)}
      >
        <Spinner role="presentation" aria-label={undefined} aria-hidden="true" />
        {label}
      </Text>
    );
  }
  return (
    <Text
      as="p"
      role="status"
      aria-live="polite"
      variant="secondary"
      tone="secondary"
      className={cn(className)}
    >
      {label}
    </Text>
  );
}
