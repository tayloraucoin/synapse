"use client";

import * as React from "react";

import { STARTER_LIBRARY } from "@syn/constants";
import type { HabitSummaryView, SlotView } from "@syn/types";
import { Button, GroupHeading, PickerList, SelectRow, SelectRowList, StatusLine, Text } from "@syn/ui";

import { usePrepSteps } from "../use-prep-steps";
import { QuickHabitSheet } from "@/components/habit-sheet";
import { trpc } from "@/lib/trpc/client";

import { BuilderSkeleton } from "../builder-skeleton";
import { display, minutesOf } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { ListHeader } from "../list-header";
import { SlotRows } from "../slot-rows";
import { totalOf, type DayBuilderApi } from "../use-day-builder";
import { useListScreen } from "../use-list-screen";

/** A step's usual length: the midpoint of its range (v1.1 §3.2). */
function usualOf(habit: HabitSummaryView): number {
  const min = habit.durationMin ?? 10;
  const max = habit.durationMax ?? min;
  return Math.round((min + max) / 2 / 5) * 5 || min;
}

const STARTER_TITLES = new Set(STARTER_LIBRARY.prep.map((entry) => entry.title.toLowerCase()));

/**
 * B5 — getting ready (UX v1.3 §4.4 B5; v1.2 §4.13d absorbing §4.7; DAY-9).
 *
 * THE PLAN'S LIST, NEW AND EMPTY — no longer seeded from a profile list.
 * While it is new (empty when the screen first saw it), the ten starters sit
 * above it as `SelectRow`s with their ranges, nothing preselected; a tick
 * creates the step if it is not in the library yet and its slot at the
 * midpoint (priority 7, hard) through screen 7's per-row queue
 * (`usePrepSteps`, given this list), and the row leaves the starters and
 * joins *In order*. A list that already has rows keeps the starters behind
 * *Add a step*. Never a start time; never *habit*.
 *
 * On a *No work* day the new list is *Getting going A* and the sticky line
 * has no clock (there is nothing to be ready by).
 */
