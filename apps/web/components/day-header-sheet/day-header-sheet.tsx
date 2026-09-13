"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { ActionRowSheet } from "@syn/ui";
import { formatCalendarDay, formatClock } from "@syn/utils";

import { AdjustSheet } from "@/components/adjust-sheet";
import { ITEM_COPY } from "@/components/item-sheet";
import { OneOffSheet } from "@/components/one-off-sheet";
import { dayScheduleRoute, todayScheduleRoute } from "@/lib/routes";
import type { RouterOutputs } from "@/lib/trpc/client";

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
 * THE SHIFT AND TRIM ROWS ARE GONE (DYN-17): Adjust is the day's one
 * reasoned mutation; their sheets stay on disk until DYN-21 deletes them.
 * *Adjust the day* needs a set day that is not closed; *Edit today* opens the
 * Schedule, where the drag layer lives (DYN-16).
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
  const editRow = {
    label: COPY.editToday,
    onSelect: () => {
      onOpenChange(false);
      router.push(live ? todayScheduleRoute() : dayScheduleRoute(day.dateKey));
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
            ? [libraryRow, adjustRow, wakeRow, oneOffRow, editRow]
            : [adjustRow, wakeRow, libraryRow, oneOffRow, editRow]
        }
      />

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

/** "Viewpoint · Work 9:00 · Woke 7:04" — and the close time when closed. */
function subtitle(day: DayView): string {
  const parts: string[] = [];

  if (day.focusLabel !== null) parts.push(day.focusLabel);
  if (day.anchor !== null) parts.push(`Work ${day.anchor.isHard ? "" : "~"}${day.anchor.clock}`);
  else if (day.templateName !== null) parts.push(day.templateName);

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
