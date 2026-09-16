"use client";

import * as React from "react";

import { BlockHeader, ItemRow, MultitaskGroup, Text } from "@syn/ui";
import type { DayBlockView, DayItemView, DayMode } from "@syn/types";

import { DAY_LIST_COPY as COPY } from "./copy";

/**
 * One block and its rows — UX v1.1 §6.1 (DYN-15), replacing the day part.
 *
 * THE WORK BLOCK IS ONE ROW: a container `ItemRow` with the focus as its
 * title, its span as its time text, and the fixtures inside it nested
 * beneath. Split around training it is two container rows either side of
 * the training block, in block order. The container has no checkbox and is
 * never scored.
 *
 * THE WIND-DOWN BLOCK CARRIES THE MARKER (§7.1): the row at `devicesOffAt` is
 * a hairline with the anchor glyph and no checkbox; every row after it reads
 * *confirm in the morning* from its own state and cannot be ticked live.
 *
 * DEFERRED ROWS SINK TO THE BOTTOM OF THEIR BLOCK and nowhere else — *Not
 * today* is a decision about the item, not about when it was scheduled.
 * MULTITASK MEMBERS ARE BRACKETED ONCE, as the day part did.
 */
export function BlockSection({
  block,
  focusLabel,
  devicesOffAt,
  mode,
  timeZone,
  hasUndo,
  onToggleDone,
  onUndo,
  onOpen,
  onOpenJournal,
}: {
  block: DayBlockView;
  focusLabel: string | null;
  devicesOffAt: Date | null;
  mode: DayMode;
  timeZone: string;
  hasUndo: (id: string) => boolean;
  onToggleDone: (item: DayItemView) => void;
  onUndo: (item: DayItemView) => void;
  onOpen: (item: DayItemView) => void;
  /** UX v1.1 §7.2: the wind-down *Journal* row opens the journal screen. */
  onOpenJournal?: () => void;
}) {
  const ordered = React.useMemo(() => sortForDisplay(block.items), [block.items]);
  const planMode = mode === "plan";
  const span =
    block.startLabel === null || block.endLabel === null
      ? null
      : { startLabel: block.startLabel, endLabel: block.endLabel };

  const rowProps = { planMode, timeZone, hasUndo, onToggleDone, onUndo, onOpen };

  if (block.kind === "work") {
    const fixtures = ordered.filter((item) => item.origin === "fixture");
    const others = ordered.filter((item) => item.origin !== "fixture");
    const container = others.find((item) => item.type === "deep_work") ?? null;
    const rest = others.filter((item) => item !== container);
    return (
      <section>
        <BlockHeader kind={block.kind} name={block.name} span={span} split={block.split} />
        <ul className="flex flex-col">
          <WorkContainer
            block={block}
            focusLabel={focusLabel}
            item={container}
            timeZone={timeZone}
            onOpen={onOpen}
          >
            {fixtures.map((item) => (
              <Row key={item.id} item={item} {...rowProps} />
            ))}
          </WorkContainer>
          {rest.map((item) => (
            <Row key={item.id} item={item} {...rowProps} />
          ))}
        </ul>
      </section>
    );
  }

  /*
   * UX v1.1 §7.2 (DYN-18): the wind-down *Journal* row opens the journal
   * screen, not the item sheet — recognised the way the materialiser places
   * it (the item titled *journal*). Its tick is the journal's own.
   */
  const openRow =
    block.kind === "wind_down" && onOpenJournal !== undefined
      ? (item: DayItemView) => {
          if (item.title.trim().toLowerCase() === "journal") onOpenJournal();
          else onOpen(item);
        }
      : onOpen;
  const windDownRowProps = { ...rowProps, onOpen: openRow };

  return (
    <section>
      <BlockHeader kind={block.kind} name={block.name} span={span} />
      {block.state === "pooled" && ordered.length === 0 ? (
        <Text as="p" variant="caption" tone="secondary" className="px-(--space-4) py-(--space-2)">
          {COPY.setInTheMorning}
        </Text>
      ) : null}
      <ul className="flex flex-col">
        {groupRuns(ordered).map((run) =>
          run.multitask ? (
            <MultitaskGroup key={run.key}>
              {run.items.map((item) => (
                <Row key={item.id} item={item} marker={isMarker(item, devicesOffAt)} {...windDownRowProps} />
              ))}
            </MultitaskGroup>
          ) : (
            run.items.map((item) => (
              <Row key={item.id} item={item} marker={isMarker(item, devicesOffAt)} {...windDownRowProps} />
            ))
          ),
        )}
      </ul>
    </section>
  );
}

/**
 * The work container: the focus as the title, the span as the time text, the
 * fixtures nested. `confirmDay` writes one container item per work row (the
 * focus), so the row is the item; before a focus exists the row is
 * synthesised from the block — its span read from the first and last item
 * on it — because the block is still a thing on the day.
 */
