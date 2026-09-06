"use client";

import * as React from "react";

/**
 * Pull down at the top of a list to refetch — compact only (Epic 2 LS-01).
 *
 * NOT A LIBRARY. A pull-to-refresh package brings its own scroll container,
 * its own spinner and its own opinions about overscroll; this is a threshold
 * on three touch events, and the thing it triggers is a query invalidation
 * that keeps scroll position because nothing unmounts.
 *
 * IT ONLY ARMS AT THE TOP OF THE PAGE. Starting a pull mid-list would fight
 * the scroll the person is actually doing, which is the failure that makes
 * these gestures feel hostile.
 *
 * TOUCH ONLY, SO IT IS COMPACT ONLY without asking about a breakpoint: a
 * pointer device produces no `touchstart`, and on wide the query refetches on
 * window focus instead, which is the same intent through the same cache.
 *
 * The listener is passive: this never calls `preventDefault`, so the browser's
 * own overscroll stays smooth and the gesture cannot block scrolling.
 */
const THRESHOLD_PX = 72;

export function usePullToRefresh(onRefresh: () => void | Promise<unknown>) {
  const [refreshing, setRefreshing] = React.useState(false);
  const startY = React.useRef<number | null>(null);
  const refresh = React.useRef(onRefresh);
  refresh.current = onRefresh;

  React.useEffect(() => {
    function onTouchStart(event: TouchEvent): void {
      // Armed only at the very top, and only for a single finger — a pinch is
      // not a pull.
      startY.current =
        window.scrollY <= 0 && event.touches.length === 1
          ? (event.touches[0]?.clientY ?? null)
          : null;
    }

    function onTouchMove(event: TouchEvent): void {
      if (startY.current === null) return;
      const y = event.touches[0]?.clientY;
      if (y === undefined) return;
      if (y - startY.current < THRESHOLD_PX) return;

      startY.current = null;
      setRefreshing(true);
      void Promise.resolve(refresh.current()).finally(() =>
        setRefreshing(false),
      );
    }

    function onTouchEnd(): void {
      startY.current = null;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return refreshing;
}
