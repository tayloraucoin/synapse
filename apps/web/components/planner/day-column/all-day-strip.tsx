"use client";

import * as React from "react";
import { cn, Text } from "@syn/ui";
import { DAY_COLUMN_COPY as COPY } from "./copy";
import { DAY_COLUMN_GUTTER_PX } from "./day-column";

/**
 * AllDayStrip — a checklist with no span (USE-27; D-USE-28), pinned above
 * the rail: "All day" in the rail's gutter, then one card with its name, a
 * "Checklist" tag and its rows as small boxes in two columns, a checked one
 * filled and its words muted, in place. While it is what is live, the card
 * takes the one verdigris edge [PROPOSED]; once a set-time block is under
 * way the edge moves there (D-P02).
 *
 * The card is one button, "<name>, all day[, now]", opening the checklist
 * in Block view (D-USE-72); the boxes are marks, not controls. Props only.
 */
export interface AllDayStripRow {
  id: string;
  label: string;
  checked: boolean;
}

export interface AllDayStripProps {
  name: string;
  rows: readonly AllDayStripRow[];
  underWay: boolean;
  onOpen: () => void;
  className?: string;
}

export function AllDayStrip({
  name,
  rows,
  underWay,
  onOpen,
  className,
}: AllDayStripProps) {
  const listId = React.useId();
  return (
    <div
      data-all-day-strip
      className={cn(
        "flex gap-0 border-b border-hairline px-(--space-4) py-(--space-3)",
        className,
      )}
    >
      <span
        style={{ width: `${DAY_COLUMN_GUTTER_PX}px` }}
        className="shrink-0 pt-(--space-2) pe-(--space-2)"
      >
        <Text as="span" variant="caption" tone="muted" weight={500}>
          {COPY.allDay}
        </Text>
      </span>
      <button
        type="button"
        onClick={onOpen}
        aria-label={COPY.strip(name, underWay)}
        aria-describedby={rows.length > 0 ? listId : undefined}
        data-state={underWay ? "now" : undefined}
        className={cn(
          "flex min-h-(--target) min-w-0 flex-1 flex-col gap-(--space-2) rounded-(--radius) border px-(--space-3) py-(--space-2) text-left",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          underWay ? "border-now" : "border-border",
        )}
      >
        <span className="flex items-center gap-(--space-2)">
          <Text
            as="span"
            variant="body"
            weight={600}
            truncate
            className="flex-1"
          >
            {name}
          </Text>
          <Text
            as="span"
            variant="caption"
            tone="muted"
            className="shrink-0 rounded-(--radius-control) border border-border px-(--space-2)"
          >
            {COPY.checklist}
          </Text>
        </span>
        {rows.length > 0 ? (
          <ul
            id={listId}
            className="grid grid-cols-2 gap-x-(--space-2) gap-y-(--space-1)"
          >
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex min-w-0 items-center gap-(--space-2)"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2.75 shrink-0 rounded-xs border border-input",
                    row.checked ? "bg-input" : null,
                  )}
                />
                <Text
                  as="span"
                  variant="secondary"
                  truncate
                  className={row.checked ? "text-muted-foreground" : undefined}
                >
                  {row.label}
                  {row.checked ? (
                    <span className="sr-only">, {COPY.mark.done}</span>
                  ) : null}
                </Text>
              </li>
            ))}
          </ul>
        ) : null}
      </button>
    </div>
  );
}
