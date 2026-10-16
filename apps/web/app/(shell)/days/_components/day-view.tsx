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
  firstFreeTime,
  tappedSlot,
  weekKeyOf,
} from "@syn/utils";
import type { DayEventRecord } from "@syn/validators";
import {
  DAY_COLUMN_PX_PER_HOUR,
  DayColumn,
  OfflineLine,
} from "@/components/planner";
import {
  AddEventSheet,
  formOf,
  type AddEventForm,
  type EventDone,
} from "@/components/planner/add-event";
import { TIER_HUE } from "@/components/work";
import {
  PoolButton,
  ThisWeekPool,
  WorkTiersInPlace,
} from "@/components/work/this-week";
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
import { workPartsOf } from "@/lib/data/this-week-day";
import { useSetUpColumnRead, type DaysPlace } from "@/lib/data/use-days";
import type { usePlannerWrites } from "@/lib/data/use-planner-writes";
import { usePool } from "@/lib/data/use-pool";
import type { SetUpDay } from "@/lib/data/use-set-up-day";
import { useOpeningWeek, useWeek } from "@/lib/data/use-week";
import {
  ABOVE_FOOTER_TOASTER,
  AboveFooterToaster,
  useUndoToast,
} from "@/lib/hooks/use-undo-toast";
import {
  daysBlockRoute,
  daysRoute,
  itemSheetRoute,
  newBlockSheetRoute,
} from "@/lib/routes";
import { DAYS_COPY as COPY } from "./copy";
import { EmptyDayOffer, useCopyFrom } from "./copy-from";
import {
  BoundsField,
  DayAsk,
  DayChips,
  DayMenu,
  PlusMenu,
  type DayChip,
} from "./day-parts";
import { DaysHeader } from "./days-header";
import { hasBands, ownEventCards, withEventBands } from "./event-bands";
import { useRepeatMove } from "./repeat-move";

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
 *
 * USE-81: a day of this week gains its work parts on the phone and in the
 * pane (D-USE-107): each Work block open to its tiers in place
 * (WorkTiersInPlace: squares and words, session marks, the day's due
 * words, "+ Add to <tier>", the fit line in ink), the day's own events on
 * their own at their times, and Pool beside the + (PoolButton, the pool and
 * place sheets over the day). Offline the StatusLine sits above the foot,
 * Pool stays live and the + is read-only (D-USE-82 with D-USE-56).
 *
 * USE-45: an empty day offers Copy from under Orient (the offer alone just
 * after its bounds are set, else the dashed card), and the ··· and the +
 * open Copy from's pickers.
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
type PlannerWrite = Awaited<ReturnType<DayViewProps["writes"]["editBlock"]>>;

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
  // The bounds just set on this day, here: the copy offer, not the card.
  const { scenario } = useDataSource();
  const here = `${place.week}:${place.day}`;
  const [justSet, setJustSet] = React.useState<string | null>(
    scenario.setUp?.justSet && scenario.setUp.day === place.day ? here : null,
  );

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
          onSet={() => setJustSet(here)}
        />
      ) : (
        <SetDay
          key={`${place.week}:${place.day}`}
          place={place}
          day={day}
          writes={writes}
          column={column}
          offer={offer}
          justSet={justSet === here}
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
  onSaved?: () => void,
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
          onSaved?.();
        })
        .catch(() => {
          // Kept on screen; SaveStatus offers Try again.
        });
    },
    [place, saved, writes, onSaved],
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
  onSet,
}: {
  place: DaysPlace & { day: number };
  writes: DayViewProps["writes"];
  /** Both bounds landed: the day opens on the copy offer (copy-offer.md). */
  onSet: () => void;
}) {
  const bounds = useBoundsDraft(place, null, writes, onSet);
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
  justSet,
}: {
  place: DaysPlace & { day: number };
  day: SetUpDay;
  writes: DayViewProps["writes"];
  column: ReturnType<typeof useSetUpColumnRead>;
  offer: React.ReactNode;
  justSet: boolean;
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

  // This week's work parts (USE-81).
  const { thisWeek: thisWeekKey } = useOpeningWeek();
  const source = useDataSource();
  const todayKey = source.todayKey();
  const thisWeek = place.date !== null && place.week === thisWeekKey;
  const pool = usePool();
  const parts = React.useMemo(
    () =>
      thisWeek
        ? workPartsOf({ day, slots: pool.slots ?? [], todayKey })
        : new Map(),
    [thisWeek, day, pool.slots, todayKey],
  );
  const past = place.date !== null && place.date < todayKey;
  const [poolOpen, setPoolOpen] = React.useState(false);
  const poolRef = React.useRef<HTMLButtonElement>(null);
  const [marked, setMarked] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (marked === null) return;
    // [ASSUMPTION] The mark fades as the desk drop's ink edge does.
    const timer = window.setTimeout(() => setMarked(null), UNDO_SHORT_MS);
    return () => window.clearTimeout(timer);
  }, [marked]);

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

  // Add event (USE-53): + › Event's sheet, or a Synapse event tapped to edit.
  // The time decides where it lands: a band inside its block, or its own.
  const [eventSheet, setEventSheet] = React.useState<{
    start: Partial<AddEventForm> & { startsAt: string };
    addOnOpen?: boolean;
  } | null>(null);
  const openEvent = (event: DayEventRecord) =>
    setEventSheet({ start: formOf(event) });
  const dayBlocks =
    place.date === null
      ? view.blocks
      : withEventBands(view.blocks, day, openEvent);
  // [ASSUMPTION] The + starts it at the day's first free time, as Block's.
  const eventStart = firstFreeTime({
    upAt: upAt ?? "07:00",
    blocks: view.blocks,
  });
  const eventDone = ({ words, undo }: EventDone) =>
    undoToast({
      text: words,
      onUndo: () => void writes.undo(undo),
      ...(hold ? { durationMs: Infinity } : {}),
    });
  // A frame's Add event on load (`?state=`): the sheet open, or the add sent.
  const stagedEvent = start?.day === place.day ? start.event : undefined;
  const eventStaged = React.useRef(false);
  React.useEffect(() => {
    if (eventStaged.current || stagedEvent === undefined || !ready) return;
    eventStaged.current = true;
    const { add, ...fields } = stagedEvent;
    setEventSheet({ start: fields, addOnOpen: add === true });
  }, [stagedEvent, ready]);
  const dayName = weekdayName(place.day);
  const copyFrom = useCopyFrom({
    place,
    day,
    writes,
    start: start?.day === place.day ? start : undefined,
    ready,
  });
  const orientTop =
    view.orient === null
      ? 0
      : ((view.orient.atMin - view.hours.startMin) / 60) *
        DAY_COLUMN_PX_PER_HOUR;
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

  const repeatMove = useRepeatMove({
    place,
    day,
    writes,
    ready,
    staged:
      start?.day === place.day && start.askScope !== undefined
        ? start.askScope
        : undefined,
    onMoved: setMoved,
  });

  /**
   * One block to new times, nothing else moved (D-USE-33): in This week a
   * repeating block asks This one, This and following, or All first
   * (USE-47), and a one-date block takes its own times; in the usual week
   * the block, with its reach named.
   */
  const moveTo = (blockId: string, startMin: number) => {
    const b = day.blocks.find((x) => x.block.id === blockId);
    if (!b) return;
    const length = clockMinutes(b.endsAt) - clockMinutes(b.startsAt);
    const from = Math.max(0, Math.min(24 * 60 - length, startMin));
    const startsAt = clockFromMinutes(from);
    const endsAt = clockFromMinutes(from + length);
    if (place.date !== null && b.block.rrule !== null) {
      repeatMove.ask(blockId, startsAt, endsAt);
      return;
    }
    setMoved(blockId);
    if (place.date !== null) {
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
          canCopy={copyFrom.canCopy}
          disabled={offline || !ready}
          defaultOpen={start?.day === place.day && start.menu === "day"}
          triggerRef={copyFrom.menuRef}
          onCopyFrom={copyFrom.openPicker}
          onReset={reset}
          onClear={() => setClearing(true)}
        />
      </div>
      <DayAsk
        open={clearing}
        words={clearWordsNow}
        action={COPY.clear}
        onOpenChange={setClearing}
        onConfirm={clear}
      />
      {copyFrom.element}

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
              ? dayBlocks.map((b) => ({
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
          workParts={
            thisWeek && ready
              ? (block) => {
                  const own = parts.get(block.id);
                  // An event inside it: the block's own tiers around its band (USE-53).
                  if (!own || hasBands(block)) return undefined;
                  return (
                    <WorkTiersInPlace
                      parts={own}
                      past={past}
                      marked={marked}
                      onRow={(workItemId) =>
                        router.push(itemSheetRoute(here(), workItemId))
                      }
                      onAdd={() =>
                        router.push(
                          daysRoute({
                            week: place.week,
                            day: place.day,
                            block: block.id,
                          }),
                        )
                      }
                    />
                  );
                }
              : undefined
          }
          events={ready ? ownEventCards(view.blocks, day, openEvent) : []}
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
          // A block opens its Block view, editing (USE-49): the usual weekday's, or This week's date.
          onBlock={(id) =>
            router.push(
              daysBlockRoute(
                id,
                place.date === null
                  ? { weekday: place.day }
                  : { date: place.date },
              ),
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
          {ready &&
          day.blocks.length === 0 &&
          view.orient !== null &&
          copyFrom.offered !== null ? (
            <div
              style={{ top: `${orientTop + 20}px` }}
              className="absolute start-10 end-0"
            >
              <EmptyDayOffer
                dayName={dayName}
                offered={weekdayName(copyFrom.offered.weekday)}
                justSet={justSet}
                disabled={offline}
                onCopy={copyFrom.copyOffered}
                onOther={copyFrom.openPicker}
              />
            </div>
          ) : null}
          {column.isError && view.orient !== null ? (
            <div
              style={{ top: `${orientTop + 16}px` }}
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
        {repeatMove.element}
        {offline && !thisWeek ? (
          // D-USE-82: the + gives way to the line; a block still opens.
          <div className="pointer-events-auto -mx-(--space-4) -mb-(--space-4)">
            <OfflineLine text={COPY.offline} />
          </div>
        ) : (
          <div className="flex flex-col gap-(--space-3)">
            {offline ? (
              // This week (USE-81): the line above the foot, Pool live, the + read-only.
              <div className="pointer-events-auto -mx-(--space-4)">
                <OfflineLine text={COPY.offline} />
              </div>
            ) : null}
            <div className="flex items-end gap-(--space-3)">
              {thisWeek ? (
                <div className="pointer-events-auto shrink-0">
                  <PoolButton
                    ref={poolRef}
                    disabled={!ready}
                    onOpen={() => setPoolOpen(true)}
                  />
                </div>
              ) : null}
              <div className="pointer-events-auto min-w-0 flex-1">
                {offline ? null : offer}
              </div>
              <div className="pointer-events-auto shrink-0">
                <PlusMenu
                  day={dayName}
                  disabled={!ready || offline}
                  event={place.date !== null}
                  defaultOpen={start?.menu === "plus"}
                  savedDisabled={!copyFrom.hasSaved}
                  triggerRef={copyFrom.plusRef}
                  onBlock={() => sheetAt()}
                  onTransition={() => sheetAt(undefined, "transition")}
                  onSaved={copyFrom.openSaved}
                  onEvent={
                    place.date === null
                      ? undefined
                      : () => setEventSheet({ start: { startsAt: eventStart } })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {place.date !== null ? (
        <AddEventSheet
          open={eventSheet !== null}
          onOpenChange={(open) => {
            if (!open) setEventSheet(null);
          }}
          target={{ week: place.week, day: place.day }}
          start={eventSheet?.start ?? { startsAt: eventStart }}
          addOnOpen={eventSheet?.addOnOpen ?? false}
          onDone={eventDone}
          returnFocusRef={copyFrom.plusRef}
        />
      ) : null}
      {thisWeek && place.date !== null ? (
        <ThisWeekPool
          open={poolOpen}
          onOpenChange={setPoolOpen}
          dateKey={place.date}
          returnFocusRef={poolRef}
          onPlaced={(workItemId, dates) => {
            if (place.date !== null && dates.includes(place.date)) {
              setMarked(workItemId);
            }
          }}
        />
      ) : null}
    </div>
  );
}
