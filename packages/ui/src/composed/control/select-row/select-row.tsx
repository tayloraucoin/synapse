/**
 * SelectRow — the row that IS the selection (UX v1.2 §4 frame rules, R43;
 * §10.2, §10.4; RUN-7).
 *
 * "Selection is a row, not a checkbox: a `SelectRow` — emoji, title, a muted
 * detail on the right; the whole row is the target; selected rows show a
 * tick in the trailing slot and an ink border." Every chooser in the first
 * run — the starter habits, the workouts, the fixtures — is a list of these.
 *
 * A `button[aria-pressed]`, NOT A CHECKBOX. The row is one target 56px tall
 * and the tick is decoration; a screen reader hears the title and *pressed*.
 * A disabled row keeps its caption (*in your library*) inside the button so
 * the reason is read with the row, and leaves the tab order.
 *
 * OPTIMISTIC BY RULE (§2 guardrail 4, TD-18). The tick appears on the tap:
 * `useOptimisticValue` holds `selected` locally, `onToggle` is the write,
 * debounced for a fast un-tick (a second tap on a tick is an un-tick, never a
 * duplicate); the border pulses while the write is out, and a rejection
 * reverts the tick and hands the error to `onCommitError`. Nothing disables.
 *
 * Two columns from 720px is the LIST's concern — `SelectRowList` below.
 */
"use client";

import { useOptimisticValue } from "@syn/hooks/use-optimistic-value";
import type { IconValue } from "@syn/types";
import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { COMMITTING_PULSE } from "../../../lib/committing";
import { SELECTION_CHOSEN, SELECTION_UNCHOSEN } from "../../../lib/selection";
import { Text } from "../../../primitives/typography/text";
import { EmojiSlot } from "../../display/emoji-slot";

export interface SelectRowProps {
  icon: IconValue | null;
  title: string;
  /** The muted detail on the right — *10 min*, *Tue · Thu*. */
  detail?: React.ReactNode;
  selected: boolean;
  /** The write; reject to revert the tick. */
  onToggle: (selected: boolean) => Promise<void> | void;
  /** The screen's word when it owns the request; the row's own is OR-ed in. */
  committing?: boolean;
  /** After a rejected toggle has reverted the tick. */
  onCommitError?: (error: unknown) => void;
  /** The screen's line, read with the row (`aria-describedby`). */
  error?: React.ReactNode;
  disabled?: boolean;
  /** *in your library* — why the row is not a choice. */
  disabledCaption?: string;
  /** An uploaded icon's resolved URL. */
  imageUrl?: string | null;
  className?: string;
}

export function SelectRow({
  icon,
  title,
  detail,
  selected,
  onToggle,
  committing: committingProp = false,
  onCommitError,
  error,
  disabled = false,
  disabledCaption,
  imageUrl = null,
  className,
}: SelectRowProps) {
  const errorId = React.useId();
  const { local, set, committing: writing } = useOptimisticValue<boolean>({
    value: selected,
    onCommit: onToggle,
    onError: onCommitError,
  });
  const committing = committingProp || writing;
  const hasError = error !== undefined && error !== null;

  return (
    <div className={cn("flex flex-col gap-(--space-1)", className)}>
      <button
        type="button"
        aria-pressed={local}
        aria-describedby={hasError ? errorId : undefined}
        disabled={disabled}
        data-selected={local || undefined}
        data-committing={committing || undefined}
        onClick={() => set(!local)}
        className={cn(
          "flex min-h-(--row-min) w-full items-center gap-(--space-3) rounded-(--radius) text-left",
          "px-(--space-2) py-(--space-1)",
          "transition-colors duration-(--dur-state) ease-(--ease-settle)",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
          // UX v1.3 R56 (DAY-1): surface, a 1.5px ink border, the check — one string with `LargeTargetRow`.
          local ? SELECTION_CHOSEN : SELECTION_UNCHOSEN,
          committing && COMMITTING_PULSE,
          disabled && "text-text-disabled cursor-default hover:bg-transparent",
        )}
      >
        <EmojiSlot icon={icon} imageUrl={imageUrl} className={cn(disabled && "opacity-40")} />

        <span className="flex min-w-0 flex-1 items-baseline gap-(--space-2)">
          <Text
            as="span"
            variant="row-title"
            weight={500}
            truncate
            className={cn(disabled && "text-text-disabled")}
          >
            {title}
          </Text>
        </span>

        {disabled && disabledCaption !== undefined ? (
          <Text as="span" variant="caption" className="text-text-disabled shrink-0">
            {disabledCaption}
          </Text>
        ) : detail === undefined ? null : (
          <Text as="span" variant="secondary" tone="secondary" className="shrink-0 tabular-nums">
            {detail}
          </Text>
        )}

        {/* The trailing slot is always there, so the detail never shifts when a tick lands. */}
        <span aria-hidden="true" className="inline-flex size-(--target) shrink-0 items-center justify-center">
          {local ? <Check className="size-5" strokeWidth={2} /> : null}
        </span>
      </button>

      {hasError ? (
        <Text as="span" id={errorId} variant="caption" tone="secondary" className="px-(--space-2)">
          {error}
        </Text>
      ) : null}
    </div>
  );
}

export interface SelectRowListProps {
  /** One column; or two from the wide breakpoint. */
  columns?: 1 | 2;
  children: React.ReactNode;
  className?: string;
}

/** The rows as a list — one column, or two from 720px when the chooser is long (§4). */
export function SelectRowList({ columns = 1, children, className }: SelectRowListProps) {
  return (
    <div
      role="group"
      className={cn(
        "grid gap-(--space-2)",
        columns === 2 ? "grid-cols-1 wide:grid-cols-2" : "grid-cols-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
