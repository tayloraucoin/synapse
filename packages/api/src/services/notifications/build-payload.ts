/**
 * Every sentence that can reach a lock screen.
 *
 * THIS FILE IS THE WHOLE VOCABULARY. Official spec §8.2 gives four Phase-1
 * rows and each builder below carries its row's citation; anything a person
 * reads on their phone is either one of these strings or something they wrote
 * themselves — an item's title, their own preflight note.
 *
 * WHAT IS NEVER HERE (§8.5), and the reason each is absent:
 *
 *  - **A miss.** A notification that says something was not done is the
 *    product telling someone off through their phone.
 *  - **A streak or a percentage.** The one number lives in Review, with its
 *    formula. On a lock screen it would be a score with no way to see the
 *    working.
 *  - **How long since the app was opened.** That is a fact about the product's
 *    engagement, not about the person's day.
 *  - **The second person.** No *you*. A scheduled fact does not address
 *    anybody; it states what is happening.
 *
 * TIMES ARE FORMATTED IN THE PERSON'S OWN ZONE, passed in by the job. The
 * server's zone is never right for anybody.
 */
import { formatClock } from "@syn/utils";

export type NotificationAction = { action: string; title: string };

export type BuiltPayload = {
  title: string;
  body?: string;
  url: string;
  /** Platform-permitting; the body tap always lands correctly without them. */
  actions?: NotificationAction[];
  /** Per-action destinations, read by the service worker. */
  actionUrls?: Record<string, string>;
  /** N4's *Later*: the day to defer, posted rather than navigated to. */
  snoozeDate?: string;
  ttlSeconds: number;
};

/**
 * How long a notification is worth showing.
 *
 * A 7:00 reminder surfacing at 21:00 is noise, so each kind expires at roughly
 * the point its sentence stops being true. The push service drops it after
 * that rather than delivering it whenever a phone next comes online.
 */
export const TTL_SECONDS = {
  /** The item's moment has passed within the quarter hour. */
  item_start: 15 * 60,
  /** UX v1.1 §9.1 — a block's, a fixture's and the marker's moment, likewise. */
  block_start: 15 * 60,
  fixture_start: 15 * 60,
  devices_off: 15 * 60,
  /** The evening it belongs to. */
  review_reminder: 2 * 60 * 60,
  /** The morning it belongs to. */
  pending_review: 6 * 60 * 60,
  /** The evening and the night after it. */
  week_build: 12 * 60 * 60,
  /** UX v1.2 §9 N2 — the evening it belongs to; by lights-out it is moot. */
  journal_reminder: 2 * 60 * 60,
} as const;

/**
 * N1 — at `scheduled_start`, for a fixed-time item (§8.2 row 1).
 *
 * The title is the item's own words and its time; the body is the person's own
 * preflight note or nothing at all. Nothing here is written by the product.
 */
export function itemStartPayload(input: {
  title: string;
  startsAt: Date;
  timeZone: string;
  preflightNote: string | null;
  itemUrl: string;
  startUrl: string;
  doneUrl: string;
}): BuiltPayload {
  return {
    title: `${input.title} · ${formatClock(input.startsAt, input.timeZone)}`,
    body: input.preflightNote ?? undefined,
    url: input.itemUrl,
    actions: [
      { action: "start", title: "Start" },
      { action: "done", title: "Done" },
    ],
    actionUrls: { start: input.startUrl, done: input.doneUrl },
    ttlSeconds: TTL_SECONDS.item_start,
  };
}

/**
 * N1a — at a block's `scheduled_start`, after the pick (UX v1.1 §9.1).
 *
 * The title is the block's own name — the template's, or the kind's word —
 * and its time. Nothing beneath. No actions: a block is not a thing to start
 * or tick.
 */
export function blockStartPayload(input: {
  name: string;
  startsAt: Date;
  timeZone: string;
  url: string;
}): BuiltPayload {
  return {
    title: `${input.name} · ${formatClock(input.startsAt, input.timeZone)}`,
    url: input.url,
    ttlSeconds: TTL_SECONDS.block_start,
  };
}

/**
 * N1c — a pin or a fixture at its time (UX v1.1 §9.1): *Stand-up · 9:30*.
 * "Fixtures always notify, they are the times most worth a push."
 */
