/**
 * OverflowCutList — what will not fit after a shift (v2 handoff §5.6).
 *
 * SF-01 step 3. Each row shows the item, its new time, its duration and its
 * priority, with a checkbox to cut it; a tally beneath says how far over the
 * day still is. The tally is the point — a person cutting items needs to see
 * the number fall, or they are guessing.
 *
 * A SECOND, MUTED LIST names items that have already passed and will show as
 * late. They cannot be cut and are not decisions; they are context, so they
 * sit apart rather than mixed into the choices.
 *
 * The checkbox label names the item — "Cut Read" — because fourteen unlabelled
 * checkboxes in a column are unusable without sight of the row.
 */
"use client";

import type { DayItemView } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Checkbox } from "../../../primitives/control/checkbox";
import { Text } from "../../../primitives/typography/text";
import { ItemIcon } from "../../display/item-icon";
import { Tag } from "../../display/tag";

export interface OverflowItem extends DayItemView {
  newStartLabel: string;
}

export interface OverflowCutListProps {
  items: readonly OverflowItem[];
  cut: ReadonlySet<string>;
  onChange: (next: ReadonlySet<string>) => void;
  /** Minutes the day is still over after the current cuts. */
  overMin: number;
  passedHard: readonly DayItemView[];
  className?: string;
}

export function OverflowCutList({
  items,
  cut,
  onChange,
  overMin,
  passedHard,
  className,
}: OverflowCutListProps) {
  const toggle = (id: string) => {
    const next = new Set(cut);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  return (
    <div className={cn("flex flex-col gap-(--space-3)", className)}>
      <ul className="divide-hairline flex flex-col divide-y">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex min-h-(--row-min) items-center gap-(--space-3) py-(--space-2)"
          >
            <ItemIcon icon={item.icon} size={24} />
            <span className="flex min-w-0 flex-1 flex-col">
              <Text as="span" variant="body" truncate>
                {item.title}
              </Text>
              <Text
                as="span"
                variant="caption"
                tone="secondary"
                className="tabular-nums"
              >
                {`${item.newStartLabel} · ${item.durationMin ?? 0} min`}
              </Text>
            </span>
            <Tag>{`priority ${item.priority}`}</Tag>
            {/*
              A bare Checkbox with an aria-label, not a CheckboxField: the
              visible text is already the row, and a second copy of the title
              beside it would be read twice.
            */}
            <Checkbox
              aria-label={`Cut ${item.title}`}
              checked={cut.has(item.id)}
              onCheckedChange={() => toggle(item.id)}
              className="size-5 shrink-0"
            />
          </li>
        ))}
      </ul>

      <Text
        as="p"
        variant="secondary"
        role="status"
        className="tabular-nums"
      >
        {overMin > 0 ? `${overMin} min over` : "Fits"}
      </Text>

      {passedHard.length === 0 ? null : (
        <div className="flex flex-col gap-(--space-1) opacity-55">
          <Text as="p" variant="caption" tone="secondary">
            Already passed — will show as late:
          </Text>
          <ul className="flex flex-col">
            {passedHard.map((item) => (
              <li key={item.id}>
                <Text as="span" variant="caption" tone="secondary">
                  {item.title}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
