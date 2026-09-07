"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  BigNumber,
  CategoryBar,
  FactLine,
  FormulaSentence,
  GroupHeading,
  HabitStrip,
  ItemIcon,
  ListRow,
  EmptyState,
  ScreenFrame,
  TemplateUsageRow,
  Text,
  useIsWide,
} from "@syn/ui";
import { formatCalendarDay, weekDates } from "@syn/utils";

import { reviewWeekHabitRoute } from "@/lib/routes";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { WEEK_COPY as COPY } from "./copy";
import { CarriedSheet } from "./carried-sheet";
import { ShiftsSheet } from "./shifts-sheet";

type WeekView = RouterOutputs["review"]["week"];

/**
 * WR-01 — the week, read slowly.
 *
 * **IT IS A RECORD, NOT A DASHBOARD.** There is no direction of travel, no
 * reference to any previous week, no colour on any outcome, and no sentence
 * that grades anything. The
 * strip's register is neutral by construction — the glyph says what happened,
 * never how it should feel about it — and the category bar's hues are
 * categories, which are the person's own labels, not verdicts.
 *
 * THE NUMBER COVERS REVIEWED DAYS ONLY, AND SAYS SO. An unreviewed day has
 * undecided items; counting them would make the week's percent move every time
 * someone opened a review. The line that names what is left out is what makes
 * the smaller number honest rather than merely smaller.
 *
 * HABITS ARE SORTED BY WHAT SLIPPED (§6.6-adjacent; REV-1 sorts, this renders).
 * Alphabetical would be the obvious default and the wrong one: the reason to
 * open this screen is to find what did not go well, and making a person scan
 * for it is making them do the screen's job.
 */
