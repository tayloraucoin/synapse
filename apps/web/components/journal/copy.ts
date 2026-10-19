import { weekdayForDayKey, type TomorrowPeek } from "@syn/utils";

/**
 * Close the day's strings (USE-44; day/close-the-day/built-and-words.md).
 * The prompts are the person's (their `journal_prompts`); this file holds
 * only the chrome, and the chrome holds nothing about the person: no count,
 * no ceremony, no starter phrase, no second person.
 */
export const JOURNAL_COPY = {
  title: "Close the day",
  /** The breadcrumb: the block it opens from ("Wind-down" [placeholder]). */
  back: "Wind-down",
  backLabel: "Back to Wind-down",
  /** A past day opened from Review goes back there. */
  backToReview: "Review",
  backToReviewLabel: "Back to Review",
  /** "Monday, 12 October · read back on tomorrow's Orient" */
  dateCaption: (dateKey: string) =>
    `${dayLabel(dateKey)} · read back on tomorrow's Orient`,
  /** [COPY — needs Vesper sign-off: a past day with nothing written.] */
  nothingWritten: "Nothing written.",
  /** §7.2's retrying state, verbatim; offline, instead of "Saved". */
  savingOnThisDevice: "Saving on this device",
  /** D-USE-75. */
  offline: "Offline. The words stay on this phone until back online.",
  /** v1.3 §7.2, the chrome caption over the closing quote (the orient frame's word). */
  aQuote: "A quote",
  /** The quote in quotation marks — the bank's words, never the app's. */
  quoted: (text: string) => `“${text}”`,
  tomorrow: "Tomorrow",
  /** "Wellness at 7:05, then Training" */
  peek: (peek: TomorrowPeek) => {
    const first = `${peek.first.name} at ${clockLabel(peek.first.startsAt)}`;
    return peek.second ? `${first}, then ${peek.second.name}` : first;
  },
  seeIt: "See it",
  seeItLabel: "See tomorrow as Schedule draws it",
} as const;

/** "HH:MM" to the boards' clock: "7:05", "21:50". */
function clockLabel(clock: string): string {
  const [hour = "0", minute = "00"] = clock.split(":");
  return `${Number(hour)}:${minute}`;
}

/** "Monday, 12 October" */
function dayLabel(dateKey: string): string {
  const [, month = 1, day = 1] = dateKey.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, month - 1, 1, 12)));
  return `${weekdayForDayKey(dateKey)}, ${day} ${monthName}`;
}
