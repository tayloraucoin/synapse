/**
 * InlineQuestionRow — the same-start question (v2 handoff §5.5).
 *
 * TP-02, TP-03 and WK-03 all hit the same moment: two items are being saved to
 * the same start time, and the answer changes what gets written. It replaces
 * the sheet's footer rather than opening a dialog, because a dialog over a
 * sheet is two modal layers for one question.
 *
 * A `neutral-100` band with no border, and the question as the group's
 * accessible name so a screen reader hears it before either button.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";

export interface InlineQuestionAction {
  label: string;
  onClick: () => void;
}

export interface InlineQuestionRowProps {
  text: React.ReactNode;
  primary: InlineQuestionAction;
  secondary: InlineQuestionAction;
  /** Used as the group's accessible name when `text` is not a plain string. */
  ariaLabel?: string;
  className?: string;
}

export function InlineQuestionRow({
  text,
  primary,
  secondary,
  ariaLabel,
  className,
}: InlineQuestionRowProps) {
  const label =
    ariaLabel ?? (typeof text === "string" ? text : "Question");

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex flex-wrap items-center gap-(--space-3)",
        "bg-surface px-(--space-4) py-(--space-3)",
        className,
      )}
    >
      <Text as="p" variant="secondary" className="min-w-0 flex-1">
        {text}
      </Text>
      <div className="flex shrink-0 items-center gap-(--space-1)">
        <Button variant="ghost" size="sm" onClick={secondary.onClick}>
          {secondary.label}
        </Button>
        <Button variant="ghost" size="sm" onClick={primary.onClick}>
          {primary.label}
        </Button>
      </div>
    </div>
  );
}
