"use client";

import { cn, GroupHeading, LinearStatusShape, Text } from "@syn/ui";
import type { WaitingRowView } from "./view";

/**
 * WaitingGroup — linked items whose Linear status is In review, Blocked or
 * Paused, at the foot of the block under Stretch (USE-63; waiting.md,
 * D-USE-78): nothing to do until they move. The heading has no square; each
 * row keeps the 44 px lead slot empty (no ring: a waiting row never fires and
 * is never Next), its title muted, and its status shape with its word on the
 * right in the length's place. A row opens the Item sheet, where the chip
 * changes the status. Shows only when it holds a row. Props only.
 */
export interface WaitingGroupProps {
  /** "Waiting · nothing to do until it moves". */
  heading: string;
  rows: WaitingRowView[];
  onOpen?: (id: string) => void;
  headingAs?: "h2" | "h3";
  className?: string;
}

export function WaitingGroup({
  heading,
  rows,
  onOpen,
  headingAs = "h3",
  className,
}: WaitingGroupProps) {
  if (rows.length === 0) return null;

  return (
    <section data-waiting-group aria-label={heading} className={className}>
      <GroupHeading as={headingAs}>{heading}</GroupHeading>
      <ul className="flex flex-col">
        {rows.map((row) => (
          <li
            key={row.id}
            data-waiting-row={row.id}
            className={cn(
              "flex items-center rounded-(--radius-control) pe-(--space-2)",
              "hover:bg-surface transition-colors duration-(--dur-state) ease-(--ease-settle)",
            )}
          >
            <span aria-hidden="true" className="size-(--target) shrink-0" />
            <button
              type="button"
              data-open
              onClick={() => onOpen?.(row.id)}
              className="flex min-h-(--target) min-w-0 flex-1 cursor-pointer items-center gap-1.75 text-start"
            >
              <span
                aria-hidden="true"
                className="font-emoji inline-flex h-(--lh-body) w-4.5 shrink-0 items-center justify-center text-(length:--fs-body) leading-none"
              >
                {row.emoji}
              </span>
              <Text as="span" variant="body" tone="muted" className="min-w-0">
                {row.title}
              </Text>
            </button>
            <LinearStatusShape
              type={row.status.type}
              label={row.status.label}
              progress={row.status.progress}
              color={row.status.color ?? undefined}
              className="shrink-0 ps-(--space-2)"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
