"use client";

import * as React from "react";
import type { WorkSize, WorkTier } from "@syn/types";
import {
  Button,
  cn,
  DisclosureIcon,
  ItemIcon,
  SegmentedControl,
  Text,
  Textarea,
} from "@syn/ui";
import { TierField } from "@/components/work/add/new-task/fields";
import { shortDate } from "@/components/work/add/new-task/form";
import { LengthStepper } from "@/components/work/length-stepper";
import { SizeCards } from "@/components/work/size-cards";
import {
  lengthWords,
  SIZE_POINTS,
  stepLength,
  type WorkSheetView,
} from "@/lib/data/item-sheet-work";
import { clock, ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.work;

/**
 * WorkItemFields — the Item sheet's body on a work item (USE-65;
 * item-sheet/states/size-and-length.md): the scope line, the icon and the
 * name, then Size, Length, Tier, When and, on a Synapse-only item, Notes, on
 * hairlines. A linked item's Linear line (under the name) and its Priority,
 * Assignee and Description (under Tier) come in as `linear` (USE-66).
 *
 * Size's five cards set the size and reset the range from it; Length is
 * Exact (one stepper) or Range (two), and its helper names the top the day
 * plans with. Each change is handed up as made; the values shown hold the
 * change until the day reads it back. Props only.
 */
export interface WorkItemFieldsProps {
  view: WorkSheetView;
  titleRef: React.Ref<HTMLHeadingElement>;
  onSize: (size: WorkSize) => void;
  onLength: (range: { min: number; max: number | null }) => void;
  onTier: (tier: WorkTier) => void;
  onNotes: (notes: string) => void;
  /** When's row: Move to (USE-69's step); absent, the row waits for it. */
  onWhen?: () => void;
  /** Huge's "Split it?": Spread (USE-78); absent, it waits for it. */
  onSpread?: () => void;
  /** A linked item's Linear line and its rows under Tier (USE-66). */
  linear?: { line: React.ReactNode; fields: React.ReactNode };
  /**
   * A session's or a firing item's sheet (USE-67): the scope reads "Mon 12 ·
   * Work · session 1 of 3", the firing panel and Tier come first, then
   * `extra` (Sessions, Sub-issues), then Size, Length, When and Notes.
   */
  focused?: boolean;
  /** The firing panel, under the name (while-firing.md). */
  firing?: React.ReactNode;
  /** Sessions and Sub-issues, under Tier. */
  extra?: React.ReactNode;
  /** Tier's aside: "Mon 12 only · asks before changing all". */
  tierAside?: string;
  /** A session's tier asks first: the segment waits for the answer. */
  asksTier?: boolean;
  /** Tier's control, for focus to return to once the ask closes. */
  tierRef?: React.Ref<HTMLDivElement>;
}

const SIZES: readonly WorkSize[] = [
  "quick",
  "small",
  "medium",
  "large",
  "huge",
];
const ROW =
  "border-hairline flex flex-col gap-(--space-2) border-t py-(--space-3)";
const LABEL = "text-(length:--fs-body) text-foreground";

/**
 * "Work, 9:30 to 12:00 · Primary · session 1 of 3"; on a session's or a
 * firing item's sheet as those boards print it, "Mon 12 · Work · session 1
 * of 3" and "Mon 12 · Work · Primary" (USE-67).
 */
export function scopeWords(view: WorkSheetView, focused = false): string {
  const { slot, session } = view;
  if (slot === null) return COPY.pool;
  if (focused) {
    const last =
      session !== null
        ? COPY.session(session.n, session.of)
        : slot.tier === null
          ? null
          : COPY.tier[slot.tier];
    return [shortDate(slot.dateKey), slot.blockName, last]
      .filter((part) => part !== null)
      .join(" · ");
  }
  const place = slot.today
    ? `${slot.blockName}, ${clock(slot.startsAt)} to ${clock(slot.endsAt)}`
    : `${shortDate(slot.dateKey)}, ${slot.blockName} ${clock(slot.startsAt)}`;
  return [
    place,
    slot.tier === null ? null : COPY.tier[slot.tier],
    session === null ? null : COPY.session(session.n, session.of),
    // linear-done.md: "Work, 9:30 to 12:00 · Primary · done".
    slot.done ? ITEM_SHEET_COPY.linear.done : null,
  ]
    .filter((part) => part !== null)
    .join(" · ");
}

/** When's value: "Today, Work 9:30", "Thu 15, Work 9:30", "In the pool". */
function whenWords(view: WorkSheetView): string {
  const { slot } = view;
  if (slot === null) return COPY.pool;
  const day = slot.today ? COPY.today : shortDate(slot.dateKey);
  return `${day}, ${slot.blockName} ${clock(slot.startsAt)}`;
}

export function WorkItemFields({
  view,
  titleRef,
  onSize,
  onLength,
  onTier,
  onNotes,
  onWhen,
  onSpread,
  linear,
  focused = false,
  firing,
  extra,
  tierAside,
  asksTier = false,
  tierRef,
}: WorkItemFieldsProps) {
  const { item, slot } = view;
  const ids = {
    size: React.useId(),
    length: React.useId(),
    helper: React.useId(),
  };

  // What shows while a change saves: the day's value once it reads it back.
  const [size, setSize] = React.useState(item.size);
  const [range, setRange] = React.useState({
    min: item.lengthMinMin,
    max: item.lengthMaxMin,
  });
  const [exact, setExact] = React.useState(view.exact);
  const [tier, setTier] = React.useState(slot?.tier ?? null);
  const [notes, setNotes] = React.useState(item.notes);
  React.useEffect(() => setSize(item.size), [item.size]);
  React.useEffect(
    () => setRange({ min: item.lengthMinMin, max: item.lengthMaxMin }),
    [item.lengthMinMin, item.lengthMaxMin],
  );
  React.useEffect(() => setTier(slot?.tier ?? null), [slot?.tier]);
  React.useEffect(() => setNotes(item.notes), [item.notes]);
  // A new item opens as its own length reads.
  const [shownId, setShownId] = React.useState(item.id);
  if (shownId !== item.id) {
    setShownId(item.id);
    setExact(view.exact);
  }

  const top = range.max ?? range.min;
  const isRange = !exact && range.max !== null && range.max !== range.min;
  const helper = COPY.helper(
    size === null ? null : COPY.sizes[size],
    top === null ? null : lengthWords(top),
    isRange,
  );

  function changeRange(next: { min: number; max: number | null }) {
    setRange(next);
    onLength(next);
  }

  const stepper = (
    label: string,
    value: number | null,
    change: (v: number) => void,
  ) => (
    <LengthStepper
      label={label}
      value={value}
      words={lengthWords}
      step={stepLength}
      start={30}
      stepLabels={{
        decrease: `${COPY.shorter}, ${label}`,
        increase: `${COPY.longer}, ${label}`,
      }}
      onChange={change}
    />
  );

  const sizeRow = (
    <>
      <div className={ROW}>
        <div className="flex items-baseline justify-between gap-(--space-3)">
          <Text as="span" id={ids.size} variant="body" className={LABEL}>
            {COPY.size}
          </Text>
          {item.linked ? (
            <Text as="span" variant="caption" tone="secondary">
              {COPY.sizeAside}
            </Text>
          ) : null}
        </div>
        <SizeCards
          label={COPY.size}
          value={size}
          options={SIZES.map((value) => ({
            value,
            points: SIZE_POINTS[value],
            word: COPY.sizes[value],
          }))}
          onChange={(next) => {
            setSize(next);
            onSize(next);
          }}
        />
      </div>
    </>
  );
  const lengthRow = (
    <>
      <div className={ROW}>
        <div className="flex items-center justify-between gap-(--space-3)">
          <Text as="span" id={ids.length} variant="body" className={LABEL}>
            {COPY.length}
          </Text>
          <SegmentedControl
            label={COPY.length}
            stacked={false}
            value={exact ? "exact" : "range"}
            onChange={(mode) => {
              const toExact = mode === "exact";
              setExact(toExact);
              if (toExact && top !== null) changeRange({ min: top, max: top });
            }}
            options={[
              { value: "exact", label: COPY.exact },
              { value: "range", label: COPY.range },
            ]}
            classes={{
              root: "w-auto",
              label: "sr-only",
              group: "bg-surface gap-0 border-0 p-(--space-1)",
              item: cn(
                "bg-surface text-muted-foreground h-8 rounded-(--radius-control) px-(--space-3) font-normal",
                "has-checked:bg-background has-checked:text-foreground has-checked:font-semibold",
              ),
            }}
          />
        </div>
        <div
          role="group"
          aria-labelledby={ids.length}
          aria-describedby={helper === "" ? undefined : ids.helper}
          className="flex items-center gap-(--space-2)"
        >
          {exact ? (
            stepper(COPY.length, top, (v) => changeRange({ min: v, max: v }))
          ) : (
            <>
              {stepper(COPY.from, range.min, (v) =>
                changeRange({
                  min: v,
                  max: range.max === null ? null : Math.max(v, range.max),
                }),
              )}
              {range.max === null && range.min !== null ? (
                <Text
                  as="span"
                  variant="body"
                  tone="secondary"
                  className="flex-1"
                >
                  {COPY.orMore}
                </Text>
              ) : (
                <>
                  <Text as="span" variant="body" tone="secondary">
                    {COPY.to}
                  </Text>
                  {stepper(COPY.toName, range.max, (v) =>
                    changeRange({
                      min: range.min === null ? v : Math.min(range.min, v),
                      max: v,
                    }),
                  )}
                </>
              )}
            </>
          )}
        </div>
        {helper === "" ? null : (
          <Text as="p" id={ids.helper} variant="caption" tone="secondary">
            {helper}
          </Text>
        )}
        {size === "huge" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSpread}
            className="-ms-(--space-3) self-start underline"
          >
            {COPY.huge}
          </Button>
        ) : null}
      </div>
    </>
  );
  const tierRow = (
    <>
      {slot !== null && tier !== null ? (
        <div ref={tierRef} className={ROW}>
          <TierField
            value={tier}
            {...(tierAside === undefined ? {} : { aside: tierAside })}
            onChange={(next) => {
              // A session's change asks first; the segment shows its answer.
              if (!asksTier) setTier(next);
              onTier(next);
            }}
          />
        </div>
      ) : null}
    </>
  );
  const whenRow = (
    <>
      <button
        type="button"
        aria-label={COPY.whenName(whenWords(view))}
        onClick={onWhen}
        className={cn(
          "border-hairline flex min-h-14 w-full items-center gap-(--space-2) border-t text-start",
          "hover:bg-surface focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        )}
      >
        <Text as="span" variant="body" className="flex-1">
          {COPY.when}
        </Text>
        <Text as="span" variant="body" tone="secondary" truncate>
          {whenWords(view)}
        </Text>
        <DisclosureIcon
          aria-hidden="true"
          className="text-muted-foreground size-4 shrink-0"
        />
      </button>
    </>
  );
  const notesRow = (
    <>
      {item.linked ? null : (
        <div className={ROW}>
          <Textarea
            label={ITEM_SHEET_COPY.notes}
            placeholder={ITEM_SHEET_COPY.notesPlaceholder}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            onBlur={() => {
              if (notes !== item.notes) onNotes(notes);
            }}
            autoGrow
            rows={2}
          />
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col">
      <Text as="p" variant="secondary" tone="secondary">
        {scopeWords(view, focused)}
      </Text>

      <div className="flex items-center gap-(--space-3) py-(--space-3)">
        <span
          aria-hidden="true"
          className="bg-surface inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius)"
        >
          <ItemIcon icon={item.icon} size={24} />
        </span>
        <Text
          ref={titleRef}
          as="h2"
          variant="heading"
          tabIndex={-1}
          className="min-w-0 outline-none"
        >
          {item.title}
        </Text>
      </div>

      {linear?.line}

      {focused ? (
        <>
          {firing === undefined ? null : (
            <div className="pb-(--space-3)">{firing}</div>
          )}
          {tierRow}
          {extra}
          {linear?.fields}
          {sizeRow}
          {lengthRow}
          {whenRow}
          {notesRow}
        </>
      ) : (
        <>
          {sizeRow}
          {lengthRow}
          {tierRow}
          {linear?.fields}
          {whenRow}
          {notesRow}
        </>
      )}
    </div>
  );
}