export function ReviewWeek({
  weekKey,
  initial,
}: {
  weekKey: string;
  initial: WeekView;
}) {
  const router = useRouter();
  const isWide = useIsWide();
  const [sheet, setSheet] = React.useState<"carried" | "shifts" | null>(null);

  const query = trpc.review.week.useQuery(
    { week: weekKey },
    { initialData: initial },
  );
  const week = query.data ?? initial;

  if (week.planned === 0 && week.habits.length === 0) {
    return (
      <ScreenFrame prose>
        <EmptyState text={COPY.nothingPlanned} />
      </ScreenFrame>
    );
  }

  const shares = sharesOf(week.categories);

  return (
    <ScreenFrame prose>
      <div className="flex flex-col gap-(--space-6) py-(--space-4)">
        {/* One region, so the number and its sentence are announced together. */}
        <section
          aria-label={`${week.result?.percent ?? 0}%`}
          className="flex flex-col gap-(--space-2)"
        >
          <BigNumber value={week.result?.percent ?? null} size="week" />
          {week.result === null ? null : (
            <FormulaSentence
              terms={week.result.terms}
              credit={week.result.credit}
              counted={week.result.counted}
              percent={week.result.percent}
            />
          )}
          {week.unreviewedCount === 0 ? null : (
            <FactLine>{COPY.notYetReviewed(week.unreviewedCount)}</FactLine>
          )}
        </section>

        {week.templates.length === 0 ? null : (
          <section className="flex flex-col">
            <GroupHeading>{COPY.templates}</GroupHeading>
            {week.templates.map((template) => (
              <TemplateUsageRow
                key={template.id}
                name={template.name}
                used={template.days}
                // No target is a template used without one — the row says
                // "used 3" rather than inventing a denominator.
                target={null}
              />
            ))}
          </section>
        )}

        {week.habits.length === 0 ? null : (
          <section className="flex flex-col">
            <GroupHeading>{COPY.habits}</GroupHeading>
            {week.habits.map((habit) => (
              <HabitStrip
                key={habit.habitId}
                habit={{ icon: habit.icon, title: habit.title }}
                days={habit.days}
                dayLabels={COPY.dayLabels}
                credit={habit.credit}
                counted={habit.counted}
                // Stacked on compact, where seven squares and a title cannot
                // share a line; inline once there is room (the ticket's rule).
                layout={isWide ? "inline" : "stacked"}
                size={isWide ? 20 : 16}
                onOpen={() =>
                  router.push(reviewWeekHabitRoute(weekKey, habit.habitId))
                }
              />
            ))}
          </section>
        )}

        {week.deepWorkRows.length === 0 ? null : (
          <section className="flex flex-col">
            <GroupHeading>{COPY.deepWork}</GroupHeading>
            <ul className="flex flex-col">
              {week.deepWorkRows.map((row) => (
                <ListRow
                  key={row.habitId ?? row.title}
                  as="li"
                  leading={<ItemIcon icon={row.icon} size={24} />}
                  title={row.title}
                  meta={COPY.deepWorkRow(row.sessions, row.minutes)}
                  trailing={
                    <Text as="span" variant="secondary" tone="secondary">
                      {COPY.ofCounted(row.done, row.counted)}
                    </Text>
                  }
                />
              ))}
            </ul>
          </section>
        )}

        <section className="flex flex-col">
          <GroupHeading>{COPY.tasks}</GroupHeading>
          <ul className="flex flex-col">
            <ListRow
              as="li"
              title={COPY.tasksRow(week.tasks.done, week.tasks.carried)}
              onClick={() => setSheet("carried")}
            />
          </ul>
        </section>

        {week.shifts.count === 0 ? null : (
          <section className="flex flex-col">
            <GroupHeading>{COPY.shifts}</GroupHeading>
            <ul className="flex flex-col">
              <ListRow
                as="li"
                title={COPY.shiftsRow(
                  week.shifts.count,
                  week.shifts.totalMin,
                  week.shifts.mostCommonReason,
                )}
                onClick={() => setSheet("shifts")}
              />
            </ul>
          </section>
        )}

        {week.categories.length === 0 ? null : (
          <section className="flex flex-col gap-(--space-2)">
            <GroupHeading>{COPY.timeByCategory}</GroupHeading>
            {/*
              The bar is decorative; the legend below is the content. A stacked
              bar cannot be read by a screen reader and must never be the only
              place a number lives.
            */}
            <div aria-hidden>
              <CategoryBar segments={week.categories} />
            </div>
            <ul className="flex flex-col">
              {week.categories.map((segment, index) => (
                <ListRow
                  key={segment.name}
                  as="li"
                  title={segment.name}
                  meta={COPY.minutes(segment.minutes)}
                  trailing={
                    <Text as="span" variant="secondary" tone="secondary">
                      {COPY.share(shares[index] ?? 0)}
                    </Text>
                  }
                />
              ))}
            </ul>
            <Text as="p" variant="caption" tone="secondary">
              {COPY.timersOnly}
            </Text>
          </section>
        )}

        {week.open ? null : (
          <Text as="p" tone="secondary">
            {COPY.weekClosed(
              // Sunday, from the one place the ISO week rule lives.
              formatCalendarDay(
                new Date(`${weekDates(weekKey)[6] ?? ""}T12:00:00Z`),
                "UTC",
                "short",
              ),
            )}
          </Text>
        )}
      </div>

      <CarriedSheet
        open={sheet === "carried"}
        weekKey={weekKey}
        onOpenChange={(next: boolean) => {
          if (!next) setSheet(null);
        }}
      />

      <ShiftsSheet
        open={sheet === "shifts"}
        weekKey={weekKey}
        onOpenChange={(next: boolean) => {
          if (!next) setSheet(null);
        }}
      />
    </ScreenFrame>
  );
}

/**
 * Percentage shares that sum to exactly 100 — largest remainder.
 *
 * PLAIN ROUNDING DOES NOT SUM. Three categories at 33.33% each round to 33 and
 * print 99, and a legend that visibly fails to add up undermines every other
 * number on the screen. The largest-remainder method hands the leftover points
 * to the categories that lost the most in rounding, which is both correct and
 * the least arbitrary rule available. The ticket leaves this to the dev; this
 * is the choice, and the reason.
 */
function sharesOf(
  segments: readonly { minutes: number }[],
): number[] {
  const total = segments.reduce((sum, segment) => sum + segment.minutes, 0);
  if (total === 0) return segments.map(() => 0);

  const exact = segments.map((segment) => (segment.minutes / total) * 100);
  const floors = exact.map((value) => Math.floor(value));
  let leftover = 100 - floors.reduce((sum, value) => sum + value, 0);

  const order = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);

  const out = [...floors];
  for (const entry of order) {
    if (leftover <= 0) break;
    out[entry.index] = (out[entry.index] ?? 0) + 1;
    leftover -= 1;
  }
  return out;
}
