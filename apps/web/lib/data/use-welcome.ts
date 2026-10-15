"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  clockFromMinutes,
  instantToWallClockMinutes,
  welcomeView,
  type WelcomeView,
} from "@syn/utils";
import type { Today } from "./derive-today";
import type { MorningDayRecords } from "./morning-records";
import { useDataSource } from "./source";
import { morningDayQueryKey } from "./use-morning";
import { isAllDay } from "./use-now";
import { useToday } from "./use-today";

/**
 * The Ready, go welcome's data (USE-43; interactions/ready-go/): `welcomeView`
 * over the date's blocks, Orient's "Today, as I see it" line, and whether
 * Ready, go was ever given before (the first go ever is derived, never
 * stored). The minute is read once, at the open: nothing on the welcome
 * moves on by itself, so it never ticks.
 */

export function readiedBeforeQueryKey(scenario: string, dateKey: string) {
  return ["welcome", scenario, dateKey, "readied-before"] as const;
}

/** The welcome from a day: pure, so a test reads what the screen reads. */
export function deriveWelcome(
  today: Today,
  {
    now,
    linesToday,
    firstEver,
  }: { now: Date; linesToday: string | null; firstEver: boolean },
): WelcomeView {
  const { records } = today;
  // `readDay` already leaves out a block skipped on the date.
  const occurrences = today.occurrences.blocks.map((occurrence) => ({
    id: occurrence.block.id,
    name: occurrence.block.name,
    kind: occurrence.block.kind,
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt,
    checklist: occurrence.block.checklist,
  }));
  return welcomeView({
    occurrences,
    now: clockFromMinutes(instantToWallClockMinutes(now, records.timeZone)),
    linesToday,
    firstEver,
    isChecklistDay: today.occurrences.blocks.some((occurrence) =>
      isAllDay(occurrence.block, occurrence.startsAt, occurrence.endsAt),
    ),
  });
}

export function useWelcome(dateKey: string) {
  const source = useDataSource();
  const scenario = source.scenario.name;
  const [now] = useState(() => source.now());
  const { today } = useToday(dateKey);
  const day = useQuery<MorningDayRecords>({
    queryKey: morningDayQueryKey(scenario, dateKey),
    queryFn: () => source.server.readMorningDay(dateKey),
    retry: false,
  });
  const readiedBefore = useQuery<boolean>({
    queryKey: readiedBeforeQueryKey(scenario, dateKey),
    queryFn: () => source.server.readReadiedBefore(dateKey),
    retry: false,
  });
  // A read that fails leaves its part out (no line; the plain welcome, not
  // the teaching): the welcome still shows.
  const settled =
    (day.isSuccess || day.isError) &&
    (readiedBefore.isSuccess || readiedBefore.isError);
  const view =
    today === undefined || !settled
      ? undefined
      : deriveWelcome(today, {
          now,
          linesToday: day.data?.lines?.todayAsISeeIt ?? null,
          firstEver: readiedBefore.data === false,
        });
  return { view, today };
}
