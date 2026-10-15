"use client";

import * as React from "react";

/**
 * Scroll to now (USE-27; `_global/navigation.md`): re-tapping the active tab
 * or pressing `t` brings a timed day back to the minute. The tab bar fires
 * `SCROLL_TO_NOW_EVENT` on a re-tap; the screen that draws now listens. The
 * key is ignored while a field has focus or with a modifier held.
 */
export const SCROLL_TO_NOW_EVENT = "syn:scroll-to-now";

/** The tab bar's re-tap: no navigation, the screen scrolls. */
export function requestScrollToNow() {
  window.dispatchEvent(new Event(SCROLL_TO_NOW_EVENT));
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

export function useScrollToNow(onScroll: () => void) {
  const ref = React.useRef(onScroll);
  React.useEffect(() => {
    ref.current = onScroll;
  });
  React.useEffect(() => {
    const run = () => ref.current();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "t" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      if (isTyping(event.target)) return;
      run();
    };
    window.addEventListener(SCROLL_TO_NOW_EVENT, run);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(SCROLL_TO_NOW_EVENT, run);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
}
