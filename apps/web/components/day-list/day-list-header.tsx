"use client";

import * as React from "react";

import { DayHeader } from "@syn/ui";
import {
  formatCalendarDay,
  formatClock,
  weekdayForDayKey,
  zoneCityLabel,
} from "@syn/utils";

import { DayHeaderSheet } from "@/components/day-header-sheet";
import { useDeviceZone } from "@/lib/hooks/use-device-zone";
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
 *
 * THE ZONE LABEL IS COMPUTED HERE, from `useDeviceZone()` (SYS-2). It compares
 * the device with THIS DAY'S snapshot rather than with the stored zone, so a
 * past day lived in London still reads *times in London* after the person is
 * home — the label is about the record, not about travelling. `day.zoneLabel`
 * is the server's answer to the same question for a caller that knows the
 * device zone; the browser does not tell the server, so the client computes it
 * from the one hook and falls back to the server's when it has one.
 */
/** "Viewpoint · Work 9:00" — the day's focus and anchor. */
function headerLine(day: DayView): string {
  if (day.blocks.length === 0) return COPY.noTemplate;
  if (day.shape === "unstructured") return COPY.unstructured;
  const parts: string[] = [];
  if (day.focusLabel !== null) parts.push(day.focusLabel);
  if (day.anchor !== null) parts.push(COPY.workAt(day.anchor.clock, !day.anchor.isHard));
  return parts.length === 0 ? COPY.noTemplate : parts.join(" · ");
}

export function DayListHeader({ day }: { day: DayView }) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const deviceZone = useDeviceZone();
  const utils = trpc.useUtils();

  const zoneLabel =
    deviceZone === null
      ? day.zoneLabel
      : deviceZone === day.timezone
        ? null
        : COPY.zoneLabel(zoneCityLabel(day.timezone));

  return (
    <>
      <DayHeader
        dateLabel={formatCalendarDay(
          new Date(`${day.dateKey}T12:00:00Z`),
          "UTC",
          "long",
        )}
        // UX v1.1 §6.1 (R17): the focus and the anchor as a plain time —
        // *Viewpoint · Work 9:00*, *Work ~9:00* when soft; the tilde is the
        // whole difference. An unstructured day says so.
        templateName={headerLine(day)}
        wokeAtLabel={
          day.wokeAt === null
            ? null
            : COPY.wokeAt(formatClock(day.wokeAt, day.timezone))
        }
        shiftedMin={day.shiftedMin > 0 ? day.shiftedMin : null}
        zoneLabel={zoneLabel}
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
