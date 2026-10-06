/**
 * ConfirmYesterdayRows — last night's items, one tap each (UX v1.1 §7.3,
 * §10.4).
 *
 * "The items after devices-off as `CheckboxField` rows — *Read · Stretch* —
 * none pre-ticked, each 44px." NEVER PRE-TICKED: that fabricates the record.
 * No reason is asked. Each row is labelled *{title}, last night, not
 * confirmed* so a screen reader hears what the tick means.
 *
 * The rows are the rows; the section (*Last night*) and the write are the
 * caller's — the quick-pick (DYN-14) and the Day Review (DYN-18) put them in
 * different places.
 */
"use client";

import type { DayItemView } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { CheckboxField } from "../../../primitives/control/checkbox";
import { Text } from "../../../primitives/typography/text";
import { ItemIcon } from "../../display/item-icon";
import { CONFIRM_YESTERDAY_COPY } from "./copy";

export interface ConfirmYesterdayRowsProps {
  items: ReadonlyArray<Pick<DayItemView, "id" | "title" | "icon">>;
  /** The ids the person has ticked this morning. */
  checked: ReadonlySet<string> | ReadonlyArray<string>;
  onChange: (id: string, checked: boolean) => void;
  /** *Last night* — omit to render the rows alone. */
  caption?: string;
  disabled?: boolean;
  className?: string;
}

export function ConfirmYesterdayRows({
  items,
  checked,
  onChange,
  caption,
  disabled = false,
  className,
}: ConfirmYesterdayRowsProps) {
  if (items.length === 0) return null;
  const ticked = checked instanceof Set ? checked : new Set(checked);

  return (
    <div data-confirm-yesterday className={cn("flex flex-col gap-(--space-1)", className)}>
      {caption === undefined ? null : (
        <Text as="span" variant="caption" tone="secondary">
          {caption}
        </Text>
      )}
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id}>
            <CheckboxField
              checked={ticked.has(item.id)}
              disabled={disabled}
              onCheckedChange={(value) => onChange(item.id, value === true)}
              aria-label={CONFIRM_YESTERDAY_COPY.rowLabel(item.title)}
              classes={{ root: "min-h-(--target) items-center" }}
            >
              <span className="flex items-center gap-(--space-2)">
                <ItemIcon icon={item.icon} size={20} />
                <span>{item.title}</span>
              </span>
            </CheckboxField>
          </li>
        ))}
      </ul>
    </div>
  );
}
