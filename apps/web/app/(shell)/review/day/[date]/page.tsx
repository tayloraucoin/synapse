import { notFound } from "next/navigation";

import { formatCalendarDay, formatClock } from "@syn/utils";
import { dateKeySchema } from "@syn/validators";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { REVIEW_COPY, ReviewDayScreen } from "@/components/review-day";
import { getServerApi } from "@/lib/trpc/server";
import { reviewRoute } from "@/lib/routes";

/**
 * DR-01 Day Review — and DR-07, which is this route in a finished state.
 *
 * THE DAY IS READ ON THE SERVER so the first paint is the real column of
 * decisions rather than a skeleton. The hook then subscribes to the same query
 * and owns every write.
 *
 * `?from=list` IS READ HERE, not in the client leaf: it decides where *Finish
 * later* and DR-07's *Done* return to, and it is a fact about how the screen
 * was entered rather than state that changes while it is open.
 */
export default async function ReviewDayPage({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { date } = await params;
  if (!dateKeySchema.safeParse(date).success) notFound();

  const { from } = await searchParams;
  const api = await getServerApi();
  const day = await api.review.day({ date });

  return (
    <PageFrame
      dayKey={date}
      header={
        <ShellPageHeader
          title={formatCalendarDay(
            new Date(`${date}T12:00:00Z`),
            "UTC",
            "long",
          )}
          // Pending mode says what is owed and when the day ended.
          subtitle={
            day.mode === "pending" && day.closedAt !== null
              ? REVIEW_COPY.closedAtPending(
                  formatClock(day.closedAt, day.timezone),
                  day.pendingCount,
                )
              : day.mode === "edit"
                ? REVIEW_COPY.reviewed
                : undefined
          }
          showBack
          backFallback={reviewRoute()}
        />
      }
    >
      <ReviewDayScreen
        dateKey={date}
        initial={day}
        from={from === "list" ? "list" : null}
      />
    </PageFrame>
  );
}
