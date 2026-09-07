import { SOON_MINUTES } from "./item-state";

/**
 * *Running late?* — Epic 2 §3.6, §6.1.
 *
 * THE TRIGGER IS EVIDENCE, NOT A CLOCK. The line appears when the day itself
 * says someone is behind: the first fixed item of the day started half an hour
 * ago and has not been touched. Not "it is 10am", not "you have not opened the
 * app" — a fact about the plan, which is the only thing the product is entitled
 * to notice.
 *
 * IT IS COMPUTED FROM FIELDS `shell.status` ALREADY READS. SYS-1 returns
 * `firstFixedStartToday` and `hasShiftToday` precisely so this decision needs
 * no second query and can be re-derived on the client's minute tick — a status
 * line whose truth changes at 10:29 should not wait for a refetch.
 *
 * ONCE A SHIFT EXISTS, IT STOPS. The person has answered the question; asking
 * again the same day would be the app nagging about something already handled.
 * Dismissal is separate and client-side, scoped to the day (SYS-1's slot).
 *
 * NOTHING ABOUT THIS CARRIES COLOUR, A COUNT, OR URGENCY (official §2.4). It is
 * an offer of help, and if it reads as a reprimand it has failed.
 */

/** Half an hour past — twice the *soon* window, so it is unambiguous. */
export const LATE_OFFER_THRESHOLD_MIN = SOON_MINUTES * 2;

export function isLateOffer(input: {
  /** The day being viewed is the live one. */
  isToday: boolean;
  closedAt: Date | null;
  hasShiftToday: boolean;
  /** `scheduled_start` of the first fixed, assigned, upcoming item today. */
  firstFixedStartToday: Date | null;
  now: Date;
}): boolean {
  if (!input.isToday) return false;
  if (input.closedAt !== null) return false;
  if (input.hasShiftToday) return false;
  if (input.firstFixedStartToday === null) return false;

  const minutesPast =
    (input.now.getTime() - input.firstFixedStartToday.getTime()) / 60_000;

  return minutesPast >= LATE_OFFER_THRESHOLD_MIN;
}
