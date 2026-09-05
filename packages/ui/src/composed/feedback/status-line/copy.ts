/**
 * The status line's strings — one line per variant (v2 handoff §5.2).
 *
 * Seven are verbatim from the UX documents and cited below. Three
 * (`setup`, `pending-review`, `permission`) have a screen and a trigger in the
 * documents but no fixed sentence; they are written here in the product's
 * register and marked, because a line that appears under the header on every
 * screen is not a place to improvise per caller.
 *
 * [COPY — needs Vesper sign-off: setup, pending-review, permission.]
 *
 * REGISTER (official spec §10.1, §2.4): plain, present, specific. No second
 * person where a statement works, no exclamation marks, no counts that grade
 * the day, and never a question — except the late offer, which Epic 2 §3.6
 * allows as the one permitted question, once a day, dismissable.
 */
import type { StatusLineVariant } from "@syn/types";

export interface StatusLineCopyEntry {
  /** The line, or a builder when it names a zone or a count. */
  text: string;
  /** The action label, when the variant has one. */
  actionLabel?: string;
  /** Empty when the line cannot be dismissed. */
  dismissLabel?: string;
}

export const STATUS_LINE_COPY: Record<StatusLineVariant, StatusLineCopyEntry> =
  {
    /** Nav & system §6.2 — verbatim. Not dismissable. */
    offline: { text: "Offline — changes save on this device." },

    /** Nav & system §6.2 — verbatim. Not dismissable, clears itself. */
    syncing: { text: "Syncing…" },

    /** Nav & system §6.2 / SY-03 — verbatim. */
    "sync-issues": {
      text: "Some changes couldn't sync.",
      actionLabel: "Details",
    },

    /** Nav & system §4.2 — dismissable for the session. */
    setup: {
      text: "Setup isn't finished.",
      actionLabel: "Finish",
      dismissLabel: "Dismiss",
    },

    /** Nav & system §4.2 — taps through to Review; never dismissable. */
    "pending-review": {
      text: "Yesterday is waiting to be reviewed.",
      actionLabel: "Review",
    },

    /** Epic 2 §3.6 — verbatim, including the one permitted question. */
    "late-offer": {
      text: "Running late?",
      actionLabel: "Shift the day",
      dismissLabel: "Dismiss for today",
    },

    /** Nav & system §5.4 / SY-02 — verbatim. Non-dismissable. */
    update: { text: "A new version is ready.", actionLabel: "Reload" },

    /** Nav & system §7.3 / SY-06 — the zones are filled by the caller. */
    timezone: {
      text: "Your device is in another time zone.",
      actionLabel: "Switch",
      dismissLabel: "Dismiss",
    },

    /** Nav & system §5.1 / SY-07 — verbatim. Dismiss never returns. */
    install: {
      text: "Synapse can be installed — it opens faster and gets reminders.",
      actionLabel: "How",
      dismissLabel: "Dismiss",
    },

    /** Official spec §8.3 — the out-of-context fallback ask. */
    permission: {
      text: "Reminders are off.",
      actionLabel: "Turn on",
      dismissLabel: "Dismiss",
    },
  };

/** SY-06's line names both zones; the copy table holds the shape. */
export function timezoneMismatchText(
  deviceZone: string,
  storedZone: string,
): string {
  return `Your device is in ${deviceZone}. Synapse is on ${storedZone}.`;
}
