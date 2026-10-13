"use client";

import { useEffect } from "react";

import { STORAGE_KEYS } from "@syn/constants";

/**
 * Each tab keeps its scroll position for the session (cross-cutting §4.3).
 *
 * WHY IT MATTERS: switching to Review to check something and coming back to
 * the top of a long day is the app losing the person's place. The position is
 * theirs, not the route's.
 *
 * `sessionStorage`, so it dies with the tab — a position restored a day later
 * would be worse than none. Reads and writes are wrapped: a browser with site
 * data blocked simply does not remember, which is a degradation, not a fault.
 *
 * RESTORE HAPPENS ON MOUNT for now. The List will be able to say when its rows
 * have rendered (USE-2), at which point this takes a `ready` flag and waits
 * for it — restoring before content exists scrolls to the bottom of an empty
 * page.
 */

const THROTTLE_MS = 100;

export function useScrollMemory(tab: string): void {
  useEffect(() => {
    const key = `${STORAGE_KEYS.SCROLL_PREFIX}${tab}`;

    try {
      const saved = window.sessionStorage.getItem(key);
      if (saved !== null) {
        const y = Number(saved);
        if (Number.isFinite(y) && y > 0) {
          window.scrollTo(0, y);
        }
      }
    } catch {
      // No stored position; start at the top.
    }

    let timer: number | null = null;

    function save(): void {
      if (timer !== null) return;
      timer = window.setTimeout(() => {
        timer = null;
        try {
          window.sessionStorage.setItem(key, String(window.scrollY));
        } catch {
          // Best effort — the position is a convenience, never a record.
        }
      }, THROTTLE_MS);
    }

    window.addEventListener("scroll", save, { passive: true });

    return () => {
      if (timer !== null) window.clearTimeout(timer);
      // Save on the way out too: the last scroll may be inside the throttle
      // window, and leaving is exactly when the position matters.
      try {
        window.sessionStorage.setItem(key, String(window.scrollY));
      } catch {
        // As above.
      }
      window.removeEventListener("scroll", save);
    };
  }, [tab]);
}

/**
 * Re-tapping the active tab scrolls to now rather than navigating (Epic 2
 * SH-00). The List and the Schedule subscribe; nothing else needs to.
 *
 * A `window` CustomEvent rather than a context callback, because the publisher
 * (the tab bar, in the shell) and the subscriber (a page's list) have no
 * ancestor relationship worth threading a prop through.
 */
export const SCROLL_TO_NOW_EVENT = "syn:scroll-to-now";

export function dispatchScrollToNow(): void {
  window.dispatchEvent(new CustomEvent(SCROLL_TO_NOW_EVENT));
}
