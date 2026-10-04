/**
 * LargeTargetRow — big choices (v2 handoff §5.4; UX v1.1 §4.1, §6.6).
 *
 * SF-01 step 1: "how far behind are you?", answered while running late, one
 * handed, probably walking. Four 56px targets, no scrolling, no typing.
 *
 * Native radios, as everywhere else in this package, for arrow-key movement
 * and a real radiogroup.
 *
 * ONE SELECTION GRAMMAR (UX v1.3 R56; DAY-1). The chosen option is
 * `bg-surface`, a 1.5px ink border and a check in the trailing slot — the
 * grammar `SelectRow` has, from one string in `lib/selection.ts`. It was an
 * ink fill; beside the sticky primary that read as a second button (T1.1).
 * The `row` layout (Adjust's four 56px cells) takes the border and the
 * surface but no check: four cells at 375px have no trailing slot, and the
 * cell's text is its label. The check is `aria-hidden`; the radio announces
 * *checked*.
 *
 * UNDER v1.1 THE ROW ALSO STACKS (`layout="stacked"`): the first-run
 * archetype cards (§4.1) and Adjust's *what gives* rows (§6.6) are full-width
 * 72px cards with a title and one line of secondary text. An option may be
 * `disabled` on its own: §4.1's three grey archetypes "render at
 * `text-text-disabled` with a caption *not yet* on the right, not tappable,
 * no explanation" — honest scope, in the quietest treatment. A disabled
 * option is not in the tab order and announces its caption.
 *
 * UX v1.2 §4 (RUN-7): an option may carry a `leading` slot — an `IconValue`
 * renders through `EmojiSlot` (the 44px square, `aria-hidden`); any node
 * renders as given. A disabled option fades its glyph to 0.4 with the rest.
 */
"use client";

import type { IconValue } from "@syn/types";
import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { SELECTION_CHOSEN, SELECTION_UNCHOSEN } from "../../../lib/selection";
import { Text } from "../../../primitives/typography/text";
import { EmojiSlot, isIconValue } from "../../display/emoji-slot";

export interface LargeTargetOption {
  value: string;
  label: string;
  /** One line of secondary text under the title (stacked layout). */
  description?: string;
  /** Not tappable; the caption says why in one word (§4.1). */
  disabled?: boolean;
  caption?: string;
  /** An `IconValue` through `EmojiSlot`, or any node (v1.2). */
  leading?: React.ReactNode | IconValue;
  /**
   * Stacked only (Workflow WF-03, FLO-8): a control BESIDE the card — a saved
   * template's menu. It sits outside the `label`, so pressing it never
   * chooses the option and it is its own focus stop.
   */
  trailing?: React.ReactNode;
}

export interface LargeTargetRowProps {
  options: readonly LargeTargetOption[];
  value: string | null;
  onChange: (value: string) => void;
  label: React.ReactNode;
  disabled?: boolean;
  /** `row` — 56px cells side by side; `stacked` — full-width 72px cards. */
  layout?: "row" | "stacked";
  className?: string;
}

export function LargeTargetRow({
  options,
  value,
  onChange,
  label,
  disabled = false,
  layout = "row",
  className,
}: LargeTargetRowProps) {
  const groupName = React.useId();
  const groupLabelId = React.useId();
  const stacked = layout === "stacked";

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="span" id={groupLabelId} variant="secondary" weight={500}>
        {label}
      </Text>

      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        className={cn("flex gap-(--space-2)", stacked && "flex-col")}
      >
        {options.map((option) => {
          const selected = option.value === value;
          const off = disabled || option.disabled === true;
          const leading =
            option.leading === undefined ? null : isIconValue(option.leading) ? (
              <EmojiSlot icon={option.leading} className={cn(option.disabled && "opacity-40")} />
            ) : (
              <span className={cn("flex shrink-0 items-center", option.disabled && "opacity-40")}>
                {option.leading}
              </span>
            );

          const beside = stacked && option.trailing !== undefined;
          const card = (
            <label
              key={option.value}
              aria-disabled={option.disabled === true ? true : undefined}
              className={cn(
                "flex cursor-pointer items-center rounded-(--radius)",
                stacked
                  ? "min-h-18 w-full justify-between gap-(--space-3) px-(--space-4) py-(--space-3)"
                  : "h-14 flex-1 justify-center",
                beside && "w-auto min-w-0 flex-1",
                "text-(length:--fs-body) font-medium",
                "transition-colors duration-(--dur-state) ease-(--ease-settle)",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                selected ? SELECTION_CHOSEN : SELECTION_UNCHOSEN,
                disabled && "pointer-events-none opacity-40",
                option.disabled &&
                  "text-text-disabled hover:bg-transparent pointer-events-none cursor-default border-hairline",
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={selected}
                disabled={off}
                tabIndex={option.disabled ? -1 : undefined}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {leading}
              {stacked ? (
                <span className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
                  <Text
                    as="span"
                    variant="row-title"
                    weight={500}
                    className={cn(option.disabled && "text-text-disabled")}
                  >
                    {option.label}
                  </Text>
                  {option.description === undefined ? null : (
                    <Text
                      as="span"
                      variant="secondary"
                      tone="secondary"
                      className={cn(option.disabled && "text-text-disabled")}
                    >
                      {option.description}
                    </Text>
                  )}
                </span>
              ) : (
                <span>{option.label}</span>
              )}
              {option.caption === undefined ? null : (
                <Text as="span" variant="caption" className="text-text-disabled shrink-0">
                  {option.caption}
                </Text>
              )}
              {/* The trailing slot is always there, so nothing shifts when the check lands. */}
              {stacked && option.caption === undefined ? (
                <span
                  aria-hidden="true"
                  className="-me-(--space-2) inline-flex size-(--target) shrink-0 items-center justify-center"
                >
                  {selected ? <Check className="size-5" strokeWidth={2} /> : null}
                </span>
              ) : null}
            </label>
          );

          if (!beside) return card;
          return (
            <div key={option.value} className="flex items-center gap-(--space-1)">
              {card}
              {option.trailing}
            </div>
          );
        })}
      </div>
    </div>
  );
}
