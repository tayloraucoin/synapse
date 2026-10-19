import { getServerApi } from "@/lib/trpc/server";

import { TodayScreen } from "./_components/today-screen";

/**
 * LS-01 — today, in one of two states (UX v1.1 R6, DYN-14).
 *
 * THE DAY IS READ ON THE SERVER and handed to the client as `initialData`, so
 * the first paint is the real day rather than a skeleton that resolves a beat
 * later. Unconfirmed, the quick-pick is read the same way; the client screen
 * branches on `confirmedAt` and flips to the list when *Set the day* lands.
 *
 * WHICH DAY "TODAY" IS depends on the person's close time, so it comes from
 * `day.today` rather than from the server's calendar date. At 01:00 under a
 * 03:00 close, today is still yesterday's date — and this is the screen where
 * getting that wrong would show someone an empty list at the end of a long
 * evening.
 */
export default async function TodayPage() {
  const api = await getServerApi();
  const { todayKey } = await api.day.today();
  const day = await api.day.get({ date: todayKey });
  const pick = day.confirmedAt === null ? await api.day.quickPick({ date: todayKey }) : null;
  // UX v1.2 §5.3 (RUN-13): under *Build each morning* the pick opens expanded.
  const me = pick === null ? null : await api.user.me();

  return (
    <TodayScreen
      dateKey={todayKey}
      initialDay={day}
      initialPick={pick}
      pickExpanded={me?.morningMode === "build_each_morning"}
    />
  );
}