export function fixtureStartPayload(input: {
  title: string;
  startsAt: Date;
  timeZone: string;
  url: string;
}): BuiltPayload {
  return {
    title: `${input.title} · ${formatClock(input.startsAt, input.timeZone)}`,
    url: input.url,
    ttlSeconds: TTL_SECONDS.fixture_start,
  };
}

/**
 * N1d — the devices-off marker (UX v1.1 §9.1): *Phone away · 22:15*. A time
 * the person set, in the words the marker already carries.
 */
export function devicesOffPayload(input: {
  title: string;
  startsAt: Date;
  timeZone: string;
  url: string;
}): BuiltPayload {
  return {
    title: `${input.title} · ${formatClock(input.startsAt, input.timeZone)}`,
    url: input.url,
    ttlSeconds: TTL_SECONDS.devices_off,
  };
}

/**
 * Same-minute starts of any kind, grouped (UX v1.1 §9.1's grouping rule,
 * DYN-20): *Work · Stand-up · 9:00*. No actions, for N1's reason.
 */
export function groupedStartPayload(input: {
  titles: readonly string[];
  startsAt: Date;
  timeZone: string;
  url: string;
}): BuiltPayload {
  return {
    title: `${input.titles.join(" · ")} · ${formatClock(input.startsAt, input.timeZone)}`,
    url: input.url,
    ttlSeconds: TTL_SECONDS.block_start,
  };
}

/**
 * N4 — at the review-reminder time, only on an open day with undone items
 * (§8.2 row 4).
 *
 * *{n} items to decide on* counts things still to answer. It is not a score
 * and not a judgement: the same sentence appears whether the day went well or
 * badly, because the number of decisions owed is the same fact either way.
 */
export function reviewReminderPayload(input: {
  undoneCount: number;
  reviewUrl: string;
  /** The day *Later* defers — the worker posts it, it does not navigate. */
  dateKey: string;
}): BuiltPayload {
  return {
    title: "Close out today",
    body: `${input.undoneCount} ${input.undoneCount === 1 ? "item" : "items"} to decide on`,
    url: input.reviewUrl,
    actions: [
      { action: "review", title: "Review" },
      { action: "later", title: "Later" },
    ],
    // *Later* has no URL on purpose: it defers; it navigates nowhere.
    actionUrls: { review: input.reviewUrl },
    snoozeDate: input.dateKey,
    ttlSeconds: TTL_SECONDS.review_reminder,
  };
}

/**
 * N5 — the morning after an AUTO-close, once (§8.2 row 5).
 *
 * Only after an auto-close: a day somebody closed themselves was closed
 * deliberately, and reminding them about it the next morning would be the
 * product second-guessing a decision they made.
 */
export function pendingReviewPayload(input: {
  pendingCount: number;
  reviewUrl: string;
}): BuiltPayload {
  return {
    title: `Yesterday has ${input.pendingCount} ${input.pendingCount === 1 ? "item" : "items"} to review`,
    url: input.reviewUrl,
    actions: [{ action: "review", title: "Review" }],
    actionUrls: { review: input.reviewUrl },
    ttlSeconds: TTL_SECONDS.pending_review,
  };
}

/**
 * N6 — at the person's chosen day and time, only when next week is unplanned
 * (§8.2 row 6).
 *
 * It states a fact about next week and offers the screen that changes it. It
 * does not say the week SHOULD be planned, and it never arrives when it is.
 */
export function weekBuildPayload(input: { weekUrl: string }): BuiltPayload {
  return {
    title: "Next week isn't planned yet",
    url: input.weekUrl,
    actions: [{ action: "plan", title: "Plan" }],
    actionUrls: { plan: input.weekUrl },
    ttlSeconds: TTL_SECONDS.week_build,
  };
}

/**
 * N2 — the journal reminder, at the person's time, only while tonight's
 * entry is empty (UX v1.2 §9, R38; RUN-6).
 *
 * *A few lines* is an invitation, not a task: it names nothing owed and
 * counts nothing. The body is the time alone, so the push reads as a moment
 * rather than a nudge; it never arrives once a line has been written.
 * [COPY — needs Vesper sign-off]
 */
export function journalReminderPayload(input: {
  dueAt: Date;
  timeZone: string;
  journalUrl: string;
}): BuiltPayload {
  return {
    title: "A few lines",
    body: formatClock(input.dueAt, input.timeZone),
    url: input.journalUrl,
    actions: [{ action: "write", title: "Write" }],
    actionUrls: { write: input.journalUrl },
    ttlSeconds: TTL_SECONDS.journal_reminder,
  };
}
