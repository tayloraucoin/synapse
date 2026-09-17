"use client";

import * as React from "react";

import { Button, ConfirmDialog, DayHeader, StatusLine } from "@syn/ui";
import { formatCalendarDay } from "@syn/utils";

import { useOnline } from "@/lib/hooks/use-online";

import { QUICK_PICK_COPY as COPY } from "./copy";
import {
  BeforeWorkSection,
  FixturesSection,
  LastNightSection,
  PickError,
  RoutineSection,
  TrainingSection,
  WorkSection,
  WorkingTodaySection,
} from "./sections";
import { useQuickPick, type QuickPickView } from "./use-quick-pick";

/**
 * The quick-pick — UX v1.1 §5.3 (DYN-14): the Today tab in its unconfirmed
 * state (R6), not a modal. The tab bar is beneath it; the day header reads
 * the date and *Not set yet*; the body is a stack of sections, one per open
 * question, each already answered and collapsed to one row.
 *
 * "The common morning is a glance down four rows and one tap on *Set the
 * day*." Over budget is a question with two answers (R7), never a refusal;
 * the only thing that disables the primary is a workout with no time, which
 * is one chip away (§3.7).
 */
export function QuickPickHeader({ date }: { date: string }) {
  return (
    <DayHeader
      dateLabel={formatCalendarDay(new Date(`${date}T12:00:00Z`), "UTC", "long")}
      templateName={COPY.notSetYet}
      mode="live"
    />
  );
}

export function QuickPick({
  initial,
  timeZone,
  onSet,
  defaultExpanded = false,
}: {
  initial: QuickPickView;
  timeZone: string;
  onSet: () => Promise<void> | void;
  /** UX v1.2 §5.3 (RUN-13): *Build each morning* — every section open, the plan's choices preselected by the service. */
  defaultExpanded?: boolean;
}) {
  const online = useOnline();
  const pick = useQuickPick(initial, { onSet, defaultExpanded });
  const disabled = !online || pick.setting;
  const { view } = pick;

  const primaryLabel =
    pick.workoutUnplaced && pick.workout !== null
      ? COPY.chooseATime(pick.workout.title)
      : view.anchor !== null && (view.anchor.isHard || (view.work?.askAnchor && pick.anchorIsHard))
        ? COPY.setTheDayAt(view.anchor.clock)
        : COPY.setTheDay;

  return (
    <div className="flex flex-col gap-(--space-4) pb-(--space-8)">
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}

      <div className="flex flex-col">
        {view.lastNight.length > 0 ? <LastNightSection pick={pick} disabled={disabled} /> : null}
        {view.shape?.asked ? <WorkingTodaySection pick={pick} disabled={disabled} /> : null}
        {pick.structured ? (
          <>
            <RoutineSection pick={pick} disabled={disabled} />
            <BeforeWorkSection pick={pick} disabled={disabled} />
            <TrainingSection pick={pick} disabled={disabled} />
            <WorkSection pick={pick} disabled={disabled} />
          </>
        ) : null}
        <FixturesSection pick={pick} timeZone={timeZone} />
      </div>

      <PickError message={pick.error} />

      {/* Pinned, within thumb reach: one primary, one ghost (§5.3). */}
      <div className="bg-paper sticky bottom-0 flex flex-col gap-(--space-2) pt-(--space-3) pb-(--space-2)">
        <Button
          className="w-full"
          busy={pick.setting}
          disabled={disabled || pick.workoutUnplaced}
          onClick={() => void pick.set()}
        >
          {primaryLabel}
        </Button>
        {pick.structured ? (
          <Button variant="ghost" className="w-full" disabled={disabled} onClick={() => void pick.unstructured()}>
            {COPY.unstructuredToday}
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={pick.overOpen}
        onOpenChange={(next) => {
          if (!next) pick.setOverOpen(false);
        }}
        title={COPY.overTitle(pick.overMin)}
        description={pick.runsTo === null ? undefined : COPY.overBody(pick.runsTo, !(view.anchor?.isHard ?? true))}
        confirmLabel={COPY.setAnyway}
        cancelLabel={COPY.adjust}
        busy={pick.setting}
        onConfirm={() => void pick.set(true)}
        onCancel={() => {
          // *Adjust* returns to the list with *Shorten to fit* highlighted.
          pick.setOverOpen(false);
          pick.setAdjusting(true);
          if (!pick.open.has("routine")) pick.toggleOpen("routine");
        }}
      />
    </div>
  );
}
