/**
 * LinearStatusShape — a Linear workflow status, drawn as Linear draws it,
 * with its word (D-USE-35; USE-10).
 *
 * FIVE SHAPES, ONE PER STATUS TYPE. Backlog a dashed ring; unstarted an empty
 * ring; started a ring part filled, the fill from the status's place in its
 * group (`progress`, 0 to 1, worked out by the caller); completed a filled
 * disc with a check; canceled a filled disc with a cross.
 *
 * THE COLOUR IS LINEAR'S. `color` is the workspace's own colour for the
 * status, read from Linear and passed as data; this is the one door Linear's
 * status colours come through. Without it the shape takes a token: muted for
 * backlog and unstarted, yellow for started, ink for completed and canceled
 * (open-3: Linear's indigo Done would sit on off-schedule violet).
 *
 * COLOUR NEVER ALONE. The word is always printed beside the shape; the shape
 * is `aria-hidden`, so the word is what is read.
 */
import * as React from "react";
import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export type LinearStatusType =
  "backlog" | "unstarted" | "started" | "completed" | "canceled";

export interface LinearStatusShapeProps {
  type: LinearStatusType;
  /** The status's own name, e.g. "In progress". Always shown. */
  label: string;
  /** Started only: the part filled, 0 to 1. Default one half. */
  progress?: number;
  /** The workspace's colour for this status (a CSS colour from Linear). */
  color?: string;
  className?: string;
}

const TOKEN_TONE: Record<LinearStatusType, string> = {
  backlog: "text-muted-foreground",
  unstarted: "text-muted-foreground",
  started: "text-category-yellow-dot",
  completed: "text-foreground",
  canceled: "text-foreground",
};

const C = 7;
const RING = 6;
const PIE = 3.5;

/** A pie wedge from 12 o'clock, clockwise, `part` of a turn. */
function wedgePath(part: number): string {
  const angle = 2 * Math.PI * part;
  const x = C + PIE * Math.sin(angle);
  const y = C - PIE * Math.cos(angle);
  const large = part > 0.5 ? 1 : 0;
  return `M ${C} ${C} L ${C} ${C - PIE} A ${PIE} ${PIE} 0 ${large} 1 ${x.toFixed(3)} ${y.toFixed(3)} Z`;
}

export function LinearStatusGlyph({
  type,
  progress = 0.5,
  color,
  className,
}: Omit<LinearStatusShapeProps, "label">) {
  const part = Math.min(1, Math.max(0, progress));
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 14"
      data-linear-status={type}
      style={color ? { color } : undefined}
      className={cn(
        "size-3.5 shrink-0",
        color ? null : TOKEN_TONE[type],
        className,
      )}
    >
      {type === "backlog" ? (
        <circle
          cx={C}
          cy={C}
          r={RING}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="1.6 1.6"
        />
      ) : null}
      {type === "unstarted" || type === "started" ? (
        <circle
          cx={C}
          cy={C}
          r={RING}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ) : null}
      {type === "started" && part > 0 ? (
        part >= 1 ? (
          <circle cx={C} cy={C} r={PIE} fill="currentColor" />
        ) : (
          <path d={wedgePath(part)} fill="currentColor" />
        )
      ) : null}
      {type === "completed" || type === "canceled" ? (
        <circle cx={C} cy={C} r={C} fill="currentColor" />
      ) : null}
      {type === "completed" ? (
        <path
          d="M4.2 7.2 L6.2 9.1 L9.8 5.2"
          fill="none"
          className="stroke-background"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {type === "canceled" ? (
        <path
          d="M4.9 4.9 L9.1 9.1 M9.1 4.9 L4.9 9.1"
          fill="none"
          className="stroke-background"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

export function LinearStatusShape({
  label,
  className,
  ...glyph
}: LinearStatusShapeProps) {
  return (
    <span
      data-linear-status-shape
      className={cn(
        "inline-flex items-center gap-(--space-1) whitespace-nowrap",
        className,
      )}
    >
      <LinearStatusGlyph {...glyph} />
      <Text as="span" variant="caption" tone="secondary">
        {label}
      </Text>
    </span>
  );
}
