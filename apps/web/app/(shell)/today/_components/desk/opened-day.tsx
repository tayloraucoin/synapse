"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GroupHeading, RegionRetry, Text } from "@syn/ui";
import { weekdayIndex, weekKeyOf } from "@syn/utils";
import { PlannerItemRow } from "@/components/planner";
import { TierGroup } from "@/components/work";
import { useClients } from "@/lib/data/use-clients";
import { useLinear } from "@/lib/data/use-linear";
import { useTodos } from "@/lib/data/use-todos";
import { useWeek } from "@/lib/data/use-week";
import { useShownWeek, useWeekView } from "@/lib/data/use-week-view";
import {
  addSheetRoute,
  itemSheetRoute,
  todoSheetRoute,
  weekRoute,
} from "@/lib/routes";
import { clockWords, DESK_COPY as COPY } from "./copy";
import { openedDayTiers } from "./opened-day-view";

/**
 * Another date in Today's layout, planning (USE-58; opened-day.md,
 * D-USE-41): the date in the serif with its "Work ends" on the right where
 * Today has the time, Step away and + Add; "‹ Week" with the planning line;
 * the tiers, the first undone item in the card's shade with no Start or
 * Done; "+ Add to <tier>" on an empty tier; the date's To-dos under a rule.
 * No band (no current block on another date), no Next strip, no lead slot:
 * nothing fires, starts or is done from here, and no key acts on a row
 * (C-USE-today-opened-day-2).
 *
 * ‹ Week returns to the Week on this date's week, in the lens it was left in:
 * the lens is the Week's remembered toggle (C-USE-today-opened-day-4).
 */
export function OpenedDay({ dateKey }: { dateKey: string }) {
  const weekKey = weekKeyOf(dateKey);
  const { view, isError, retry } = useWeekView(weekKey);
  const week = useWeek(weekKey);
  const { clientFor } = useClients();
  const { issueFor } = useLinear();
  const todos = useTodos(dateKey);
  const thisWeek = useShownWeek();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;

  const weekday = weekdayIndex(dateKey);
  const day = view?.days.find((entry) => entry.dateKey === dateKey) ?? null;
  const records = week.week?.days.find((entry) => entry.date === dateKey);
  const tiers =
    day && records
      ? openedDayTiers({
          day,
          workItems: records.records.workItems,
          slots: records.records.slots,
          clientFor,
          issueFor,
        })
      : null;
  const workItemOf = new Map(
    Object.values(day?.cells ?? {})
      .flat()
      .map((chip) => [chip.id, chip.workItemId]),
  );
  const firstWork = records?.blocks.find(
    (entry) => entry.block.kind === "work",
  );

  return (
    <div className="flex flex-col gap-(--space-6)">
      <header className="flex flex-col gap-(--space-3)">
        <div className="flex items-baseline justify-between gap-(--space-4)">
          <h1 className="font-serif text-review-title text-ink">
            {COPY.title(weekday, dateKey)}
          </h1>
          {day ? (
            <Text as="span" variant="secondary" tone="muted" weight={400}>
              {day.fits}
            </Text>
          ) : null}
        </div>
        <p className="flex items-baseline gap-(--space-3)">
          <Link
            href={
              weekKey === thisWeek.weekKey
                ? weekRoute()
                : weekRoute({ week: weekKey })
            }
            aria-label={COPY.backLabel}
            className="rounded-(--radius-control) text-label font-semibold text-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {COPY.back}
          </Link>
          <Text as="span" variant="secondary" tone="muted" weight={400}>
            {COPY.planning(weekday)}
          </Text>
        </p>
      </header>

      {isError ? (
        <RegionRetry label={COPY.dayError} onRetry={() => void retry()} />
      ) : tiers === null ? null : (
        <div className="flex flex-col gap-(--space-6)">
          {tiers.map((group) => (
            <TierGroup
              key={group.tier}
              tier={group.tier}
              word={group.word}
              rows={group.rows}
              planning
              headingAs="h2"
              onOpen={(id) => {
                const item = workItemOf.get(id);
                if (item) router.push(itemSheetRoute(here, item));
              }}
              empty={
                <Link
                  href={addSheetRoute(here, {
                    block: firstWork?.block.id,
                    ...(group.tier === "primary" || group.tier === "secondary"
                      ? { tier: group.tier }
                      : {}),
                  })}
                  className="inline-flex min-h-10 items-center rounded-(--radius-control) text-label text-muted-foreground outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {COPY.addTo(group.word)}
                </Link>
              }
            />
          ))}
        </div>
      )}

      {todos.rows && todos.rows.length > 0 ? (
        <section
          aria-label={COPY.todos}
          className="border-t border-border pt-(--space-4)"
        >
          <GroupHeading as="h2">{COPY.todos}</GroupHeading>
          <ul className="flex flex-col">
            {todos.rows.map((row) => (
              <li key={row.id}>
                <PlannerItemRow
                  item={{
                    id: row.id,
                    title: row.title,
                    emoji: row.icon?.kind === "emoji" ? row.icon.value : null,
                    checked: row.checked,
                    meta:
                      row.carriedLabel ??
                      (row.reminderAt ? clockWords(row.reminderAt) : null),
                  }}
                  onCheckedChange={(id, checked) =>
                    void (checked ? todos.check(id) : todos.uncheck(id))
                  }
                  onOpen={(id) => router.push(todoSheetRoute(here, { id }))}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
