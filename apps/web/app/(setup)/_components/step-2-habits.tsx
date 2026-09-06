"use client";

import * as React from "react";

import {
  Button,
  ConfirmDialog,
  EllipsesMenu,
  ItemIcon,
  ListRow,
  SkeletonRow,
} from "@syn/ui";
import type { HabitSummaryView } from "@syn/types";

import { HabitSheet } from "@/components/habit-sheet";
import { StarterSetChooser } from "@/components/starter-set";
import { setupRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { StepFrame, useStepNavigation } from "./step-frame";

/**
 * FR-02 — the first, small habit library.
 *
 * THIS STEP OWNS NO FORM. *Add a habit* opens SET-4's habit sheet and *Start
 * from a small set* reveals SET-4's chooser; both are imported whole. A
 * first-run-only copy of LB-02 would be a second place the 1–7 scale, the
 * range rules and the wake-anchor mark could drift, and it would drift
 * silently because nobody edits a wizard after launch.
 *
 * ZERO HABITS IS A REAL ANSWER. The primary reads *Continue without habits*
 * and skips to FR-05, because a template with nothing to put in it and a week
 * with nothing to apply are two screens that could only waste someone's time.
 *
 * THE LIST REGION IS ABSENT WHEN EMPTY, not a placeholder (Epic 1 FR-02's
 * empty state). An empty box with a dashed border is the product apologising
 * for a state it deliberately allows.
 */
export function Step2Habits() {
  const goTo = useStepNavigation();
  const utils = trpc.useUtils();

  const [sheet, setSheet] = React.useState<{ habitId?: string } | null>(null);
  const [chooserOpen, setChooserOpen] = React.useState(false);
  const [archiveTarget, setArchiveTarget] =
    React.useState<HabitSummaryView | null>(null);

  const list = trpc.habit.list.useQuery({ includeArchived: false });
  const archive = trpc.habit.archive.useMutation();

  const habits = list.data?.habits ?? [];
  const hasHabits = habits.length > 0;

  return (
    <StepFrame
      step={2}
      heading={COPY.step2Heading}
      body={COPY.step2Body}
      primary={{
        label: hasHabits ? COPY.continue : COPY.continueWithoutHabits,
        // With nothing to build a template from, FR-03 and FR-04 have no
        // question to ask, so the sequence goes straight to its last screen.
        onClick: () =>
          hasHabits
            ? void goTo(3, setupRoute(3))
            : void goTo(5, setupRoute(5)),
      }}
    >
      <div className="flex flex-col gap-(--space-4)">
        <div className="flex flex-wrap items-center gap-(--space-3)">
          <Button variant="secondary" onClick={() => setSheet({})}>
            {COPY.addHabit}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setChooserOpen((open) => !open)}
          >
            {COPY.startFromSet}
          </Button>
        </div>

        {chooserOpen ? (
          <StarterSetChooser
            existingTitles={habits.map((habit) => habit.title)}
            onClose={() => setChooserOpen(false)}
          />
        ) : null}

        {list.isLoading ? (
          <div className="flex flex-col gap-(--space-2)">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : null}

        {hasHabits ? (
          <ul className="flex flex-col">
            {habits.map((habit) => (
              <ListRow
                key={habit.id}
                as="li"
                leading={<ItemIcon icon={habit.icon} />}
                title={habit.title}
                meta={COPY.habitMeta(
                  habit.durationMin,
                  habit.durationMax,
                  habit.lifePriority,
                )}
                tag={habit.isWakeAnchor ? "wake-up" : undefined}
                onClick={() => setSheet({ habitId: habit.id })}
                trailing={
                  <EllipsesMenu
                    label={`More actions for ${habit.title}`}
                    items={[
                      {
                        label: COPY.archive,
                        onClick: () => setArchiveTarget(habit),
                      },
                    ]}
                  />
                }
              />
            ))}
          </ul>
        ) : null}
      </div>

      <HabitSheet
        open={sheet !== null}
        mode={sheet?.habitId === undefined ? "create" : "edit"}
        habitId={sheet?.habitId}
        onOpenChange={(next) => {
          if (!next) setSheet(null);
        }}
        onSaved={() => {
          void utils.habit.list.invalidate();
        }}
      />

      <ConfirmDialog
        open={archiveTarget !== null}
        onOpenChange={(next) => {
          if (!next) setArchiveTarget(null);
        }}
        title={COPY.archiveTitle(archiveTarget?.title ?? "")}
        confirmLabel={COPY.archive}
        cancelLabel={COPY.keep}
        busy={archive.isPending}
        onConfirm={() => {
          if (!archiveTarget) return;
          void archive
            .mutateAsync({ id: archiveTarget.id })
            .then(async () => {
              await utils.habit.list.invalidate();
              setArchiveTarget(null);
            });
        }}
        onCancel={() => setArchiveTarget(null)}
      />
    </StepFrame>
  );
}
