"use client";

import * as React from "react";

import {
  Button,
  CountStepper,
  EllipsesMenu,
  Input,
  ListRow,
  MinutesStepper,
  SkeletonRow,
  Text,
  WeekdayChips,
  type Weekday,
} from "@syn/ui";
import {
  DURATION_MAX,
  DURATION_MIN,
  FOCUS_TITLE_MAX,
  WEEKLY_TARGET_MAX,
  WEEKLY_TARGET_MIN,
  WORKOUT_TITLE_MAX,
} from "@syn/constants";
import type { HabitSummaryView } from "@syn/types";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";

/**
 * The rotation rows — UX v1.1 §4.9 (workouts) and §4.11 (focuses), one
 * component: "what, how often, usually when, how long" for a workout; the
 * same without a length for a focus. Neither asks for a time — placement is
 * a morning decision (§3.7), and unset days mean *decide in the morning*.
 *
 * EACH CHANGE SAVES. A row is a `habits` row with a rotation (TD-3); the
 * first save is `createWorkout` / `createFocus`, every later one
 * `updateRotation`. *Add a workout* opens an inline name field; the row
 * exists once the name is given.
 */

export interface RotationRowsProps {
  kind: "workout" | "deep_work";
}

const TITLE_MAX = { workout: WORKOUT_TITLE_MAX, deep_work: FOCUS_TITLE_MAX } as const;

export function RotationRows({ kind }: RotationRowsProps) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const list = trpc.habit.list.useQuery({ includeArchived: false, types: [kind] });
  const createWorkout = trpc.habit.createWorkout.useMutation();
  const createFocus = trpc.habit.createFocus.useMutation();
  const updateRotation = trpc.habit.updateRotation.useMutation();
  const archive = trpc.habit.archive.useMutation();

  const [naming, setNaming] = React.useState(false);
  const [name, setName] = React.useState("");

  const rows = React.useMemo(
    () => (list.data?.habits ?? []).filter((habit) => habit.type === kind),
    [list.data?.habits, kind],
  );
  const busy = createWorkout.isPending || createFocus.isPending || updateRotation.isPending || archive.isPending;
  const disabled = !online || busy;

  async function refresh(): Promise<void> {
    await utils.habit.list.invalidate();
  }

  async function add(): Promise<void> {
    const title = name.trim();
    if (title === "") return;
    const input = {
      title,
      weeklyTarget: 2,
      typicalDays: null,
      durationMin: kind === "workout" ? 60 : null,
      lifePriority: 6,
    };
    if (kind === "workout") await createWorkout.mutateAsync(input);
    else await createFocus.mutateAsync(input);
    setName("");
    setNaming(false);
    await refresh();
  }

  async function patch(habit: HabitSummaryView, change: Partial<{ weeklyTarget: number; typicalDays: Weekday[] | null; durationMin: number }>): Promise<void> {
    await updateRotation.mutateAsync({
      id: habit.id,
      habit: {
        title: habit.title,
        weeklyTarget: change.weeklyTarget ?? habit.weeklyTarget ?? 2,
        typicalDays:
          change.typicalDays !== undefined
            ? change.typicalDays
            : habit.typicalDays === null
              ? null
              : [...habit.typicalDays],
        durationMin: kind === "workout" ? (change.durationMin ?? habit.durationMin ?? 60) : null,
        lifePriority: habit.lifePriority,
      },
    });
    await refresh();
  }

  const addLabel = kind === "workout" ? COPY.addAWorkout : COPY.addAFocus;
  const nameLabel = kind === "workout" ? COPY.workoutName : COPY.focusName;

  if (list.isLoading) {
    return (
      <div className="flex flex-col gap-(--space-2)">
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-(--space-4)">
      {rows.length === 0 ? null : (
        <ul className="flex flex-col">
          {rows.map((habit) => (
            <ListRow
              key={habit.id}
              as="li"
              layout="wide"
              title={habit.title}
              meta={
                <span className="flex flex-col gap-(--space-3) pt-(--space-2)">
                  <CountStepper
                    label={`${habit.title} · ${COPY.timesAWeek}`}
                    value={habit.weeklyTarget ?? 2}
                    onChange={(next) => void patch(habit, { weeklyTarget: next })}
                    min={WEEKLY_TARGET_MIN}
                    max={WEEKLY_TARGET_MAX}
                    disabled={disabled}
                  />
                  <WeekdayChips
                    label={`${COPY.usualDays}: ${habit.title}`}
                    value={(habit.typicalDays ?? []) as Weekday[]}
                    onChange={(next) => void patch(habit, { typicalDays: next.length === 0 ? null : next })}
                    indexing="monday"
                    disabled={disabled}
                  />
                  {kind === "deep_work" && (habit.typicalDays === null || habit.typicalDays.length === 0) ? (
                    <Text as="span" variant="caption" tone="secondary">
                      {COPY.decideInTheMorning}
                    </Text>
                  ) : null}
                  {kind === "workout" ? (
                    <MinutesStepper
                      label={`${COPY.typicalLength}: ${habit.title}`}
                      value={habit.durationMin ?? 60}
                      onChange={(next) => void patch(habit, { durationMin: next })}
                      min={DURATION_MIN}
                      max={DURATION_MAX}
                      step={5}
                      disabled={disabled}
                    />
                  ) : null}
                </span>
              }
              trailing={
                <EllipsesMenu
                  label={habit.title}
                  disabled={disabled}
                  items={[
                    {
                      label: COPY.remove,
                      onClick: () => {
                        void archive.mutateAsync({ id: habit.id }).then(refresh);
                      },
                    },
                  ]}
                />
              }
            />
          ))}
        </ul>
      )}

      {naming ? (
        <form
          className="flex items-end gap-(--space-2)"
          onSubmit={(event) => {
            event.preventDefault();
            void add();
          }}
        >
          <Input
            label={nameLabel}
            value={name}
            maxLength={TITLE_MAX[kind]}
            autoFocus
            disabled={disabled}
            onChange={(event) => setName(event.target.value)}
          />
          <Button type="submit" disabled={disabled || name.trim() === ""} busy={busy}>
            {COPY.add}
          </Button>
        </form>
      ) : (
        <Button variant="secondary" className="self-start" disabled={disabled} onClick={() => setNaming(true)}>
          {addLabel}
        </Button>
      )}
    </div>
  );
}
