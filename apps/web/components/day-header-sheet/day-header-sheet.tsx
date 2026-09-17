"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { ActionRowSheet, PickerList, ResponsiveSheet } from "@syn/ui";
import type { WorkDayMode, WorkDays } from "@syn/types";
import { formatCalendarDay, formatClock, weekdayIndex } from "@syn/utils";

import { AdjustSheet } from "@/components/adjust-sheet";
import { ITEM_COPY } from "@/components/item-sheet";
import { OneOffSheet } from "@/components/one-off-sheet";
import { SheetHost } from "@/components/page-frame";
import { dayScheduleRoute, todayScheduleRoute } from "@/lib/routes";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { DAY_HEADER_SHEET_COPY as COPY } from "./copy";
import { LibraryPickSheet } from "./library-pick-sheet";
import { WakeTimeSheet } from "./wake-time-sheet";

type DayView = RouterOutputs["day"]["get"];

/**
 * DH-01, amended — UX v1.1 §6.2: "An `ActionRowSheet` with five rows, in
 * this order: **Adjust the day** · **Set wake time** · **Add from the
 * library** · **Add a one-off** · **Edit today**. On a closed day: only
 * *Edit today* in record mode. On an unstructured day, *Add from the library*
 * is the primary way the day is built and appears first."
 *
 * THE SHIFT AND TRIM ROWS ARE GONE (DYN-17, deleted in DYN-21): Adjust is the
 * day's one reasoned mutation. * *Adjust the day* needs a set day that is not closed; *Edit today* opens the
 * Schedule in move mode — tap to lift, tap to drop — for people who cannot
 * hold a press (§10.4, DYN-16).
 */
