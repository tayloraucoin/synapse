"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb, Button, RegionRetry, StatusLine, Text } from "@syn/ui";
import {
  clockFromMinutes,
  weekdayForDayKey,
  weekdayIndex,
  weekKeyOf,
} from "@syn/utils";
import {
  AllDayStrip,
  DayColumn,
  DayColumnSkeleton,
  EmptyDayChoices,
  TodosTray,
  type DayColumnEvent,
} from "@/components/planner";
import { AddSheet } from "@/components/planner/add-sheet";
import { eventHue } from "@/components/planner/block-hue";
import { DAY_COLUMN_PX_PER_HOUR } from "@/components/planner/day-column";
import { DAY_COLUMN_COPY } from "@/components/planner/day-column/copy";
import { snapToStep } from "@/components/planner/rail-add";
import { LaterStartSheet, MakeRoomSheet } from "@/components/planner/room";
import { useChecklistDay } from "@/lib/data/checklist-day";
import { useDataSource } from "@/lib/data/source";
import { useConnection } from "@/lib/data/use-connection";
import { useTodayKey } from "@/lib/data/use-morning";
import { useRailAdd } from "@/lib/data/use-rail-add";
import {
  useReadyGo,
  useReviewDay,
  type ReviewEvent,
} from "@/lib/data/use-review-day";
import { useRoom } from "@/lib/data/use-room";
import { scheduleNow } from "@/lib/data/use-schedule";
import { useTodos } from "@/lib/data/use-todos";
import { useNow as useMinute } from "@/lib/hooks/use-now";
import { AboveFooterToaster } from "@/lib/hooks/use-undo-toast";
import {
  addSheetRoute,
  daysRoute,
  itemSheetRoute,
  newBlockSheetRoute,
  orientRoute,
  todayBlockRoute,
  todayReadyRoute,
  withSearch,
} from "@/lib/routes";
import { fadeNavigate } from "../../_components/fade-navigate";
import { dateTitle } from "../../_components/now/copy";
import { useDayEntryGate } from "../../../_components/day-entry-gate";
import { ChecklistEditor } from "./checklist-editor";
import { REVIEW_DAY_COPY as COPY } from "./copy";
import { EmptyWork } from "./empty-work";
import { FirstChangeLine } from "./first-change-line";
import { PassedRow } from "./passed-row";
import { RailPlus } from "./rail-plus";
import { TraySkeleton } from "./tray-skeleton";
import { useReviewEdits } from "./use-review-edits";

/** Where now sits under the top when the column opens at it: an hour down. */
const NOW_FROM_TOP_PX = DAY_COLUMN_PX_PER_HOUR;
/** The rail + and the now tag closer than this would overlap on the rail. */
const PLUS_CLEAR_MIN = 25;

const eventOf = (event: ReviewEvent): DayColumnEvent => ({
  id: event.id,
  title: event.title,
  startsAt: event.startsAt,
  endsAt: event.endsAt,
  hue: eventHue(event.color),
  meta: DAY_COLUMN_COPY.eventMeta(event.startsAt, event.endsAt, event.tag),
  underWay: false,
});

