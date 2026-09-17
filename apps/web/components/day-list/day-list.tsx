"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  Button,
  DayCompleteAction,
  EmptyState,
  ExpanderSection,
  HelperText,
  ItemRow,
  RegionRetry,
  ScreenFrame,
  toastUndo,
} from "@syn/ui";
import { UNDO_LONG_MS } from "@syn/constants";
import { addDays, formatClock } from "@syn/utils";
import type { DayItemView } from "@syn/types";

import { AdjustSheet, type AdjustEntry } from "@/components/adjust-sheet";
import { ConfirmYesterdayPanel } from "@/components/confirm-yesterday";
import { DaySheet } from "@/components/week-build";
import { ItemSheet } from "@/components/item-sheet";
import { OneOffSheet } from "@/components/one-off-sheet";
import { usePullToRefresh } from "@/lib/hooks/use-pull-to-refresh";
import { useRovingFocus } from "@/lib/hooks/use-roving-focus";
import { journalRoute, reviewDayRoute } from "@/lib/routes";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { BlockSection, UnblockedSection } from "./block-section";
import { DAY_LIST_COPY as COPY } from "./copy";
import { useLanding, useScrollToItem } from "./use-landing";
import { useDayList } from "./use-day-list";

type DayView = RouterOutputs["day"]["get"];

/**
 * LS-00…03 — the day, top to bottom, in time order.
 *
 * NOTHING ON THIS SCREEN COUNTS THE DAY. No total, no remaining, no
 * percentage, no progress mark (official spec §2.4). The one number is the
 * count in each expander's heading, and that is a count of things HIDDEN, not
 * a grade — it exists so a collapsed section says how much it is hiding.
 *
 * THE TWO EXPANDERS ARE ABSENT WHEN EMPTY, not collapsed-and-empty. A line
 * reading *Not assigned today* on a day where everything is assigned is the
 * screen inventing a problem to report.
 *
 * *DAY COMPLETE* IS A LINK. The review does the closing (REV-2); a button here
 * that closed the day would be a second place the day can end.
 */
