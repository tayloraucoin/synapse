"use client";

import { CheckboxField, Text } from "@syn/ui";
import type { DayItemView } from "@syn/types";

import { CONFIRM_YESTERDAY_COPY as COPY } from "./copy";

/**
 * Confirm yesterday — UX v1.1 §7.3: "the items after devices-off as
 * `CheckboxField` rows — Read · Stretch — none pre-ticked, each 44px."
 *
 * NEVER PRE-TICKED (that fabricates the record). NEVER ASKS FOR A REASON.
 * The panel holds no state and writes nothing: the quick-pick sends the
 * ticked ids with *Set the day* (`lastNight.doneItemIds`), and the unticked
 * become *not confirmed* there (R16). The Day Review (DYN-19) mounts the same
 * rows with its own write.
 */
export interface ConfirmYesterdayPanelProps {
  items: readonly DayItemView[];
  ticked: ReadonlySet<string>;
  onToggle: (id: string, on: boolean) => void;
  disabled?: boolean;
  /** The caption is the section's heading in the quick-pick; hidden when the host has its own. */
  showCaption?: boolean;
}

export function ConfirmYesterdayPanel({
  items,
  ticked,
  onToggle,
  disabled = false,
  showCaption = true,
}: ConfirmYesterdayPanelProps) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-(--space-2)" aria-label={COPY.lastNight}>
      {showCaption ? (
        <Text as="h3" variant="caption" tone="secondary">
          {COPY.lastNight}
        </Text>
      ) : null}
      <Text as="p" variant="caption" tone="secondary">
        {COPY.helper}
      </Text>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id} className="flex min-h-11 items-center">
            <CheckboxField
              checked={ticked.has(item.id)}
              disabled={disabled}
              onCheckedChange={(next) => onToggle(item.id, next === true)}
            >
              {item.title}
            </CheckboxField>
          </li>
        ))}
      </ul>
    </section>
  );
}