export function DayHeaderSheet({
  open,
  day,
  onOpenChange,
  onChanged,
}: {
  open: boolean;
  day: DayView;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}) {
  const router = useRouter();
  const [wakeOpen, setWakeOpen] = React.useState(false);
  const [oneOffOpen, setOneOffOpen] = React.useState(false);
  const [libraryOpen, setLibraryOpen] = React.useState(false);
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [typeOpen, setTypeOpen] = React.useState(false);
  const me = trpc.user.me.useQuery(undefined, { enabled: open });
  const workTypes = trpc.template.list.useQuery({ includeArchived: false, kind: "work" }, { enabled: open || typeOpen });
  const applyWorkType = trpc.day.applyWorkType.useMutation();
  const removeType = trpc.day.removeWorkType.useMutation();
  const applyType = async (templateId: string) => {
    await applyWorkType.mutateAsync({ date: day.dateKey, templateId });
    setTypeOpen(false);
    onChanged?.();
  };

  const closed = day.closedAt !== null;
  const live = day.mode === "live";
  const unstructured = day.shape === "unstructured";

  const adjustRow = {
    label: COPY.adjustTheDay,
    onSelect: () => {
      onOpenChange(false);
      setAdjustOpen(true);
    },
    hidden: closed || !live || day.confirmedAt === null,
  };
  const wakeRow = {
    label: COPY.setWakeTime,
    onSelect: () => {
      onOpenChange(false);
      setWakeOpen(true);
    },
    hidden: day.mode === "plan",
  };
  const libraryRow = {
    label: COPY.addFromLibrary,
    onSelect: () => {
      onOpenChange(false);
      setLibraryOpen(true);
    },
    hidden: closed,
  };
  const oneOffRow = {
    label: COPY.addOneOff,
    onSelect: () => {
      onOpenChange(false);
      setOneOffOpen(true);
    },
    hidden: closed,
  };
  /*
   * UX v1.2 §3.9, R40, TD-19 (RUN-13): *Working today* on a *Rarely* day
   * — the work-day type onto a day that has none, and the reverse. Only on
   * a weekday the profile calls *rarely*; the weekday row is the account's.
   */
  const rarely = workModeFor(me.data?.workDays ?? null, day.dateKey) === "rarely";
  const hasWork = day.blocks.some((block) => block.kind === "work");
  const workingRow = {
    label: COPY.workingToday,
    onSelect: () => {
      onOpenChange(false);
      const types = workTypes.data ?? [];
      const only = types[0];
      if (types.length <= 1 && only !== undefined) void applyType(only.id);
      else setTypeOpen(true);
    },
    hidden: closed || !rarely || hasWork || day.mode === "record",
  };
  const notWorkingRow = {
    label: COPY.notWorkingAfterAll,
    onSelect: () => {
      onOpenChange(false);
      void removeType.mutateAsync({ date: day.dateKey }).then(() => onChanged?.());
    },
    hidden: closed || !rarely || !hasWork || day.mode === "record",
  };

  // §10.4's long-press fallback: the Schedule in move mode (DYN-16).
  const editRow = {
    label: COPY.editToday,
    onSelect: () => {
      onOpenChange(false);
      router.push(
        live ? todayScheduleRoute({ move: true }) : dayScheduleRoute(day.dateKey, { move: true }),
      );
    },
  };

  return (
    <>
      <ActionRowSheet
        open={open}
        onOpenChange={onOpenChange}
        title={formatCalendarDay(new Date(`${day.dateKey}T12:00:00Z`), "UTC", "long")}
        subtitle={subtitle(day)}
        closeLabel={COPY.close}
        rows={
          unstructured
            ? [libraryRow, workingRow, notWorkingRow, adjustRow, wakeRow, oneOffRow, editRow]
            : [workingRow, notWorkingRow, adjustRow, wakeRow, libraryRow, oneOffRow, editRow]
        }
      />

      {/* More than one work-day type: which one (v1.2 §3.9). */}
      <SheetHost open={typeOpen}>
        <ResponsiveSheet open={typeOpen} onOpenChange={setTypeOpen} title={COPY.workingToday}>
          <PickerList
            groups={[
              {
                heading: COPY.whichType,
                items: (workTypes.data ?? []).map((type) => ({
                  id: type.id,
                  title: type.name,
                  icon: type.workDayType?.icon ?? undefined,
                  meta:
                    type.workDayType?.startClock && type.workDayType.endClock
                      ? `${type.workDayType.startClock}–${type.workDayType.endClock}`
                      : undefined,
                })),
              },
            ]}
            value={null}
            onSelect={(id) => void applyType(id)}
            searchLabel={COPY.whichType}
            emptyText={COPY.noTypes}
            presentation="inline"
            className={applyWorkType.isPending ? "pointer-events-none opacity-50" : undefined}
          />
        </ResponsiveSheet>
      </SheetHost>

      <AdjustSheet
        open={adjustOpen}
        date={day.dateKey}
        entry="header"
        onOpenChange={setAdjustOpen}
        onApplied={onChanged}
      />

      <WakeTimeSheet
        open={wakeOpen}
        day={day}
        anchorHabitTitle={null}
        onOpenChange={setWakeOpen}
        onSaved={onChanged}
      />

      <LibraryPickSheet open={libraryOpen} day={day} onOpenChange={setLibraryOpen} onAdded={onChanged} />

      <OneOffSheet
        open={oneOffOpen}
        date={day.dateKey}
        allowDateChange
        onOpenChange={setOneOffOpen}
        onSaved={onChanged}
      />
    </>
  );
}

/** The profile's word for a date's weekday — Mon = "0". */
function workModeFor(workDays: WorkDays | null, dateKey: string): WorkDayMode {
  const weekday = weekdayIndex(dateKey);
  return workDays?.[String(weekday) as keyof WorkDays] ?? (weekday < 5 ? "always" : "never");
}

/** "Viewpoint · Work 9:00 · Woke 7:04" — and the close time when closed. */
function subtitle(day: DayView): string {
  const parts: string[] = [];

  if (day.focusLabel !== null) parts.push(day.focusLabel);
  if (day.anchor !== null) parts.push(`Work ${day.anchor.isHard ? "" : "~"}${day.anchor.clock}`);

  parts.push(
    day.wokeAt === null
      ? ITEM_COPY.wakeTimeNotSet
      : ITEM_COPY.woke(formatClock(day.wokeAt, day.timezone)),
  );

  if (day.closedAt !== null) {
    parts.push(ITEM_COPY.closedAt(formatClock(day.closedAt, day.timezone)));
  }

  return parts.join(" · ");
}
