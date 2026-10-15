"use client";

import type * as React from "react";
import { DeskDay } from "./desk-day";
import { DeskStrip } from "./desk-strip";
import { OpenedDay } from "./opened-day";
import { useShownDate } from "./use-shown-date";

/**
 * The desk's Today frame (USE-58; today/index.md, C-USE-today-1): the week
 * strip across the top, then the main column (720) and the day column (340)
 * 48 px apart, the content (1108) centred right of the rail. From 1024 the
 * day column keeps 340 and the main column shrinks; under 1728 the strip
 * scrolls sideways. Desk-only: the page mounts it inside `hidden split:flex`,
 * switched in CSS, never by a width read (D-USE-55).
 *
 * `main` is today's main column (USE-57's); another date (`?date=`) shows
 * the opened day in its place, planning (D-USE-41).
 */
export function TodayDesk({ main }: { main: React.ReactNode }) {
  const { todayKey, dateKey, opened } = useShownDate();
  return (
    <div className="flex flex-col">
      <div className="border-b border-border px-(--space-6) py-(--space-4)">
        <div className="mx-auto w-full max-w-(--desk-w)">
          <DeskStrip dateKey={dateKey} todayKey={todayKey} />
        </div>
      </div>
      <div className="px-(--space-6) py-(--space-8)">
        <div className="mx-auto flex w-full max-w-(--desk-w) gap-(--space-12)">
          <div className="min-w-0 max-w-(--content-text) flex-1">
            {opened ? <OpenedDay key={dateKey} dateKey={dateKey} /> : main}
          </div>
          <DeskDay
            dateKey={dateKey}
            isToday={!opened}
            className="w-(--day-col-w) shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
