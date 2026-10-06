"use client";

import { create } from "zustand";

/**
 * The running-timer tick — the first sanctioned Zustand store, and the reason
 * `lib/stores/README.md` set a bar for one.
 *
 * WHY A STORE AND NOT CONTEXT. A timer publishes a new number every second and
 * four places read it: the item's row in a list of thirty, the item sheet, the
 * tab title, and (Phase 2) a persistent notification. Through Context that is
 * the whole day list re-rendering once a second to change one row's digits.
 * Subscribers here select by item id, so a tick re-renders only what shows it.
 *
 * IT IS NOT THE SOURCE OF TRUTH. Whether a timer EXISTS is a `timer_sessions`
 * row; this holds what to display and is re-seeded from the server on every
 * refetch. That is what makes the second device work, what makes a reload
 * correct, and what makes an auto-close that ended a session show up as an
 * idle row rather than a number still counting up.
 *
 * IT IS A MAP, NOT ONE ENTRY. Two timers legitimately run at once inside a
 * multitask group (official spec §5.5), so a single `itemId` would be wrong
 * exactly where the product is most particular.
 *
 * ONE INTERVAL FOR ALL OF THEM, started with the first running entry and
 * cleared with the last. Per-timer intervals would drift apart and repaint on
 * different frames, so two rows counting the same second would disagree.
 */
export type TimerEntry = {
  /** When the open session began, per the server. */
  startedAt: number;
  /** Seconds already logged in ENDED sessions for this item. */
  accumulatedSec: number;
};

export type TimerSeed = {
  itemId: string;
  startedAt: Date;
  accumulatedSec: number;
};

type TimerState = {
  running: Record<string, TimerEntry>;
  /** Bumped once a second while anything runs; subscribers read through it. */
  tick: number;
  start: (itemId: string, startedAt: Date, accumulatedSec: number) => void;
  stop: (itemId: string) => void;
  /** Replace every entry from the server's answer. */
  seed: (entries: readonly TimerSeed[]) => void;
};

let interval: number | null = null;

function ensureInterval(get: () => TimerState, set: (partial: Partial<TimerState>) => void): void {
  const anyRunning = Object.keys(get().running).length > 0;

  if (anyRunning && interval === null) {
    interval = window.setInterval(() => {
      set({ tick: Date.now() });
    }, 1000);
    return;
  }

  if (!anyRunning && interval !== null) {
    window.clearInterval(interval);
    interval = null;
  }
}

export const useTimerStore = create<TimerState>((set, get) => ({
  running: {},
  tick: Date.now(),

  start: (itemId, startedAt, accumulatedSec) => {
    set({
      running: {
        ...get().running,
        [itemId]: { startedAt: startedAt.getTime(), accumulatedSec },
      },
      tick: Date.now(),
    });
    ensureInterval(get, set);
  },

  stop: (itemId) => {
    const next = { ...get().running };
    delete next[itemId];
    set({ running: next });
    ensureInterval(get, set);
  },

  /**
   * The server's answer, wholesale.
   *
   * It REPLACES rather than merges, deliberately: a timer that ended on
   * another device, or was closed by the auto-close pass, is absent from the
   * seed, and merging would leave it counting up here forever.
   */
  seed: (entries) => {
    const running: Record<string, TimerEntry> = {};
    for (const entry of entries) {
      running[entry.itemId] = {
        startedAt: entry.startedAt.getTime(),
        accumulatedSec: entry.accumulatedSec,
      };
    }
    set({ running, tick: Date.now() });
    ensureInterval(get, set);
  },
}));

/**
 * Elapsed seconds for one item, or null when it is not running.
 *
 * Reading `tick` is what subscribes the caller to the second-by-second update;
 * the arithmetic is done here so the store holds instants rather than a number
 * it would have to rewrite for every timer every second.
 */
export function useElapsedSec(itemId: string | null): number | null {
  return useTimerStore((state) => {
    if (itemId === null) return null;
    const entry = state.running[itemId];
    if (entry === undefined) return null;
    // `state.tick` is read so this selector re-runs each second.
    const now = Math.max(state.tick, entry.startedAt);
    return entry.accumulatedSec + Math.floor((now - entry.startedAt) / 1000);
  });
}

/** Whether any timer is running, for the tab title. */
export function useRunningTimer(): { itemId: string; elapsedSec: number } | null {
  return useTimerStore((state) => {
    const [itemId] = Object.keys(state.running);
    if (itemId === undefined) return null;
    const entry = state.running[itemId];
    if (entry === undefined) return null;
    const now = Math.max(state.tick, entry.startedAt);
    return {
      itemId,
      elapsedSec:
        entry.accumulatedSec + Math.floor((now - entry.startedAt) / 1000),
    };
  });
}
