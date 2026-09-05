/**
 * LoadingText — an inline wait that isn't on a button (v2 handoff §5.3, reuse CC).
 *
 * ST-10's *Preparing your export*, and anywhere else a person is waiting for
 * something that has no button to spin on. `role="status"` so the wait is
 * announced once, `aria-live="polite"` so it never interrupts.
 *
 * No spinner and no ellipsis animation — the words say it, and the official
 * spec's motion rule (§9.6) does not spend movement on waiting.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export interface LoadingTextProps {
  label?: string;
  className?: string;
}

export function LoadingText({ label = "Loading", className }: LoadingTextProps) {
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
