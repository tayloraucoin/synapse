"use client";

import * as React from "react";

import { ActionRowSheet } from "@syn/ui";
import { formatCalendarDay, formatClock } from "@syn/utils";

import { ITEM_COPY as COPY } from "@/components/item-sheet";
import { OneOffSheet } from "@/components/one-off-sheet";
import { ShiftSheet } from "@/components/shift-sheet";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { WakeTimeSheet } from "./wake-time-sheet";

type DayView = RouterOutputs["day"]["get"];

/**
 * DH-01 — the four things you can do to a day.
 *
 * ONE ROW IS STILL HIDDEN. *I have less time today* arrives with USE-7; a
 * greyed row for a feature that does not exist is a promise the product has not
 * made, and `ActionRowSheet` filters `hidden` rows out entirely rather than
 * dimming them. *Shift my day* is live as of USE-6.
 *
 * A CLOSED DAY LOSES BOTH ANYWAY. Trimming or shifting a day that has ended is
 * not something anyone can mean.
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
  const [wakeOpen, setWakeOpen] = React.useState(false);
  const [oneOffOpen, setOneOffOpen] = React.useState(false);
  const [shiftOpen, setShiftOpen] = React.useState(false);

  // Only to name the habit in DH-02's *set by* line.
  const habits = trpc.habit.list.useQuery(
    { includeArchived: true },
    { enabled: open && day.wokeAtSource === "anchor" },
  );
  const anchorTitle =
    habits.data?.habits.find((habit) => habit.isWakeAnchor)?.title ?? null;

  const closed = day.closedAt !== null;

  return (
    <>
      <ActionRowSheet
        open={open}
        onOpenChange={onOpenChange}
        title={formatCalendarDay(
          new Date(`${day.dateKey}T12:00:00Z`),
          "UTC",
          "long",
        )}
        subtitle={subtitle(day)}
        closeLabel={COPY.close}
        rows={[
          {
            label: COPY.setWakeTime,
            onSelect: () => {
              onOpenChange(false);
              setWakeOpen(true);
            },
          },
          // USE-7.
          { label: COPY.lessTimeToday, onSelect: () => undefined, hidden: true },
          {
            label: COPY.shiftMyDay,
            onSelect: () => {
              onOpenChange(false);
              setShiftOpen(true);
            },
            hidden: closed,
          },
          {
            label: COPY.addOneOff,
            onSelect: () => {
              onOpenChange(false);
              setOneOffOpen(true);
            },
            hidden: closed,
          },
        ]}
      />

      <ShiftSheet
        open={shiftOpen}
        day={day}
        onOpenChange={setShiftOpen}
        onShifted={onChanged}
      />

      <WakeTimeSheet
        open={wakeOpen}
        day={day}
        anchorHabitTitle={anchorTitle}
        onOpenChange={setWakeOpen}
        onSaved={onChanged}
      />

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

/** "Morning · starts 7:00 · Woke 7:04" — and the close time when closed. */
function subtitle(day: DayView): string {
  const parts: string[] = [];

  if (day.templateName !== null) parts.push(day.templateName);
  if (day.anchorTime !== null) parts.push(COPY.startsAt(day.anchorTime));

  parts.push(
    day.wokeAt === null
      ? COPY.wakeTimeNotSet
      : COPY.woke(formatClock(day.wokeAt, day.timezone)),
  );

  if (day.closedAt !== null) {
    parts.push(COPY.closedAt(formatClock(day.closedAt, day.timezone)));
  }

  return parts.join(" · ");
}
