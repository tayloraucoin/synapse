"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
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
import { formatClock } from "@syn/utils";

import { DaySheet } from "@/components/week-build";
import { ItemSheet } from "@/components/item-sheet";
import { OneOffSheet } from "@/components/one-off-sheet";
import { usePullToRefresh } from "@/lib/hooks/use-pull-to-refresh";
import { reviewDayRoute } from "@/lib/routes";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { DAY_LIST_COPY as COPY } from "./copy";
import { DaySection } from "./day-section";
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

  const [sheet, setSheet] = React.useState<"day-plan" | "one-off" | null>(null);
  const [openItemId, setOpenItemId] = React.useState<string | null>(null);

  const isEmpty =
    day.parts.length === 0 &&
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
          sheet={sheet}
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

      {list.isError ? (
        <RegionRetry
          label={COPY.loadError}
          onRetry={() => void list.refresh()}
        />
      ) : null}

      {day.parts.map((part) => (
        <DaySection
          key={part.part}
          part={part.part}
          span={part.span}
          items={part.items}
          mode={day.mode}
          timeZone={day.timezone}
          hasUndo={list.hasUndo}
          onToggleDone={list.toggleDone}
          onUndo={list.undoRow}
          onOpen={(item) => setOpenItemId(item.id)}
        />
      ))}

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
          reviewHref={reviewDayRoute(day.dateKey)}
          onComplete={() => router.push(reviewDayRoute(day.dateKey))}
        />
      )}

      <Sheets
        dateKey={dateKey}
        sheet={sheet}
        onClose={() => setSheet(null)}
        onSaved={() => void list.refresh()}
      />

      <ItemSheet
        open={openItemId !== null}
        itemId={openItemId}
        dayKey={dateKey}
        onOpenChange={(next) => {
          if (!next) setOpenItemId(null);
        }}
      />
    </ScreenFrame>
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
  sheet,
  onClose,
  onSaved,
}: {
  dateKey: string;
  sheet: "day-plan" | "one-off" | null;
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
