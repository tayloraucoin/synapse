/**
 * PreflightNote — what the person wrote to themselves (v2 handoff §5.6).
 *
 * A quoted block above the timer in IT-01: a 2px neutral left edge, body text,
 * and the caption *Before starting*. It is the one place in the item sheet
 * where the person's own words appear before they act, so it reads as a quote
 * rather than as an instruction from the app.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export interface PreflightNoteProps {
  children: string;
  className?: string;
}

export function PreflightNote({ children, className }: PreflightNoteProps) {
  return (
    <blockquote
      className={cn(
        "flex flex-col gap-(--space-1) border-s-2 border-neutral-300 ps-(--space-3) dark:border-neutral-600",
        className,
      )}
    >
      <Text as="span" variant="caption" tone="secondary">
        Before starting
      </Text>
      <Text as="p" variant="body" tone="body">
        {children}
      </Text>
    </blockquote>
  );
}
