"use client";

import { Checkbox, Text } from "@syn/ui";

/**
 * The reminder line under the first firing row, once (D-USE-47): "While it
 * fires: Kegels · daily" with its checkbox. TierGroup's `afterRow` slot holds
 * it; the screen picks the reminder and passes every word.
 */
export interface WhileItFiresLineProps {
  /** "While it fires:" */
  lead: string;
  title: string;
  /** "daily" */
  meta: string | null;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function WhileItFiresLine({
  lead,
  title,
  meta,
  checked,
  onCheckedChange,
}: WhileItFiresLineProps) {
  return (
    <label
      data-while-it-fires
      className="flex min-h-(--target) cursor-pointer items-center gap-(--space-3) ps-(--target)"
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange?.(value === true)}
      />
      <Text as="span" variant="secondary" tone="muted">
        {lead}
      </Text>
      <Text
        as="span"
        variant="secondary"
        weight={600}
        tone={checked ? "muted" : "ink"}
      >
        {title}
      </Text>
      {meta ? (
        <Text as="span" variant="caption" tone="muted">
          {`· ${meta}`}
        </Text>
      ) : null}
    </label>
  );
}
