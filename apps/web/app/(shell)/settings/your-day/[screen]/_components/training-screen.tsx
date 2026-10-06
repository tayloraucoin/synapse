"use client";

import * as React from "react";

import { Text } from "@syn/ui";

import { SETUP_COPY as COPY } from "@/app/(setup)/_components/copy";
import { FactScreen } from "@/app/(setup)/_components/fact-screen";
import { SetupCards } from "@/app/(setup)/_components/setup-cards";
import { WorkoutSetupCard } from "@/app/(setup)/_components/workout-setup-card";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

/**
 * Settings → Your day → *Training* (UX v1.3 §4.6) — v1.2's screen 10
 * (§4.10; RUN-11) as Settings always showed it, moved here by DAY-13 when
 * the step files were retired (the sequence's *Yes · Not right now* lives on
 * the builder's B4 now).
 *
 * "The rotation: what, how often, usually when, how long, where." The
 * workouts as `WorkoutSetupCard`s: empty, one muted line and *Add a workout*
 * full width; a new card appends **below** and opens, unsaved until its
 * first fact; the muted line under the list says where placement lives.
 *
 * NOTHING HERE ASKS FOR A TIME — where it fits on the day is the builder's.
 * The training template exists from the first visit, as DYN-11 made it.
 */
export function TrainingScreen({ onSaved }: { onSaved?: () => void }) {
  const online = useOnline();
  const utils = trpc.useUtils();
  // Created order (UX v1.3 R65): the rotation reads as the person built it.
  const workouts = trpc.habit.list.useQuery({ includeArchived: false, types: ["workout"], order: "created" });
  const templates = trpc.template.list.useQuery({ includeArchived: false, kind: "training" });
  const create = trpc.template.create.useMutation();

  const rows = React.useMemo(
    () => (workouts.data?.habits ?? []).filter((habit) => habit.type === "workout"),
    [workouts.data?.habits],
  );

  const ensuring = React.useRef(false);
  React.useEffect(() => {
    if (!templates.isSuccess || templates.data.length > 0 || ensuring.current) return;
    ensuring.current = true;
    void create.mutateAsync({ kind: "training" }).then(() => utils.template.list.invalidate());
  }, [templates.isSuccess, templates.data, create, utils]);

  return (
    <FactScreen step={4} heading={COPY.step10Heading} save={null} embedded onSaved={onSaved}>
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
    </FactScreen>
  );
}