function WorkContainer({
  block,
  focusLabel,
  item,
  timeZone,
  onOpen,
  children,
}: {
  block: DayBlockView;
  focusLabel: string | null;
  item: DayItemView | null;
  timeZone: string;
  onOpen: (item: DayItemView) => void;
  children: React.ReactNode;
}) {
  const starts = block.items
    .map((row) => row.scheduledStart)
    .filter((at): at is Date => at !== null)
    .sort((a, b) => a.getTime() - b.getTime());
  const ends = block.items
    .map((row) => row.scheduledEnd)
    .filter((at): at is Date => at !== null)
    .sort((a, b) => b.getTime() - a.getTime());
  const start = starts[0] ?? null;
  const end = ends[0] ?? null;

  const view: DayItemView = item ?? {
    id: `block-${block.id}`,
    habitId: null,
    title: focusLabel ?? block.name ?? COPY.work,
    icon: { kind: "curated", value: "dot", colorKey: null },
    type: "deep_work",
    category: null,
    timeMode: start === null ? "unscheduled" : "fixed_time",
    scheduledStart: start,
    scheduledEnd: end,
    originalScheduledStart: null,
    durationMin: null,
    priority: 4,
    scheduling: "hard",
    origin: "template",
    carriedFromLabel: null,
    doneAt: null,
    quantityUnit: null,
    quantityValue: null,
    timerElapsedSec: null,
    state: "upcoming",
    multitask: "none",
    dayBlockId: block.id,
    blockKind: "work",
    pinned: false,
    gapBeforeMin: 0,
    alternates: null,
    versionKey: null,
    parentItemId: null,
  };

  return (
    <div data-item-id={view.id} tabIndex={-1} className="outline-none">
      <ItemRow
        item={focusLabel === null ? view : { ...view, title: focusLabel }}
        variant="container"
        timeZone={timeZone}
        onOpen={item === null ? undefined : onOpen}
      >
        {children}
      </ItemRow>
    </div>
  );
}

function isMarker(item: DayItemView, devicesOffAt: Date | null): boolean {
  return (
    devicesOffAt !== null &&
    item.scheduledStart !== null &&
    item.scheduledStart.getTime() === devicesOffAt.getTime() &&
    item.pinned
  );
}

function Row({
  item,
  marker = false,
  planMode,
  timeZone,
  hasUndo,
  onToggleDone,
  onUndo,
  onOpen,
}: {
  item: DayItemView;
  marker?: boolean;
  planMode: boolean;
  timeZone: string;
  hasUndo: (id: string) => boolean;
  onToggleDone: (item: DayItemView) => void;
  onUndo: (item: DayItemView) => void;
  onOpen: (item: DayItemView) => void;
}) {
  return (
    /*
     * The wrapper carries the id and the focus target a notification landing
     * scrolls to (USE-8, PN-01). `tabIndex={-1}` lets focus reach it without
     * adding a stop to the tab order.
     */
    <div data-item-id={item.id} tabIndex={-1} className="outline-none">
      <ItemRow
        item={item}
        variant={planMode ? "read-only" : "default"}
        timeZone={timeZone}
        marker={marker}
        onToggleDone={planMode ? undefined : onToggleDone}
        onOpen={onOpen}
        undo={hasUndo(item.id) ? { label: COPY.undo, onUndo: () => onUndo(item) } : undefined}
      />
    </div>
  );
}

/** Time order, with deferred rows last inside their own block. */
export function sortForDisplay(items: readonly DayItemView[]): DayItemView[] {
  return [...items].sort((a, b) => {
    const deferredA = a.state === "deferred" ? 1 : 0;
    const deferredB = b.state === "deferred" ? 1 : 0;
    if (deferredA !== deferredB) return deferredA - deferredB;
    const startA = a.scheduledStart?.getTime() ?? Number.POSITIVE_INFINITY;
    const startB = b.scheduledStart?.getTime() ?? Number.POSITIVE_INFINITY;
    return startA - startB;
  });
}

type Run = { key: string; multitask: boolean; items: DayItemView[] };

/** Consecutive rows of one multitask bracket, as runs (opened by `first`, closed by `last`). */
function groupRuns(items: readonly DayItemView[]): Run[] {
  const runs: Run[] = [];
  let current: Run | null = null;
  for (const item of items) {
    if (item.multitask === "none") {
      current = null;
      runs.push({ key: item.id, multitask: false, items: [item] });
      continue;
    }
    if (current === null) {
      current = { key: item.id, multitask: true, items: [item] };
      runs.push(current);
    } else {
      current.items.push(item);
    }
    if (item.multitask === "last") current = null;
  }
  return runs;
}

/** Rows with no block — one-offs, an unstructured day's adds — under the blocks. */
export function UnblockedSection({
  items,
  mode,
  timeZone,
  hasUndo,
  onToggleDone,
  onUndo,
  onOpen,
}: {
  items: readonly DayItemView[];
  mode: DayMode;
  timeZone: string;
  hasUndo: (id: string) => boolean;
  onToggleDone: (item: DayItemView) => void;
  onUndo: (item: DayItemView) => void;
  onOpen: (item: DayItemView) => void;
}) {
  if (items.length === 0) return null;
  const rowProps = { planMode: mode === "plan", timeZone, hasUndo, onToggleDone, onUndo, onOpen };
  return (
    <section>
      <Text as="h2" variant="secondary" tone="secondary" weight={500} className="px-(--space-4) pt-(--space-6) pb-(--space-2)">
        {COPY.alsoToday}
      </Text>
      <ul className="flex flex-col">
        {sortForDisplay(items).map((item) => (
          <Row key={item.id} item={item} {...rowProps} />
        ))}
      </ul>
    </section>
  );
}
