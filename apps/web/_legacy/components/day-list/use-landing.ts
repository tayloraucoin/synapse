"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

/**
 * What a notification tap asked for — Epic 2 §9, PN-01.
 *
 * THE PARAMS ARE ACTED ON ONCE AND THEN REMOVED. A landing is an instruction
 * that arrives with a navigation, not a piece of state: leaving `?action=done`
 * in the URL would re-fire on every back, every refresh, and every restored
 * tab, marking something done again each time.
 *
 * THE URL IS REPLACED, NOT PUSHED, so the cleaned address is what back returns
 * to — a person who taps *Done* on a notification and then goes back should
 * not re-enter the action they already took.
 *
 * `focus` SCROLLS AND MOVES FOCUS; it opens nothing. It is the grouped
 * notification's landing, where two items are due and choosing between them is
 * the person's to make.
 */
export type Landing = {
  /** The item to scroll to and focus, from `?focus=` or `?id=`. */
  focusId: string | null;
  /** `?action=start` or `?action=done`, consumed once. */
  action: "start" | "done" | null;
  actionItemId: string | null;
};

export function useLanding(): Landing {
  const router = useRouter();
  const params = useSearchParams();

  const focusParam = params.get("focus");
  const idParam = params.get("id");
  const actionParam = params.get("action");

  const [landing] = React.useState<Landing>(() => ({
    focusId: focusParam ?? idParam,
    action:
      actionParam === "start" || actionParam === "done" ? actionParam : null,
    actionItemId: idParam,
  }));

  // Strip the instruction from the address once it has been read.
  React.useEffect(() => {
    if (focusParam === null && actionParam === null) return;

    const next = new URLSearchParams(params.toString());
    next.delete("focus");
    next.delete("action");
    // `id` stays when a sheet is open — it is what keeps the sheet on a
    // reload — and goes when it was only carrying an action.
    if (next.get("sheet") === null) next.delete("id");

    const query = next.toString();
    router.replace(query === "" ? window.location.pathname : `?${query}`, {
      scroll: false,
    });
  }, [focusParam, actionParam, params, router]);

  return landing;
}

/**
 * Scroll a row into view and put focus on it.
 *
 * FOCUS, NOT JUST SCROLL. A screen-reader user who taps a notification should
 * land on the item it was about, not at the top of a list they then have to
 * search. The rows carry `tabIndex={-1}` so this can reach them without adding
 * a stop to the tab order.
 */
export function useScrollToItem(itemId: string | null, ready: boolean): void {
  const done = React.useRef(false);

  React.useEffect(() => {
    if (itemId === null || !ready || done.current) return;

    const row = document.querySelector<HTMLElement>(
      `[data-item-id="${CSS.escape(itemId)}"]`,
    );
    if (!row) return;

    done.current = true;
    row.scrollIntoView({ block: "center", behavior: "smooth" });
    row.focus({ preventScroll: true });
  }, [itemId, ready]);
}
