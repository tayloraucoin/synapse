"use client";

import { useRouter } from "next/navigation";

import { Button, EmptyState, ListRow, ResponsiveSheet } from "@syn/ui";
import { formatCalendarDay, weekDates, weekKeyOf } from "@syn/utils";

import { SheetHost } from "@/components/page-frame";
import { settingsWeekRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { WEEK_COPY as COPY } from "./copy";

/**
 * WR-03 — what came with you into next week.
 *
 * READ-ONLY, DELIBERATELY. A carried task's future is decided where the future
 * is planned — the week build — so the only action here is the door to it.
 * Letting someone re-decide a carry from a report would put the same choice in
 * two places and make one of them the wrong one.
 *
 * *carried {n} times* IS A COUNT, NOT A JUDGEMENT. A task carried four times is
 * a fact about a plan that has not matched a week yet; the product says so and
 * says nothing else about it.
 */
export function CarriedSheet({
  open,
  weekKey,
  onOpenChange,
}: {
  open: boolean;
  weekKey: string;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const week = trpc.review.week.useQuery({ week: weekKey }, { enabled: open });
  const carried = week.data?.carriedItems ?? [];

  const nextWeek = nextWeekKey(weekKey);

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.carriedTitle}
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button
              variant="ghost"
              onClick={() => router.push(settingsWeekRoute(nextWeek))}
            >
              {COPY.openNextWeek}
            </Button>
            <Button onClick={() => onOpenChange(false)}>{COPY.close}</Button>
          </div>
        }
      >
        {carried.length === 0 ? (
          <EmptyState text={COPY.nothingCarried} density="inline" />
        ) : (
          <ul className="flex flex-col">
            {carried.map((item) => (
              <ListRow
                key={item.id}
                as="li"
                title={item.title}
                meta={`${COPY.firstAssigned(
                  formatCalendarDay(
                    new Date(`${item.firstAssignedDate}T12:00:00Z`),
                    "UTC",
                    "short",
                  ),
                )} · ${COPY.carriedTimes(item.carriedCount)}`}
              />
            ))}
          </ul>
        )}
      </ResponsiveSheet>
    </SheetHost>
  );
}

/** The Monday after this week's Sunday, as a week key. */
function nextWeekKey(weekKey: string): string {
  const sunday = weekDates(weekKey)[6];
  if (sunday === undefined) return weekKey;
  const next = new Date(`${sunday}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  // `weekKeyOf` is the one home for the ISO rule.
  return weekKeyOf(next.toISOString().slice(0, 10));
}
