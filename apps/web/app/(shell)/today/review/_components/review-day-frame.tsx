"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb, Button, Text } from "@syn/ui";
import { DayColumn, TodosTray } from "@/components/planner";
import { useDataSource } from "@/lib/data/source";
import { useTodayKey } from "@/lib/data/use-morning";
import { useReadyGo, useReviewDay } from "@/lib/data/use-review-day";
import {
  itemSheetRoute,
  orientRoute,
  todayBlockRoute,
  todayReadyRoute,
} from "@/lib/routes";
import { dateTitle } from "../../_components/now/copy";
import { useDayEntryGate } from "../../../_components/day-entry-gate";
import { REVIEW_DAY_COPY as COPY } from "./copy";

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
 * server keeps the first `readyAt`, and the screen goes to the welcome.
 * After that the entry tree sends this path on (D-USE-71).
 *
 * Loading, error and offline are the system-states ticket's; the rail +,
 * the first-change line and swap's Toaster are the edits ticket's, which
 * fills the slot laid out above Ready, go.
 */
export function ReviewDayFrame() {
  const router = useRouter();
  const dateKey = useTodayKey();
  const { entered } = useDayEntryGate("review", dateKey);
  const { view } = useReviewDay(dateKey);
  const readyGo = useReadyGo();
  // A scenario's `view.open` seeds the tray open, for its capture.
  const seeded = useDataSource().scenario.view?.open;
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const sent = React.useRef(false);

  React.useEffect(() => {
    if (entered) headingRef.current?.focus();
  }, [entered]);

  // Not shown until the day's answer is Review the day: after Ready, go it goes on.
  if (!entered) return null;

  /** A path with this screen's query kept, so `?state=` travels. */
  const kept = (path: string) => `${path}${window.location.search}`;

  function onReadyGo() {
    if (sent.current) return;
    sent.current = true;
    readyGo.mutate(dateKey, {
      onSuccess: () => router.push(kept(todayReadyRoute())),
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

        <TodosTray defaultOpen={seeded === "todos"} />

        <div className="min-h-0 flex-1 overflow-y-auto pt-(--space-3) pb-(--space-8)">
          {view !== undefined ? (
            <DayColumn
              hours={{ startMin: view.startMin, endMin: view.endMin }}
              orient={view.orient}
              blocks={view.blocks}
              timeZone={view.timeZone}
              onBlock={(id) => router.push(kept(todayBlockRoute(id)))}
              onBullet={(_blockId, itemId) =>
                router.push(
                  itemSheetRoute(
                    `${window.location.pathname}${window.location.search}`,
                    itemId,
                  ),
                )
              }
            />
          ) : null}
        </div>

        {/* D-USE-25: Ready, go floats on a fade to the background. */}
        <footer className="relative px-(--space-4) pt-(--space-3) pb-[max(env(safe-area-inset-bottom),var(--space-4))] split:flex split:flex-col split:items-end split:border-t split:border-border">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-full h-(--space-8) bg-linear-to-b from-transparent to-background split:hidden"
          />
          {/* The edits ticket's Toaster sits here, above the button. */}
          <div data-toaster-slot className="split:self-stretch" />
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
    </main>
  );
}
