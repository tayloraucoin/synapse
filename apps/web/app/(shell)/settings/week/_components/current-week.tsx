"use client";

import { SkeletonRow } from "@syn/ui";
import { weekKeyOf } from "@syn/utils";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { WeekCanvas, WeekHeader } from "@/components/week-build";
import { trpc } from "@/lib/trpc/client";

/**
 * `/settings/week` — the current week, resolved rather than redirected to.
 *
 * The key comes from `day.today`, so it is the person's day key put through
 * `weekKeyOf`: at 01:00 on a Monday under a 03:00 close, this is still last
 * week, which is the week they are actually still in.
 */
export function CurrentWeek() {
  const today = trpc.day.today.useQuery();

  if (today.data === undefined) {
    return (
      <PageFrame header={<ShellPageHeader title="" showBack />}>
        <div className="flex flex-col gap-(--space-2)">
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </div>
      </PageFrame>
    );
  }

  const weekKey = weekKeyOf(today.data.todayKey);

  return (
    <PageFrame contentWidth="canvas" header={<WeekHeader weekKey={weekKey} />}>
      <WeekCanvas weekKey={weekKey} />
    </PageFrame>
  );
}
