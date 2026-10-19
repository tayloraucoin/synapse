"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWorkClock } from "@syn/hooks";
import { Button, GroupHeading, StepAwayIcon, Text, useIsSplit } from "@syn/ui";
import {
  DayBlockBand,
  OfflineLine,
  PlannerItemRow,
} from "@/components/planner";
import {
  LiftedMeeting,
  StartCard,
  WorkNextStrip,
  WorkRetry,
  WorkTiersSkeleton,
} from "@/components/work";
import { AddEntry } from "@/components/work/add";
import { useDataSource, useIsOffline } from "@/lib/data/source";
import { dayTitle, wallWords } from "@/lib/data/today-work";
import { useTodayLinear } from "@/lib/data/use-today-linear";
import { useTodayWork, useWorkLoop } from "@/lib/data/use-today-work";
import {
  useNextTitle,
  useTodayKeys,
  type TodayKeyRow,
} from "@/lib/hooks/use-today-keys";
import { itemSheetRoute, todoSheetRoute, weekRoute } from "@/lib/routes";
import { PushCheck } from "../push-check";
import { WORK_COPY as COPY } from "../work/copy";
import { EMPTY_COPY } from "../work/empty-copy";
import { useStepAway } from "../work/use-step-away";
import { WorkTiers, type WorkTiersKeyActions } from "../work/work-tiers";
import { DESK_COPY } from "./copy";

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
 *
 * Step away (USE-60, D-USE-46) sits left of + Add while a work timer runs;
 * while it holds, its bar sits under the title, above the band.
 *
 * Nothing slotted (USE-82): with work left open on the last workday, the
 * start card under the band offers each item at its old tier, Add both as
 * they were and Plan the week (D-USE-42), the pool docked beside by the
 * frame; with nothing left open, one line to the Week (D-USE-65). The tiers
 * show their add rows either way.
 *
 * The keys (USE-71, D-USE-62): F fires the focused row or brings it back,
 * D is Done, J and K walk the rows (tiers, then To-dos), Enter goes to
 * Next; through the tiers' own actions, never in a field, menu or sheet.
 * The tab reads "Next: <title> — Synapse" (D-USE-43). Desk only: both wait
 * on `useIsSplit`, as the phone's tree is mounted too.
 */
