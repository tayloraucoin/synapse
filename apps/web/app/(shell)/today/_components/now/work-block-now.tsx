"use client";

import type * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWorkClock } from "@syn/hooks";
import { DayBlockHeader } from "@/components/planner";
import { AllFiringCard, WorkRetry, WorkTiersSkeleton } from "@/components/work";
import { useDataSource } from "@/lib/data/source";
import { TODAY_WORK_COPY } from "@/lib/data/today-work";
import type { NowBlockView } from "@/lib/data/use-now";
import { useTodayWork, useWorkLoop } from "@/lib/data/use-today-work";
import { itemSheetRoute } from "@/lib/routes";
import { WORK_COPY as COPY } from "../work/copy";
import { WorkTiers } from "../work/work-tiers";

/**
 * Now inside a Work block, on the phone (USE-57; work/today/index.md, phone
 * layout, D-USE-50): the block's header ("9:30 to 12:00 · Kestrel weekly at
 * 11:00", ···), then the same tiers as the desk, the rows trimmed (D-USE-51).
 * No Next strip: Next is the lifted card in its tier, or a shaded row
 * (D-USE-61). The header stands while the tiers load or fail; the tiers
 * alone wait or retry (loading.md, error.md). With every item firing, the
 * undone to-dos lift into a card under the header (USE-59, D-USE-53).
 */
export function WorkBlockNow({
  block,
  trailing,
}: {
  block: NowBlockView;
  /** Now's ··· pull-down. */
  trailing: React.ReactNode;
}) {
  const source = useDataSource();
  const dateKey = source.todayKey();
  const now = useWorkClock(source.now);
  const work = useTodayWork(dateKey, now);
  const { view } = work;
  const loop = useWorkLoop(dateKey, view);
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;

  const detail =
    view?.band?.id === block.id
      ? view.band.headerDetail
      : TODAY_WORK_COPY.span(block.startsAt, block.endsAt);

  return (
    <section
      aria-labelledby="now-block"
      className="flex flex-1 flex-col gap-(--space-4) px-(--space-4)"
    >
      <div id="now-block">
        <DayBlockHeader
          // The tab's header holds the page's h1 ("Now").
          as="h2"
          kind={block.kind}
          name={block.name}
          detail={detail}
          trailing={trailing}
        />
      </div>
      {work.isError ? (
        <WorkRetry
          label={COPY.error}
          detail={COPY.errorDetail}
          retry={COPY.tryAgain}
          onRetry={work.retry}
        />
      ) : view === null ? (
        <WorkTiersSkeleton label={COPY.loading} />
      ) : (
        <>
          {view.allFiring ? (
            <AllFiringCard
              title={COPY.allFiring}
              lead={COPY.allFiringLead}
              todos={(work.todos ?? []).filter((todo) => !todo.checked)}
              onCheckedChange={work.checkTodo}
            />
          ) : null}
          <WorkTiers
            view={view}
            now={now}
            loop={loop}
            headingAs="h3"
            onOpen={(slotId) => {
              const item = view.workItemIds.get(slotId);
              if (item)
                router.push(itemSheetRoute(here, item), { scroll: false });
            }}
            onCheckReminder={work.checkTodo}
          />
        </>
      )}
    </section>
  );
}
