import type { Shortcut } from "@syn/ui";

/**
 * The keyboard shortcuts — cross-cutting §3.1 and §3.2.
 *
 * **THIS FILE IS DATA, NOT BINDINGS.** SYS-3 renders it as a table on About and
 * SYS-4 binds the same array and feeds the same array to `ShortcutsDialog`.
 * Two lists would be two chances for the dialog to promise a key nothing
 * listens for — which is worse than no list at all, because a person who tries
 * an advertised shortcut and gets nothing concludes the app is broken.
 *
 * DESKTOP ONLY, and never shown as badges on the controls themselves (§3.1).
 * A phone has no keyboard to speak of, so About hides the table below the wide
 * breakpoint in CSS rather than in JavaScript — the server render is then right
 * at both widths.
 *
 * SINGLE KEYS, NO MODIFIERS, because nothing on the peer screens has a text
 * field focused by default; §3.1's ruling also says every one of these is
 * suppressed while an input has focus, which is SYS-4's job to honour.
 */
export const SHORTCUTS: readonly Shortcut[] = [
  /* --------------------------------------------------------- §3.1 global -- */
  { keys: ["1"], label: "List" },
  { keys: ["2"], label: "Schedule" },
  { keys: ["3"], label: "Review" },
  { keys: [","], label: "Settings" },
  { keys: ["t"], label: "Scroll to now" },
  { keys: ["n"], label: "Add a one-off" },
  { keys: ["Esc"], label: "Close the sheet or dialog" },
  { keys: ["?"], label: "This list" },

  /* ------------------------------------- §3.2 within the List and Schedule -- */
  { keys: ["↑", "↓"], label: "Move between rows, in time order" },
  { keys: ["Space"], label: "Toggle done on the focused row" },
  { keys: ["Enter"], label: "Open the item" },
  { keys: ["s"], label: "Start or stop the timer on the focused row" },

  /* ------------------------------ Workflow — Workflow UX spec v0.1 §7 -- */
  // Each board key joins this group in the ticket that makes it work (FLO-6…FLO-8).
  { keys: ["4"], label: "Workflow" },
  // FLO-6 — the board's grid. §7's words where it has them.
  // [COPY — needs Vesper sign-off: §7 names no line for the arrows.]
  { keys: ["↑", "↓", "←", "→"], label: "Move between tasks on the board" },
  { keys: ["Space"], label: "Fire or mark back" },
  { keys: ["g"], label: "Go to next" },
  { keys: ["["], label: "Previous view" },
  { keys: ["]"], label: "Next view" },
];
