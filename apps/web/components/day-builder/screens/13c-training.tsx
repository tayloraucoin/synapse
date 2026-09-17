"use client";

import * as React from "react";

import type { DayPlanTraining, HabitSummaryView, TrainingPlacement } from "@syn/types";
import { QuickChipRow, SegmentedControl, SelectRow, SelectRowList, Text } from "@syn/ui";

import { DAY_BUILDER_COPY as COPY } from "../copy";
import type { DayBuilderApi } from "../use-day-builder";

type When = "before" | "midday" | "after";
type Side = "before_morning" | "after_morning";

function whenOf(placement: TrainingPlacement): When {
  if (placement === "inside_work") return "midday";
  if (placement === "after_work") return "after";
  return "before";
}

function placementOf(when: When, side: Side): TrainingPlacement {
  if (when === "midday") return "inside_work";
  if (when === "after") return "after_work";
  return side;
}

/**
 * 13c — training (UX v1.2 §4.13c). Skipped by the shell when there are no
 * workouts.
 *
 * ONE ROW PER WORKOUT; a tick writes `training` with the placement at once
 * — *Before work* is *before the routine* until the segment says otherwise
 * (§13 #18). Travel is the habit's own, only captioned here; the day plans
 * it beside the workout at materialisation (RUN-6).
 */
export function ScreenTraining({
  api,
  workouts,
  disabled,
}: {
  api: DayBuilderApi;
  workouts: readonly HabitSummaryView[];
  disabled: boolean;
}) {
  const plan = api.plan;
  const [line, setLine] = React.useState<string | null>(null);
  if (plan === null) return null;

  const training = plan.trainingPlan;
  const write = (next: readonly DayPlanTraining[]) =>
    api.patch({ training: next.map((entry) => ({ habitId: entry.habitId, placement: entry.placement })) });

  return (
    <div className="flex flex-col gap-(--space-5)">
      <SelectRowList>
        {workouts.map((habit) => {
          const entry = training.find((row) => row.habitId === habit.id) ?? null;
          const when = entry === null ? null : whenOf(entry.placement);
          const side: Side = entry?.placement === "after_morning" ? "after_morning" : "before_morning";
          const travel = habit.travel?.planned ? habit.travel : null;
          return (
            <div key={habit.id} className="flex flex-col gap-(--space-3)">
              <SelectRow
                icon={habit.icon}
                title={habit.title}
                detail={habit.durationMin === null ? undefined : COPY.c.minutes(habit.durationMin)}
                selected={entry !== null}
                disabled={disabled}
                error={line}
                onCommitError={() => setLine(COPY.saveError)}
                onToggle={async (selected) => {
                  setLine(null);
                  if (selected) {
                    await write([...training, { habitId: habit.id, placement: "before_morning" }]);
                  } else {
                    await write(training.filter((row) => row.habitId !== habit.id));
                  }
                }}
              />
              {entry === null ? null : (
                <div className="flex flex-col gap-(--space-3) ps-(--space-4)">
                  <QuickChipRow
                    label={COPY.c.when}
                    selected={when}
                    disabled={disabled}
                    onSelect={(value) =>
                      void write(
                        training.map((row) =>
                          row.habitId === habit.id ? { ...row, placement: placementOf(value as When, side) } : row,
                        ),
                      )
                    }
                    chips={[
                      { label: COPY.c.beforeWork, value: "before" },
                      { label: COPY.c.midday, value: "midday" },
                      { label: COPY.c.afterWork, value: "after" },
                    ]}
                  />
                  {when === "before" ? (
                    <SegmentedControl<Side>
                      label={COPY.c.when}
                      value={side}
                      disabled={disabled}
                      onChange={(value) =>
                        void write(training.map((row) => (row.habitId === habit.id ? { ...row, placement: value } : row)))
                      }
                      options={[
                        { value: "before_morning", label: COPY.c.beforeTheRoutine },
                        { value: "after_morning", label: COPY.c.afterIt },
                      ]}
                      classes={{ label: "sr-only" }}
                    />
                  ) : null}
                  {travel === null ? null : (
                    <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
                      {COPY.c.travel(travel.thereMin, travel.backMin)}
                    </Text>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </SelectRowList>

      <Text as="p" variant="caption" tone="secondary">
        {COPY.c.foot}
      </Text>
    </div>
  );
}
