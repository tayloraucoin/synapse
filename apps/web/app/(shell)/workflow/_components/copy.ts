/**
 * Workflow's words — Workflow UX spec v0.1 §7, verbatim. One home for the
 * route: the pages, the loading frames and the board all read this file. The
 * composites' own defaults (*next*, *firing*, *Collapse {name}*, …) live in
 * their `copy.ts` files in `@syn/ui`.
 *
 * No tally of anything appears here, by design (W15).
 */
export const WORKFLOW_COPY = {
  /** Nav and `h1` (§7). */
  title: "Workflow",

  /* ---- the browser tab's title (§3.4, §7 *Tab title*) ---- */
  tabTitleNext: (task: string) => `Next: ${task} — Synapse`,
  tabTitleAllFiring: "Everything is firing — Synapse",
  tabTitleDefault: "Workflow — Synapse",

  /* ---- the one polite announcement (WF-01 accessibility) ---- */
  announceNext: (task: string) => `Next: ${task}`,
  announceAllFiring: "Everything is firing.",

  /* ---- states (§7 *Empty*, *Failure, offline*) ---- */
  nothingInProgress: "Nothing in progress.",
  /** The day list's save-failure sentence, reused verbatim (§7) — not imported from its file. */
  saveError: "Couldn't save. Try again.",

  /** [COPY — needs Vesper sign-off: the view tabs' accessible name; §7 has none.] */
  viewsLabel: "Views",
} as const;
