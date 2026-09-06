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
  /** The evening it belongs to. */
  review_reminder: 2 * 60 * 60,
  /** The morning it belongs to. */
  pending_review: 6 * 60 * 60,
  /** The evening and the night after it. */
  week_build: 12 * 60 * 60,
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
 * N1, grouped — two or more items at the same minute (§8.2's grouping rule).
 *
 * NO ACTIONS ON A GROUP. *Start* would have to pick one of them, and picking
 * for someone is the one thing this product does not do. The tap lands on the
 * list with the first row in view, where both are visible and either can be
 * chosen.
 */
export function groupedItemStartPayload(input: {
  titles: readonly string[];
  startsAt: Date;
  timeZone: string;
  focusUrl: string;
}): BuiltPayload {
  return {
    title: `${input.titles.join(" · ")} · ${formatClock(input.startsAt, input.timeZone)}`,
    url: input.focusUrl,
    ttlSeconds: TTL_SECONDS.item_start,
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
    // *Later* has no URL on purpose: it defers, it does not take you anywhere.
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
