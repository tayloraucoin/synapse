"use client";

import { DayHeader } from "@syn/ui";
import { formatCalendarDay, formatClock, weekdayForDayKey } from "@syn/utils";

import type { RouterOutputs } from "@/lib/trpc/client";

import { DAY_LIST_COPY as COPY } from "./copy";

type DayView = RouterOutputs["day"]["get"];

/**
 * The day's header — the screen's one `h1`.
 *
 * EVERY LABEL IS FORMATTED IN THE DAY'S OWN ZONE, never the viewer's
 * (cross-cutting §7.3). A day lived in Vancouver still reads in Vancouver time
 * after the person flies to London; that is the entire reason `days.timezone`
 * is snapshotted on the row.
 *
 * `onOpen` IS UNDEFINED UNTIL USE-3. `DayHeader` renders a non-interactive
 * block without it rather than a button that does nothing, which is the
 * difference between a screen that is incomplete and one that is broken.
 */
export function DayListHeader({ day }: { day: DayView }) {
  return (
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
    />
  );
}
