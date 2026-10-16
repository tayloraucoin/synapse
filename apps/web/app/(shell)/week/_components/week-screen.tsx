"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { DragToPlace, RegionRetry, Text } from "@syn/ui";
import { OfflineLine } from "@/components/planner";
import { NewTaskSheet } from "@/components/work/add/new-task/new-task-sheet";
import { PoolPanel } from "@/components/work/pool";
import { useIsOffline } from "@/lib/data/source";
import {
  useShownWeek,
  useWeekLens,
  useWeekView,
  type WeekLens,
} from "@/lib/data/use-week-view";
import { daysRoute } from "@/lib/routes";
import { WEEK_COPY as COPY } from "./copy";
import { PriorityLens } from "./priority-lens";
import { TimeLens } from "./time-lens";
import { useWeekPlacing } from "./use-week-placing";
import { WeekHeader } from "./week-header";

/**
 * The Week (USE-72; ux/work/week/): from 1024 the pool panel at 360
 * (USE-74), then the header and the lens. Region by region: the week
 * failing is a RegionRetry in the lens's place, the rest live; offline is one
 * StatusLine under the header and everything still works (D-USE-56). Below
 * 1024 there is no Week: one line to Set my days › This week (D-USE-55).
 * Pool rows drag onto the lens and placed chips back (USE-75, DragToPlace),
 * every placing announced politely.
 */
export function WeekScreen() {
  const shown = useShownWeek();
  const [lens, setLens] = useWeekLens();
  const { view, heads, range, isError, retry, nowMin, timeZone, week } =
    useWeekView(shown.weekKey);
  const placing = useWeekPlacing(week);
  const offline = useIsOffline();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;
  const [announcement, setAnnouncement] = React.useState("");

  const announced = React.useRef(range);
  React.useEffect(() => {
    if (announced.current === range) return;
    announced.current = range;
    setAnnouncement(COPY.announceWeek(range));
  }, [range]);

  const chooseLens = (next: WeekLens) => {
    setLens(next);
    setAnnouncement(
      COPY.announceLens(next === "time" ? COPY.time : COPY.priority),
    );
  };

  return (
    <>
      <div className="px-(--space-4) py-(--space-6) split:hidden">
        <Text as="p" variant="body" tone="secondary">
          {COPY.phoneLine}{" "}
          <Link
            href={daysRoute({ week: shown.weekKey })}
            className="text-ink underline"
          >
            {COPY.phoneLink}
          </Link>
        </Text>
      </div>

      <DragToPlace onPlace={placing.onPlace} onLift={placing.settle}>
        <div className="hidden min-h-dvh flex-1 split:flex">
          <PoolPanel mode="week" />
          <div className="flex min-w-0 flex-1 flex-col gap-(--space-6) px-(--space-8) py-(--space-6)">
            <WeekHeader
              range={range}
              lens={lens}
              onLens={chooseLens}
              onPrevious={shown.previous}
              onNext={shown.next}
              onToday={shown.today}
            />
            <div className="flex flex-col border-t border-hairline">
              {offline ? <OfflineLine text={COPY.offline} /> : null}
              {isError ? (
                <RegionRetry
                  label={COPY.weekFailed}
                  onRetry={() => void retry()}
                />
              ) : lens === "time" ? (
                <div
                  aria-busy={view === null}
                  aria-label={view === null ? COPY.loading : undefined}
                >
                  <TimeLens
                    heads={heads}
                    range={range}
                    view={view}
                    here={here}
                    nowMin={nowMin}
                    timeZone={timeZone}
                    placing={placing}
                  />
                </div>
              ) : (
                <div
                  aria-busy={view === null}
                  aria-label={view === null ? COPY.loading : undefined}
                >
                  <PriorityLens
                    heads={heads}
                    range={range}
                    view={view}
                    here={here}
                    placing={placing}
                  />
                </div>
              )}
            </div>
            <div aria-live="polite" className="sr-only">
              {announcement}
            </div>
            <div aria-live="polite" className="sr-only">
              {placing.announcement}
            </div>
          </div>
        </div>
      </DragToPlace>
      {placing.newItem ? (
        <NewTaskSheet
          open
          onOpenChange={(open) => {
            if (!open) placing.closeNewItem();
          }}
          dateKey={placing.newItem.dateKey}
          blockId={placing.newItem.blockId}
          tier={placing.newItem.tier}
          from="add"
          initial={{
            title: placing.newItem.title,
            days: [placing.newItem.dateKey],
          }}
        />
      ) : null}
    </>
  );
}
