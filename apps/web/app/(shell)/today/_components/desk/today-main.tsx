"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWorkClock } from "@syn/hooks";
import { GroupHeading, Text } from "@syn/ui";
import { DayBlockBand, PlannerItemRow } from "@/components/planner";
import { WorkNextStrip, WorkRetry, WorkTiersSkeleton } from "@/components/work";
import { AddEntry } from "@/components/work/add";
import { useDataSource } from "@/lib/data/source";
import { dayTitle, wallWords } from "@/lib/data/today-work";
import { useTodayWork, useWorkLoop } from "@/lib/data/use-today-work";
import { itemSheetRoute, todoSheetRoute } from "@/lib/routes";
import { PushCheck } from "../push-check";
import { WORK_COPY as COPY } from "../work/copy";
import { WorkTiers } from "../work/work-tiers";

/**
 * The desk's Today, the main column (USE-57; work/today/index.md, layout 2):
 * the date in the serif with the time on the right; the current block as a
 * band in its colour; the Next strip; the tiers, Next lifted as the card in
 * its place; the To-dos under a rule. Everything comes from `useTodayWork`
 * at the page's one tick; the column decides no order.
 *
 * Outside a Work block the band names the block and the tiers stay, quieter:
 * Next a shaded row with no Start (not-a-work-block.md, D-USE-65). Loading
 * keeps the header real over still skeleton rows; a failed read is the
 * column's own retry, the day column and strip untouched.
 *
 * The header's + Add ⌄ (USE-61) is USE-51's menu: Task to a tier opens New
 * task in the block under way; To-do opens a new to-do; From the pool and
 * Event wait on their tickets.
 */
export function TodayMain() {
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

  const openItem = (slotId: string) => {
    const item = view?.workItemIds.get(slotId);
    if (item) router.push(itemSheetRoute(here, item), { scroll: false });
  };
  const goToNext = () => {
    const id = view?.nextRow?.id;
    if (!id) return;
    document
      .querySelector<HTMLElement>(
        `[data-next-card="${id}"] [data-open], [data-work-row="${id}"] [data-open]`,
      )
      ?.focus();
  };

  return (
    <div className="flex flex-col gap-(--space-4)">
      <header className="flex items-baseline justify-between gap-(--space-4)">
        <h1 className="font-serif text-review-title text-ink">
          {view?.title ?? dayTitle(dateKey)}
        </h1>
        <div className="flex items-center gap-(--space-4)">
          <Text
            as="span"
            variant="secondary"
            tone="muted"
            weight={400}
            className="tabular-nums"
          >
            {view?.time ?? wallWords(now, source.scenario.records.timeZone)}
          </Text>
          <AddEntry
            dateKey={dateKey}
            block={
              view?.band?.isWork
                ? {
                    id: view.band.id,
                    name: view.band.name,
                    startsAt: view.band.startsAt,
                    endsAt: view.band.endsAt,
                  }
                : null
            }
            onTodo={() =>
              router.push(todoSheetRoute(here, { new: true }), {
                scroll: false,
              })
            }
            openOnLoad={
              source.scenario.view?.open === "add" ? "add" : undefined
            }
          />
        </div>
      </header>

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
          {view.band ? (
            <DayBlockBand
              kind={view.band.kind}
              name={view.band.name}
              detail={view.band.detail}
            />
          ) : null}
          {view.nextRow ? (
            <WorkNextStrip
              label={COPY.nextLabel}
              emoji={view.nextRow.emoji}
              title={view.nextRow.title}
              tierWord={view.nextRow.tierWord}
              go={{
                word: COPY.go,
                name: COPY.goName(view.nextRow.title),
                onGo: goToNext,
              }}
            />
          ) : view.allFiring ? (
            <WorkNextStrip
              label={COPY.nextLabel}
              emoji={null}
              title={COPY.allFiring}
              tierWord={null}
              go={null}
            />
          ) : null}
          <WorkTiers
            view={view}
            now={now}
            loop={loop}
            className="pt-(--space-2)"
            onOpen={openItem}
            onCheckReminder={work.checkTodo}
          />
        </>
      )}

      {work.todos && work.todos.length > 0 ? (
        <section
          aria-label={COPY.todos}
          className="border-border mt-(--space-2) border-t pt-(--space-4)"
        >
          <GroupHeading as="h2">{COPY.todos}</GroupHeading>
          <ul className="flex flex-col">
            {work.todos.map((todo) => (
              <li key={todo.id}>
                <PlannerItemRow
                  item={{
                    id: todo.id,
                    title: todo.title,
                    emoji: todo.emoji,
                    checked: todo.checked,
                    meta: todo.meta,
                  }}
                  onCheckedChange={work.checkTodo}
                  onOpen={(id) =>
                    router.push(todoSheetRoute(here, { id }), {
                      scroll: false,
                    })
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <PushCheck />
    </div>
  );
}
