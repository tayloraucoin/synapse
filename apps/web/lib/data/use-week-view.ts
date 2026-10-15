"use client";

import * as React from "react";
import { useQueryState } from "nuqs";
import {
  addDays,
  instantToWallClockMinutes,
  weekDates,
  weekKeyOf,
} from "@syn/utils";
import { weekKeySchema } from "@syn/validators";
import { useRememberedToggle } from "@/lib/hooks/use-remembered-toggle";
import { useDataSource } from "./source";
import { usePool } from "./use-pool";
import { useWeek } from "./use-week";
import { thisWeekKey } from "./week-records";
import { deriveWeekView, weekRange } from "./week-view";

/**
 * The Week at the desk (USE-72): one week's view from `useWeek` and
 * `usePool`, every word printed in `deriveWeekView`. The pool only lends the
 * sessions that run past this week; the week reads without it. Wave 3 swaps
 * nothing here: the reads beneath it change.
 */

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface WeekHead {
  dateKey: string;
  head: string;
  isToday: boolean;
  past: boolean;
}

/** The heads, real before the week reads (loading.md). */
export function weekHeads(weekKey: string, todayKey: string): WeekHead[] {
  return weekDates(weekKey).map((dateKey, index) => ({
    dateKey,
    head: `${WEEKDAY_SHORT[index]} ${Number(dateKey.slice(8, 10))}`,
    isToday: dateKey === todayKey,
    past: dateKey < todayKey,
  }));
}

export function useWeekView(weekKey: string) {
  const source = useDataSource();
  const todayKey = source.todayKey();
  const week = useWeek(weekKey);
  const pool = usePool();
  const view = React.useMemo(
    () =>
      week.week
        ? deriveWeekView({
            weekKey,
            week: week.week,
            pool: pool.pool ?? null,
            todayKey,
          })
        : null,
    [week.week, pool.pool, weekKey, todayKey],
  );
  const dates = weekDates(weekKey);
  // The Time lens's now line (USE-73): today's minute, in this week only.
  const nowMin = dates.includes(todayKey)
    ? instantToWallClockMinutes(source.now(), source.scenario.records.timeZone)
    : null;
  return {
    view,
    nowMin,
    timeZone: source.scenario.records.timeZone,
    heads: weekHeads(weekKey, todayKey),
    range: weekRange(dates),
    isError: week.isError,
    retry: week.retry,
  };
}

/**
 * The week shown: `?week=` when it is a week key, else this week (the one
 * Set my days opens on). ‹ and › step a week; Today drops the param.
 */
export function useShownWeek() {
  const source = useDataSource();
  const [param, setParam] = useQueryState("week");
  const thisWeek = thisWeekKey(source.now(), source.scenario.records.timeZone);
  const parsed = weekKeySchema.safeParse(param);
  const weekKey = parsed.success ? parsed.data : thisWeek;
  const step = (by: number) => {
    const next = weekKeyOf(addDays(weekDates(weekKey)[0]!, by * 7));
    void setParam(next === thisWeek ? null : next);
  };
  return {
    weekKey,
    isThisWeek: weekKey === thisWeek,
    previous: () => step(-1),
    next: () => step(1),
    today: () => void setParam(null),
  };
}

export type WeekLens = "priority" | "time";

/**
 * The lens, remembered per person (C-USE-week-2, C-USE-week-time-lens-4;
 * Synapse is single-player, so the device's store is the person's). `?lens=`
 * overrides it for a capture, as does a scenario's `week:time` (USE-73's
 * `week-time` states), until a lens is chosen.
 */
export function useWeekLens(): [WeekLens, (lens: WeekLens) => void] {
  const source = useDataSource();
  const [timeChosen, setTimeChosen] = useRememberedToggle(
    "synapse.week.lens-time",
    false,
  );
  const [param, setParam] = useQueryState("lens");
  const [seeded, setSeeded] = React.useState(
    () => source.scenario.view?.open?.startsWith("week:time") ?? false,
  );
  const lens: WeekLens =
    param === "time" || param === "priority"
      ? param
      : seeded || timeChosen
        ? "time"
        : "priority";
  const choose = (next: WeekLens) => {
    setTimeChosen(next === "time");
    setSeeded(false);
    if (param !== null) void setParam(null);
  };
  return [lens, choose];
}
