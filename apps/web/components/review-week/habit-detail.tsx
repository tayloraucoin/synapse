"use client";

import { useRouter } from "next/navigation";

import {
  DayOutcomeRow,
  FactLine,
  GroupHeading,
  HabitStrip,
  ScreenFrame,
  Text,
} from "@syn/ui";
import { formatClock, weekdayForDayKey } from "@syn/utils";

import { reviewDayRoute } from "@/lib/routes";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { WEEK_COPY as COPY } from "./copy";

type HabitWeek = RouterOutputs["review"]["habitWeek"];
type DayOutcome = HabitWeek["days"][number];

/**
 * WR-02 — one habit's week, in words.
 *
 * EVERY OUTCOME IS A SENTENCE, NOT A GLYPH. The strip above says the shape of
 * the week at a glance; these rows say what actually happened on each day, in
 * the same vocabulary the person chose the reason in. A row that read only
 * "missed" would make them open the day to find out why, which is the work
 * this screen exists to save.
 *
 * *Last 4 weeks* IS A FACT WITH NO DIRECTION. It is a count over four weeks'
 * items — never an average of four percents, and never compared to the four
 * before it. The moment it acquires an arrow this screen becomes the dashboard
 * the epic forbids.
 *
 * A DAY ROW OPENS THE DAY REVIEW IN EDIT MODE, scrolled to this item (REV-3).
 * The record is changed where it was made, not here — this screen reads.
 */
export function HabitDetail({
  weekKey,
  habitId,
  initial,
  timeZone,
}: {
  weekKey: string;
  habitId: string;
  initial: HabitWeek;
  timeZone: string;
}) {
  const router = useRouter();

  const query = trpc.review.habitWeek.useQuery(
    { week: weekKey, habitId },
    { initialData: initial },
  );
  const habit = query.data ?? initial;

  return (
    <ScreenFrame prose>
      <div className="flex flex-col gap-(--space-5) py-(--space-4)">
        <HabitStrip
          habit={{ icon: habit.icon, title: habit.title }}
          days={
            habit.strip as unknown as React.ComponentProps<
              typeof HabitStrip
            >["days"]
          }
          dayLabels={COPY.dayLabels}
          credit={habit.credit}
          counted={habit.counted}
          layout="stacked"
          size={24}
          // Already here; the strip is a picture on this screen, not a door.
          onOpen={() => undefined}
        />

        <Text as="p" tone="secondary">
          {COPY.thisWeek(habit.credit, habit.counted)}
        </Text>

        <section className="flex flex-col">
          <GroupHeading>{COPY.habits}</GroupHeading>
          <ul className="flex flex-col">
            {habit.days.map((day) => (
              <DayOutcomeRow
                key={day.date}
                weekday={weekdayForDayKey(day.date)}
                timeLabel={
                  day.scheduledStart === null
                    ? undefined
                    : formatClock(day.scheduledStart, timeZone)
                }
                outcome={outcomeOf(day, timeZone)}
                minutes={day.minutes ?? undefined}
                quantity={
                  day.quantityValue === null || day.quantityUnit === null
                    ? undefined
                    : COPY.quantity(day.quantityValue, day.quantityUnit)
                }
                form="long"
                onOpen={
                  day.itemId === null
                    ? undefined
                    : () =>
                        router.push(
                          `${reviewDayRoute(day.date)}?item=${day.itemId}`,
                        )
                }
              />
            ))}
          </ul>
        </section>

        <FactLine>
          {COPY.lastFourWeeks(
            habit.lastFourWeeks.credit,
            habit.lastFourWeeks.counted,
          )}
        </FactLine>
      </div>
    </ScreenFrame>
  );
}

/**
 * One day's outcome, in the document's wording (Epic 3 §3, WR-02).
 *
 * THE ORDER OF THE BRANCHES IS THE ORDER OF SPECIFICITY. A traded-up miss is
 * still a miss and a cut item is still a miss, so both are checked before the
 * general sentence — otherwise every one of them would read *missed — planned
 * it wrong*, which is true of the tier and useless about the day.
 */
function outcomeOf(day: DayOutcome, timeZone: string): string {
  if (day.itemId === null) return COPY.notAssigned;
  if (day.verdict === "pending") return COPY.pending;

  if (day.doneAt !== null) {
    const moved =
      day.originalScheduledStart !== null &&
      day.scheduledStart !== null &&
      day.originalScheduledStart.getTime() !== day.scheduledStart.getTime();

    return moved && day.originalScheduledStart !== null
      ? COPY.doneMoved(
          formatClock(day.doneAt, timeZone),
          formatClock(day.originalScheduledStart, timeZone),
        )
      : COPY.done(formatClock(day.doneAt, timeZone));
  }

  const weight =
    day.verdict === null ? COPY.weight.missed : COPY.weight[day.verdict];

  if (day.tradedUpTitle !== null) return COPY.tradedUp(day.tradedUpTitle);
  if (day.cutByShift) return COPY.cutWhenShifted(weight);
  if (day.tier === null) return COPY.missedPlain;

  return COPY.missed(COPY.tierPhrase[day.tier], day.reasonLabel, weight);
}
