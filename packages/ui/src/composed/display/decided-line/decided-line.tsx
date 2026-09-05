/**
 * DecidedLine — what was decided, in one sentence (v2 handoff §5.9).
 *
 * Replaces DR-02's two big targets once an item is decided. The weight phrase
 * — *not counted*, *counts half*, *counts as missed* — is the only part in ink
 * weight 500, because it is the part a person is checking.
 *
 * *Change* is always available. A review a person cannot revise is a review
 * they will learn to answer carelessly.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";

export interface DecidedLineProps {
  text: React.ReactNode;
  /** "not counted" · "counts half" · "counts as missed". */
  weightPhrase: string;
  onChange: () => void;
  /** "Carried 3 times since 12 Aug." — a fact, no advice. */
  note?: string;
  className?: string;
}

export function DecidedLine({
  text,
  weightPhrase,
  onChange,
  note,
  className,
}: DecidedLineProps) {
  return (
    <div className={cn("flex flex-col gap-(--space-1)", className)}>
      <div className="flex items-start gap-(--space-3)">
        <Text as="p" variant="body" tone="body" className="min-w-0 flex-1">
          {text}
          {" · "}
          <Text as="span" variant="body" tone="ink" weight={500}>
            {weightPhrase}
          </Text>
        </Text>
        <Button variant="ghost" size="sm" onClick={onChange}>
          Change
        </Button>
      </div>
      {note === undefined ? null : (
        <Text as="p" variant="caption" tone="secondary">
          {note}
        </Text>
      )}
    </div>
  );
}