export function DayList({
  dateKey,
  initial,
}: {
  dateKey: string;
  initial: DayView;
}) {
  const router = useRouter();
  const list = useDayList(dateKey, initial);
  const { day } = list;
  const refreshing = usePullToRefresh(list.refresh);

  const [sheet, setSheet] = React.useState<
    "day-plan" | "one-off" | "adjust" | null
  >(null);
  const [adjustEntry, setAdjustEntry] = React.useState<AdjustEntry>("header");
  const [openItemId, setOpenItemId] = React.useState<string | null>(null);

  /** Every item on the day, in every place items live (v1.1: by block). */
  const allItems = React.useMemo(
    () => [
      ...day.blocks.flatMap((block) => block.items),
      ...day.unblocked,
      ...day.notAssigned,
      ...day.cutByShift,
    ],
    [day],
  );

  /*
   * A notification landing — USE-8's PN-01.
   *
   * `?sheet=item&id=…` opens the sheet, `?focus=…` only scrolls, and
   * `?action=done` marks the row done here with its undo rather than opening
   * anything. The params are read once and stripped from the address.
   */
  const landing = useLanding();
  const doneFired = React.useRef(false);

  React.useEffect(() => {
    if (landing.action !== "done" || landing.actionItemId === null) return;
    if (doneFired.current) return;

    // The item must be in the cache before the optimistic patch can find it.
    const item = allItems.find((candidate) => candidate.id === landing.actionItemId);
    if (!item) return;

    doneFired.current = true;
    list.toggleDone(item);
  }, [landing, allItems, list]);

  useScrollToItem(landing.focusId, !list.isError);

  /*
   * SYS-4 — arrows between rows in time order, `Space` to tick, `Enter` to
   * open, `s` for the timer. The hook moves focus and presses the row's own
   * controls; the timer is the one thing it cannot press, because the row has
   * no timer button — so the List, which has the mutations, handles it.
   */
  const listRef = React.useRef<HTMLDivElement>(null);

  useRovingFocus(listRef, {
    selector: "[data-item-row]",
    onToggleTimer: (element) => {
      const id = element.getAttribute("data-item-id");
      if (id === null) return;
      const item = allItems.find((candidate) => candidate.id === id);
      if (item === undefined) return;
      list.toggleTimer(item);
    },
  });

  /*
   * `?sheet=…` — how the chrome asks the page to open something.
   *
   * The status line (USE-6's late offer) and the keyboard host (SYS-4's `n`)
   * both sit ABOVE the page and have no `DayView` to hand a sheet, so they
   * navigate and this opens it. Read once and cleaned off the address, the same
   * way a notification landing is: a sheet that reopened on every back would be
   * the app asking a question the person already answered.
   */
  const search = useSearchParams();
  const sheetParam = search.get("sheet");
  const entryParam = search.get("entry");
  const dayKeyRoute = usePathname();
  const sheetConsumed = React.useRef(false);

  React.useEffect(() => {
    if (sheetConsumed.current) return;
    if (sheetParam !== "adjust" && sheetParam !== "one-off") return;
    sheetConsumed.current = true;
    // UX v1.1 §6.6: the late-wake offer arrives as `?sheet=adjust&entry=late-offer`.
    if (sheetParam === "adjust") setAdjustEntry(entryParam === "late-offer" ? "late-offer" : "header");
    setSheet(sheetParam);
    router.replace(dayKeyRoute, { scroll: false });
  }, [sheetParam, entryParam, router, dayKeyRoute]);

  React.useEffect(() => {
    // `?sheet=item&id=…` opens the sheet; `?focus=` deliberately does not.
    if (landing.action === "done") return;
    if (landing.focusId !== null && landing.actionItemId !== null) {
      setOpenItemId(landing.actionItemId);
    }
  }, [landing]);

  const isEmpty =
    day.blocks.length === 0 &&
    day.unblocked.length === 0 &&
    day.notAssigned.length === 0 &&
    day.cutByShift.length === 0;

  if (isEmpty) {
    return (
      <ScreenFrame padded={false}>
        <EmptyDay
          day={day}
          onPlan={() => setSheet("day-plan")}
          onOneOff={() => setSheet("one-off")}
          onRefresh={() => void list.refresh()}
        />
        <Sheets
          dateKey={dateKey}
          day={day}
          sheet={sheet}
          adjustEntry={adjustEntry}
          onClose={() => setSheet(null)}
          onSaved={() => void list.refresh()}
        />
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame padded={false}>
      {/*
       * Announced, not drawn. The document specifies the gesture but no
       * spinner, and a list that visibly jumps while someone is reading it is
       * the opposite of what a refresh is for.
       */}
      <span aria-live="polite" className="sr-only">
        {refreshing ? COPY.refreshing : ""}
      </span>

      {/* The roving-focus container — every `[data-item-row]` under it. */}
      <div ref={listRef} className="flex flex-col">

      {list.isError ? (
        <RegionRetry
          label={COPY.loadError}
          onRetry={() => void list.refresh()}
        />
      ) : null}

      {/* UX v1.2 §5.3 (RUN-13): the day set by the frame leaves last night for the list's first section. */}
      {day.mode === "live" && day.lastNight.length > 0 ? (
        <LastNightSection dateKey={dateKey} items={day.lastNight} onResolved={() => void list.refresh()} />
      ) : null}

      {/* UX v1.1 §6.1 (R20): sectioned by block, in block order. */}
      {day.blocks.map((block) => (
        <BlockSection
          key={block.id}
          block={block}
          focusLabel={day.focusLabel}
          devicesOffAt={day.devicesOffAt}
          mode={day.mode}
          timeZone={day.timezone}
          hasUndo={list.hasUndo}
          onToggleDone={list.toggleDone}
          onUndo={list.undoRow}
          onOpen={(item) => setOpenItemId(item.id)}
          onOpenJournal={() => router.push(journalRoute(dateKey))}
        />
      ))}

      <UnblockedSection
        items={day.unblocked}
        mode={day.mode}
        timeZone={day.timezone}
        hasUndo={list.hasUndo}
        onToggleDone={list.toggleDone}
        onUndo={list.undoRow}
        onOpen={(item) => setOpenItemId(item.id)}
      />

      {day.notAssigned.length === 0 ? null : (
        <ExpanderSection
          heading={`${day.notAssigned.length} ${COPY.notAssigned.toLowerCase()}`}
          explanation={COPY.notAssignedExplanation(day.capacityMin ?? 0)}
        >
          <ul className="flex flex-col">
            {day.notAssigned.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                variant="faded-with-action"
                timeZone={day.timezone}
                action={{
                  label: COPY.bringBack,
                  onClick: list.onBringBack,
                }}
              />
            ))}
          </ul>
        </ExpanderSection>
      )}

      {day.cutByShift.length === 0 ? null : (
        <ExpanderSection
          heading={`${day.cutByShift.length} ${COPY.cutWhenShifted.toLowerCase()}`}
          explanation={cutExplanation(day)}
        >
          <ul className="flex flex-col">
            {day.cutByShift.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                variant="faded-with-action"
                timeZone={day.timezone}
                action={{
                  label: COPY.doItAnyway,
                  onClick: list.onDoAnyway,
                }}
              />
            ))}
          </ul>
        </ExpanderSection>
      )}

      </div>

      {list.error === null ? null : (
        <div className="px-(--space-4)">
          <HelperText error>{list.error}</HelperText>
        </div>
      )}

      {/* A plan is not a day to close. */}
      {day.mode === "plan" ? null : (
        <DayCompleteAction
          closedAtLabel={
            day.closedAt === null
              ? null
              : COPY.dayClosedAt(formatClock(day.closedAt, day.timezone))
          }
          // `?from=list` so *Finish later* and DR-07's *Done* come back here
          // rather than to the Review tab (REV-2).
          reviewHref={`${reviewDayRoute(day.dateKey)}?from=list`}
          onComplete={() =>
            router.push(`${reviewDayRoute(day.dateKey)}?from=list`)
          }
        />
      )}

      <Sheets
        dateKey={dateKey}
        day={day}
        sheet={sheet}
        adjustEntry={adjustEntry}
        onClose={() => setSheet(null)}
        onSaved={() => void list.refresh()}
      />

      <ItemSheet
        open={openItemId !== null}
        itemId={openItemId}
        dayKey={dateKey}
        // Only when the landing asked for it, and only for that item.
        autoStart={
          landing.action === "start" && landing.actionItemId === openItemId
        }
        onOpenChange={(next) => {
          if (!next) setOpenItemId(null);
        }}
      />
    </ScreenFrame>
  );
}

