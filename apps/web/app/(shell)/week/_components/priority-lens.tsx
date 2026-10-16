"use client";

import * as React from "react";
import Link from "next/link";
import type { WorkTier } from "@syn/types";
import { cn, HueSquare, Skeleton, useDropTarget } from "@syn/ui";
import { TIER_HUE } from "@/components/work";
import { PLACE_IDS } from "@/lib/data/place";
import type { WeekHead } from "@/lib/data/use-week-view";
import {
  NOTHING_SLOTTED,
  TIER_WORDS,
  type WeekDayView,
  type WeekView,
} from "@/lib/data/week-view";
import { itemSheetRoute, todayRoute } from "@/lib/routes";
import { AddToTierPopover } from "./add-to-tier-popover";
import { WEEK_COPY as COPY } from "./copy";
import type { WeekPlacing } from "./use-week-placing";
import { EventChip, LandedLine, WorkChip } from "./week-chip";

/**
 * The Priority lens (USE-72, D-USE-41): a table, days as column headers and
 * tiers as row headers, so each cell reads "Tuesday, Primary". An 84 px
 * label column, then seven equal columns that shrink to about 120 px and then
 * scroll sideways (D-USE-94). Today's head is marked by its word and a line
 * in the now colour; a day with no Work block is one region, "No work
 * blocks". `view` null is loading: the heads and labels real, still skeleton
 * chips (A-14), the Fits line blank. With `placing` (USE-75) each tier cell
 * takes a pool row or a chip dropped on it and offers "+ Add to <tier>".
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
  /** Placing from the pool (USE-75); without it the cells only show. */
  placing?: WeekPlacing;
}

export function PriorityLens({
  heads,
  range,
  view,
  here,
  placing,
}: PriorityLensProps) {
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
      return (
        <TierCell
          key={head.dateKey}
          day={day}
          tier={row}
          here={here}
          placing={placing}
        />
      );
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

/**
 * One day's tier (USE-75): a drop target for a pool row or a placed chip,
 * shaded while one is over it; its chips carry; the chip that just landed is
 * ringed with its line under it; "+ Add to <tier>" shows on hover and focus.
 */
function TierCell({
  day,
  tier,
  here,
  placing,
}: {
  day: WeekDayView;
  tier: WorkTier;
  here: string;
  placing: WeekPlacing | undefined;
}) {
  const drop = useDropTarget(PLACE_IDS.cell(day.dateKey, tier), {
    disabled: placing === undefined,
  });
  const chips = day.cells[tier];
  const landed =
    placing?.landed?.dateKey === day.dateKey ? placing.landed : null;
  const adding =
    placing?.adding?.dateKey === day.dateKey && placing.adding.tier === tier;
  return (
    <td
      ref={drop.ref}
      data-week-cell={`${day.dateKey}:${tier}`}
      className={cn(
        cellEdge,
        "group/cell p-2 align-top",
        // The drop target's shade; an empty cell shades on hover too, as drawn.
        drop.isOver
          ? "bg-fill-muted"
          : (chips.length === 0 || adding) &&
              placing &&
              "hover:bg-surface has-focus-visible:bg-surface",
        adding && "bg-surface",
      )}
    >
      <div className="flex flex-col gap-1">
        {chips.map((chip) => {
          const ringed = landed?.workItemId === chip.workItemId;
          return (
            <React.Fragment key={chip.id}>
              <WorkChip
                chip={chip}
                past={day.past}
                href={itemSheetRoute(here, chip.workItemId)}
                dragId={placing ? PLACE_IDS.chip(chip.id) : undefined}
                ringed={ringed}
              />
              {ringed && landed ? (
                <LandedLine
                  line={landed.line}
                  onUndo={landed.undo ? () => void placing?.undo() : null}
                  undoName={COPY.undoName(landed.line)}
                />
              ) : null}
            </React.Fragment>
          );
        })}
        {placing ? (
          <AddToTierPopover
            weekday={day.weekday}
            tier={tier}
            open={adding}
            onOpenChange={(open) =>
              placing.setAdding(open ? { dateKey: day.dateKey, tier } : null)
            }
            onPick={(from) =>
              placing.placeInCell(from, { dateKey: day.dateKey, tier })
            }
            onNewItem={(title) =>
              placing.openNewItem({ dateKey: day.dateKey, tier }, title)
            }
            initialQuery={placing.seededQuery}
          />
        ) : null}
      </div>
    </td>
  );
}

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

/** A day's head, both lenses': "Mon 12 ›" to the opened day, "today" on today. */
export function DayHead({
  head,
  weekday,
  hasWork,
  inline = false,
}: {
  head: WeekHead;
  weekday: string | undefined;
  hasWork: boolean;
  /** "today" beside the date (Time) rather than under it (Priority). */
  inline?: boolean;
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
    <span
      className={cn(
        "flex items-start",
        inline ? "flex-row items-baseline gap-(--space-2)" : "flex-col",
      )}
    >
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
