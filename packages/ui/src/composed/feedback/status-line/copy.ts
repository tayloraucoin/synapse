/**
 * The status line's strings — one line per variant (v2 handoff §5.2).
 *
 * Seven are verbatim from the UX documents and cited below. Three had a screen
 * and a trigger but no fixed sentence; two of those were signed by SYS-1 and
 * are now cited like the rest. One remains open.
 *
 * [COPY — needs Vesper sign-off: permission. It is unused — nothing wires
 * `permissionOffer` until SET-9 — so the marker costs nothing today.]
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

    /**
     * Epic 1 §0.5, signed by SYS-1. Dismissable for the session: a person who
     * deliberately left the sequence should not be told again every screen.
     */
    setup: {
      text: "Setup isn't finished",
      actionLabel: "Continue",
      dismissLabel: "Dismiss",
    },

    /**
     * Official spec §10.5, signed by SYS-1. The default text is the fallback;
     * a caller with a weekday and a count passes `pendingReviewText(…)`, which
     * is the document's actual line.
     *
     * Never dismissable — it taps through to the thing it is about, so
     * dismissing it would be a way to lose a day quietly.
     */
    "pending-review": {
      text: "Yesterday has items to review",
      actionLabel: "Review",
    },

    /**
     * UX v1.1 §6.6 — the late-wake offer, verbatim (DYN-17): one fact, no
     * question. It replaced Epic 2 §3.6's *Running late? · Shift the day*.
     */
    "late-offer": {
      text: "Up later than planned",
      actionLabel: "Adjust the morning",
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

    /**
     * UX v1.1 §6.6 — verbatim. The one quiet Adjust offer: shown once when
     * the orient frame opened well after the wake target on a day set the
     * night before with a hard anchor; never on an unset day, never twice.
     * Not a question and not a detection — the person opened the frame late,
     * and the line says so and offers the sheet.
     */
    "late-wake-offer": {
      text: "Up later than planned",
      actionLabel: "Adjust the morning",
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

/**
 * The pending-review line — official spec §10.5's *Yesterday has 3 items to
 * review.*
 *
 * Yesterday is named as "Yesterday"; anything older is named by its weekday,
 * because "3 days ago" is arithmetic a person should not have to do about
 * their own week.
 *
 * THE COUNT IS NOT A SCORE. Product non-negotiables forbid numbers about the
 * day on the execution tabs; this is a count of things WAITING, which is the
 * one the document writes, and it appears in the status line rather than on a
 * tab.
 */
export function pendingReviewText(
  weekday: string | null,
  count: number,
): string {
  const subject = weekday ?? "Yesterday";
  const items = count === 1 ? "1 item" : `${count} items`;
  return `${subject} has ${items} to review`;
}
