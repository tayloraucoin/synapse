"use client";

import * as React from "react";

import type { DayPlanTraining, HabitSummaryView, TrainingPlacement } from "@syn/types";
import {
  EmojiSlot,
  GroupHeading,
  LargeTargetRow,
  QuickChipRow,
  SegmentedControl,
  SelectRow,
  SelectRowList,
  SortableHandle,
  SortableList,
  Text,
} from "@syn/ui";

import { SetupCards } from "@/app/(setup)/_components/setup-cards";
import { WorkoutSetupCard } from "@/app/(setup)/_components/workout-setup-card";
import { trpc } from "@/lib/trpc/client";

import { BuilderSkeleton } from "../builder-skeleton";
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

const PLACEMENT_WORD: Record<TrainingPlacement, string> = {
  before_morning: COPY.b04.beforeTheRoutine,
  after_morning: COPY.b04.afterIt,
  inside_work: COPY.b04.midday,
  after_work: COPY.b04.afterWork,
  in_break: COPY.b04.midday,
};

/**
 * B4 — training (UX v1.3 §4.4 B4, R52, §3.15; v1.2 §4.13c + §4.10 merged;
 * DAY-9).
 *
 * THE ROTATION, THEN THIS DAY. On the first plan with no workouts yet, *Yes ·
 * Not right now* first — *Not right now* writes nothing and moves on. Then the
 * `WorkoutSetupCard`s in created order (R65) — DAY-2's cards, which never
 * remount on their first write — and, once one exists, *On this day*: a row
 * per workout, and a tick writes `training` with its placement at once.
 * SEVERAL MAY BE SELECTED (R52): DAY-6 materialises a band per entry, in the
 * list's order. Two in the same placement get a handle, and a drop rewrites
 * `training`'s order within that placement only.
 *
 * *Not on this day* (the frame's ghost) clears the plan's training.
 */
export function ScreenTraining({
  api,
  disabled,
  onForward,
}: {
  api: DayBuilderApi;
  disabled: boolean;
  /** *Not right now* moves on without a write. */
  onForward: () => void;
}) {
  const plan = api.plan;
  const utils = trpc.useUtils();
  // Created order (R65): the rotation reads as the person built it.
  const workoutsQuery = trpc.habit.list.useQuery({ includeArchived: false, types: ["workout"], order: "created" });
  const templates = trpc.template.list.useQuery({ includeArchived: false, kind: "training" });
  const createTemplate = trpc.template.create.useMutation();
  const workouts = React.useMemo(
    () => (workoutsQuery.data?.habits ?? []).filter((habit) => habit.type === "workout"),
    [workoutsQuery.data?.habits],
  );
  const [answer, setAnswer] = React.useState<"yes" | "no" | null>(null);
  const [line, setLine] = React.useState<string | null>(null);

  const first = plan?.sortOrder === 0;
  const asking = first && workouts.length === 0 && answer !== "yes";
  const trains = !asking;

  // The training template exists from the first *Yes*, as DYN-11 made it (screen 10 did the same).
  const ensuring = React.useRef(false);
  React.useEffect(() => {
    if (!trains || !templates.isSuccess || templates.data.length > 0 || ensuring.current) return;
    ensuring.current = true;
    void createTemplate.mutateAsync({ kind: "training" }).then(() => utils.template.list.invalidate());
  }, [trains, templates.isSuccess, templates.data, createTemplate, utils]);

  if (plan === null) return null;
  if (workoutsQuery.isLoading) return <BuilderSkeleton />;

  const training = plan.trainingPlan;
  const write = (next: readonly DayPlanTraining[]) =>
    api.patch({ training: next.map((entry) => ({ habitId: entry.habitId, placement: entry.placement })) });
  const byId = new Map(workouts.map((habit) => [habit.id, habit]));

  // Placements held by two or more — each gets its order list (R52).
  const shared = (Object.keys(PLACEMENT_WORD) as TrainingPlacement[])
    .map((placement) => ({ placement, entries: training.filter((entry) => entry.placement === placement) }))
    .filter((group) => group.entries.length > 1);

  const reorderWithin = (placement: TrainingPlacement, ids: string[]) => {
    const queue = ids.slice();
    const next = training.map((entry) => (entry.placement === placement ? { ...entry, habitId: queue.shift() ?? entry.habitId } : entry));
    void write(next);
  };

  return (
    <div className="flex flex-col gap-(--space-5)">
      {asking ? (
        <LargeTargetRow
          label={COPY.b04.heading}
          layout="stacked"
          value={answer}
          disabled={disabled}
          onChange={(value) => {
            if (value === "no") {
              setAnswer("no");
              onForward();
              return;
            }
            setAnswer("yes");
          }}
          options={[
            { value: "yes", label: COPY.b04.yes },
            { value: "no", label: COPY.b04.notRightNow },
          ]}
          className="[&>span:first-child]:sr-only"
        />
      ) : (
        <SetupCards
          rows={workouts}
          loading={false}
          addLabel={COPY.b04.addAWorkout}
          disabled={disabled}
          renderCard={({ habit, added }, callbacks) => (
            <WorkoutSetupCard
              habit={habit}
              initiallyOpen={added}
              onCreated={callbacks.onCreated}
              onRemoved={callbacks.onRemoved}
              onDiscard={callbacks.onDiscard}
            />
          )}
        />
      )}

      {workouts.length === 0 ? null : (
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{COPY.b04.onThisDay}</GroupHeading>
          <SelectRowList>
            {workouts.map((habit) => (
              <WorkoutRow
                key={habit.id}
                habit={habit}
                entry={training.find((row) => row.habitId === habit.id) ?? null}
                disabled={disabled}
                line={line}
                onError={() => setLine(COPY.saveError)}
                onToggle={async (selected) => {
                  setLine(null);
                  await write(
                    selected
                      ? [...training, { habitId: habit.id, placement: "before_morning" }]
                      : training.filter((row) => row.habitId !== habit.id),
                  );
                }}
                onPlace={(placement) =>
                  void write(training.map((row) => (row.habitId === habit.id ? { ...row, placement } : row)))
                }
              />
            ))}
          </SelectRowList>

          {shared.map((group) => (
            <div key={group.placement} className="flex flex-col gap-(--space-2)">
              <Text as="h3" variant="secondary" weight={500} tone="secondary">
                {COPY.b04.inOrder(PLACEMENT_WORD[group.placement])}
              </Text>
              <SortableList
                label={COPY.b04.inOrder(PLACEMENT_WORD[group.placement])}
                items={group.entries.map((entry) => ({ id: entry.habitId, title: byId.get(entry.habitId)?.title ?? "" }))}
                disabled={disabled}
                onReorder={(ids) => reorderWithin(group.placement, ids)}
                renderItem={(item, { handleProps }) => (
                  <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
                    <SortableHandle {...handleProps} />
                    <EmojiSlot icon={byId.get(item.id)?.icon ?? null} />
                    <Text as="span" variant="row-title" weight={500} truncate>
                      {item.title}
                    </Text>
                  </div>
                )}
              />
            </div>
          ))}

          <Text as="p" variant="caption" tone="secondary">
            {COPY.b04.foot}
          </Text>
        </section>
      )}
    </div>
  );
}

