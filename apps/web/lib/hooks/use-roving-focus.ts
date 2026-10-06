"use client";

import * as React from "react";

/**
 * Arrow-key navigation over a list of rows — cross-cutting §3.2.
 *
 * ROVING `tabIndex`, NOT A TAB STOP PER ROW. A day can hold thirty items, and
 * thirty Tab stops is a keyboard user pressing Tab thirty times to reach the
 * tab bar. The standard pattern is one stop into the list and arrows within it,
 * which is what this implements: exactly one element carries `tabIndex=0` at a
 * time and the rest carry `-1`.
 *
 * DOM ORDER IS TIME ORDER, BY CONSTRUCTION. The List and the Schedule both
 * render in schedule order, so walking the DOM walks the day. This hook
 * deliberately does no sorting of its own — a second ordering rule here could
 * disagree with the one on screen, and the visible order is the true one.
 *
 * IT NEVER WRAPS. Down at the last row stays on the last row. Wrapping in a
 * list that represents a day would jump from tonight to this morning, which is
 * disorienting in a way that a list of options is not.
 *
 * `Space` AND `Enter` ARE DELEGATED, NOT REIMPLEMENTED. The row already has a
 * checkbox and a body button with their own handlers and their own undo; this
 * clicks them. Re-implementing "toggle done" here would be a second path to the
 * same mutation, with its own bugs.
 */

export type RovingFocusOptions = {
  /** Marks the navigable elements — `[data-item-row]`. */
  selector: string;
  /** `s` — the caller owns the timer; the hook only reports the row. */
  onToggleTimer?: (element: HTMLElement) => void;
  enabled?: boolean;
};

export function useRovingFocus(
  containerRef: React.RefObject<HTMLElement | null>,
  { selector, onToggleTimer, enabled = true }: RovingFocusOptions,
): void {
  const latestToggle = React.useRef(onToggleTimer);
  latestToggle.current = onToggleTimer;

  React.useEffect(() => {
    const container: HTMLElement | null = containerRef.current;
    if (!enabled || container === null) return;
    // Narrowed once here so the closures below do not each re-check it.
    const root: HTMLElement = container;

    const rows = (): HTMLElement[] =>
      Array.from(root.querySelectorAll<HTMLElement>(selector));

    /*
     * One stop into the list. Re-run whenever the rows change, so a day that
     * gains an item does not end up with two `tabIndex=0` rows or none.
     */
    function seed(): void {
      const all = rows();
      if (all.length === 0) return;
      const focused = all.find((row) => row.tabIndex === 0);
      if (focused !== undefined) return;
      all.forEach((row, index) => {
        row.tabIndex = index === 0 ? 0 : -1;
      });
    }

    seed();
    const observer = new MutationObserver(seed);
    observer.observe(root, { childList: true, subtree: true });

    function move(from: HTMLElement, delta: number): void {
      const all = rows();
      const index = all.indexOf(from);
      if (index < 0) return;

      // Never wraps — see the header.
      const next = all[index + delta];
      if (next === undefined) return;

      from.tabIndex = -1;
      next.tabIndex = 0;
      next.focus();
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const row = target.closest<HTMLElement>(selector);
      if (row === null || !root.contains(row)) return;

      switch (event.key) {
        case "ArrowDown":
          move(row, 1);
          break;
        case "ArrowUp":
          move(row, -1);
          break;
        case " ":
          // The checkbox owns "done" and its undo — this presses it. A row
          // without one (a Schedule block) does nothing, which is correct.
          row
            .querySelector<HTMLElement>(
              '[role="checkbox"], input[type="checkbox"]',
            )
            ?.click();
          break;
        case "Enter":
          /*
           * The row ITSELF may be the button — a Schedule block carries both
           * markers, because the block is the control. `querySelector` only
           * searches descendants, so the self case is checked first.
           */
          (row.matches("[data-row-open]")
            ? row
            : row.querySelector<HTMLElement>("[data-row-open]")
          )?.click();
          break;
        case "s":
          latestToggle.current?.(row);
          break;
        default:
          return;
      }

      event.preventDefault();
    }

    root.addEventListener("keydown", onKeyDown);
    return () => {
      observer.disconnect();
      root.removeEventListener("keydown", onKeyDown);
    };
  }, [containerRef, selector, enabled]);
}
