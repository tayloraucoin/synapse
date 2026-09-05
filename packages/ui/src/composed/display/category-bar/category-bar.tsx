/**
 * CategoryBar — where the week's time went (v2 handoff §5.9).
 *
 * A 12px bar of proportional segments with a legend beneath. The bar is
 * `role="img"` with a text summary and the legend is the accessible content:
 * eight tinted segments carry no meaning to a screen reader, and the legend
 * already says everything the bar shows.
 *
 * COLOUR IS THE REMINDER, THE LEGEND IS THE MEANING (official spec §9.3). A
 * person who cannot separate two hues reads the same facts from the rows.
 *
 * Uncategorised time is `neutral-300`, not a ninth hue — the absence of a
 * category is not a category, the same rule `ColorSwatchRow` follows.
 */
import type { CategoryKey } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

/** Static so Tailwind emits all eight — see CategoryChip. */
const SEGMENT: Record<CategoryKey, string> = {
  leaf: "bg-cat-leaf-500",
  sky: "bg-cat-sky-500",
  clay: "bg-cat-clay-500",
  rose: "bg-cat-rose-500",
  amber: "bg-cat-amber-500",
  slate: "bg-cat-slate-500",
  plum: "bg-cat-plum-500",
  moss: "bg-cat-moss-500",
};

export interface CategorySegment {
  key: CategoryKey | null;
  name: string;
  minutes: number;
}

export interface CategoryBarProps {
  segments: readonly CategorySegment[];
  className?: string;
}

function hoursAndMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function CategoryBar({ segments, className }: CategoryBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.minutes, 0);
  if (total === 0) return null;

  const summary = segments
    .map((segment) => `${segment.name} ${hoursAndMinutes(segment.minutes)}`)
    .join(", ");

  return (
    <div className={cn("flex flex-col gap-(--space-3)", className)}>
      <div
        role="img"
        aria-label={summary}
        className="flex h-3 w-full gap-px overflow-hidden rounded-(--radius-full)"
      >
        {segments.map((segment) => (
          <span
            key={segment.name}
            style={{ flexGrow: segment.minutes }}
            className={cn(
              segment.key === null
                ? "bg-edge"
                : SEGMENT[segment.key],
            )}
          />
        ))}
      </div>

      <ul className="flex flex-col gap-(--space-1)">
        {segments.map((segment) => (
          <li
            key={segment.name}
            className="flex items-center gap-(--space-2)"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                segment.key === null
                  ? "bg-edge"
                  : SEGMENT[segment.key],
              )}
            />
            <Text as="span" variant="secondary" className="min-w-0 flex-1">
              {segment.name}
            </Text>
            <Text
              as="span"
              variant="secondary"
              tone="secondary"
              className="tabular-nums"
            >
              {hoursAndMinutes(segment.minutes)}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}
