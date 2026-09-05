/**
 * ReflectionBlock — rating an item on its own axes (v2 handoff §5.9).
 *
 * DR-06 and IT-01. One block per item: the item's identity, a `Stepper17` per
 * axis, and a note. `captions={false}` on the steppers because a column of
 * four "less … more" pairs is noise once the first one has taught the scale.
 *
 * The axes are the habit's own, passed in. Nothing here knows what "focus" or
 * "effort" mean, which is what keeps the block reusable for a habit with one
 * axis and a habit with four.
 */
"use client";

import type { DayItemView } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Textarea } from "../../../primitives/control/textarea";
import { Text } from "../../../primitives/typography/text";
import { ItemIcon } from "../../display/item-icon";
import { Stepper17, type Stepper17Value } from "../stepper-17";

export interface ReflectionAxis {
  key: string;
  label: string;
  value: Stepper17Value | null;
}

export interface ReflectionBlockProps {
  item: DayItemView;
  axes: readonly ReflectionAxis[];
  note: string;
  onRate: (axis: string, value: Stepper17Value) => void;
  onNoteChange: (note: string) => void;
  className?: string;
}

export function ReflectionBlock({
  item,
  axes,
  note,
  onRate,
  onNoteChange,
  className,
}: ReflectionBlockProps) {
  return (
    <section className={cn("flex flex-col gap-(--space-4)", className)}>
      <div className="flex items-center gap-(--space-3)">
        <ItemIcon icon={item.icon} size={24} />
        <Text as="h3" variant="row-title" weight={500} truncate>
          {item.title}
        </Text>
      </div>

      {axes.map((axis) => (
        <Stepper17
          key={axis.key}
          label={axis.label}
          value={axis.value}
          captions={false}
          onChange={(value) => onRate(axis.key, value)}
        />
      ))}

      <Textarea
        label="Note"
        maxLength={280}
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
      />
    </section>
  );
}
