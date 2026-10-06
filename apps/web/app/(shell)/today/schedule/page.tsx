import { PageFrame } from "@/components/page-frame";
import { DayListHeader } from "@/components/day-list";
import { ScheduleCanvas } from "@/components/schedule-canvas";
import { getServerApi } from "@/lib/trpc/server";

/**
 * SC-01 — today, against an axis.
 *
 * THE SAME HEADER AS THE LIST, from the same query. The two tabs are two views
 * of one day, and a header assembled separately here would be a second place
 * the woke time and the shift total could be computed differently.
 */
export default async function TodaySchedulePage() {
  const api = await getServerApi();
  const { todayKey } = await api.day.today();
  const day = await api.day.get({ date: todayKey });

  return (
    <PageFrame
      dayKey={todayKey}
      contentWidth="canvas"
      header={<DayListHeader day={day} />}
    >
      <ScheduleCanvas dateKey={todayKey} initial={day} />
    </PageFrame>
  );
}
