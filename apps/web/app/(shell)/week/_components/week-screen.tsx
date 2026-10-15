"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { RegionRetry, Text } from "@syn/ui";
import { OfflineLine } from "@/components/planner";
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
import { WeekHeader } from "./week-header";

/**
 * The Week (USE-72; ux/work/week/): from 1024 the pool panel's place at 360
 * (USE-74 fills it), then the header and the lens. Region by region: the week
 * failing is a RegionRetry in the lens's place, the rest live; offline is one
 * StatusLine under the header and everything still works (D-USE-56). Below
 * 1024 there is no Week: one line to Set my days › This week (D-USE-55).
 */
export function WeekScreen() {
  const shown = useShownWeek();
  const [lens, setLens] = useWeekLens();
  const { view, heads, range, isError, retry } = useWeekView(shown.weekKey);
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

      <div className="hidden min-h-dvh flex-1 split:flex">
        <aside
          aria-label={COPY.pool}
          data-pool-panel=""
          className="sticky top-0 h-dvh w-(--pool-w) shrink-0 border-e border-hairline bg-surface"
        />
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
              <Text
                as="p"
                variant="body"
                tone="muted"
                className="py-(--space-6)"
              >
                {COPY.timeLensLater}
              </Text>
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
                />
              </div>
            )}
          </div>
          <div aria-live="polite" className="sr-only">
            {announcement}
          </div>
        </div>
      </div>
    </>
  );
}
