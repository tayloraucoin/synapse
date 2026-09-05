/**
 * SessionRow — one recorded stretch of time (v2 handoff §5.6).
 *
 * "7:22–7:31 · 9 min", with an *Edit* ghost. A manual session carries the
 * words *by hand* — not as a warning, but because a record a person typed and
 * a record the timer took are different kinds of fact, and the review reads
 * better when it says which.
 */
"use client";

import type { TimerSessionSource } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";
import { Tag } from "../tag";

export interface SessionRowProps {
  startLabel: string;
  endLabel: string;
  minutes: number;
  source: TimerSessionSource;
  onEdit: () => void;
  className?: string;
}

export function SessionRow({
  startLabel,
  endLabel,
  minutes,
  source,
  onEdit,
  className,
}: SessionRowProps) {
  return (
    <li
      className={cn(
        "flex min-h-(--target) items-center gap-(--space-2)",
        className,
      )}
    >
      <Text
        as="span"
        variant="secondary"
        tone="secondary"
        className="tabular-nums"
      >
        {`${startLabel}–${endLabel} · ${minutes} min`}
      </Text>
      {source === "manual" ? <Tag>by hand</Tag> : null}
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="ms-auto"
      >
        Edit
      </Button>
    </li>
  );
}
