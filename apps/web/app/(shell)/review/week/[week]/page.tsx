import { notFound } from "next/navigation";

import { weekKeySchema } from "@syn/validators";
import { formatCalendarDay, weekDates } from "@syn/utils";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { ReviewWeek, WEEK_COPY } from "@/components/review-week";
import { getServerApi } from "@/lib/trpc/server";

/**
 * WR-01 Week Review.
 *
 * THE SUBTITLE SAYS WHAT THE NUMBER COVERS. *3 of 4 days reviewed · so far* is
 * the caveat on every figure below it, so it belongs in the header rather than
 * buried beside the percent — a person who reads only the top of this screen
 * should still know the week is not finished.
 *
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default async function ReviewWeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  if (!weekKeySchema.safeParse(week).success) notFound();

  const api = await getServerApi();
  const view = await api.review.week({ week });

  const dates = weekDates(week);
  const asDate = (key: string | undefined) =>
    new Date(`${key ?? ""}T12:00:00Z`);
  const range = `${formatCalendarDay(asDate(dates[0]), "UTC", "short")} – ${formatCalendarDay(
    asDate(dates[6]),
    "UTC",
    "short",
  )}`;

  const subtitle = [
    WEEK_COPY.daysReviewed(view.reviewed, view.planned),
    ...(view.open ? [WEEK_COPY.soFar] : []),
  ].join(" · ");

  return (
    <PageFrame
      header={<ShellPageHeader title={range} subtitle={subtitle} showBack />}
    >
      <ReviewWeek weekKey={week} initial={view} />
    </PageFrame>
  );
}
