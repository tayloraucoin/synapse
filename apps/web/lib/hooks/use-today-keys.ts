/**
 * useTodayKeys — the desk's keys on Today (USE-71; D-USE-62, D-USE-117;
 * work/today/words-and-access.md › Access). F fires the focused row, or
 * brings it back when firing; D is Done on the focused row; J and K move
 * focus down and up through the rows in order, tiers then To-dos; Enter
 * goes to Next. The keys write nothing of their own: F and D call the work
 * loop's functions (USE-59) through the screen's `actions`.
 *
 * [ASSUMPTION, as drawn] A key acts only when focus is not in a text
 * field, an open menu or a sheet, and never on an opened day (planning,
 * C-USE-today-opened-day-2). Enter on a focused control is that control's
 * own (a row's link opens its sheet); it goes to Next from nowhere in
 * particular. J past the last row and K above the first stay where they are.
 * Focus moves without animation (A-15).
 *
 * `todayKeyAction` decides (pure, tested); the hook reads the page and acts.
 * One listener on the document, for focus inside the main column (`root`)
 * or on nothing; desk only, the screen passes `enabled`.
 */
"use client";

import * as React from "react";

export interface TodayKeyRow {
  /** The slot id of a work row, the to-do id of a To-do. */
  key: string;
  kind: "work" | "todo";
  firing: boolean;
  done: boolean;
}

export type TodayKeyAction =
  | { type: "fire"; key: string }
  | { type: "bring-back"; key: string }
  | { type: "done"; key: string }
  | { type: "focus"; key: string }
  | { type: "next" };

export interface TodayKeyContext {
  rows: readonly TodayKeyRow[];
  /** The row focus is in, by key; null when focus is on no row. */
  focusedRow: string | null;
  /** Focus is in an input, a textarea, a select or editable text. */
  inField: boolean;
  menuOpen: boolean;
  sheetOpen: boolean;
  /** An opened day: nothing acts (C-USE-today-opened-day-2). */
  planning: boolean;
  /** Focus is on a button, link or other control: Enter is its own. */
  onControl?: boolean;
}

export interface TodayKeyPress {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}

export function todayKeyAction(
  press: TodayKeyPress,
  context: TodayKeyContext,
): TodayKeyAction | null {
  if (press.ctrlKey || press.metaKey || press.altKey) return null;
  if (
    context.inField ||
    context.menuOpen ||
    context.sheetOpen ||
    context.planning
  ) {
    return null;
  }
  const { rows, focusedRow } = context;
  const at = focusedRow ? rows.findIndex((row) => row.key === focusedRow) : -1;
  const row = at >= 0 ? rows[at]! : null;
  const key = press.key.length === 1 ? press.key.toLowerCase() : press.key;

  switch (key) {
    case "f":
      if (!row || row.kind !== "work" || row.done) return null;
      return row.firing
        ? { type: "bring-back", key: row.key }
        : { type: "fire", key: row.key };
    case "d":
      if (!row || row.kind !== "work" || row.done) return null;
      return { type: "done", key: row.key };
    case "j": {
      const to = at < 0 ? rows[0] : rows[at + 1];
      return to ? { type: "focus", key: to.key } : null;
    }
    case "k": {
      const to = at < 0 ? rows[0] : rows[at - 1];
      return to ? { type: "focus", key: to.key } : null;
    }
    case "Enter":
      return context.onControl ? null : { type: "next" };
    default:
      return null;
  }
}

export interface TodayKeyActions {
  fire: (key: string) => void;
  bringBack: (key: string) => void;
  done: (key: string) => void;
  /** Focus Next (on the strip it is Go). */
  goToNext: () => void;
  /** The element a row takes focus on, inside `root`. */
  focusTarget: (root: HTMLElement, row: TodayKeyRow) => HTMLElement | null;
  /** The row an element sits in, by key; null outside every row. */
  rowOf: (element: Element) => string | null;
}

const FIELD =
  "input, textarea, select, [contenteditable=''], [contenteditable='true']";
const CONTROL =
  "button, a[href], [role='button'], [role='link'], [role='checkbox'], [role='switch']";

export function useTodayKeys({
  root,
  rows,
  actions,
  enabled,
  planning = false,
}: {
  root: React.RefObject<HTMLElement | null>;
  rows: readonly TodayKeyRow[];
  actions: TodayKeyActions;
  enabled: boolean;
  planning?: boolean;
}) {
  const latest = React.useRef({ rows, actions, planning });
  latest.current = { rows, actions, planning };

  React.useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      const column = root.current;
      if (!column) return;
      const active = document.activeElement;
      const inColumn = active !== null && column.contains(active);
      if (!inColumn && active !== null && active !== document.body) return;
      const { rows, actions, planning } = latest.current;
      const action = todayKeyAction(event, {
        rows,
        focusedRow: inColumn && active ? actions.rowOf(active) : null,
        inField: active?.matches(FIELD) ?? false,
        menuOpen: document.querySelector("[role='menu']") !== null,
        sheetOpen: document.querySelector("[role='dialog']") !== null,
        planning,
        onControl: inColumn && active ? active.matches(CONTROL) : false,
      });
      if (!action) return;
      event.preventDefault();
      switch (action.type) {
        case "fire":
          actions.fire(action.key);
          return;
        case "bring-back":
          actions.bringBack(action.key);
          return;
        case "done":
          actions.done(action.key);
          return;
        case "next":
          actions.goToNext();
          return;
        case "focus": {
          const row = rows.find((r) => r.key === action.key);
          const target = row ? actions.focusTarget(column, row) : null;
          if (!target) return;
          // No smooth scroll, no animation (A-15).
          target.focus({ preventScroll: true });
          target.scrollIntoView({ block: "nearest", behavior: "instant" });
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [enabled, root]);
}

/**
 * The tab's title at the desk (D-USE-43): "Next: <title> — Synapse", or
 * "Today — Synapse" with no Next. The page's own title comes back on leaving.
 */
export function useNextTitle(title: string, enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;
    const was = document.title;
    document.title = title;
    return () => {
      document.title = was;
    };
  }, [title, enabled]);
}