/**
 * Last night, as the list's first section — UX v1.2 §5.3, v1.1 §7.3, R16
 * (RUN-13). Under *Set from the plan* the frame set today and left
 * yesterday's after-phone-away rows unanswered; the same panel the pick and
 * the review use, collapsible, with its own *Confirm*: ticked rows are
 * written done, the rest *not confirmed*, and the section is gone. Nothing
 * is pre-ticked; the section reports no count.
 */
function LastNightSection({
  dateKey,
  items,
  onResolved,
}: {
  dateKey: string;
  items: readonly DayItemView[];
  onResolved: () => void;
}) {
  const confirm = trpc.review.confirmLastNight.useMutation();
  const [ticked, setTicked] = React.useState<Set<string>>(() => new Set());
  const [error, setError] = React.useState<string | null>(null);

  return (
    <ExpanderSection heading={COPY.lastNight} explanation={COPY.lastNightExplanation} open>
      <div className="flex flex-col gap-(--space-3) px-(--space-4) pb-(--space-3)">
        <ConfirmYesterdayPanel
          items={items}
          ticked={ticked}
          showCaption={false}
          disabled={confirm.isPending}
          onToggle={(id, on) =>
            setTicked((current) => {
              const next = new Set(current);
              if (on) next.add(id);
              else next.delete(id);
              return next;
            })
          }
        />
        {error ? <HelperText error>{error}</HelperText> : null}
        <Button
          variant="secondary"
          busy={confirm.isPending}
          className="w-full wide:w-auto wide:self-start"
          onClick={() => {
            setError(null);
            void confirm
              .mutateAsync({ date: addDays(dateKey, -1), doneItemIds: Array.from(ticked) })
              .then(onResolved)
              .catch(() => setError(COPY.lastNightError));
          }}
        >
          {COPY.confirmLastNight}
        </Button>
      </div>
    </ExpanderSection>
  );
}

