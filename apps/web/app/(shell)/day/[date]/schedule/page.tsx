import { notFound, redirect } from "next/navigation";

import { dateKeySchema } from "@syn/validators";

import { PageFrame } from "@/components/page-frame";
import { DayListHeader } from "@/components/day-list";
import { ScheduleCanvas } from "@/components/schedule-canvas";
import { getServerApi } from "@/lib/trpc/server";
import { todayScheduleRoute } from "@/lib/routes";

/**
 * SC-01 for a past or future day.
 *
 * TODAY REDIRECTS TO `/today/schedule`, the same rule the List follows: one
 * canonical URL per screen, so the tab bar has one address to compare against
 * and back never walks through a duplicate.
 *
 * A past day keeps its ghosts and bands and loses the now line; a future day
 * is a plan, and its blocks are not buttons.
 */
export default async function DaySchedulePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!dateKeySchema.safeParse(date).success) notFound();

  const api = await getServerApi();
  const { todayKey } = await api.day.today();
  if (todayKey === date) redirect(todayScheduleRoute());

  const day = await api.day.get({ date });

  return (
    <PageFrame
      dayKey={date}
      contentWidth="canvas"
      header={<DayListHeader day={day} />}
    >
      <ScheduleCanvas dateKey={date} initial={day} />
    </PageFrame>
  );
}
