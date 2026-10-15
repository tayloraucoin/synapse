/**
 * ProgressRing — a Running row's share of its plan (USE-24; D-USE-27,
 * D-USE-72): an ink arc on a hairline circle, drawn clockwise from the top.
 *
 * `value` is elapsed over plan, 0 to 1; past the plan it stays full, and the
 * row's words ("4 min over") carry the rest. Presentational and
 * `aria-hidden`: the count is in the row's words, never in the ring alone.
 * No motion of its own; the caller's tick moves the arc.
 */
import { cn } from "../../../lib/cn";

export interface ProgressRingProps {
  /** Elapsed over plan, 0 to 1; clamped. */
  value: number;
  /** The drawn size in px; 20 on a Running row. */
  size?: 20;
  className?: string;
}

const VIEW = 20;
const STROKE = 2;
const RADIUS = (VIEW - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** The value as a share of the circle, 0 to 1. */
export function ringShare(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function ProgressRing({
  value,
  size = 20,
  className,
}: ProgressRingProps) {
  const share = ringShare(value);
  return (
    <svg
      aria-hidden="true"
      data-progress-ring={share}
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className={cn("shrink-0 -rotate-90", className)}
    >
      <circle
        cx={VIEW / 2}
        cy={VIEW / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
        className="stroke-hairline"
      />
      {share > 0 ? (
        <circle
          cx={VIEW / 2}
          cy={VIEW / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap={share < 1 ? "round" : "butt"}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - share)}
          className="stroke-foreground"
        />
      ) : null}
    </svg>
  );
}
