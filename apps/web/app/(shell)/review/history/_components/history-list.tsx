"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  Button,
  DayOutcomeRow,
  EmptyState,
  SkeletonBlock,
  Text,
  WeekRow,
} from "@syn/ui";
import { formatCalendarDay, weekDates, weekdayForDayKey } from "@syn/utils";

import {
  reviewDayRoute,
  reviewWeekRoute,
  settingsDataRoute,
} from "@/lib/routes";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { HISTORY_COPY as COPY } from "./copy";

type HistoryPage = RouterOutputs["review"]["history"];
type HistoryWeek = HistoryPage["weeks"][number];
type HistoryDay = HistoryWeek["days"][number];

/**
 * HS-01 — past weeks, newest first.
 *
 * WEEKS ARE THE UNIT, DAYS ARE INSIDE THEM. History is read as "what did that
 * week look like", and a page boundary in the middle of a week would split a
 * strip across two screens — which is why REV-1 paginates by week and this
 * appends whole weeks.
 *
 * DAY ROWS RENDER ONLY WHILE EXPANDED. Seven rows per week times eight weeks is
 * fifty-six rows nobody has asked to see; `WeekRow` owns the expander, so the
 * children are built lazily behind it.
 *
 * *EXPORT EVERYTHING* IS AT THE BOTTOM, and it is a link rather than a button:
 * it goes to SET-10's screen, which is where the exporting actually happens.
 * History is where a person goes looking for their record, so the way to take
 * the whole thing with them belongs at the end of it.
 */
export function HistoryList({ initial }: { initial: HistoryPage }) {
  const router = useRouter();

  const [before, setBefore] = React.useState<string | null>(null);
  const [pages, setPages] = React.useState<HistoryPage[]>([initial]);

  const next = trpc.review.history.useQuery(
    { before: before ?? undefined },
    { enabled: before !== null },
  );

  React.useEffect(() => {
    if (before === null || next.data === undefined) return;
    setPages((current) =>
      // The cursor is the guard against a double append: a page whose oldest
      // week is already present is a refetch, not a new page.
      current.some((page) => page.nextBefore === next.data.nextBefore)
        ? current
        : [...current, next.data],
    );
  }, [before, next.data]);

  const weeks = pages.flatMap((page) => page.weeks);
  const cursor = pages[pages.length - 1]?.nextBefore ?? null;
  const loading = before !== null && next.isFetching;

  if (weeks.length === 0) {
    return <EmptyState text={COPY.empty} />;
  }

  return (
    <div className="flex flex-col gap-(--space-5) py-(--space-4)">
      <div className="flex flex-col">
        {weeks.map((week) => (
          <WeekRow
            key={week.weekKey}
            rangeLabel={rangeLabelFor(week.weekKey)}
            status={statusForWeek(week)}
            onOpenWeek={() => router.push(reviewWeekRoute(week.weekKey))}
          >
            <ul className="flex flex-col">
              {week.days.map((day) => (
                <DayOutcomeRow
                  key={day.date}
                  weekday={dayLabel(day.date)}
                  outcome={statusForDay(day)}
                  form="short"
                  // Every day opens, including one with nothing on it: the Day
                  // Review is the record of that day, and "nothing assigned" is
                  // a thing the record can say.
                  onOpen={() => router.push(reviewDayRoute(day.date))}
                />
              ))}
            </ul>
          </WeekRow>
        ))}
      </div>

      {loading ? <SkeletonBlock heightPx={56} /> : null}

      {cursor === null ? null : (
        <div>
          <Button
            variant="ghost"
            busy={loading}
            onClick={() => setBefore(cursor)}
          >
            {COPY.showEarlier}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-(--space-1) pt-(--space-4)">
        <Button
          variant="ghost"
          className="self-start px-0"
          onClick={() => router.push(settingsDataRoute())}
        >
          {COPY.exportEverything}
        </Button>
        <Text as="p" tone="secondary">
          {COPY.exportLine}
        </Text>
      </div>
    </div>
  );
}

/** "Mon 1 Sep – Sun 7 Sep" reduced to its two dates, in the viewer's locale. */
function rangeLabelFor(weekKey: string): string {
  const dates = weekDates(weekKey);
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (first === undefined || last === undefined) return weekKey;

  // Formatted at midday UTC so a zone offset cannot roll the label's date.
  const asDate = (key: string) => new Date(`${key}T12:00:00Z`);
  return `${formatCalendarDay(asDate(first), "UTC", "short")} – ${formatCalendarDay(
    asDate(last),
    "UTC",
    "short",
  )}`;
}

/** A percent once the week has a reviewed day; a count of days before that. */
function statusForWeek(week: HistoryWeek): string {
  if (week.percent !== null) return COPY.percent(week.percent);

  const planned = week.days.filter(
    (day) => day.status !== "nothing-assigned",
  ).length;
  const reviewed = week.days.filter((day) => day.status === "reviewed").length;
  return COPY.weekOpen(reviewed, planned);
}

/** REV-1's four statuses, as words — and a number only for a reviewed day. */
function statusForDay(day: HistoryDay): string {
  switch (day.status) {
    case "reviewed":
      return day.percent === null ? COPY.notReviewed : COPY.percent(day.percent);
    case "pending":
      return COPY.pending;
    case "not-reviewed":
      return COPY.notReviewed;
    case "nothing-assigned":
      return COPY.nothingAssigned;
  }
}

/** "Thu 4" — the weekday and the date, which is what a day row is named by. */
function dayLabel(dateKey: string): string {
  const dayOfMonth = Number(dateKey.split("-")[2] ?? "0");
  return `${weekdayForDayKey(dateKey).slice(0, 3)} ${dayOfMonth}`;
}