/** One workout on this day: the tick, then *When* and — before work — which side of the routine. */
function WorkoutRow({
  habit,
  entry,
  disabled,
  line,
  onError,
  onToggle,
  onPlace,
}: {
  habit: HabitSummaryView;
  entry: DayPlanTraining | null;
  disabled: boolean;
  line: string | null;
  onError: () => void;
  onToggle: (selected: boolean) => Promise<void>;
  onPlace: (placement: TrainingPlacement) => void;
}) {
  const when = entry === null ? null : whenOf(entry.placement);
  const side: Side = entry?.placement === "after_morning" ? "after_morning" : "before_morning";
  const travel = habit.travel?.planned ? habit.travel : null;
  return (
    <div className="flex flex-col gap-(--space-3)">
      <SelectRow
        icon={habit.icon}
        title={habit.title}
        detail={habit.durationMin === null ? undefined : COPY.b04.minutes(habit.durationMin)}
        selected={entry !== null}
        disabled={disabled}
        error={line}
        onCommitError={onError}
        onToggle={onToggle}
      />
      {entry === null ? null : (
        <div className="flex flex-col gap-(--space-3) ps-(--space-4)">
          <QuickChipRow
            label={COPY.b04.when}
            selected={when}
            disabled={disabled}
            onSelect={(value) => onPlace(placementOf(value as When, side))}
            chips={[
              { label: COPY.b04.beforeWork, value: "before" },
              { label: COPY.b04.midday, value: "midday" },
              { label: COPY.b04.afterWork, value: "after" },
            ]}
          />
          {when === "before" ? (
            <SegmentedControl<Side>
              label={COPY.b04.when}
              value={side}
              disabled={disabled}
              onChange={(value) => onPlace(value)}
              options={[
                { value: "before_morning", label: COPY.b04.beforeTheRoutine },
                { value: "after_morning", label: COPY.b04.afterIt },
              ]}
              classes={{ label: "sr-only" }}
            />
          ) : null}
          {travel === null ? null : (
            <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
              {COPY.b04.travel(travel.thereMin, travel.backMin)}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