/**
 * LS-00 — an unplanned day, and the doors out of it.
 *
 * *APPLY {name}* IS ONLY OFFERED WITH HISTORY and only in live or plan mode.
 * On a past day there is nothing to plan: applying a template to yesterday
 * would write a plan for a day that has already been lived, which is the one
 * thing record mode exists to prevent.
 */
function EmptyDay({
  day,
  onPlan,
  onOneOff,
  onRefresh,
}: {
  day: DayView;
  onPlan: () => void;
  onOneOff: () => void;
  onRefresh: () => void;
}) {
  const utils = trpc.useUtils();
  const suggestion = trpc.week.mostUsedTemplate.useQuery(undefined, {
    enabled: day.mode !== "record",
  });
  const apply = trpc.week.applyTemplate.useMutation();
  const remove = trpc.week.removeTemplate.useMutation();

  if (day.mode === "record") {
    return (
      <EmptyState density="page" text={COPY.nothingWasPlanned} actions={[]} />
    );
  }

  const template = suggestion.data;

  const actions = [
    { label: COPY.planThisDay, onClick: onPlan },
    { label: COPY.addOneOff, onClick: onOneOff },
    ...(template
      ? [
          {
            label: COPY.applyTemplate(template.name),
            onClick: () => {
              void apply
                .mutateAsync({ date: day.dateKey, templateId: template.id })
                .then(async () => {
                  await utils.day.get.invalidate({ date: day.dateKey });
                  onRefresh();
                  // Ten seconds, not five: this applied a whole day, and
                  // undoing it is a bigger decision than un-ticking a row.
                  toastUndo({
                    text: COPY.appliedTemplate(template.name),
                    durationMs: UNDO_LONG_MS,
                    onUndo: () => {
                      void remove
                        .mutateAsync({ date: day.dateKey })
                        .then(async () => {
                          await utils.day.get.invalidate({
                            date: day.dateKey,
                          });
                          onRefresh();
                        });
                    },
                  });
                });
            },
          },
        ]
      : []),
  ];

  return (
    <EmptyState density="page" text={COPY.nothingPlanned} actions={actions} />
  );
}

/**
 * The two doors SET-6 built, mounted here.
 *
 * They are rendered only while open rather than always: each fetches its own
 * data on mount, and two sheets querying templates and habits behind an empty
 * day would be two requests for screens nobody has asked for.
 */
function Sheets({
  dateKey,
  day,
  sheet,
  adjustEntry,
  onClose,
  onSaved,
}: {
  dateKey: string;
  day: DayView | null;
  sheet: "day-plan" | "one-off" | "adjust" | null;
  adjustEntry: AdjustEntry;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <>
      {sheet === "day-plan" ? (
        <DaySheet
          open
          date={dateKey}
          onOpenChange={(next) => {
            if (!next) onClose();
          }}
          onChanged={onSaved}
        />
      ) : null}

      {sheet === "one-off" ? (
        <OneOffSheet
          open
          date={dateKey}
          allowDateChange
          onOpenChange={(next) => {
            if (!next) onClose();
          }}
          onSaved={onSaved}
        />
      ) : null}

      {/*
       * Adjust (UX v1.1 §6.6, DYN-17), opened by the late-wake offer's
       * `?sheet=adjust&entry=late-offer`. The status line is chrome above the
       * page and has no day to hand the sheet, so it navigates and the page —
       * which does — opens it.
       */}
      {sheet === "adjust" && day !== null ? (
        <AdjustSheet
          open
          date={dateKey}
          entry={adjustEntry}
          onOpenChange={(next) => {
            if (!next) onClose();
          }}
          onApplied={onSaved}
        />
      ) : null}
    </>
  );
}

/** "Shifted +45 min at 10:20 — Something came up." */
function cutExplanation(day: DayView): string {
  const shift = day.shifts.at(-1);
  if (!shift) return COPY.notAssignedExplanation(day.capacityMin ?? 0);
  return COPY.cutExplanation(
    shift.deltaMin,
    formatClock(shift.at, day.timezone),
    shift.reasonLabel ?? "",
  );
}
