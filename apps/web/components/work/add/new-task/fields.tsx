"use client";

import * as React from "react";
import type { WorkSize, WorkTier } from "@syn/types";
import {
  cn,
  DisclosureIcon,
  HueSquare,
  RangeInput,
  SegmentedControl,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from "@syn/ui";
import { ClientTile, TIER_HUE, type ClientHue } from "../../index";
import { NEW_TASK_COPY as COPY } from "../copy";
import {
  canPick,
  rangeWords,
  SIZES,
  sizeWords,
  TIERS,
  tierWord,
  type DayChip,
} from "./form";

/**
 * New task's fields (USE-51; add/states/new-task.md): each a part with its
 * value and its change, the words from the form. Tier and Size are radio
 * groups named in words (colour never alone); the days are toggle buttons,
 * a dashed day disabled with "no Work block" in its name.
 */

const LABEL = "text-(length:--fs-secondary) font-semibold text-foreground";

export function FieldLabel({
  id,
  children,
  aside,
}: {
  id?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-(--space-3)">
      <Text as="span" id={id} variant="secondary" className={LABEL}>
        {children}
      </Text>
      {aside}
    </div>
  );
}

/** A row between rules: label left, value muted right, a chevron when it opens a picker. */
export function ValueRow({
  label,
  value,
  leading,
  chevron = false,
  expanded,
  onPress,
}: {
  label: string;
  value: string;
  leading?: React.ReactNode;
  chevron?: boolean;
  expanded: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-label={COPY.rowName(label, value)}
      onClick={onPress}
      className={cn(
        "border-hairline flex min-h-14 w-full items-center gap-(--space-2) border-b text-start",
        "hover:bg-surface focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
      )}
    >
      <Text as="span" variant="body" className="flex-1">
        {label}
      </Text>
      {leading}
      <Text as="span" variant="body" tone="muted" truncate>
        {value}
      </Text>
      {chevron ? (
        <DisclosureIcon
          aria-hidden="true"
          className="text-muted-foreground size-4 shrink-0"
        />
      ) : null}
    </button>
  );
}

export interface ClientOption {
  id: string;
  name: string;
  letter: string;
  hue: ClientHue;
}

/** The client picker until the clients ticket: clients only, the project reads none. */
export function ClientPicker({
  clients,
  value,
  onChange,
}: {
  clients: readonly ClientOption[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <SegmentedControl
      label={COPY.fields.client}
      stacked
      value={value ?? ""}
      onChange={(next) => onChange(next === "" ? null : next)}
      options={[
        ...clients.map((client) => ({
          value: client.id,
          label: (
            <span className="flex w-full items-center gap-(--space-2)">
              <ClientTile letter={client.letter} hue={client.hue} />
              {client.name}
            </span>
          ),
        })),
        { value: "", label: <span className="w-full">{COPY.noClient}</span> },
      ]}
      classes={{
        root: "py-(--space-2)",
        label: "sr-only",
        group: "bg-transparent gap-0 border-0",
        item: cn(
          "justify-start bg-transparent text-foreground font-normal",
          "hover:bg-surface has-checked:bg-surface has-checked:text-foreground has-checked:font-semibold",
        ),
      }}
    />
  );
}

/** The tier's segments, each its square and word (D-USE-38). */
export function TierField({
  value,
  onChange,
  aside,
}: {
  value: WorkTier;
  onChange: (tier: WorkTier) => void;
  /** Muted on the label's right: the Item sheet's "Mon 12 only · …" (USE-67). */
  aside?: string;
}) {
  return (
    <div className="flex flex-col gap-(--space-2)">
      <SegmentedControl
        label={
          aside === undefined ? (
            <span className={LABEL}>{COPY.fields.tier}</span>
          ) : (
            <span className="flex w-full items-baseline justify-between gap-(--space-3)">
              <span className={LABEL}>{COPY.fields.tier}</span>
              <span className="text-muted-foreground text-(length:--fs-caption) font-normal">
                {aside}
              </span>
            </span>
          )
        }
        stacked={false}
        value={value}
        onChange={onChange}
        options={TIERS.map((tier) => ({
          value: tier,
          label: (
            <span className="flex items-center gap-(--space-1)">
              <HueSquare hue={TIER_HUE[tier]} />
              {tierWord(tier)}
            </span>
          ),
        }))}
        classes={{
          group: "bg-surface gap-0 border-0 p-(--space-1)",
          item: cn(
            "bg-surface text-muted-foreground min-w-0 rounded-(--radius-control) font-normal",
            "hover:bg-paper has-checked:bg-background has-checked:text-foreground has-checked:font-semibold",
            "has-checked:border-hairline has-checked:border",
          ),
        }}
      />
    </div>
  );
}

/** Size's five words; the range beside the label stays editable (the size dev note). */
export function SizeField({
  size,
  min,
  max,
  onSize,
  onRange,
}: {
  size: WorkSize | null;
  min: number | null;
  max: number | null;
  onSize: (size: WorkSize) => void;
  onRange: (range: { min: number | null; max: number | null }) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const labelId = React.useId();
  const range = rangeWords(min, max);

  return (
    <div className="flex flex-col gap-(--space-2)">
      <FieldLabel
        id={labelId}
        aside={
          range === "" ? null : (
            <button
              type="button"
              aria-expanded={editing}
              aria-label={COPY.editRange(range)}
              onClick={() => setEditing((open) => !open)}
              className="text-muted-foreground focus-visible:ring-ring rounded-(--radius-control) text-(length:--fs-secondary) focus-visible:ring-2 focus-visible:outline-none"
            >
              {range}
            </button>
          )
        }
      >
        {COPY.fields.size}
      </FieldLabel>
      <SegmentedControl
        label={COPY.fields.size}
        stacked={false}
        value={size ?? ("" as WorkSize)}
        onChange={onSize}
        options={SIZES.map((value) => ({ value, label: sizeWords(value) }))}
        classes={{
          label: "sr-only",
          group: "bg-transparent gap-(--space-1) border-0 flex-wrap",
          item: cn(
            // 36 drawn inside a 44 hit area (new-task.md › Access).
            "border-hairline bg-background text-foreground relative h-9 flex-none rounded-full border px-(--space-2) font-normal",
            "after:absolute after:-inset-y-1 after:inset-x-0 after:content-['']",
            "hover:bg-surface has-checked:bg-primary has-checked:text-primary-foreground has-checked:border-primary",
          ),
        }}
      />
      {editing ? (
        <RangeInput
          label={COPY.fields.range}
          from={min}
          to={max}
          onChange={({ from, to }) => onRange({ min: from, max: to })}
        />
      ) : null}
    </div>
  );
}

/** The week's seven days, letter over date; two or more make sessions of one task. */
export function DaysField({
  chips,
  value,
  onToggle,
}: {
  chips: readonly DayChip[];
  value: readonly string[];
  onToggle: (dateKey: string) => void;
}) {
  const labelId = React.useId();
  return (
    <div className="flex flex-col gap-(--space-2)">
      <FieldLabel
        id={labelId}
        aside={
          <Text as="span" variant="secondary" tone="muted">
            {COPY.daysHint}
          </Text>
        }
      >
        {COPY.fields.days}
      </FieldLabel>
      <ToggleGroup
        type="multiple"
        aria-labelledby={labelId}
        value={[...value]}
        onValueChange={(next) => {
          const added = next.find((d) => !value.includes(d));
          const removed = value.find((d) => !next.includes(d));
          const changed = added ?? removed;
          if (changed !== undefined) onToggle(changed);
        }}
        className="grid w-full grid-cols-7 gap-(--space-1)"
      >
        {chips.map((chip) => {
          const pickable = canPick(chip);
          const on = value.includes(chip.dateKey);
          return (
            <ToggleGroupItem
              key={chip.dateKey}
              value={chip.dateKey}
              disabled={!pickable}
              aria-label={chip.name}
              data-day={chip.dateKey}
              className={cn(
                // 36 drawn inside a 44 hit area (new-task.md › Access).
                "relative flex h-12 min-w-0 flex-col items-center justify-center gap-0 rounded-(--radius) border px-0",
                "after:absolute after:-inset-y-1 after:inset-x-0 after:content-['']",
                on
                  ? "border-primary bg-primary text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  : "border-hairline bg-background text-foreground",
                !pickable &&
                  "text-muted-foreground border-dashed bg-transparent disabled:opacity-60",
              )}
            >
              <span
                aria-hidden="true"
                className="text-(length:--fs-caption) leading-none"
              >
                {chip.letter}
              </span>
              <span
                aria-hidden="true"
                className="text-(length:--fs-body) leading-tight font-medium"
              >
                {chip.date}
              </span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
