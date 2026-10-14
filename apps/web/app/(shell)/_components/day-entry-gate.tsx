"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { DayEntry } from "@syn/utils";
import { useDayEntry } from "@/lib/data/use-day-entry";
import { useTodayKey } from "@/lib/data/use-morning";
import {
  orientRoute,
  todayReadyRoute,
  todayReviewRoute,
  todayRoute,
} from "@/lib/routes";

/**
 * The day's entry tree on the screens it can send between (USE-12; D-USE-5,
 * `states/skipped.md`): a screen that is not the day's answer replaces the
 * URL with the one that is, keeping `?state=`.
 *
 * DECIDED ONCE. The first answer holds for the life of the screen: Orient's
 * own stamp makes the day "oriented", and a gate that kept listening would
 * send the person on before they had read a line.
 */

const ROUTE_FOR: Record<DayEntry, () => string> = {
  orient: orientRoute,
  review: todayReviewRoute,
  welcome: todayReadyRoute,
  now: todayRoute,
};

/** `entered` once the day's answer is this screen (or the day cannot be read). */
export function useDayEntryGate(here: DayEntry, dateKey: string) {
  const router = useRouter();
  const { entry, failed } = useDayEntry(dateKey);
  const [decided, setDecided] = React.useState<DayEntry | null>(null);

  React.useEffect(() => {
    if (decided !== null) return;
    if (failed) setDecided(here);
    else if (entry !== null) setDecided(entry);
  }, [decided, entry, failed, here]);

  React.useEffect(() => {
    if (decided === null || decided === here) return;
    router.replace(`${ROUTE_FOR[decided]()}${window.location.search}`);
  }, [decided, here, router]);

  return { decided, entered: decided === here };
}

/**
 * For a screen that renders while the answer is read (Now's placeholder):
 * its children show until the gate sends the day elsewhere.
 */
export function DayEntryGate({
  here,
  children,
}: {
  here: DayEntry;
  children: React.ReactNode;
}) {
  const { decided } = useDayEntryGate(here, useTodayKey());
  if (decided !== null && decided !== here) return null;
  return <>{children}</>;
}