/**
 * Review the day (USE-31; day/review-the-day/), the success frame and the
 * tray open. One focused column, top to bottom: "‹ Orient" over the date;
 * the To-dos tray, closed, which opens in place and pushes the day down;
 * the day column at 96 px an hour, scrolling under its own clip, with
 * Orient's locked line at the top; Ready, go on its fade at the foot.
 *
 * At the desk (split) the same column, centred and capped at
 * `--content-text`, a hairline over the foot and Ready, go right-aligned at
 * a fixed 240 (D-USE-39, D-USE-65). Never a rail, tabs or the avatar.
 *
 * The column opens at its first hour, which is Up at's, so Orient's line is
 * at the top with nothing to scroll.
 *
 * READY, GO WRITES ONCE. The button is held while the write is out; the
 * server keeps the first `readyAt`, and the screen cross-fades to the
 * welcome (USE-43).
 * After that the entry tree sends this path on (D-USE-71).
 *
 * SYSTEM STATES (USE-34; D-USE-69). The header never waits: the date is
 * known on the device. The day and the to-dos are two queries and each
 * waits and fails in place: the tray as two still bars, then its own; the
 * column as still bands, then `RegionRetry` with Ready, go hidden. While the
 * day is read Ready, go is disabled, reading "Loading the day". With both
 * failed the tray is not drawn and the one Try again reads both. Offline
 * one StatusLine sits under the header and nothing else changes: the day
 * from cache, every edit and Ready, go held on the phone until the
 * connection is back (D-USE-56, D-USE-64).
 *
 * The edits
 * (USE-37) change today only, each with Undo in the Toaster above Ready, go:
 * a band swiped away, an empty Work block's Add rows, the rail + at the next
 * free time with its first-mornings hint, and the first-change line under
 * the header on the first change ever.
 *
 * A late wake (USE-38) lays the column out from the wake, and the blocks it
 * passed fold into one row under the tray that opens to Move later and
 * Leave; nothing reads late.
 *
 * Finding minutes (USE-41): Make room opens over the day when an addition
 * finds no room the engine could guess; A later start opens by itself once
 * a day from 15 minutes past Up at, and again from the passed row. Both
 * apply the engine's plan for today, with Undo in the same Toaster.
 *
 * Add from the rail (USE-54): the + tapped, dragged and released, empty
 * time tapped (rounded to 15 minutes), or a Work block's Add row opens the
 * add sheet (`?sheet=add`). With room the addition lands at once, today
 * only, with Undo; with none it goes to Make room. Block hands the time to
 * the New block sheet.
 *
 * A loose day (USE-40; D-USE-28, D-USE-30, D-USE-68): with nothing set the
 * ask sits under the title over no column and no Ready, go; Make a
 * checklist writes today's checklist and opens it for typing, with Ready,
 * go back. A checklist with no span is the All day strip above the rail,
 * beside anything timed. The now-line runs across the column whenever now
 * falls in its hours, moving each minute, and the column opens scrolled to
 * it; on a usual morning that is the top, with Orient's line.
 */
