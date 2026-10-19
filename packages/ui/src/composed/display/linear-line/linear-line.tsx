/**
 * LinearLine — a linked item's Linear line (Item sheet, linear-linked,
 * tier-and-sessions, while-firing; USE-10).
 *
 * Left to right: the status chip (a bordered chip, `LinearStatusShape` and
 * its word, a chevron; a button when `onStatusPress` is given, which opens
 * the status picker), the ID in tabular semibold, the project's emoji and
 * name muted, and the link out on the right ("Linear ↗").
 *
 * PRINTS WHAT IT IS GIVEN. Every word comes from the caller; the status's
 * colour is Linear's, through `LinearStatusShape`.
 */
"use client";

import * as React from "react";
import { ArrowUpRightIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import {
  LinearStatusShape,
  type LinearStatusShapeProps,
} from "../linear-status-shape";

export interface LinearLineProps {
  status: Omit<LinearStatusShapeProps, "className">;
  /** Opens the status picker; without it the chip is read-only. */
  onStatusPress?: () => void;
  /** The chip's accessible name when it is a button, e.g. "Status: In progress, change". */
  statusActionLabel?: string;
  identifier: string;
  project?: { emoji: string | null; name: string } | null;
  /** The issue in Linear; the link is left out without it. */
  href?: string;
  /** The link's words, e.g. "Linear". The arrow is drawn after them. */
  linkLabel?: string;
  className?: string;
}

export function LinearLine({
  status,
  onStatusPress,
  statusActionLabel,
  identifier,
  project,
  href,
  linkLabel,
  className,
}: LinearLineProps) {
  const chip = (
    <>
      <LinearStatusShape {...status} />
      {onStatusPress ? (
        <ChevronDownIcon
          aria-hidden="true"
          className="text-muted-foreground size-3.5"
        />
      ) : null}
    </>
  );
  const chipClass =
    "border-border inline-flex min-h-8 items-center gap-(--space-1) rounded-(--radius-control) border px-(--space-2)";

  return (
    <div
      data-linear-line
      className={cn(
        "flex min-h-(--target) items-center gap-(--space-3)",
        className,
      )}
    >
      {onStatusPress ? (
        <button
          type="button"
          onClick={onStatusPress}
          aria-label={statusActionLabel}
          className={cn(chipClass, "hover:bg-surface cursor-pointer")}
        >
          {chip}
        </button>
      ) : (
        <span className={chipClass}>{chip}</span>
      )}
      <Text as="span" variant="caption" weight={600} className="tabular-nums">
        {identifier}
      </Text>
      {project ? (
        <span className="inline-flex min-w-0 items-center gap-(--space-1)">
          {project.emoji ? (
            <span aria-hidden="true" className="font-emoji leading-none">
              {project.emoji}
            </span>
          ) : null}
          <Text as="span" variant="caption" tone="secondary" truncate>
            {project.name}
          </Text>
        </span>
      ) : null}
      {href && linkLabel ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground ms-auto inline-flex min-h-(--target) items-center gap-(--space-1) text-(length:--fs-caption)"
        >
          {linkLabel}
          <ArrowUpRightIcon aria-hidden="true" className="size-3.5" />
        </a>
      ) : null}
    </div>
  );
}
