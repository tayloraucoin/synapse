/**
 * TierRadioRows — the three miss tiers, with reasons beneath (v2 handoff §5.4).
 *
 * DR-03, SF-01 step 2, and ST-06a. Three full-width rows, each with its
 * weighting as a second line, and — under tiers 1 and 2 only — the person's
 * own reason chips. Tier 3 decides on selection, which is why it has none:
 * "Didn't do it" is already the whole answer.
 *
 * SELECTED IS A 2px INK LEFT EDGE, NOT A FILL. These rows carry a sentence
 * each; filling one inverts a definition and makes it the least readable line
 * on a screen a person is reading carefully.
 *
 * `lockedTier` is ST-06a: a structural built-in reason shows which tier it
 * belongs to without offering to move it. Shown, not changeable — and not
 * disabled-looking either, because nothing is wrong.
 */
"use client";

import type { MissTier, ReasonView } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";
import { ReasonChips } from "../reason-chips";
import {
  TIERS_WITH_REASONS,
  TIER_RADIO_ROWS_COPY,
  TIER_ROWS,
} from "./copy";

export interface TierRadioRowsProps {
  value: MissTier | null;
  onChange: (tier: MissTier) => void;
  /** When present, chips render under tiers 1 and 2. */
  reasons?: Readonly<Record<MissTier, readonly ReasonView[]>>;
  selectedReason?: string | null;
  onReasonSelect?: (key: string) => void;
  otherText?: string;
  onOtherTextChange?: (text: string) => void;
  onKeepReason?: () => void;
  /** ST-06a — the tier is shown but not changeable. */
  lockedTier?: MissTier | null;
  label: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
}

export function TierRadioRows({
  value,
  onChange,
  reasons,
  selectedReason = null,
  onReasonSelect,
  otherText,
  onOtherTextChange,
  onKeepReason,
  lockedTier = null,
  label,
  error,
  className,
}: TierRadioRowsProps) {
  const groupName = React.useId();
  const groupLabelId = React.useId();
  const errorId = React.useId();

  const locked = lockedTier !== null;
  const current = locked ? lockedTier : value;
  const invalid = error !== undefined && error !== null;

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="span" id={groupLabelId} variant="secondary" weight={500}>
        {label}
      </Text>

      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        aria-describedby={invalid ? errorId : undefined}
        aria-invalid={invalid || undefined}
        className="flex flex-col"
      >
        {TIER_ROWS.map((row) => {
          const selected = current === row.tier;
          const showChips =
            selected &&
            reasons !== undefined &&
            onReasonSelect !== undefined &&
            TIERS_WITH_REASONS.includes(row.tier);

          return (
            <div key={row.tier} className="flex flex-col">
              <label
                className={cn(
                  "flex min-h-(--row-min) cursor-pointer items-center",
                  "ps-(--space-3) pe-(--space-2) py-(--space-2)",
                  "border-s-2 transition-colors duration-(--dur-state) ease-(--ease-settle)",
                  "focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset",
                  selected
                    ? "border-s-ink"
                    : "border-s-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  locked && "cursor-default",
                )}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={row.tier}
                  checked={selected}
                  disabled={locked}
                  onChange={() => onChange(row.tier)}
                  className="sr-only"
                />
                <span className="flex min-w-0 flex-col">
                  <Text as="span" variant="body">
                    {row.label}
                  </Text>
                  <Text as="span" variant="caption" tone="secondary">
                    {row.definition}
                  </Text>
                </span>
              </label>

              {showChips ? (
                <div className="ps-(--space-5) pb-(--space-3)">
                  <ReasonChips
                    reasons={reasons[row.tier]}
                    value={selectedReason}
                    onChange={onReasonSelect}
                    otherText={otherText}
                    onOtherTextChange={onOtherTextChange}
                    onKeepReason={onKeepReason}
                    label={TIER_RADIO_ROWS_COPY.reasonsLabel}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {invalid ? (
        <HelperText id={errorId} error>
          {error}
        </HelperText>
      ) : null}
    </div>
  );
}
