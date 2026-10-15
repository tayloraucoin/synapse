import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dateKeySchema } from "@syn/validators";

import { JOURNAL_COPY, JournalScreen } from "@/components/journal";

export const metadata: Metadata = { title: JOURNAL_COPY.title };

/**
 * `/day/{date}/journal` — Close the day (USE-44; D-USE-73, DYN-18), on
 * fixtures through `useJournal` until the day-records wiring.
 *
 * Focused at every width (`isJournalPath`): no rail, no tabs. Today and any
 * past day may be written; a past day opened from Review (`?from=review`)
 * is read only; a future day is a 404, decided against the person's day
 * key in the screen.
 */
export default async function JournalPage({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { date } = await params;
  const { from } = await searchParams;
  if (!dateKeySchema.safeParse(date).success) notFound();
  return <JournalScreen dateKey={date} fromReview={from === "review"} />;
}
