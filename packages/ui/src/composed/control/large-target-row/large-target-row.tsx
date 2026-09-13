/**
 * LargeTargetRow — big choices (v2 handoff §5.4; UX v1.1 §4.1, §6.6).
 *
 * SF-01 step 1: "how far behind are you?", answered while running late, one
 * handed, probably walking. Four 56px targets, no scrolling, no typing.
 *
 * The selected option becomes `default` (ink fill) and the rest stay
 * `secondary`, so the answer is visible from arm's length. Native radios, as
 * everywhere else in this package, for arrow-key movement and a real
 * radiogroup.
 *
 * UNDER v1.1 THE ROW ALSO STACKS (`layout="stacked"`): the first-run
 * archetype cards (§4.1) and Adjust's *what gives* rows (§6.6) are full-width
 * 72px cards with a title and one line of secondary text. An option may be
 * `disabled` on its own: §4.1's three grey archetypes "render at
 * `text-text-disabled` with a caption *not yet* on the right, not tappable,
 * no explanation" — honest scope, in the quietest treatment. A disabled
 * option is not in the tab order and announces its caption.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export interface LargeTargetOption {
  value: string;
  label: string;
  /** One line of secondary text under the title (stacked layout). */
  description?: string;
  /** Not tappable; the caption says why in one word (§4.1). */
  disabled?: boolean;
  caption?: string;
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

          return (
            <label
              key={option.value}
              aria-disabled={option.disabled === true ? true : undefined}
              className={cn(
                "flex cursor-pointer items-center rounded-(--radius)",
                stacked
                  ? "min-h-18 w-full justify-between gap-(--space-3) px-(--space-4) py-(--space-3)"
                  : "h-14 flex-1 justify-center",
                "text-(length:--fs-body) font-medium",
                "transition-colors duration-(--dur-state) ease-(--ease-settle)",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                selected
                  ? "bg-primary text-primary-foreground border border-transparent"
                  : "border-hairline text-ink border hover:bg-surface",
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
              {stacked ? (
                <span className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
                  <Text
                    as="span"
                    variant="row-title"
                    weight={500}
                    className={cn(
                      option.disabled && "text-text-disabled",
                      selected && !option.disabled && "text-primary-foreground",
                    )}
                  >
                    {option.label}
                  </Text>
                  {option.description === undefined ? null : (
                    <Text
                      as="span"
                      variant="secondary"
                      tone="secondary"
                      className={cn(
                        option.disabled && "text-text-disabled",
                        selected && !option.disabled && "text-primary-foreground",
                      )}
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
            </label>
          );
        })}
      </div>
    </div>
  );
}
