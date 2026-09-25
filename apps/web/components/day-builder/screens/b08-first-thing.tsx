"use client";

import { Step6BeforeTheDay } from "@/app/(setup)/_components/step-6-before-the-day";

import type { DayBuilderApi } from "../use-day-builder";

/**
 * B8 — first thing (UX v1.3 §4.4 B8, R53, R54; DAY-10) — a PROFILE screen,
 * on the first plan only (`visibleScreens`).
 *
 * Screen 6's component mounted `bare` inside the builder's frame — the
 * passages, *To open* (the links, whose kind the server derives), the quote
 * switch with its added caption, and the three lines — so there is one home
 * for that logic until DAY-13 moves the body here. Every switch writes at
 * once; the builder's *Next* is the one primary and reads the counts.
 */
export function ScreenFirstThing({
  api,
  onCounts,
}: {
  api: DayBuilderApi;
  onCounts: (counts: { passages: number; links: number }) => void;
}) {
  const profile = api.profile;
  if (profile === null) return null;
  return (
    <Step6BeforeTheDay
      initialQuotesOptIn={profile.quotesOptIn}
      initialAskGratitude={profile.orientAskGratitude}
      initialAskIntention={profile.orientAskIntention}
      initialAskVisualisation={profile.orientAskVisualisation}
      bare
      onCounts={onCounts}
    />
  );
}
