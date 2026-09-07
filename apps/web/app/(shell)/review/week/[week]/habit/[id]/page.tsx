import { notFound } from "next/navigation";

import { weekKeySchema } from "@syn/validators";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { HabitDetail } from "@/components/review-week";
import { getServerApi } from "@/lib/trpc/server";

/**
 * WR-02 Habit strip detail.
 *
 * A ROUTE, NOT A SHEET (cross-cutting §4.1). It is addressable, it is where
 * WR-01's strips and — later — a notification would land, and back returns to
 * the week. On wide it reads as its own column rather than a panel; the URL is
 * the state either way, which is what makes that a presentation choice rather
 * than a second implementation.
 *
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default async function ReviewWeekHabitPage({
  params,
}: {
  params: Promise<{ week: string; id: string }>;
}) {
  const { week, id } = await params;
  if (!weekKeySchema.safeParse(week).success) notFound();

  const api = await getServerApi();
  const view = await api.review.habitWeek({ week, habitId: id });
  const weekView = await api.review.week({ week });

  return (
    <PageFrame header={<ShellPageHeader title={view.title} showBack />}>
      <HabitDetail
        weekKey={week}
        habitId={id}
        initial={view}
        timeZone={weekView.timezone}
      />
    </PageFrame>
  );
}
