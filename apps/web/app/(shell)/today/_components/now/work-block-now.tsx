"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWorkClock } from "@syn/hooks";
import { SettingsRow, Text } from "@syn/ui";
import { DayBlockHeader, OfflineLine } from "@/components/planner";
import {
  AllFiringCard,
  StartCard,
  WorkRetry,
  WorkTiersSkeleton,
} from "@/components/work";
import { PoolSheet, type PoolPlaceRef } from "@/components/work/pool-sheet";
import { useDataSource, useIsOffline } from "@/lib/data/source";
import { stillOpenView } from "@/lib/data/tier-edges";
import { TODAY_WORK_COPY } from "@/lib/data/today-work";
import type { NowBlockView } from "@/lib/data/use-now";
import { useTodayLinear } from "@/lib/data/use-today-linear";
import { useTodayWork, useWorkLoop } from "@/lib/data/use-today-work";
import { daysRoute, itemSheetRoute } from "@/lib/routes";
import { WORK_COPY as COPY } from "../work/copy";
import { EMPTY_COPY } from "../work/empty-copy";
import { useStepAway } from "../work/use-step-away";
import { WorkTiers } from "../work/work-tiers";

/**
 * Now inside a Work block, on the phone (USE-57; work/today/index.md, phone
 * layout, D-USE-50): the block's header ("9:30 to 12:00 · Kestrel weekly at
 * 11:00", ···), then the same tiers as the desk, the rows trimmed (D-USE-51).
 * No Next strip: Next is the lifted card in its tier, or a shaded row
 * (D-USE-61). Step away is the pill beside ··· while a work timer runs, and
 * its bar sits under the header while it holds (USE-60, D-USE-52). The header stands while the tiers load or fail; the tiers
 * alone wait or retry (loading.md, error.md). With every item firing, the
 * undone to-dos lift into a card under the header (USE-59, D-USE-53).
 *
 * The day's later Work block (USE-61, later-work-block.md) shows only what is
 * still open, under a quiet line naming where the done work stays; a firing
 * item stays in its tier, firing. The desk keeps the day's tiers whole.
 *
 * Nothing slotted (USE-82, D-USE-56): with work left open on the last
 * workday, the start card stands in the tiers' place, each item checked at
 * its old tier, Bring these in placing the checked ones and Open the pool
 * opening the pool sheet over Now, set to today [ASSUMPTION]; under it,
 * nothing is marked missed. With nothing left open, the line, each tier's
 * add row and the Plan the week row to Set my days › This week.
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
  const view = work.view ? stillOpenView(work.view) : null;
  const loop = useWorkLoop(dateKey, view);
  const linear = useTodayLinear(dateKey, view);
  // Offline is not an error (USE-63, D-USE-56): one line, every control live.
  const offline = useIsOffline();
  const away = useStepAway(view, loop);
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;
  const [poolOpen, setPoolOpen] = React.useState(false);
  const empty = work.empty;
  // [ASSUMPTION] A pick from the pool lands at its old tier when it was left open, else Primary.
  const placeFromPool = (ref: PoolPlaceRef) => {
    const left =
      empty?.kind === "nothing-planned" && ref.kind === "item"
        ? empty.leftOpen.items.find(
            (item) => item.workItemId === ref.workItemId,
          )
        : undefined;
    void work.placeAt(
      ref.kind === "item"
        ? { workItemId: ref.workItemId, title: ref.title }
        : { issueId: ref.issueId, title: ref.title },
      left?.tier ?? "primary",
    );
  };

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
          stepAway={away.stepAway}
        />
      </div>
      {offline ? <OfflineLine text={COPY.offline} /> : null}
      {away.bar}
      {away.live}
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
          {view.later ? (
            <Text as="p" variant="secondary" tone="muted" weight={400}>
              {view.later.line}
            </Text>
          ) : null}
          {view.allFiring ? (
            <AllFiringCard
              title={COPY.allFiring}
              lead={COPY.allFiringLead}
              todos={(work.todos ?? []).filter((todo) => !todo.checked)}
              onCheckedChange={work.checkTodo}
            />
          ) : null}
          {empty?.kind === "nothing-planned" ? (
            <div className="flex flex-col gap-(--space-3)">
              <StartCard
                variant="phone"
                title={EMPTY_COPY.phoneTitle}
                lead={EMPTY_COPY.phoneLead(empty.leftOpen.weekday)}
                items={empty.leftOpen.items}
                words={{
                  openThePool: EMPTY_COPY.openThePool,
                  bringIn: EMPTY_COPY.bringIn,
                }}
                onOpenPool={() => setPoolOpen(true)}
                onBringIn={(slotIds) =>
                  void work.bringIn(empty.leftOpen, slotIds)
                }
              />
              <Text as="p" variant="secondary" tone="muted" weight={400}>
                {EMPTY_COPY.notBrought}
              </Text>
            </div>
          ) : null}
          {empty?.kind === "no-work-slotted" ? (
            <Text as="p" variant="secondary" tone="muted" weight={400}>
              {EMPTY_COPY.phoneNone}
            </Text>
          ) : null}
          {empty?.kind === "nothing-planned" ? null : (
            <WorkTiers
              view={view}
              now={now}
              loop={loop}
              linear={linear}
              unplanned={empty ? { dropZones: false } : null}
              headingAs="h3"
              meetingsInFlow
              onOpen={(slotId) => {
                const item = view.workItemIds.get(slotId);
                if (item)
                  router.push(itemSheetRoute(here, item), { scroll: false });
              }}
              onCheckReminder={work.checkTodo}
            />
          )}
          {empty?.kind === "no-work-slotted" ? (
            <ul className="rounded-(--radius-sheet) border border-hairline">
              <SettingsRow
                title={EMPTY_COPY.planTheWeek}
                description={EMPTY_COPY.planTheWeekLine}
                href={daysRoute({ week: "this" })}
              />
            </ul>
          ) : null}
        </>
      )}
      <PoolSheet
        open={poolOpen}
        onOpenChange={setPoolOpen}
        dateKey={dateKey}
        onPlace={placeFromPool}
      />
      <p aria-live="polite" className="sr-only">
        {work.placed}
      </p>
    </section>
  );
}
