"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { RegionRetry, Skeleton, Text } from "@syn/ui";
import { boundsEdge, clockMinutes, tappedSlot } from "@syn/utils";
import { DAY_COLUMN_PX_PER_HOUR, DayColumn } from "@/components/planner";
import {
  dayTitle,
  EDGE_LINE,
  railClock,
  setUpColumn,
  weekdayName,
} from "@/lib/data/set-up-view";
import { useDataSource } from "@/lib/data/source";
import { useSetUpColumnRead, type DaysPlace } from "@/lib/data/use-days";
import type { usePlannerWrites } from "@/lib/data/use-planner-writes";
import type { SetUpDay } from "@/lib/data/use-set-up-day";
import { useWeek } from "@/lib/data/use-week";
import { daysRoute, newBlockSheetRoute } from "@/lib/routes";
import { DAYS_COPY as COPY } from "./copy";
import {
  BoundsField,
  DayChips,
  DayMenuButton,
  PlusMenu,
  type DayChip,
} from "./day-parts";
import { DaysHeader } from "./days-header";

/**
 * A day (A; the-day.md, usual-saturday.md): "‹ Week" over its title, the
 * chips, the bounds row with the ···, then the column at 96 px an hour with
 * Orient locked at Up at and every block at its true times, and the + at
 * the foot. A day with nothing set holds the two bounds fields instead, and
 * no column or + until both are set (empty-first-day.md). The column is its
 * own read: loading and error stay in it while the rest paints.
 */
export interface DayViewProps {
  place: DaysPlace & { day: number };
  writes: ReturnType<typeof usePlannerWrites>;
  /** The header's SaveStatus, or null where it is absent. */
  save: React.ReactNode;
  onDay: (day: number) => void;
  /** The install offer, when it shows, bottom left beside the +. */
  offer: React.ReactNode;
}

type Bounds = { upAt: string; lightsOut: string };

const CHIP_LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export function DayView({ place, writes, save, onDay, offer }: DayViewProps) {
  const { week } = useWeek(place.week);
  const day = week?.days[place.day];
  const titleDay = { weekday: place.day, date: place.date };
  const column = useSetUpColumnRead(place.week, place.day);

  const chips: DayChip[] = Array.from({ length: 7 }, (_, weekday) => {
    const date = place.dates[weekday] ?? null;
    const n = date === null ? null : Number(date.slice(8));
    const name = weekdayName(weekday);
    return {
      weekday,
      label:
        n === null ? CHIP_LETTERS[weekday]! : `${CHIP_LETTERS[weekday]} ${n}`,
      name:
        date === null
          ? name
          : `${name} ${n} ${dayTitle({ weekday, date }).split(" ").at(-1)}`,
      set: week?.days[weekday]?.isSet ?? false,
    };
  });

  const regionQuiet = !column.isLoading && !column.isError;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DaysHeader
        crumb={{
          label: COPY.week,
          href: daysRoute({ week: place.week }),
          ariaLabel: COPY.backToWeek,
        }}
        title={dayTitle(titleDay)}
        save={regionQuiet ? save : null}
        // Focus lands on the title when the day opens, not as the chips move.
        focusKey="day"
      />
      <div className="pt-(--space-3)">
        <DayChips chips={chips} value={place.day} onChange={onDay} />
      </div>
      {day === undefined ? (
        <div
          aria-busy="true"
          className="flex flex-col gap-(--space-2) px-(--space-4) pt-(--space-4)"
        >
          <Skeleton className="h-9 w-full rounded-(--radius-control)" />
          <Skeleton className="h-60 w-full rounded-(--radius-control)" />
        </div>
      ) : !day.isSet ? (
        <FirstDay
          place={place}
          writes={writes}
          key={`${place.week}:${place.day}`}
        />
      ) : (
        <SetDay
          key={`${place.week}:${place.day}`}
          place={place}
          day={day}
          writes={writes}
          column={column}
          offer={offer}
        />
      )}
    </div>
  );
}

/** Where a bounds write goes: the weekday in the usual week, else the date. */
function boundsTarget(place: DaysPlace & { day: number }) {
  return place.date === null ? { weekday: place.day } : { onDate: place.date };
}

/**
 * The bounds as typed: a draft per field until the write lands, kept on a
 * failure (saved.md). Both are needed before anything is written, so a
 * suggestion is never saved as a time.
 */
