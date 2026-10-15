import { useMemo, useSyncExternalStore } from "react";

/**
 * useWorkClock — the one tick every running figure on a screen reads (USE-23).
 *
 * ONE INTERVAL PER PAGE, however many cards and rows read it: the hooks share
 * a module store, so every figure changes on the same second and none drifts
 * against its neighbour. The tick carries no time of its own; each read takes
 * `now()` afresh, and the figure is `clockAt` over the derived slot clock at
 * that instant. A reopened page therefore reads start minus paused spans, not
 * where a counter stopped.
 *
 * WHILE THE PAGE IS HIDDEN NOTHING TICKS, and on return it ticks at once, so
 * the figure catches up before the next second.
 *
 * PLATFORM-PURE: visibility is a subscription the platform passes. The default
 * reads `document` only when one exists (the web); Expo passes its AppState.
 */

/** A platform's visibility: whether hidden now, and a change subscription. */
export interface Visibility {
  hidden: () => boolean;
  subscribe: (onChange: () => void) => () => void;
}

export const WORK_CLOCK_TICK_MS = 1000;

interface DocumentLike {
  hidden: boolean;
  addEventListener: (type: "visibilitychange", listener: () => void) => void;
  removeEventListener: (type: "visibilitychange", listener: () => void) => void;
}

function documentVisibility(): Visibility {
  const doc = (globalThis as { document?: DocumentLike }).document;
  return {
    hidden: () => doc?.hidden ?? false,
    subscribe: (onChange) => {
      if (!doc) return () => {};
      doc.addEventListener("visibilitychange", onChange);
      return () => doc.removeEventListener("visibilitychange", onChange);
    },
  };
}

let tick = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let stopWatching: (() => void) | null = null;
const listeners = new Set<() => void>();

function bump() {
  tick += 1;
  for (const listener of listeners) listener();
}

function stopTimer() {
  if (timer === null) return;
  clearInterval(timer);
  timer = null;
}

function startTimer(visibility: Visibility) {
  if (timer !== null || visibility.hidden()) return;
  timer = setInterval(bump, WORK_CLOCK_TICK_MS);
}

function subscribeWith(visibility: Visibility) {
  return (listener: () => void) => {
    listeners.add(listener);
    if (listeners.size === 1) {
      stopWatching = visibility.subscribe(() => {
        if (visibility.hidden()) {
          stopTimer();
          return;
        }
        bump();
        startTimer(visibility);
      });
      startTimer(visibility);
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size > 0) return;
      stopTimer();
      stopWatching?.();
      stopWatching = null;
    };
  };
}

const getTick = () => tick;
const getServerTick = () => 0;

let defaultSubscribe: ((listener: () => void) => () => void) | null = null;

/**
 * The instant to read figures at, renewed once a second while the page shows.
 * `now` is the source's clock (the fixture clock in a scenario).
 */
export function useWorkClock(
  now: () => Date = () => new Date(),
  visibility?: Visibility,
): Date {
  const subscribe = useMemo(() => {
    if (visibility) return subscribeWith(visibility);
    defaultSubscribe ??= subscribeWith(documentVisibility());
    return defaultSubscribe;
  }, [visibility]);
  const current = useSyncExternalStore(subscribe, getTick, getServerTick);
  // `now` is read per tick; a new function each render must not re-read it.
  return useMemo(() => now(), [current]);
}
