"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import {
  dateKeyIn,
  defaultWeek,
  weekDates,
  weekdayIndex,
  weekKeyOf,
} from "@syn/utils";
import { useDataSource } from "./source";
import { useOpeningWeek } from "./use-week";
import type { WeekRef } from "./week-records";

/**
 * Set my days' place (USE-39): which week and which day are open, from the
 * URL (`?week=&day=`, the New block sheet's own params), else the
 * scenario's start, else the opening rule (This week from Sunday evening).
 * `day` is a weekday, Monday 0; a date key names its week too.
 */

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export interface DaysPlace {
  /** What the reads take: "usual" or an ISO week key. */
  week: WeekRef;
  /** This week's key, for the switch. */
  thisWeek: string;
  /** The open weekday, or null on the week. */
  day: number | null;
  /** The open day's date in a dated week. */
  date: string | null;
  /** Seven dates in a dated week; none in the usual week. */
  dates: string[];
}

export function resolveDaysPlace({
  week,
  day,
  opens,
  thisWeek,
}: {
  week: string | null;
  day: string | null;
  opens: WeekRef;
  thisWeek: string;
}): DaysPlace {
  let ref: WeekRef = week === null ? opens : week === "this" ? thisWeek : week;
  let weekday: number | null = null;
  if (day !== null && DATE_KEY.test(day)) {
    ref = weekKeyOf(day);
    weekday = weekdayIndex(day);
  } else if (day !== null && /^[0-6]$/.test(day)) {
    weekday = Number(day);
  }
  const dates = ref === "usual" ? [] : weekDates(ref);
  return {
    week: ref,
    thisWeek,
    day: weekday,
    date: weekday === null ? null : (dates[weekday] ?? null),
    dates,
  };
}

/**
 * The day the 1024 list-detail selects when the URL names none (the-day.md,
 * D-USE-39 (3)): a day is always selected, today, or from Sunday evening
 * the week's first day. A week without today opens on its first day; the
 * usual week on today's weekday [ASSUMPTION].
 */
export function openingDay({
  dates,
  now,
  timeZone,
}: {
  dates: readonly string[];
  now: Date;
  timeZone: string;
}): number {
  const today = dateKeyIn(now, timeZone);
  if (dates.length > 0) return Math.max(0, dates.indexOf(today));
  return defaultWeek(now, timeZone) === "this" ? 0 : weekdayIndex(today);
}

export function useDaysPlace() {
  const source = useDataSource();
  const { scenario } = source;
  const { opens, thisWeek } = useOpeningWeek();
  const [params, setParams] = useQueryStates({
    week: parseAsString,
    day: parseAsString,
  });
  const start = scenario.setUp;
  const place = resolveDaysPlace({
    week: params.week ?? start?.week ?? null,
    day:
      params.day ??
      (params.week === null && start?.day !== undefined
        ? String(start.day)
        : null),
    opens,
    thisWeek,
  });
  return {
    ...place,
    /** The 1024 day pane's day: the open one, else the opening rule's. */
    splitDay:
      place.day ??
      openingDay({
        dates: place.dates,
        now: source.now(),
        timeZone: scenario.records.timeZone,
      }),
    /** Another week: the switch and the stepper keep the week view. */
    showWeek: (week: WeekRef) =>
      void setParams({ week, day: null }, { history: "replace" }),
    /** A row or a chip opens a day (A), pushed. */
    openDay: (day: number) =>
      void setParams(
        { week: place.week, day: String(day) },
        { history: "push" },
      ),
    /** At 1024 a row selects its day in place (list-detail). */
    selectDay: (day: number) =>
      void setParams(
        { week: place.week, day: String(day) },
        { history: "replace" },
      ),
  };
}

/**
 * The open day's column, its own read (USE-39; loading.md, error.md): it
 * waits or fails alone while the header, chips and bounds paint from the
 * week. Wave 3: one day is one read, and this is it.
 */
export function useSetUpColumnRead(week: WeekRef, day: number) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const queryKey = ["set-up-column", source.scenario.name, week, day] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => source.server.readSetUpColumn().then(() => true),
    retry: false,
  });
  function retry() {
    source.server.recover();
    return queryClient.refetchQueries({ queryKey });
  }
  return {
    isLoading: query.isPending,
    isError: query.isError,
    retry,
  };
}