function useBoundsDraft(
  place: DaysPlace & { day: number },
  saved: Bounds | null,
  writes: DayViewProps["writes"],
) {
  const [draft, setDraft] = React.useState<Partial<Bounds>>({});
  const latest = React.useRef(draft);
  const value = (field: keyof Bounds) => draft[field] ?? saved?.[field] ?? null;

  const commit = React.useCallback(
    (next: Partial<Bounds>) => {
      const merged = { ...latest.current, ...next };
      latest.current = merged;
      setDraft(merged);
      const upAt = merged.upAt ?? saved?.upAt;
      const lightsOut = merged.lightsOut ?? saved?.lightsOut;
      if (upAt === undefined || lightsOut === undefined) return;
      writes
        .writeBounds({ ...boundsTarget(place), upAt, lightsOut })
        .then(() => {
          latest.current = {};
          setDraft({});
        })
        .catch(() => {
          // Kept on screen; SaveStatus offers Try again.
        });
    },
    [place, saved, writes],
  );

  // A frame's edit made on load (`?state=`), once: Saving, Saved, Not saved.
  const { scenario } = useDataSource();
  const staged = scenario.setUp?.staged;
  const ran = React.useRef(false);
  React.useEffect(() => {
    if (ran.current || staged === undefined) return;
    if (scenario.setUp?.day !== place.day) return;
    ran.current = true;
    commit(staged);
  }, [staged, commit, scenario.setUp?.day, place.day]);

  return { value, commit };
}

/** Nothing set yet: the line, then Up at and Lights out labelled above, grey suggestions. */
function FirstDay({
  place,
  writes,
}: {
  place: DaysPlace & { day: number };
  writes: DayViewProps["writes"];
}) {
  const bounds = useBoundsDraft(place, null, writes);
  return (
    <div className="flex flex-col gap-(--space-6) border-t border-border px-(--space-4) pt-(--space-8) mt-(--space-3)">
      <div className="flex flex-col gap-(--space-1)">
        <Text as="h2" variant="body" weight={600}>
          {COPY.firstDayHeading}
        </Text>
        <Text as="p" variant="body" tone="muted">
          {COPY.firstDayBody}
        </Text>
      </div>
      <div className="flex gap-(--space-3)">
        <BoundsField
          stacked
          label={COPY.upAt}
          value={bounds.value("upAt")}
          suggestion={COPY.suggestUpAt}
          onCommit={(upAt) => bounds.commit({ upAt })}
        />
        <BoundsField
          stacked
          label={COPY.lightsOut}
          value={bounds.value("lightsOut")}
          suggestion={COPY.suggestLightsOut}
          onCommit={(lightsOut) => bounds.commit({ lightsOut })}
        />
      </div>
    </div>
  );
}

