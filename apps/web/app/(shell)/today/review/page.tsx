import type { Metadata } from "next";
import { REVIEW_DAY_COPY, ReviewDayFrame } from "./_components";

export const metadata: Metadata = { title: REVIEW_DAY_COPY.title };

/**
 * `/today/review`: Review the day (USE-31; D-USE-7, 10, 23, 25, 39, 65), on
 * fixtures through `useToday` until the day-records wiring. The day already
 * written in, to look over before Ready, go.
 *
 * Focused at every width (`isFocusedPath`): no header, no rail, no tabs, no
 * avatar. Ready, go writes `readyAt` once and goes to the welcome; after it,
 * the entry tree sends this path on to the welcome or Now (D-USE-71).
 */
export default function ReviewDayPage() {
  return <ReviewDayFrame />;
}
