"use client";

import type * as React from "react";
import Link from "next/link";
import type { WorkTier } from "@syn/types";
import { cn, HueSquare, Skeleton } from "@syn/ui";
import { TIER_HUE } from "@/components/work";
import type { WeekHead } from "@/lib/data/use-week-view";
import {
  NOTHING_SLOTTED,
  TIER_WORDS,
  type WeekDayView,
  type WeekView,
} from "@/lib/data/week-view";
import { itemSheetRoute, todayRoute } from "@/lib/routes";
import { WEEK_COPY as COPY } from "./copy";
import { EventChip, WorkChip } from "./week-chip";

/**
 * The Priority lens (USE-72, D-USE-41): a table, days as column headers and
 * tiers as row headers, so each cell reads "Tuesday, Primary". An 84 px
 * label column, then seven equal columns that shrink to about 120 px and then
 * scroll sideways (D-USE-94). Today's head is marked by its word and a line
 * in the now colour; a day with no Work block is one region, "No work
 * blocks". `view` null is loading: the heads and labels real, still skeleton
 * chips (A-14), the Fits line blank.
 */

const TIERS: WorkTier[] = ["urgent", "primary", "secondary", "stretch"];

/** The drawn row heights, grown by their tallest cell. */
const ROW_MIN: Record<"events" | WorkTier | "fits", string> = {
  events: "h-18",
  urgent: "h-30",
  primary: "h-50",
  secondary: "h-50",
  stretch: "h-30",
  fits: "h-12",
};

export interface PriorityLensProps {
  heads: WeekHead[];
  range: string;
  view: WeekView | null;
  /** The path under the sheet a chip opens, query kept. */
  here: string;
}

export function PriorityLens({ heads, range, view, here }: PriorityLensProps) {
  const days: (WeekDayView | null)[] = heads.map(
    (head) => view?.days.find((day) => day.dateKey === head.dateKey) ?? null,
  );
  const tiers = TIERS.filter((tier) => tier !== "urgent" || view?.hasUrgent);
  const bodyRows = tiers.length + 2;

  const dayCell = (
    day: WeekDayView | null,
    head: WeekHead,
    row: "events" | WorkTier,
  ) => {
    if (day && !day.hasWork) {
      if (row !== "events") return null;
      return (
        <td
          key={head.dateKey}
          rowSpan={bodyRows}
          className={cn(cellEdge, "p-2 align-top")}
        >
          <div className="flex flex-col gap-1">
            {day.events.map((event) => (
              <EventChip key={event.id} event={event} />
            ))}
            <span className="text-caption text-muted-foreground">
              {COPY.noWorkBlocks}
            </span>
          </div>
        </td>
      );
    }
    let content: React.ReactNode = null;
    if (day === null) {
      content =
        view === null && (row === "primary" || row === "secondary") ? (
          <>
            <Skeleton className="h-11 w-full" />
            {row === "primary" ? <Skeleton className="h-11 w-full" /> : null}
          </>
        ) : null;
    } else if (row === "events") {
      content = day.events.map((event) => (
        <EventChip key={event.id} event={event} />
      ));
    } else {
      content = day.cells[row].map((chip) => (
        <WorkChip
          key={chip.id}
          chip={chip}
          past={day.past}
          href={itemSheetRoute(here, chip.workItemId)}
        />
      ));
    }
    return (
      <td key={head.dateKey} className={cn(cellEdge, "p-2 align-top")}>
        <div className="flex flex-col gap-1">{content}</div>
      </td>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table
        aria-label={COPY.matrix(range)}
        className="w-full min-w-[calc(var(--week-label-w)+var(--week-col-min)*7)] table-fixed border-collapse"
      >
        <colgroup>
          <col className="w-(--week-label-w)" />
          {heads.map((head) => (
            <col key={head.dateKey} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-hairline">
            <td className="h-13" />
            {heads.map((head, index) => {
              const day = days[index];
              const hasWork = day?.hasWork ?? index < 5;
              return (
                <th
                  key={head.dateKey}
                  scope="col"
                  className={cn(
                    cellEdge,
                    "h-13 px-2.5 pt-2 text-left align-top font-normal",
                    head.isToday && "border-b-2 border-b-now",
                  )}
                >
                  <DayHead
                    head={head}
                    weekday={day?.weekday}
                    hasWork={hasWork}
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {(["events", ...tiers] as const).map((row) => (
            <tr key={row} className="border-b border-hairline">
              <th
                scope="row"
                className={cn(ROW_MIN[row], "pt-3 text-left align-top")}
              >
                <RowLabel row={row} />
              </th>
              {heads.map((head, index) => dayCell(days[index]!, head, row))}
            </tr>
          ))}
          <tr>
            <th
              scope="row"
              className={cn(ROW_MIN.fits, "text-left align-middle")}
            >
              <span className="text-label text-muted-foreground">
                {COPY.fits}
              </span>
            </th>
            {heads.map((head, index) => {
              const day = days[index];
              if (day && !day.hasWork) return null;
              return (
                <td
                  key={head.dateKey}
                  className={cn(cellEdge, "px-2.5 align-middle text-caption")}
                >
                  {day ? (
                    <span
                      className={
                        day.fits === NOTHING_SLOTTED
                          ? "text-text-muted"
                          : "text-muted-foreground"
                      }
                    >
                      {day.fits}
                    </span>
                  ) : null}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const cellEdge = "border-s border-hairline";

function RowLabel({ row }: { row: "events" | WorkTier }) {
  if (row === "events")
    return (
      <span className="text-label text-muted-foreground">{COPY.events}</span>
    );
  return (
    <span className="flex items-center gap-2 text-label font-semibold text-ink">
      <HueSquare hue={TIER_HUE[row]} />
      {TIER_WORDS[row]}
    </span>
  );
}

function DayHead({
  head,
  weekday,
  hasWork,
}: {
  head: WeekHead;
  weekday: string | undefined;
  hasWork: boolean;
}) {
  const word = (
    <span
      className={cn(
        "text-label",
        hasWork ? "font-semibold text-ink" : "text-muted-foreground",
        head.past && "text-muted-foreground",
      )}
    >
      {head.head}
      {hasWork ? "\u00a0\u00a0›" : null}
    </span>
  );
  return (
    <span className="flex flex-col items-start">
      {hasWork && weekday ? (
        // The opened day (USE-58): Today on that date, planning; today's is Today.
        <Link
          href={
            head.isToday ? todayRoute() : todayRoute({ date: head.dateKey })
          }
          aria-label={COPY.openDay(weekday)}
          className="rounded-(--radius-control) outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {word}
        </Link>
      ) : (
        word
      )}
      {head.isToday ? (
        <span className="text-caption text-link">{COPY.todayMark}</span>
      ) : null}
    </span>
  );
}
