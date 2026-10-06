"use client";

import { useRouter } from "next/navigation";

import { ListRow, ReviewRegion, ScreenFrame } from "@syn/ui";
import { weekKeyOf, weekdayForDayKey } from "@syn/utils";

import { REVIEW_COPY as COPY } from "@/components/review-day";
import { usePullToRefresh } from "@/lib/hooks/use-pull-to-refresh";
import {
  reviewDayRoute,
  reviewHistoryRoute,
  reviewWeekRoute,
} from "@/lib/routes";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

/**
 * RV-00 — what is due, in three regions and one link.
 *
 * TODAY HAS FOUR SHAPES and none of them is a nag: something to decide,
 * everything done, already reviewed, or nothing assigned. The last two offer
 * no work, which is the point — a review tab that always found something for
 * you to do would be a tab you stopped opening.
 *
 * PENDING DAYS ARE LISTED, NOT COUNTED DOWN. Each row names its weekday and
 * how many items it holds. There is no total, no badge and no "overdue": a day
 * that closed without being reviewed is waiting, not late.
 *
 * TODAY IS NEVER IN THE PENDING LIST. The Today region speaks for today, and
 * one date appearing in two regions would read as two separate things owed.
 */
export function ReviewTab() {
  const router = useRouter();

  const today = trpc.day.today.useQuery();
  const todayKey = today.data?.todayKey ?? null;

  const day = trpc.review.day.useQuery(
    { date: todayKey ?? "" },
    { enabled: todayKey !== null },
  );
  const pending = trpc.review.pendingDays.useQuery();
  const week = trpc.review.week.useQuery(
    { week: todayKey === null ? "" : weekKeyOf(todayKey) },
    { enabled: todayKey !== null },
  );

  usePullToRefresh(async () => {
    await day.refetch();
    await pending.refetch();
    await week.refetch();
  });

  return (
    <ScreenFrame>
      <div className="flex flex-col gap-(--space-5)">
        <ReviewRegion
          title={COPY.today}
          loading={day.isLoading}
          error={
            day.isError
              ? { label: COPY.loadError, onRetry: () => void day.refetch() }
              : undefined
          }
          status={todayStatus(day.data)}
          action={todayAction(day.data, () => {
            if (todayKey !== null) router.push(reviewDayRoute(todayKey));
          })}
        />

        {(pending.data ?? []).length === 0 ? null : (
          <ul className="flex flex-col">
            {(pending.data ?? []).map((row) => (
              <ListRow
                key={row.date}
                as="li"
                title={COPY.pendingRow(weekdayForDayKey(row.date), row.count)}
                href={reviewDayRoute(row.date)}
              />
            ))}
          </ul>
        )}

        <ReviewRegion
          title={COPY.thisWeek}
          loading={week.isLoading}
          status={weekStatus(week.data)}
          action={
            week.data === undefined
              ? undefined
              : {
                  label: COPY.open,
                  emphasis: "ghost" as const,
                  onClick: () => {
                    if (todayKey !== null) {
                      router.push(reviewWeekRoute(weekKeyOf(todayKey)));
                    }
                  },
                }
          }
        />

        <ul className="flex flex-col">
          <ListRow
            as="li"
            title={COPY.pastWeeksAndDays}
            href={reviewHistoryRoute()}
          />
        </ul>
      </div>
    </ScreenFrame>
  );
}

type ReviewDayData = RouterOutputs["review"]["day"];
type ReviewWeekData = RouterOutputs["review"]["week"];

/** The four shapes of Today. */
function todayStatus(day: ReviewDayData | undefined): string {
  if (day === undefined) return "";

  if (day.reviewedAt !== null && day.result?.percent !== undefined) {
    return COPY.reviewedAt(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: day.timezone,
      }).format(day.reviewedAt),
      day.result?.percent ?? 0,
    );
  }

  if (day.summary.assigned === 0) return COPY.nothingWasAssigned;
  if (day.toDecide.length === 0) return COPY.everyItemWasDone;

  return COPY.todayStatus(
    day.summary.done,
    day.summary.assigned,
    day.toDecide.length,
  );
}

function todayAction(
  day: ReviewDayData | undefined,
  onOpen: () => void,
): { label: string; onClick: () => void; emphasis: "default" | "ghost" } | undefined {
  if (day === undefined) return undefined;
  // Nothing was assigned: there is nothing to close, so nothing is offered.
  if (day.summary.assigned === 0 && day.reviewedAt === null) return undefined;

  return day.reviewedAt !== null
    ? { label: COPY.open, onClick: onOpen, emphasis: "ghost" }
    : { label: COPY.closeOutToday, onClick: onOpen, emphasis: "default" };
}

/** "3 of 5 days reviewed · 84% so far" — *so far* until the week closes. */
function weekStatus(week: ReviewWeekData | undefined): string {
  if (week === undefined) return "";

  const days = COPY.weekStatus(week.reviewed, week.planned);
  const percent = week.result?.percent ?? null;
  if (percent === null) return days;

  return `${days} · ${week.open ? COPY.weekSoFar(percent) : COPY.weekFinal(percent)}`;
}
