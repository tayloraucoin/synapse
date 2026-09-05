/**
 * EmptyState — every empty list (v2 handoff §5.3).
 *
 * Adapted from CC's, over the `Empty` parts, with the diamond ornament and the
 * display headline dropped: official spec §9.7 asks for one sentence and no
 * illustrations. An empty list is a fact, not an occasion.
 *
 * One sentence, then up to three actions. The third is a ghost, because a
 * screen offering three equal buttons has not decided what it wants a person
 * to do.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
} from "../../../primitives/display/empty";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  emphasis?: "default" | "secondary" | "ghost";
}

export interface EmptyStateProps {
  /** One sentence. */
  text: React.ReactNode;
  /** 1–3; the third reads as a ghost unless the caller says otherwise. */
  actions?: readonly EmptyStateAction[];
  density?: "page" | "inline";
  className?: string;
}

const DEFAULT_EMPHASIS = ["default", "secondary", "ghost"] as const;

export function EmptyState({
  text,
  actions,
  density = "page",
  className,
}: EmptyStateProps) {
  return (
    <Empty
      className={cn(
        "gap-(--space-5) text-center",
        density === "page" ? "py-(--space-7)" : "py-(--space-5)",
        className,
      )}
    >
      <EmptyDescription className="max-w-(--measure) text-[length:var(--fs-body)] text-text-body">
        {text}
      </EmptyDescription>

      {actions === undefined || actions.length === 0 ? null : (
        <EmptyContent className="flex flex-wrap items-center justify-center gap-(--space-2)">
          {actions.map((action, index) => (
            <Button
              key={action.label}
              variant={action.emphasis ?? DEFAULT_EMPHASIS[index] ?? "ghost"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </EmptyContent>
      )}
    </Empty>
  );
}
