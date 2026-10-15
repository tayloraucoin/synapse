"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb, Button, Text } from "@syn/ui";
import { clockFromMinutes, weekdayIndex, weekKeyOf } from "@syn/utils";
import { DayColumn, TodosTray } from "@/components/planner";
import { AddSheet } from "@/components/planner/add-sheet";
import { DAY_COLUMN_PX_PER_HOUR } from "@/components/planner/day-column";
import { snapToStep } from "@/components/planner/rail-add";
import { LaterStartSheet, MakeRoomSheet } from "@/components/planner/room";
import { useDataSource } from "@/lib/data/source";
import { useTodayKey } from "@/lib/data/use-morning";
import { useRailAdd } from "@/lib/data/use-rail-add";
import { useReadyGo, useReviewDay } from "@/lib/data/use-review-day";
import { useRoom } from "@/lib/data/use-room";
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
import { REVIEW_DAY_COPY as COPY } from "./copy";
import { EmptyWork } from "./empty-work";
import { FirstChangeLine } from "./first-change-line";
import { PassedRow } from "./passed-row";
import { RailPlus } from "./rail-plus";
import { useReviewEdits } from "./use-review-edits";

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
 * Loading, error and offline are the system-states ticket's. The edits
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
 */
export function ReviewDayFrame() {
  const router = useRouter();
  const dateKey = useTodayKey();
  const { entered } = useDayEntryGate("review", dateKey);
  const { view } = useReviewDay(dateKey);
  const readyGo = useReadyGo();
  const edits = useReviewEdits(dateKey, view);
  // USE-41: Make room when an addition finds no room; A later start once a day.
  const room = useRoom(dateKey, { offerLaterStart: true });
  const source = useDataSource();
  // A scenario's `view.open` seeds the tray open, for its capture.
  const seeded = source.scenario.view?.open;
  const rail = useRailAdd(dateKey, edits.edits, room.place);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const sent = React.useRef(false);

  React.useEffect(() => {
    if (entered) headingRef.current?.focus();
  }, [entered]);

  // Not shown until the day's answer is Review the day: after Ready, go it goes on.
  if (!entered) return null;

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
    readyGo.mutate(dateKey, {
      // The welcome cross-fades in (USE-43; D-USE-71).
      onSuccess: () =>
        fadeNavigate(() => router.push(kept(todayReadyRoute())), { keyboard }),
      // Not written: the button comes back (offline is its own ticket).
      onError: () => {
        sent.current = false;
      },
    });
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

        {edits.firstChangeLine ? <FirstChangeLine dateKey={dateKey} /> : null}

        <TodosTray defaultOpen={seeded === "todos"} />

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

        <div
          data-day-scroller
          className="min-h-0 flex-1 overflow-y-auto pt-(--space-3) pb-(--space-8)"
        >
          {view !== undefined ? (
            <DayColumn
              hours={{ startMin: view.startMin, endMin: view.endMin }}
              orient={view.orient}
              blocks={view.blocks}
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
              {edits.plusAtMin !== null ? (
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
          ) : null}
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
          <Button
            size="lg"
            className="w-full font-semibold split:w-60"
            disabled={view === undefined || readyGo.isPending}
            onClick={onReadyGo}
          >
            {view === undefined ? COPY.loading : COPY.readyGo}
          </Button>
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
