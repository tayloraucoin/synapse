"use client";

import * as React from "react";

import { DayHeader } from "@syn/ui";
import { formatCalendarDay, formatClock, weekdayForDayKey } from "@syn/utils";

import { DayHeaderSheet } from "@/components/day-header-sheet";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { DAY_LIST_COPY as COPY } from "./copy";

type DayView = RouterOutputs["day"]["get"];

/**
 * The day's header — the screen's one `h1`, and (USE-3) the door to DH-01.
 *
 * EVERY LABEL IS FORMATTED IN THE DAY'S OWN ZONE, never the viewer's
 * (cross-cutting §7.3). A day lived in Vancouver still reads in Vancouver time
 * after the person flies to London; that is the entire reason `days.timezone`
 * is snapshotted on the row.
 *
 * THE WHOLE REGION IS THE CONTROL (Epic 2 DH-01) rather than a button beside
 * the title. There is one thing to do here and it is "tell me about this day",
 * so the thing that says which day it is opens it.
 *
 * A PLAN DAY DOES NOT OPEN. DH-01's rows are about a day being lived — a wake
 * time, a shift, a trim — and none of them mean anything about next Thursday.
 */
export function DayListHeader({ day }: { day: DayView }) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const utils = trpc.useUtils();

  return (
    <>
      <DayHeader
        dateLabel={formatCalendarDay(
          new Date(`${day.dateKey}T12:00:00Z`),
          "UTC",
          "long",
        )}
        templateName={day.templateName ?? COPY.noTemplate}
        wokeAtLabel={
          day.wokeAt === null
            ? null
            : COPY.wokeAt(formatClock(day.wokeAt, day.timezone))
        }
        shiftedMin={day.shiftedMin > 0 ? day.shiftedMin : null}
        zoneLabel={day.zoneLabel}
        notUntilWeekday={
          day.mode === "plan" ? weekdayForDayKey(day.dateKey) : null
        }
        mode={day.mode}
        onOpen={day.mode === "plan" ? undefined : () => setSheetOpen(true)}
      />

      <DayHeaderSheet
        open={sheetOpen}
        day={day}
        onOpenChange={setSheetOpen}
        onChanged={() => {
          void utils.day.get.invalidate({ date: day.dateKey });
        }}
      />
    </>
  );
}
