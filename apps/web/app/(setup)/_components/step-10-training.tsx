"use client";

import * as React from "react";

import { Button, LargeTargetRow, SkeletonRow, Text } from "@syn/ui";
import type { HabitSummaryView } from "@syn/types";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";
import { setupRoute } from "@/lib/routes";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";
import { useStepNavigation } from "./step-frame";
import { useCardEntries } from "./use-card-entries";
import { WorkoutSetupCard } from "./workout-setup-card";

/**
 * Screen 10 — Training (UX v1.2 §4.10; RUN-11).
 *
 * "The rotation: what, how often, usually when, how long, where." *Yes ·
 * Not right now* — the second skips ahead and writes nothing. On yes, the
 * workouts as `WorkoutSetupCard`s: empty, one muted line and *Add a workout*
 * full width; a new card appends **below** and opens, unsaved until its
 * first fact; the muted line under the list says where placement lives.
 * *Continue · n workouts* only navigates.
 *
 * NOTHING HERE ASKS FOR A TIME — where it fits on the day is the builder's.
 * The training template exists from the first *Yes*, as DYN-11 made it.
 */
export function Step10Training({
  embedded = false,
  onSaved,
}: {
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const goTo = useStepNavigation();
  const utils = trpc.useUtils();
  // Created order (UX v1.3 R65): the rotation reads as the person built it.
  const workouts = trpc.habit.list.useQuery({ includeArchived: false, types: ["workout"], order: "created" });
  const templates = trpc.template.list.useQuery({ includeArchived: false, kind: "training" });
  const create = trpc.template.create.useMutation();

  const rows = React.useMemo(
    () => (workouts.data?.habits ?? []).filter((habit) => habit.type === "workout"),
    [workouts.data?.habits],
  );
  const [answer, setAnswer] = React.useState<"yes" | "no" | null>(null);
  const trains = answer === "yes" || (answer === null && rows.length > 0) || embedded;

  const ensuring = React.useRef(false);
  React.useEffect(() => {
    if (!trains || !templates.isSuccess || templates.data.length > 0 || ensuring.current) return;
    ensuring.current = true;
    void create.mutateAsync({ kind: "training" }).then(() => utils.template.list.invalidate());
  }, [trains, templates.isSuccess, templates.data, create, utils]);

  return (
    <FactScreen
      step={10}
      heading={COPY.step10Heading}
      save={null}
      primaryLabel={COPY.continueWorkouts(rows.length)}
      embedded={embedded}
      onSaved={onSaved}
    >
      <div className="flex flex-col gap-(--space-5)">
        {embedded ? null : (
          <LargeTargetRow
            label={COPY.step10Heading}
            layout="stacked"
            value={trains ? "yes" : answer}
            onChange={(value) => {
              if (value === "no") {
                setAnswer("no");
                void goTo(11, setupRoute(11), "other");
                return;
              }
              setAnswer("yes");
            }}
            options={[
              { value: "yes", label: COPY.trainYes },
              { value: "no", label: COPY.trainNo },
            ]}
            className="[&>span:first-child]:sr-only"
          />
        )}

        {trains ? (
          <SetupCards
            rows={rows}
            loading={workouts.isLoading}
            addLabel={COPY.addAWorkout}
            disabled={!online}
            renderCard={({ habit, added }, callbacks) => (
              <WorkoutSetupCard
                habit={habit}
                initiallyOpen={added}
                onCreated={callbacks.onCreated}
                onRemoved={callbacks.onRemoved}
                onDiscard={callbacks.onDiscard}
              />
            )}
            footer={
              <Text as="p" variant="caption" tone="secondary">
                {COPY.whereItFits}
              </Text>
            }
          />
        ) : null}
      </div>
    </FactScreen>
  );
}

/**
 * The cards as a list that appends — shared by screens 10 and 12.
 *
 * A CARD NEVER REMOUNTS ON ITS FIRST WRITE (UX v1.3 §10.2; DAY-2). Every
 * card — a row the list had, or one added here — is one entry of
 * `useCardEntries` with one key for its life; when an added card's create
 * lands, the entry's `habit` goes from null to the row on the same
 * instance. The card treats that as nothing: its draft, its open state and
 * its `idRef` are its own. `data-draft` carries the key, so the same DOM
 * node can be checked across the create.
 */
export function SetupCards({
  rows,
  loading,
  addLabel,
  disabled,
  renderCard,
  footer,
}: {
  rows: HabitSummaryView[];
  loading: boolean;
  addLabel: string;
  disabled: boolean;
  renderCard: (
    entry: { habit: HabitSummaryView | null; added: boolean; index: number },
    callbacks: { onCreated: (id: string) => void; onRemoved: () => void; onDiscard: () => void },
  ) => React.ReactNode;
  footer?: React.ReactNode;
}) {
  const utils = trpc.useUtils();
  const { entries, add, created, removed } = useCardEntries(rows);
  const refresh = () => void utils.habit.list.invalidate();

  return (
    <div className="flex flex-col gap-(--space-3)">
      {loading ? (
        <SkeletonRow />
      ) : entries.length === 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.nothingYet}
        </Text>
      ) : null}

      {entries.map((entry, index) => (
        <div key={entry.key} data-draft={entry.key}>
          {renderCard(
            { habit: entry.row, added: entry.added, index },
            {
              onCreated: (id) => created(entry.key, id),
              onRemoved: () => {
                removed(entry.key);
                refresh();
              },
              onDiscard: () => removed(entry.key),
            },
          )}
        </div>
      ))}

      <Button
        variant="secondary"
        className="w-full wide:w-auto wide:self-start"
        disabled={disabled}
        onClick={add}
      >
        {addLabel}
      </Button>

      {footer}
    </div>
  );
}
