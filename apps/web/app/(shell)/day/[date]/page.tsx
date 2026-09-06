import { notFound, redirect } from "next/navigation";

import { dateKeySchema } from "@syn/validators";

import { PageFrame } from "@/components/page-frame";
import { DayList, DayListHeader } from "@/components/day-list";
import { getServerApi } from "@/lib/trpc/server";
import { todayRoute } from "@/lib/routes";

/**
 * LS-01 for a past or future day — record mode and plan mode (cross-cutting
 * §8.2).
 *
 * The segment is validated rather than trusted: a URL is untrusted input, and
 * `dateKeySchema` is the same schema the API uses, so a key that 404s here
 * cannot succeed against a procedure.
 *
 * TODAY REDIRECTS TO `/today`. One canonical URL per screen: without it a
 * person can be on "today" at two different paths, the tab bar has to know
 * about both, and back walks through a duplicate.
 *
 * THE MODE IS THE READ MODEL'S, not this page's. `getDay` computes it from the
 * date against the person's own today key; deciding it here would be a second
 * definition of "past", and the two would disagree for anyone awake at 01:00.
 */
export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!dateKeySchema.safeParse(date).success) notFound();

  const api = await getServerApi();
  const { todayKey } = await api.day.today();
  if (todayKey === date) redirect(todayRoute());

  const day = await api.day.get({ date });

  return (
    <PageFrame dayKey={date} header={<DayListHeader day={day} />}>
      <DayList dateKey={date} initial={day} />
    </PageFrame>
  );
}