export function ScreenGettingReady({
  api,
  disabled,
  onTotal,
}: {
  api: DayBuilderApi;
  disabled: boolean;
  onTotal: (minutes: number) => void;
}) {
  const utils = trpc.useUtils();
  const noWork = api.plan?.work === null;
  const seed = React.useCallback(() => [], []);
  const list = useListScreen({
    api,
    kind: "prep",
    fk: "prepTemplateId",
    defaultName: noWork ? COPY.b05.defaultNameNoWork : COPY.b05.defaultName,
    seed,
  });
  const steps = usePrepSteps({ templateId: list.templateId });
  const candidates = React.useMemo(() => api.habitsOf((habit) => habit.blockKind === "prep"), [api]);
  const [stepSheetOpen, setStepSheetOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [oneOf, setOneOf] = React.useState<{ slot: SlotView; habitId: string | null } | null>(null);

  // Whether the list was new when this screen first saw it — decided once, so a tick never hides the rest.
  const [startedEmpty, setStartedEmpty] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    if (startedEmpty !== null || list.templateId === null || list.slots === null) return;
    setStartedEmpty(list.slots.length === 0);
  }, [startedEmpty, list.templateId, list.slots]);

  const total = list.slots === null ? 0 : totalOf(list.slots);
  React.useEffect(() => {
    onTotal(total);
  }, [total, onTotal]);

  if (list.templateId === null || list.slots === null || startedEmpty === null) {
    return (
      <div className="flex flex-col gap-(--space-5)">
        <ListHeader list={list} nameLabel={COPY.b05.listName} newLabel={COPY.b05.newList} disabled={disabled} />
        {list.missing ? null : <BuilderSkeleton />}
      </div>
    );
  }

  const workStart = minutesOf(api.times.workStart);
  const from = workStart === null ? null : display(workStart - total);
  const to = workStart === null ? null : display(workStart);
  // The starters not yet in the list — a ticked one leaves at once (its tick is ahead of the write).
  const starters = steps.rows.filter((row) => STARTER_TITLES.has(row.title.toLowerCase()) && !row.selected);
  const showStarters = (startedEmpty || addOpen) && starters.length > 0;

  return (
    <div className="flex flex-col gap-(--space-5)">
      <ListHeader list={list} nameLabel={COPY.b05.listName} newLabel={COPY.b05.newList} disabled={disabled} />

      {showStarters ? (
        <section className="flex flex-col gap-(--space-3)">
          <SelectRowList columns={2}>
            {starters.map((row) => (
              <SelectRow
                key={row.key}
                icon={row.icon}
                title={row.title}
                detail={COPY.b05.range(row.rangeMin, row.rangeMax)}
                selected={false}
                committing={row.committing}
                disabled={disabled || row.locked}
                onToggle={(next) => steps.toggle(row, next)}
              />
            ))}
          </SelectRowList>
          <Button variant="ghost" disabled={disabled} onClick={() => setStepSheetOpen(true)} className="w-full wide:w-auto wide:self-start">
            {COPY.b05.somethingElse}
          </Button>
        </section>
      ) : null}
      {steps.line === null ? null : <StatusLine variant="sync-issues" text={steps.line} placement="inline" />}

      <section className="flex flex-col gap-(--space-3)">
        <GroupHeading>{COPY.b05.inOrder}</GroupHeading>
        <SlotRows
          list={list}
          candidates={candidates}
          disabled={disabled}
          listLabel={COPY.b05.heading}
          leaveOutLabel={COPY.b05.leaveOut}
          notOnThisDayLabel={COPY.b05.notOnThisDay}
          includeLabel={COPY.b05.include}
          usualOf={usualOf}
          menuExtra={(slot) =>
            slot.alternates === null ? [{ label: COPY.b05.oneOfTwo, onClick: () => setOneOf({ slot, habitId: null }) }] : []
          }
        />
      </section>

      {oneOf === null ? null : (
        <div className="bg-surface/60 flex flex-col gap-(--space-3) rounded-(--radius) p-(--space-3)">
          <Text as="span" variant="caption" tone="secondary">
            {`${COPY.b05.oneOfTwo} · ${oneOf.slot.title}`}
          </Text>
          <PickerList
            groups={[
              {
                heading: COPY.b05.notOnThisDay,
                items: candidates
                  .filter((habit) => habit.id !== oneOf.slot.habitId)
                  .map((habit) => ({ id: habit.id, title: habit.title, icon: habit.icon })),
              },
            ]}
            value={oneOf.habitId}
            onSelect={(id) => setOneOf({ ...oneOf, habitId: id })}
            createLabel={COPY.b05.addAStep}
            onCreate={() => setStepSheetOpen(true)}
            searchLabel={COPY.b05.pickerSearch}
            emptyText={COPY.b05.pickerEmpty}
            presentation="inline"
          />
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" size="sm" onClick={() => setOneOf(null)}>
              {COPY.cancel}
            </Button>
            <Button
              size="sm"
              disabled={disabled || oneOf.habitId === null}
              onClick={() => {
                const habit = candidates.find((row) => row.id === oneOf.habitId);
                if (habit === undefined) return;
                void list
                  .addSlot({ habitId: habit.id, durationMin: usualOf(habit), priorityOverride: 7, scheduling: "hard", alternatesWith: oneOf.slot.id })
                  .then(() => setOneOf(null));
              }}
            >
              {COPY.b05.include}
            </Button>
          </div>
        </div>
      )}

      {showStarters ? null : (
        <Button
          variant="secondary"
          disabled={disabled}
          onClick={() => (starters.length > 0 ? setAddOpen(true) : setStepSheetOpen(true))}
          className="w-full wide:w-auto wide:self-start"
        >
          {COPY.b05.addAStep}
        </Button>
      )}

      {/* Sticky, tabular — the list against *working by* (§4.4 B5). */}
      <div className="bg-paper border-hairline sticky bottom-[calc(var(--target)+2*var(--space-3)+env(safe-area-inset-bottom))] border-t pt-(--space-3)">
        <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
          {COPY.b05.sticky(list.name ?? COPY.b05.heading, total, from, to)}
        </Text>
      </div>

      <QuickHabitSheet
        open={stepSheetOpen}
        mode="step"
        onOpenChange={setStepSheetOpen}
        onSaved={(habit) => {
          void utils.habit.list.fetch({ includeArchived: false }).then((result) => {
            const fresh = result.habits.find((row) => row.id === habit.id);
            const minutes = fresh === undefined ? 10 : usualOf(fresh);
            if (oneOf !== null) {
              void list
                .addSlot({ habitId: habit.id, durationMin: minutes, priorityOverride: 7, scheduling: "hard", alternatesWith: oneOf.slot.id })
                .then(() => setOneOf(null));
            } else {
              void list.addSlot({ habitId: habit.id, durationMin: minutes, priorityOverride: 7, scheduling: "hard" });
            }
          });
        }}
      />
    </div>
  );
}