export function TodayMain() {
  const source = useDataSource();
  const dateKey = source.todayKey();
  const now = useWorkClock(source.now);
  const work = useTodayWork(dateKey, now);
  const { view } = work;
  const loop = useWorkLoop(dateKey, view);
  const linear = useTodayLinear(dateKey, view);
  // Offline is not an error (USE-63, D-USE-56): one line, every control live.
  const offline = useIsOffline();
  const away = useStepAway(view, loop);
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;
  const atDesk = useIsSplit();
  const column = useRef<HTMLDivElement>(null);
  const keyActions = useRef<WorkTiersKeyActions | null>(null);

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

  const keyRows: TodayKeyRow[] = [
    ...(view?.tiers ?? []).flatMap((group) =>
      group.rows.map((row) => ({
        key: row.id,
        kind: "work" as const,
        firing: view?.states.get(row.id) === "firing",
        done: view?.states.get(row.id) === "done",
      })),
    ),
    ...(work.todos ?? []).map((todo) => ({
      key: todo.id,
      kind: "todo" as const,
      firing: false,
      done: todo.checked,
    })),
  ];
  useTodayKeys({
    root: column,
    rows: keyRows,
    enabled: atDesk,
    actions: {
      fire: (id) => keyActions.current?.fire(id),
      bringBack: (id) => keyActions.current?.bringBack(id),
      done: (id) => keyActions.current?.done(id),
      goToNext,
      focusTarget: (root, row) => {
        const key = CSS.escape(row.key);
        if (row.kind === "todo") {
          return root.querySelector<HTMLElement>(
            `[data-planner-item-row="${key}"] [data-row-open]`,
          );
        }
        return (
          root.querySelector<HTMLElement>(
            `[data-work-row="${key}"] [data-open], [data-next-card="${key}"] [data-open]`,
          ) ??
          (view?.inHand?.slotId === row.key
            ? root.querySelector<HTMLElement>(
                "[data-running-work-card] [data-open]",
              )
            : null)
        );
      },
      rowOf: (element) => {
        const row = element.closest<HTMLElement>(
          "[data-work-row], [data-next-card], [data-running-work-card], [data-planner-item-row]",
        );
        if (!row) return null;
        if (row.hasAttribute("data-running-work-card")) {
          return view?.inHand?.slotId ?? null;
        }
        return (
          row.dataset.workRow ??
          row.dataset.nextCard ??
          row.dataset.plannerItemRow ??
          null
        );
      },
    },
  });
  useNextTitle(DESK_COPY.tabTitle(view?.nextRow?.title ?? null), atDesk);

  return (
    <div ref={column} className="flex flex-col gap-(--space-4)">
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
          {away.stepAway ? (
            <Button
              variant="secondary"
              size="sm"
              aria-label={away.stepAway.name}
              data-step-away-button
              onClick={away.stepAway.onPress}
            >
              <StepAwayIcon aria-hidden="true" className="size-4" />
              {away.stepAway.label}
            </Button>
          ) : null}
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
      {view ? away.bar : null}
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
          {view.band ? (
            <DayBlockBand
              kind={view.band.kind}
              name={view.band.name}
              detail={view.band.detail}
            />
          ) : null}
          {/* Offline under the band, above the Next strip (D-USE-65). */}
          {offline ? <OfflineLine text={COPY.offline} /> : null}
          {/* A meeting at its time: a row under the band; the tiers stay (D-USE-65). */}
          {view.meetings.lifted.map((meeting) => (
            <LiftedMeeting
              key={meeting.id}
              variant="row"
              heading={meeting.heading}
              title={meeting.title}
              tag={meeting.tag}
              meta={meeting.meta}
            />
          ))}
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
          {work.empty?.kind === "nothing-planned" ? (
            <StartCard
              variant="desk"
              title={EMPTY_COPY.deskTitle}
              lead={EMPTY_COPY.deskLead}
              heading={EMPTY_COPY.leftOpenOn(work.empty.leftOpen.weekday)}
              items={work.empty.leftOpen.items}
              words={{
                was: EMPTY_COPY.was,
                addTo: EMPTY_COPY.addTo,
                addName: EMPTY_COPY.addName,
                addAll: EMPTY_COPY.addAll(work.empty.leftOpen.items.length),
                planTheWeek: EMPTY_COPY.planTheWeek,
              }}
              onAdd={(slotId) => {
                if (work.empty?.kind !== "nothing-planned") return;
                const open = work.empty.leftOpen;
                void work.bringIn(open, new Set([slotId]));
              }}
              onAddAll={() => {
                if (work.empty?.kind !== "nothing-planned") return;
                const open = work.empty.leftOpen;
                void work.bringIn(
                  open,
                  new Set(open.items.map((item) => item.slotId)),
                );
              }}
              onPlanTheWeek={() => router.push(weekRoute())}
            />
          ) : work.empty?.kind === "no-work-slotted" ? (
            <Text as="p" variant="secondary" tone="muted" weight={400}>
              {EMPTY_COPY.deskNone}{" "}
              <Link href={weekRoute()} className="text-ink underline">
                {EMPTY_COPY.planTheWeek}
              </Link>
            </Text>
          ) : null}
          <WorkTiers
            view={view}
            now={now}
            loop={loop}
            linear={linear}
            unplanned={
              work.empty
                ? { dropZones: work.empty.kind === "nothing-planned" }
                : null
            }
            keyActions={keyActions}
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

      <p aria-live="polite" className="sr-only">
        {work.placed}
      </p>
      <PushCheck />
    </div>
  );
}
