/**
 * StarterSetChooser — FR-02's inline chooser (v2 handoff §5.4).
 *
 * Ten suggested habits at first run, and the same component again from LB-01's
 * empty state. Rows are `role="checkbox"` toggles rather than a list of
 * buttons, because the gesture is "pick several, then add" — one write, not
 * ten.
 *
 * ALREADY-ADDED ROWS READ *Added* AND ARE UNSELECTABLE. Coming back from
 * LB-01 and being offered the same ten again, with no sign of which are
 * already in the library, is how a person ends up with two "Read" habits.
 *
 * The footer count is a fact about the selection, not a target
 * ("Add 3 selected"). Nothing here says how many a person ought to pick.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";
import { Tag } from "../../display/tag";

export interface StarterSetItem {
  id: string;
  title: string;
  rangeLabel: string;
  importance: number;
  wakeAnchor?: boolean;
  added: boolean;
}

export interface StarterSetChooserProps {
  items: readonly StarterSetItem[];
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
  busy?: boolean;
  className?: string;
}

export function StarterSetChooser({
  items,
  selected,
  onToggle,
  onAdd,
  onClose,
  busy = false,
  className,
}: StarterSetChooserProps) {
  const count = selected.size;

  return (
    <div className={cn("flex flex-col gap-(--space-4)", className)}>
      <ul className="divide-hairline flex flex-col divide-y">
        {items.map((item) => {
          const isSelected = selected.has(item.id);

          return (
            <li key={item.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={item.added ? true : isSelected}
                aria-disabled={item.added || undefined}
                disabled={item.added || busy}
                onClick={() => onToggle(item.id)}
                className={cn(
                  "flex min-h-(--row-min) w-full items-center gap-(--space-3) text-left",
                  "border-s-2 ps-(--space-3) pe-(--space-2) py-(--space-2)",
                  "transition-colors duration-(--dur-state) ease-(--ease-settle)",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
                  isSelected && !item.added
                    ? "border-s-ink"
                    : "border-s-transparent",
                  item.added
                    ? "opacity-55"
                    : "hover:bg-surface",
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-(--space-2)">
                    <Text as="span" variant="row-title" weight={500} truncate>
                      {item.title}
                    </Text>
                    {item.wakeAnchor === true ? <Tag>wake-up</Tag> : null}
                  </span>
                  <Text as="span" variant="secondary" tone="secondary">
                    {item.rangeLabel} · importance {item.importance}
                  </Text>
                </span>

                {item.added ? (
                  <Tag>Added</Tag>
                ) : isSelected ? (
                  <span aria-hidden="true" className="text-ink shrink-0">
                    ✓
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-(--space-2)">
        <Button busy={busy} disabled={count === 0} onClick={onAdd}>
          {`Add ${count} selected`}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
