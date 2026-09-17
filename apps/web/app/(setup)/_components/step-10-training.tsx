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
  const workouts = trpc.habit.list.useQuery({ includeArchived: false, types: ["workout"] });
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
                void goTo(11, setupRoute(11));
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
            renderCard={(habit, draft, callbacks) => (
              <WorkoutSetupCard
                key={habit?.id ?? `draft-${draft}`}
                habit={habit}
                initiallyOpen={habit === null}
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
 * The cards as a list that appends — shared by screens 10 and 12. A draft is
 * an appended card without a row; once it creates one, the list keeps the
 * draft's card until the refetch carries the row, so nothing flashes.
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
    habit: HabitSummaryView | null,
    draft: number,
    callbacks: { onCreated: (id: string) => void; onRemoved: () => void; onDiscard: () => void },
  ) => React.ReactNode;
  footer?: React.ReactNode;
}) {
  const utils = trpc.useUtils();
  const [drafts, setDrafts] = React.useState<number[]>([]);
  const [createdByDraft, setCreatedByDraft] = React.useState<ReadonlyMap<number, string>>(new Map());
  const nextDraft = React.useRef(0);

  // Once the list carries a draft's row, the draft's card is the list's card.
  React.useEffect(() => {
    const landed = [...createdByDraft.entries()].filter(([, id]) => rows.some((row) => row.id === id));
    if (landed.length === 0) return;
    setDrafts((current) => current.filter((draft) => !landed.some(([id]) => id === draft)));
    setCreatedByDraft((current) => {
      const next = new Map(current);
      for (const [id] of landed) next.delete(id);
      return next;
    });
  }, [rows, createdByDraft]);

  const dropDraft = (draft: number) => setDrafts((current) => current.filter((id) => id !== draft));
  const created = new Set(createdByDraft.values());
  const shown = rows.filter((row) => !created.has(row.id));
  const refresh = () => void utils.habit.list.invalidate();

  return (
    <div className="flex flex-col gap-(--space-3)">
      {loading ? (
        <SkeletonRow />
      ) : shown.length === 0 && drafts.length === 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.nothingYet}
        </Text>
      ) : null}

      {shown.map((habit) =>
        renderCard(habit, -1, { onCreated: () => undefined, onRemoved: refresh, onDiscard: () => undefined }),
      )}

      {drafts.map((draft) =>
        renderCard(null, draft, {
          onCreated: (id) => setCreatedByDraft((current) => new Map(current).set(draft, id)),
          onRemoved: () => {
            dropDraft(draft);
            refresh();
          },
          onDiscard: () => dropDraft(draft),
        }),
      )}

      <Button
        variant="secondary"
        className="w-full wide:w-auto wide:self-start"
        disabled={disabled}
        onClick={() => setDrafts((current) => [...current, nextDraft.current++])}
      >
        {addLabel}
      </Button>

      {footer}
    </div>
  );
}
