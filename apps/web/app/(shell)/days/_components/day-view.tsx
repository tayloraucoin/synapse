"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { UNDO_SHORT_MS } from "@syn/constants";
import { RegionRetry, Skeleton, Text, toast } from "@syn/ui";
import {
  boundsEdge,
  clockFromMinutes,
  clockMinutes,
  tappedSlot,
  weekKeyOf,
} from "@syn/utils";
import {
  DAY_COLUMN_PX_PER_HOUR,
  DayColumn,
  OfflineLine,
} from "@/components/planner";
import { TIER_HUE } from "@/components/work";
import {
  clearWords,
  dayTitle,
  EDGE_LINE,
  railClock,
  reachWords,
  resetWords,
  setUpColumn,
  weekdayName,
} from "@/lib/data/set-up-view";
import { useDataSource } from "@/lib/data/source";
import { useSetUpColumnRead, type DaysPlace } from "@/lib/data/use-days";
import type { usePlannerWrites } from "@/lib/data/use-planner-writes";
import type { SetUpDay } from "@/lib/data/use-set-up-day";
import { useWeek } from "@/lib/data/use-week";
import {
  ABOVE_FOOTER_TOASTER,
  AboveFooterToaster,
  useUndoToast,
} from "@/lib/hooks/use-undo-toast";
import { daysRoute, newBlockSheetRoute } from "@/lib/routes";
import { DAYS_COPY as COPY } from "./copy";
import {
  BoundsField,
  ClearDialog,
  DayChips,
  DayMenu,
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
 *
 * USE-42: in the 1024 day pane (`pane`) the chips and "‹ Week" drop, since
 * the week beside it does their job; the ··· holds Copy from…, Reset to
 * usual and Clear this day; a held block drags in time, and an overlap
 * shows side by side with its one fix; a usual change names its reach in a
 * Toaster; offline the day's own controls are faded and inert and the +
 * gives way to the StatusLine (D-USE-82). Reach, overlaps and own changes
 * come from the set-up hooks.
 */
export interface DayViewProps {
  place: DaysPlace & { day: number };
  writes: ReturnType<typeof usePlannerWrites>;
  /** The header's SaveStatus, or null where it is absent. */
  save: React.ReactNode;
  onDay: (day: number) => void;
  /** The install offer, when it shows, bottom left beside the +. */
  offer: React.ReactNode;
  /** The 1024 day pane: no chips, no crumb (the-day.md). */
  pane?: boolean;
}

type Bounds = { upAt: string; lightsOut: string };
/** What a planner write hands back: its Undo, and a usual change's reach. */
type PlannerWrite = Awaited<
  ReturnType<DayViewProps["writes"]["editBlock"]>
>;

const CHIP_LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export function DayView({
  place,
  writes,
  save,
  onDay,
  offer,
  pane = false,
}: DayViewProps) {
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
        crumb={
          pane
            ? null
            : {
                label: COPY.week,
                href: daysRoute({ week: place.week }),
                ariaLabel: COPY.backToWeek,
              }
        }
        title={dayTitle(titleDay)}
        save={regionQuiet ? save : null}
        // Focus lands on the title when the day opens, not as the chips move.
        focusKey="day"
      />
      {pane ? null : (
        <div className="pt-(--space-3)">
          <DayChips chips={chips} value={place.day} onChange={onDay} />
        </div>
      )}
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

/** The open day as the words read it. */
function titleOf(place: DaysPlace & { day: number }) {
  return { weekday: place.day, date: place.date };
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
  const offline = !writes.online;
  const undoToast = useUndoToast();
  const hold = start?.day === place.day && start?.holdToast === true;
  // The block just changed (ringed) and the one just moved (the ink edge).
  const [changed, setChanged] = React.useState<string | null>(null);
  const [moved, setMoved] = React.useState<string | null>(
    start?.day === place.day ? (start.moved ?? null) : null,
  );
  const [clearing, setClearing] = React.useState(false);

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
  const ref =
    place.date === null ? { weekday: place.day } : { date: place.date };

  /** A usual change names its reach (D-USE-33); See it opens the date that follows. */
  const showReach = (write: PlannerWrite, blockId: string) => {
    setChanged(blockId);
    if (!write.reach) return;
    const { follows, weekday } = write.reach;
    const blockName =
      day.blocks.find((b) => b.block.id === blockId)?.block.name ?? "";
    toast(reachWords({ blockName, weekday, follows }), {
      toasterId: ABOVE_FOOTER_TOASTER,
      duration: hold ? Infinity : UNDO_SHORT_MS,
      ...(follows !== null
        ? {
            action: {
              label: COPY.seeIt,
              onClick: () =>
                router.push(
                  daysRoute({ week: weekKeyOf(follows), day: follows }),
                ),
            },
          }
        : {}),
    });
  };

  /**
   * One block to new times, nothing else moved (D-USE-33): in This week the
   * date's change, never the usual block; in the usual week the block, with
   * its reach named.
   */
  const moveTo = (blockId: string, startMin: number) => {
    const b = day.blocks.find((x) => x.block.id === blockId);
    if (!b) return;
    const length = clockMinutes(b.endsAt) - clockMinutes(b.startsAt);
    const from = Math.max(0, Math.min(24 * 60 - length, startMin));
    const startsAt = clockFromMinutes(from);
    const endsAt = clockFromMinutes(from + length);
    setMoved(blockId);
    if (place.date !== null && b.block.rrule !== null) {
      void writes
        .writeBlockChange({ blockId, onDate: place.date, startsAt, endsAt })
        .catch(() => {});
    } else if (place.date !== null) {
      void writes.editBlock({ id: blockId, startsAt, endsAt }).catch(() => {});
    } else {
      void writes
        .editBlock({ id: blockId, startsAt, endsAt }, { weekday: place.day })
        .then((write) => showReach(write, blockId))
        .catch(() => {});
    }
  };

  const reset = () => {
    if (place.date === null) return;
    void writes
      .resetDay({ date: place.date })
      .then((write) =>
        undoToast({
          text: resetWords(titleOf(place)),
          onUndo: () => void writes.undo(write.undo),
        }),
      )
      .catch(() => {});
  };
  const clearWordsNow = clearWords(day);
  const clear = () => {
    setClearing(false);
    void writes
      .clearDay(ref)
      .then((write) =>
        undoToast({
          text: clearWordsNow.done,
          onUndo: () => void writes.undo(write.undo),
          ...(hold ? { durationMs: Infinity } : {}),
        }),
      )
      .catch(() => {});
  };

  // A usual change made in a block (its Block view), arriving on load (`?state=`).
  const staged = React.useRef(false);
  const reachRef = React.useRef(showReach);
  reachRef.current = showReach;
  const reachOf = start?.day === place.day ? start.reach : undefined;
  React.useEffect(() => {
    if (staged.current || reachOf === undefined || place.date !== null) return;
    const b = day.blocks.find((x) => x.block.id === reachOf);
    if (!b) return;
    staged.current = true;
    void writes
      .editBlock(
        { id: b.block.id, startsAt: b.startsAt },
        { weekday: place.day },
      )
      .then((write) => reachRef.current(write, b.block.id))
      .catch(() => {});
    // Once, on open: the ref holds it to one write.
  }, [reachOf, day.blocks, place.date, place.day, writes]);

  // Clear's ask, open on load (`?state=clear-confirm`).
  React.useEffect(() => {
    if (start?.day === place.day && start.menu === "clear" && ready) {
      setClearing(true);
    }
  }, [start?.day, start?.menu, place.day, ready]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-(--space-2) border-b border-border px-(--space-4) py-(--space-3)">
        <BoundsField
          label={COPY.upAt}
          value={upAt}
          disabled={offline}
          onCommit={(next) => bounds.commit({ upAt: next })}
        />
        <BoundsField
          label={COPY.lightsOut}
          value={lightsOut}
          disabled={offline}
          onCommit={(next) => bounds.commit({ lightsOut: next })}
        />
        <span className="flex-1" />
        <DayMenu
          title={dayTitle(titleOf(place))}
          day={dayName}
          // [ASSUMPTION] Shown in This week only, once the day differs from its usual.
          resetTo={place.date !== null && day.ownChange ? dayName : null}
          canClear={day.blocks.length > 0}
          disabled={offline || !ready}
          defaultOpen={start?.day === place.day && start.menu === "day"}
          onReset={reset}
          onClear={() => setClearing(true)}
        />
      </div>
      <ClearDialog
        open={clearing}
        words={clearWordsNow}
        onOpenChange={setClearing}
        onClear={clear}
      />

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
                  ringed: b.id === changed,
                  moved: b.id === moved,
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
          tierHue={TIER_HUE}
          overlaps={
            ready
              ? view.overlaps.map((pair) => ({
                  ...pair,
                  // The one fix: the later block starts at the earlier one's end.
                  onAction: () =>
                    moveTo(pair.b, clockMinutes(pair.fixStartsAt)),
                }))
              : []
          }
          // D-USE-82: no drag offline; moving a block is the day's own edit.
          onMoveBlock={
            ready && !offline
              ? (blockId, deltaMin) => {
                  const b = day.blocks.find((x) => x.block.id === blockId);
                  if (b) moveTo(blockId, clockMinutes(b.startsAt) + deltaMin);
                }
              : undefined
          }
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col px-(--space-4) pb-(--space-4)">
        <div className="pointer-events-auto">
          <AboveFooterToaster />
        </div>
        {offline ? (
          // D-USE-82: the + gives way to the line; a block still opens.
          <div className="pointer-events-auto -mx-(--space-4) -mb-(--space-4)">
            <OfflineLine text={COPY.offline} />
          </div>
        ) : (
          <div className="flex items-end gap-(--space-3)">
            <div className="pointer-events-auto min-w-0 flex-1">{offer}</div>
            <div className="pointer-events-auto shrink-0">
              <PlusMenu
                day={dayName}
                disabled={!ready}
                event={place.date !== null}
                defaultOpen={start?.menu === "plus"}
                onBlock={() => sheetAt()}
                onTransition={() => sheetAt(undefined, "transition")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
