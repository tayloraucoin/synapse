"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { dispatchScrollToNow } from "@/lib/hooks/use-scroll-memory";
import {
  reviewRoute,
  settingsRoute,
  todayRoute,
  todayScheduleRoute,
} from "@/lib/routes";

/**
 * The global shortcuts — cross-cutting §3.1, §13 call 9.
 *
 * **NOTHING FIRES WHILE A FIELD HAS FOCUS.** This is the whole risk of the
 * slice: single keys with no modifiers means `n` is both "add a one-off" and a
 * letter someone is typing into a habit's name, and getting that wrong steals
 * characters out of people's words. `isEditable` is the guard, it is checked
 * first, and it errs wide — an unknown custom element inside a dialog is
 * treated as editable rather than risked.
 *
 * `Esc` IS NOT HANDLED HERE. Radix owns it, and Radix already closes only the
 * topmost layer. A handler of our own would either duplicate that or fight it,
 * and the failure mode of fighting it is closing two sheets on one press.
 *
 * NO MODIFIER COMBINATIONS EITHER — a shortcut with `Cmd` held is a browser
 * shortcut someone is halfway through, so any modifier means this is not ours.
 * (`Cmd/Ctrl+Enter` in a textarea is §3.3's, and lives in its own hook on the
 * form that wants it.)
 *
 * DESKTOP ONLY IS NOT A CHECK. There is no detection: a phone with no keyboard
 * simply never produces these events, and a phone WITH one should get the
 * shortcuts. Gating on width would take them away from the person who went to
 * the trouble of pairing a keyboard.
 */

/** Does this event target take typed characters? */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return (
    target.closest(
      'input, textarea, select, [contenteditable="true"], [role="dialog"], [role="alertdialog"]',
    ) !== null
  );
}

export type GlobalShortcutHandlers = {
  /** `n` — only where a day is on screen; elsewhere it does nothing. */
  onAddOneOff?: () => void;
  /** `?` — the shortcut list. */
  onShowShortcuts: () => void;
};

export function useGlobalShortcuts(handlers: GlobalShortcutHandlers): void {
  const router = useRouter();
  const pathname = usePathname();

  // Held in a ref so the listener is attached once and never re-bound on a
  // handler identity change — a listener that re-attaches on every render is
  // a listener that can miss a keypress mid-swap.
  const latest = React.useRef(handlers);
  latest.current = handlers;

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditable(event.target)) return;

      switch (event.key) {
        case "1":
          router.push(todayRoute());
          break;
        case "2":
          router.push(todayScheduleRoute());
          break;
        case "3":
          router.push(reviewRoute());
          break;
        case ",":
          router.push(settingsRoute());
          break;
        case "t":
          // The List and the Schedule both listen; whichever is mounted acts.
          dispatchScrollToNow();
          break;
        case "n":
          // Scoped to the day (§3.1) — `n` on Settings means nothing.
          if (isDayRoute(pathname)) latest.current.onAddOneOff?.();
          else return;
          break;
        case "?":
          // `Shift+/` on a US layout; `event.key` is already the character, so
          // every layout that can type a question mark works without a table.
          latest.current.onShowShortcuts();
          break;
        default:
          return;
      }

      event.preventDefault();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, pathname]);
}

/** `/today`, `/today/schedule`, `/day/{date}` and its Schedule. */
function isDayRoute(pathname: string): boolean {
  return pathname.startsWith("/today") || pathname.startsWith("/day/");
}
