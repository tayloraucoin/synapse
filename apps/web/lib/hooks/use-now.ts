"use client";

import { useEffect, useState } from "react";

/**
 * A clock that ticks on the minute, not every sixty seconds from whenever the
 * component mounted.
 *
 * WHY THE ALIGNMENT MATTERS. Every row's state is a function of this value: an
 * item becomes *soon* fifteen minutes before its start and *now* at it. A
 * plain `setInterval(60_000)` drifts, so a row could turn *now* up to fifty-
 * nine seconds late — visible, and wrong, on the one screen a person checks to
 * know what they should be doing.
 *
 * IT STOPS WHILE THE TAB IS HIDDEN and takes an immediate tick when it comes
 * back. A background tab re-rendering a day list every minute is battery spent
 * on nobody, and the first thing a returning tab needs is the current time,
 * not the time a minute from now.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeout: number | null = null;
    let interval: number | null = null;

    function stop(): void {
      if (timeout !== null) window.clearTimeout(timeout);
      if (interval !== null) window.clearInterval(interval);
      timeout = null;
      interval = null;
    }

    function start(): void {
      stop();
      setNow(new Date());

      // Land on the next :00, then tick once a minute from there.
      const msToNextMinute = 60_000 - (Date.now() % 60_000);
      timeout = window.setTimeout(() => {
        setNow(new Date());
        interval = window.setInterval(() => {
          setNow(new Date());
        }, 60_000);
      }, msToNextMinute);
    }

    function onVisibility(): void {
      if (document.hidden) stop();
      else start();
    }

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return now;
}
