"use client";

import * as React from "react";
import {
  cn,
  MealIcon,
  NativeSelect,
  NativeSelectOption,
  Switch,
  Text,
} from "@syn/ui";

/**
 * The kinds' header rows in editing (USE-49; by-kind.md): one row under the
 * header, a hairline under it, between the header and the rows. Two forms:
 *
 * - `KindSwitchRow`: a word, its state in muted words and a `Switch` at the
 *   trailing edge: Meal ("Offers something to watch" or "Off", with the
 *   fork and knife) and "Checklist, no times" ("On").
 * - `KindSelectRow`: a muted word and an outlined select at the trailing
 *   edge: "Training for" (Body fitness) and "Work fills it with" (Set work).
 *
 * The words are the caller's; the state is never colour alone (the switch's
 * words say On or Off). Props only.
 */
const ROW =
  "border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-b px-(--space-4)";

export interface KindSwitchRowProps {
  label: string;
  /** "Offers something to watch", "Off", "On". */
  state: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Meal's fork and knife before the word. */
  meal?: boolean;
}

export function KindSwitchRow({
  label,
  state,
  checked,
  onCheckedChange,
  meal = false,
}: KindSwitchRowProps) {
  const id = React.useId();
  return (
    <div className={ROW} data-kind-row>
      {meal ? (
        <MealIcon
          aria-hidden="true"
          className="text-text-muted size-4 shrink-0"
        />
      ) : null}
      <label
        htmlFor={id}
        className="flex min-w-0 flex-1 items-baseline gap-(--space-2)"
      >
        <Text as="span" variant="caption" weight={600} className="shrink-0">
          {label}
        </Text>
        <Text as="span" variant="caption" tone="muted" className="truncate">
          {state}
        </Text>
      </label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0"
      />
    </div>
  );
}

export interface KindSelectRowProps<V extends string> {
  label: string;
  value: V;
  options: readonly { value: V; label: string }[];
  onChange: (value: V) => void;
  className?: string;
}

export function KindSelectRow<V extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: KindSelectRowProps<V>) {
  const id = React.useId();
  return (
    <div className={cn(ROW, className)} data-kind-row>
      <label htmlFor={id} className="min-w-0 flex-1">
        <Text as="span" variant="caption" tone="muted">
          {label}
        </Text>
      </label>
      <NativeSelect
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as V)}
        className="text-foreground h-(--target) font-medium"
      >
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}
