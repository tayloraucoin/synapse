"use client";

import * as React from "react";

import { DayPartHeader, ItemRow, MultitaskGroup } from "@syn/ui";
import type { DayItemView, DayMode } from "@syn/types";
import type { DayPart } from "@syn/utils";

import { DAY_LIST_COPY as COPY } from "./copy";

/**
 * One day part and its rows.
 *
 * DEFERRED ROWS SINK TO THE BOTTOM OF THEIR PART and nowhere else. *Not today*
 * is a decision about this item, not about when it was scheduled — moving it
 * out of its part would lose the time it was meant to happen, which is the
 * thing a person is deciding against.
 *
 * MULTITASK MEMBERS ARE BRACKETED ONCE. The read model already orders them
 * adjacently, so consecutive rows sharing a start are wrapped in one group
 * rather than each announcing itself — "multitask" said twice about two things
 * happening at once is one time too many.
 *
 * PLAN MODE HAS NO CHECKBOXES. A future day is a plan; ticking something off
 * before it has happened is not a thing the product lets anyone do by accident
 * (cross-cutting §8.2).
 */
export function DaySection({
  part,
  span,
  items,
  mode,
  timeZone,
  hasUndo,
  onToggleDone,
  onUndo,
  onOpen,
}: {
  part: DayPart;
  span: { startLabel: string; endLabel: string } | null;
  items: readonly DayItemView[];
  mode: DayMode;
  timeZone: string;
  hasUndo: (id: string) => boolean;
  onToggleDone: (item: DayItemView) => void;
  onUndo: (item: DayItemView) => void;
  /** USE-3: opens the item sheet. */
  onOpen: (item: DayItemView) => void;
}) {
  const ordered = React.useMemo(() => sortForDisplay(items), [items]);
  const planMode = mode === "plan";

  return (
    <section>
      <DayPartHeader part={part} span={span ?? undefined} />
      <ul className="flex flex-col">
        {groupRuns(ordered).map((run) =>
          run.multitask ? (
            <MultitaskGroup key={run.key}>
              {run.items.map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  planMode={planMode}
                  timeZone={timeZone}
                  hasUndo={hasUndo}
                  onToggleDone={onToggleDone}
                  onUndo={onUndo}
                  onOpen={onOpen}
                />
              ))}
            </MultitaskGroup>
          ) : (
            run.items.map((item) => (
              <Row
                key={item.id}
                item={item}
                planMode={planMode}
                timeZone={timeZone}
                hasUndo={hasUndo}
                onToggleDone={onToggleDone}
                onUndo={onUndo}
                onOpen={onOpen}
              />
            ))
          ),
        )}
      </ul>
    </section>
  );
}

function Row({
  item,
  planMode,
  timeZone,
  hasUndo,
  onToggleDone,
  onUndo,
  onOpen,
}: {
  item: DayItemView;
  planMode: boolean;
  timeZone: string;
  hasUndo: (id: string) => boolean;
  onToggleDone: (item: DayItemView) => void;
  onUndo: (item: DayItemView) => void;
  onOpen: (item: DayItemView) => void;
}) {
  return (
    <ItemRow
      item={item}
      variant={planMode ? "read-only" : "default"}
      timeZone={timeZone}
      onToggleDone={planMode ? undefined : onToggleDone}
      // A plan-mode row opens read-only; the sheet decides what it offers.
      onOpen={onOpen}
      undo={
        hasUndo(item.id)
          ? { label: COPY.undo, onUndo: () => onUndo(item) }
          : undefined
      }
    />
  );
}

/**
 * Time order, with deferred rows last inside their own part.
 *
 * The sort is stable on three keys so two items at the same minute keep the
 * order the read model gave them — `sort_order` is what decides a tie, and a
 * comparison that fell through to zero would let the browser choose.
 */
function sortForDisplay(items: readonly DayItemView[]): DayItemView[] {
  return [...items].sort((a, b) => {
    const deferredA = a.state === "deferred" ? 1 : 0;
    const deferredB = b.state === "deferred" ? 1 : 0;
    if (deferredA !== deferredB) return deferredA - deferredB;

    const startA = a.scheduledStart?.getTime() ?? Number.POSITIVE_INFINITY;
    const startB = b.scheduledStart?.getTime() ?? Number.POSITIVE_INFINITY;
    return startA - startB;
  });
}

type Run = {
  key: string;
  multitask: boolean;
  items: DayItemView[];
};

/**
 * Consecutive rows that are part of one multitask bracket, as runs.
 *
 * `DayItemView` carries `multitask` as a POSITION (`first`/`middle`/`last`/
 * `none`) rather than a group id, so a run is opened by a `first` and closed
 * by a `last`. That is why this walks the list rather than grouping by a key:
 * the shape the view model publishes is an ordering, and reading it any other
 * way would be inventing a second grouping rule.
 */
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
