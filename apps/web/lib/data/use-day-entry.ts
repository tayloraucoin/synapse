"use client";

import { useCallback, useSyncExternalStore } from "react";
import { resolveDayEntry, type DayEntry } from "@syn/utils";
import { useDataSource } from "./source";
import { useToday } from "./use-today";

/**
 * Where the day's first screen goes (USE-12): `resolveDayEntry` over the
 * date's record and whether Start was tapped on this device. Null until both
 * are known, so a gate never sends a day the wrong way on a first paint.
 *
 * START HAS NO COLUMN. It is remembered per device, by date, under
 * `useDismissed`'s key format (`syn:dismissed:<key>` holding the date), so
 * the welcome (USE-20) can mark it with `useDismissed("day-started:…", "day")`
 * or with `markStarted` here. A scenario that leaves `startedOnDevice` unset
 * counts as started, so every other surface's scenario lands on Now.
 */

const STARTED_PREFIX = "syn:dismissed:day-started:";

function startedKey(scenario: string): string {
  return `${STARTED_PREFIX}${scenario}`;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readStarted(scenario: string, dateKey: string): boolean {
  try {
    return window.localStorage.getItem(startedKey(scenario)) === dateKey;
  } catch {
    return false;
  }
}

export function useStartedOnDevice(dateKey: string) {
  const source = useDataSource();
  const name = source.scenario.name;
  const seeded = source.scenario.startedOnDevice ?? true;
  const stored = useSyncExternalStore<boolean | null>(
    subscribe,
    () => readStarted(name, dateKey),
    // On the server it is not known yet.
    () => null,
  );
  const markStarted = useCallback(() => {
    try {
      window.localStorage.setItem(startedKey(name), dateKey);
      window.dispatchEvent(new StorageEvent("storage"));
    } catch {
      // Best-effort: storage unavailable.
    }
  }, [dateKey, name]);
  const started = stored === null ? null : seeded || stored;
  return { started, markStarted };
}

/**
 * `entry` is null until known. `failed`: the day could not be read, so no
 * gate sends it anywhere; the screen asked for stays (Orient is the safe
 * frame at 7am, and Now keeps its own error).
 */
export function useDayEntry(dateKey: string): {
  entry: DayEntry | null;
  failed: boolean;
} {
  const { today, isError } = useToday(dateKey);
  const { started } = useStartedOnDevice(dateKey);
  if (isError) return { entry: null, failed: true };
  if (started === null || today === undefined) {
    return { entry: null, failed: false };
  }
  return {
    entry: resolveDayEntry({
      dayRecord: today.records.dayRecord,
      startedOnDevice: started,
    }),
    failed: false,
  };
}
