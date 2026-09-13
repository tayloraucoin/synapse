import { notFound } from "next/navigation";

import { dateKeySchema } from "@syn/validators";
import { formatCalendarDay } from "@syn/utils";

import { JOURNAL_COPY, JournalScreen } from "@/components/journal";
import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { getServerApi } from "@/lib/trpc/server";
import { dayRoute, todayRoute } from "@/lib/routes";

/**
 * `/day/{date}/journal` — the journal (UX v1.1 §7.2, DYN-18).
 *
 * "No header bar beyond a back and the date; paper; a single reading
 * column." Today and any past day may be written (last night's lines can
 * be finished in the morning); a past day opened from Review is read-only
 * serif; a future day is a 404 — a journal is written on its day or after,
 * never ahead.
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

  const api = await getServerApi();
  const { todayKey } = await api.day.today();
  if (date > todayKey) notFound();

  const entry = await api.journal.get({ date });
  const readOnly = from === "review" && date < todayKey;

  return (
    <PageFrame
      dayKey={date}
      contentWidth="text"
      header={
        <ShellPageHeader
          title={formatCalendarDay(new Date(`${date}T12:00:00Z`), "UTC", "long")}
          subtitle={JOURNAL_COPY.title}
          showBack
          backFallback={date === todayKey ? todayRoute() : dayRoute(date)}
        />
      }
    >
      <JournalScreen initial={entry} readOnly={readOnly} />
    </PageFrame>
  );
}