function SetDay({
  place,
  day,
  writes,
  column,
  offer,
}: {
  place: DaysPlace & { day: number };
  day: SetUpDay;
  writes: DayViewProps["writes"];
  column: ReturnType<typeof useSetUpColumnRead>;
  offer: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { scenario } = useDataSource();
  const start = scenario.setUp;
  const bounds = useBoundsDraft(place, day.bounds, writes);
  const [sheet] = useQueryStates({ sheet: parseAsString, at: parseAsString });

  // The column reads the bounds as typed, so Orient moves with Up at at once.
  const upAt = bounds.value("upAt");
  const lightsOut = bounds.value("lightsOut");
  const shown: SetUpDay =
    upAt !== null && lightsOut !== null
      ? {
          ...day,
          bounds: { upAt, lightsOut },
          blocks: day.blocks.map((b) => ({
            ...b,
            edge: boundsEdge(b, { upAt, lightsOut }),
          })),
        }
      : day;
  const view = setUpColumn(shown);

  const here = () => `${pathname}${window.location.search}`;
  const sheetAt = (at?: string, mode?: "transition") =>
    router.push(
      newBlockSheetRoute(here(), {
        week: place.week,
        day: place.day,
        ...(at ? { at } : {}),
        ...(mode ? { mode } : {}),
      }),
    );

  const spans = view.blocks.map((b) => ({
    startsAt: b.startsAt,
    endsAt: b.endsAt,
  }));
  const tapAt =
    sheet.sheet === "new-block" && sheet.at ? sheet.at : (start?.tapAt ?? null);
  const tapped =
    tapAt !== null && lightsOut !== null
      ? tappedSlot({ at: tapAt, blocks: spans, lightsOut })
      : null;

  // A frame that opens scrolled (`?state=`), once, on open.
  const scroller = React.useRef<HTMLDivElement>(null);
  const scrolled = React.useRef(false);
  const scrollTo = start?.scrollTo;
  const firstHour = view.hours.startMin;
  React.useEffect(() => {
    if (scrolled.current || !scrollTo || !scroller.current) return;
    scrolled.current = true;
    scroller.current.scrollTop =
      ((clockMinutes(scrollTo) - firstHour) / 60) * DAY_COLUMN_PX_PER_HOUR;
  }, [scrollTo, firstHour]);

  const ready = !column.isLoading && !column.isError;
  const dayName = weekdayName(place.day);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-(--space-2) border-b border-border px-(--space-4) py-(--space-3)">
        <BoundsField
          label={COPY.upAt}
          value={upAt}
          onCommit={(next) => bounds.commit({ upAt: next })}
        />
        <BoundsField
          label={COPY.lightsOut}
          value={lightsOut}
          onCommit={(next) => bounds.commit({ lightsOut: next })}
        />
        <span className="flex-1" />
        <DayMenuButton day={dayName} />
      </div>

      {view.allDay.map((b) => (
        <Text
          key={b.block.id}
          as="p"
          variant="secondary"
          tone="muted"
          className="border-b border-border px-(--space-4) py-(--space-2)"
        >
          {`All day · ${b.block.name}`}
        </Text>
      ))}

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto pb-24">
        <DayColumn
          hours={view.hours}
          orient={view.orient}
          blocks={
            ready
              ? view.blocks.map((b) => ({
                  ...b,
                  ...(b.outOfBounds
                    ? {
                        edge: {
                          line: EDGE_LINE[b.outOfBounds],
                          actionLabel: COPY.changeItsTime,
                          // Its Starts and Ends, the Block view's (D-USE-87) [ASSUMPTION].
                          onAction: () =>
                            router.push(
                              daysRoute({
                                week: place.week,
                                day: place.day,
                                block: b.id,
                              }),
                            ),
                        },
                      }
                    : {}),
                }))
              : []
          }
          openLines={ready ? view.openLines : []}
          tapped={ready ? tapped : null}
          onRail={
            ready
              ? (atMin) => {
                  const slot = tappedSlot({
                    at: railClock(atMin),
                    blocks: spans,
                    lightsOut: lightsOut ?? "24:00",
                  });
                  sheetAt(slot.startsAt);
                }
              : undefined
          }
          // A block opens its Block view, editing: its tickets' [ASSUMPTION: `&block=`].
          onBlock={(id) =>
            router.push(
              daysRoute({ week: place.week, day: place.day, block: id }),
            )
          }
          timeZone={scenario.records.timeZone}
        >
          {column.isLoading
            ? view.blocks.map((b) => (
                <Skeleton
                  key={b.id}
                  style={{
                    top: `${((clockMinutes(b.startsAt) - view.hours.startMin) / 60) * DAY_COLUMN_PX_PER_HOUR}px`,
                    height: `${((clockMinutes(b.endsAt) - clockMinutes(b.startsAt)) / 60) * DAY_COLUMN_PX_PER_HOUR - 4}px`,
                  }}
                  className="absolute start-10 end-0 rounded-(--radius-control)"
                />
              ))
            : null}
          {column.isError && view.orient !== null ? (
            <div
              style={{
                top: `${((view.orient.atMin - view.hours.startMin) / 60) * DAY_COLUMN_PX_PER_HOUR + 16}px`,
              }}
              className="absolute start-10 end-0"
            >
              <RegionRetry
                label={COPY.dayFailed}
                detail={COPY.dayFailedDetail}
                onRetry={() => void column.retry()}
                className="bg-background"
              />
            </div>
          ) : null}
        </DayColumn>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-(--space-3) px-(--space-4) pb-(--space-4)">
        <div className="pointer-events-auto min-w-0 flex-1">{offer}</div>
        <div className="pointer-events-auto shrink-0">
          <PlusMenu
            day={dayName}
            disabled={!ready}
            defaultOpen={start?.menu === "plus"}
            onBlock={() => sheetAt()}
            onTransition={() => sheetAt(undefined, "transition")}
          />
        </div>
      </div>
    </div>
  );
}
