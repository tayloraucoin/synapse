import { PageFrame } from "@/components/page-frame";
import { DayList, DayListHeader } from "@/components/day-list";
import { getServerApi } from "@/lib/trpc/server";

/**
 * LS-01 — today.
 *
 * THE DAY IS READ ON THE SERVER and handed to the client as `initialData`, so
 * the first paint is the real day rather than a skeleton that resolves a beat
 * later. The hook then subscribes to the same query and owns every write; the
 * page does no mutation and holds no state.
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

  return (
    <PageFrame dayKey={todayKey} header={<DayListHeader day={day} />}>
      <DayList dateKey={todayKey} initial={day} />
    </PageFrame>
  );
}