export function ReviewDayFrame() {
  const router = useRouter();
  const dateKey = useTodayKey();
  const source = useDataSource();
  const { decided, entered } = useDayEntryGate("review", dateKey);
  const day = useReviewDay(dateKey);
  const { view } = day;
  // The tray's own query, read here only to know whether it waits or failed.
  const todos = useTodos(source.todayKey());
  const { online } = useConnection();
  const readyGo = useReadyGo();
  const edits = useReviewEdits(dateKey, view);
  // USE-41: Make room when an addition finds no room; A later start once a day.
  const room = useRoom(dateKey, { offerLaterStart: true });
  // A scenario's `view.open` seeds the tray open, for its capture.
  const seeded = source.scenario.view?.open;
  const rail = useRailAdd(dateKey, edits.edits, room.place);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const sent = React.useRef(false);
  // Try again on the day: focus goes into the column once it is back.
  const retried = React.useRef(false);
  // The day is still being read: the frame shows with its skeletons.
  const waiting = decided === null;
  const shown = waiting || entered;
  const dayFailed = day.isError;
  // Both failed: the drawn error frame, no tray; one Try again reads both.
  const bothFailed = dayFailed && todos.isError;
  const checklistDay = useChecklistDay(dateKey);
  const seededChecklist = source.scenario.view?.checklist;
  const [making, setMaking] = React.useState(seededChecklist !== undefined);
  // A render each minute, so the now-line keeps to the clock.
  useMinute();
  const nowView =
    view === undefined ? null : scheduleNow(source.now(), view.timeZone);
  const now =
    view !== undefined &&
    nowView !== null &&
    nowView.atMin >= view.startMin &&
    nowView.atMin < view.endMin
      ? nowView
      : null;

  // Once, when the day first arrives: the column opens at now.
  const opened = React.useRef(false);
  React.useLayoutEffect(() => {
    if (opened.current || view === undefined) return;
    opened.current = true;
    if (now === null) return;
    const nowPx = ((now.atMin - view.startMin) / 60) * DAY_COLUMN_PX_PER_HOUR;
    scrollerRef.current?.scrollTo({
      top: Math.max(0, nowPx - NOW_FROM_TOP_PX),
    });
  }, [view, now]);

  React.useEffect(() => {
    if (shown) headingRef.current?.focus();
  }, [shown]);

  React.useEffect(() => {
    if (view === undefined || !retried.current) return;
    retried.current = false;
    scrollerRef.current?.focus();
  }, [view]);

  // Another screen is the day's answer (after Ready, go it goes on).
  if (!shown) return null;

  const checklist = view?.allDay ?? null;
  const editing = making && checklist !== null;
  // D-USE-28: no Ready, go until a choice is made.
  const asking = view?.empty === true && !editing;

  function retryDay() {
    retried.current = true;
    void day.retry();
    if (bothFailed) void todos.retry();
  }

  /** A path with this screen's query kept, so `?state=` travels. */
  const kept = (path: string) => `${path}${window.location.search}`;
  /** The add sheet over this screen. */
  const openAdd = (preset: Parameters<typeof addSheetRoute>[1]) =>
    router.push(
      addSheetRoute(
        `${window.location.pathname}${window.location.search}`,
        preset,
      ),
    );

  function onReadyGo(event: React.MouseEvent) {
    if (sent.current) return;
    sent.current = true;
    // From the keyboard the welcome lands with no motion (C-P11).
    const keyboard = event.detail === 0;
    // The welcome cross-fades in (USE-43; D-USE-71).
    const go = () =>
      fadeNavigate(() => router.push(kept(todayReadyRoute())), { keyboard });
    readyGo.mutate(dateKey, {
      onSuccess: online ? go : undefined,
      // Refused online: the button comes back.
      onError: () => {
        sent.current = false;
      },
    });
    // Offline it is held on the phone and the day already reads it (USE-34).
    if (!online) go();
  }

  return (
    <main id="main" className="flex h-dvh flex-col bg-background">
      <div className="mx-auto flex min-h-0 w-full flex-1 flex-col split:max-w-(--content-text)">
        <header className="flex flex-col gap-0.5 px-(--space-4) pt-(--space-4) pb-(--space-3)">
          <Breadcrumb
            label={COPY.back}
            href={kept(orientRoute())}
            ariaLabel={COPY.backLabel}
          />
          <Text
            as="h1"
            variant="heading"
            ref={headingRef}
            tabIndex={-1}
            className="outline-none"
          >
            {dateTitle(dateKey)}
          </Text>
        </header>

        {/* Offline (USE-34): one line, pushing the tray and column down. */}
        {!online ? <StatusLine variant="offline" text={COPY.offline} /> : null}

        {edits.firstChangeLine ? <FirstChangeLine dateKey={dateKey} /> : null}

        {todos.isPending ? (
          <TraySkeleton />
        ) : bothFailed ? null : (
          <TodosTray defaultOpen={seeded === "todos"} />
        )}

        {/* A late wake (USE-38): the passed blocks, folded under the tray. */}
        {view?.late && view.late.passed.length > 0 ? (
          <PassedRow
            wokeAt={view.late.wokeAt}
            passed={view.late.passed}
            onMoveLater={(blockId) => void edits.moveLater(blockId)}
            onLaterStart={room.openLaterStart}
            defaultOpen={seeded === "passed"}
          />
        ) : null}

        {checklist !== null && !editing ? (
          <AllDayStrip
            name={checklist.name}
            rows={checklist.rows}
            underWay={false}
            onOpen={() =>
              router.push(
                withSearch(
                  todayBlockRoute(checklist.id, "review"),
                  window.location.search,
                ),
              )
            }
          />
        ) : null}

        <div
          ref={scrollerRef}
          tabIndex={-1}
          data-day-scroller
          className="min-h-0 flex-1 overflow-y-auto pt-(--space-3) pb-(--space-8) outline-none"
        >
          {view === undefined ? (
            dayFailed ? (
              <RegionRetry
                label={COPY.dayFailed}
                detail={COPY.dayFailedDetail}
                onRetry={retryDay}
                className="flex-col items-start px-(--space-4) pt-(--space-6)"
              />
            ) : (
              <DayColumnSkeleton label={COPY.loading} meals />
            )
          ) : asking ? (
            <EmptyDayChoices
              weekday={weekdayForDayKey(dateKey)}
              checklist={{
                onSelect: () =>
                  checklistDay.make.mutate(undefined, {
                    onSuccess: () => setMaking(true),
                  }),
              }}
              pending={checklistDay.make.isPending || making}
              blocksHref={daysRoute({ day: dateKey })}
              copyHref={daysRoute({ day: dateKey })}
              className="pt-(--space-3)"
            />
          ) : editing ? (
            <ChecklistEditor
              checklist={checklist}
              initialDraft={seededChecklist?.draft}
              pending={checklistDay.span.isPending}
              onAdd={(title) =>
                checklistDay.add.mutate({ blockId: checklist.id, title })
              }
              onSpan={(startsAt, endsAt) =>
                checklistDay.span.mutate(
                  { blockId: checklist.id, startsAt, endsAt },
                  { onSuccess: () => setMaking(false) },
                )
              }
            />
          ) : (
            <DayColumn
              hours={{ startMin: view.startMin, endMin: view.endMin }}
              orient={view.orient}
              blocks={view.blocks}
              events={view.events.map(eventOf)}
              now={now}
              timeZone={view.timeZone}
              onBlock={(id) =>
                router.push(
                  withSearch(
                    todayBlockRoute(id, "review"),
                    window.location.search,
                  ),
                )
              }
              onBullet={(_blockId, itemId) =>
                router.push(
                  itemSheetRoute(
                    `${window.location.pathname}${window.location.search}`,
                    itemId,
                  ),
                )
              }
              onSwipeAway={edits.swipeAway}
              // Empty time: the add sheet there, on the 15-minute grid.
              onRail={(atMin) =>
                openAdd({
                  at: clockFromMinutes(
                    snapToStep(atMin, {
                      startMin: view.startMin,
                      endMin: view.endMin,
                    }),
                  ),
                })
              }
              emptyWork={(block) => (
                <EmptyWork
                  onAdd={(tier) => openAdd({ tier, block: block.id })}
                  weekHref={daysRoute({
                    week: weekKeyOf(dateKey),
                    day: dateKey,
                    block: block.id,
                  })}
                />
              )}
            >
              {edits.plusAtMin !== null &&
              // The + gives way to the now tag where they meet [ASSUMPTION].
              (now === null ||
                Math.abs(edits.plusAtMin - now.atMin) >= PLUS_CLEAR_MIN) ? (
                <RailPlus
                  atMin={edits.plusAtMin}
                  startMin={view.startMin}
                  endMin={view.endMin}
                  heightPx={
                    ((view.endMin - view.startMin) / 60) *
                    DAY_COLUMN_PX_PER_HOUR
                  }
                  showHint={edits.hint.show}
                  onHint={edits.hint.onHint}
                  onTap={(at) => openAdd({ at })}
                  onRelease={(at) => openAdd({ at })}
                  heldAtMin={rail.heldAtMin}
                />
              ) : null}
            </DayColumn>
          )}
        </div>

        {/* D-USE-25: Ready, go floats on a fade to the background. */}
        <footer className="relative px-(--space-4) pt-(--space-3) pb-[max(env(safe-area-inset-bottom),var(--space-4))] split:flex split:flex-col split:items-end split:border-t split:border-border">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-full h-(--space-8) bg-linear-to-b from-transparent to-background split:hidden"
          />
          {/* Undo's Toaster, above the button (D-USE-25). */}
          <div className="split:self-stretch">
            <AboveFooterToaster />
          </div>
          {/* The day failed, or nothing is set yet: Ready, go is hidden. */}
          {dayFailed || asking ? null : (
            <Button
              size="lg"
              className="w-full font-semibold split:w-60"
              disabled={view === undefined || readyGo.isPending}
              onClick={onReadyGo}
            >
              {view === undefined ? COPY.loading : COPY.readyGo}
            </Button>
          )}
        </footer>
      </div>

      {view !== undefined ? (
        <AddSheet
          open={rail.open}
          onOpenChange={(open) => {
            if (!open) rail.close();
          }}
          dateKey={dateKey}
          start={rail.start}
          day={rail.day}
          hours={{ startMin: view.startMin, endMin: view.endMin }}
          preset={rail.preset}
          onAdd={rail.add}
          // One URL change: the New block sheet takes the add sheet's place.
          onBlock={(at) => {
            router.push(
              newBlockSheetRoute(rail.hereWithoutAdd(), {
                week: weekKeyOf(dateKey),
                day: weekdayIndex(dateKey),
                at,
              }),
            );
          }}
        />
      ) : null}

      <MakeRoomSheet
        view={room.makeRoom.view}
        onSource={room.makeRoom.setSource}
        onToggle={room.makeRoom.toggle}
        onStep={room.makeRoom.step}
        onApply={() => void room.apply()}
        onClose={room.makeRoom.close}
      />
      <LaterStartSheet
        open={room.laterStart.open}
        ask={room.laterStart.ask}
        tab={room.laterStart.tab}
        onTab={room.laterStart.setTab}
        cut={room.laterStart.cut}
        slide={room.laterStart.slide}
        onToggle={room.laterStart.toggle}
        onToggleBlock={room.laterStart.toggleBlock}
        onShowMore={room.laterStart.showMore}
        canSwap={room.canSwap}
        onSwap={(itemId) => {
          room.laterStart.close();
          router.push(
            itemSheetRoute(
              `${window.location.pathname}${window.location.search}`,
              itemId,
            ),
          );
        }}
        onApply={() => void room.laterStart.apply()}
        onClose={room.laterStart.close}
      />
    </main>
  );
}
