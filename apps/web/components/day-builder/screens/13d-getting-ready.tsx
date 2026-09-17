"use client";

import * as React from "react";

import type { HabitSummaryView, SlotView } from "@syn/types";
import { Button, PickerList, Text } from "@syn/ui";

import { QuickHabitSheet } from "@/components/habit-sheet";
import { trpc } from "@/lib/trpc/client";

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

/**
 * 13d — getting ready (UX v1.2 §4.13d).
 *
 * A NEW LIST IS SCREEN 7's, IN ORDER, ALL ON (§13 #19): the first prep
 * template's slots seed *Getting ready A*. From there every change is a
 * slot write on this list — never a habit change: *Leave out on this day*
 * removes the slot and the step waits under the hairline with *Include*.
 * The sticky line is the list's own total against *working by*.
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
  const seedFrom = api.byKind("prep")[0] ?? null;
  const seed = React.useCallback(async () => {
    if (seedFrom === null) return [];
    const source = await utils.template.get.fetch({ id: seedFrom.id });
    return source.slots
      .filter((slot: SlotView) => slot.role !== "pool")
      .map((slot: SlotView) => ({
        habitId: slot.habitId,
        durationMin: slot.durationMin,
        priorityOverride: 7,
        scheduling: "hard" as const,
      }));
  }, [seedFrom, utils]);

  const list = useListScreen({ api, kind: "prep", fk: "prepTemplateId", defaultName: COPY.d.defaultName, seed });
  const candidates = React.useMemo(() => api.habitsOf((habit) => habit.blockKind === "prep"), [api]);
  const [stepSheetOpen, setStepSheetOpen] = React.useState(false);
  const [oneOf, setOneOf] = React.useState<{ slot: SlotView; habitId: string | null } | null>(null);

  const total = list.slots === null ? 0 : totalOf(list.slots);
  React.useEffect(() => {
    onTotal(total);
  }, [total, onTotal]);

  const workStart = minutesOf(api.times.workStart);
  const from = workStart === null ? null : display(workStart - total);
  const to = workStart === null ? null : display(workStart);

  return (
    <div className="flex flex-col gap-(--space-5)">
      <ListHeader list={list} nameLabel={COPY.d.listName} newLabel={COPY.d.newList} disabled={disabled} />

      <SlotRows
        list={list}
        candidates={candidates}
        disabled={disabled || list.templateId === null}
        listLabel={COPY.d.heading}
        leaveOutLabel={COPY.d.leaveOut}
        notOnThisDayLabel={COPY.d.notOnThisDay}
        includeLabel={COPY.d.include}
        usualOf={usualOf}
        menuExtra={(slot) =>
          slot.alternates === null ? [{ label: COPY.d.oneOfTwo, onClick: () => setOneOf({ slot, habitId: null }) }] : []
        }
      />

      {oneOf === null ? null : (
        <div className="bg-surface/60 flex flex-col gap-(--space-3) rounded-(--radius) p-(--space-3)">
          <Text as="span" variant="caption" tone="secondary">
            {`${COPY.d.oneOfTwo} · ${oneOf.slot.title}`}
          </Text>
          <PickerList
            groups={[
              {
                heading: COPY.d.notOnThisDay,
                items: candidates
                  .filter((habit) => habit.id !== oneOf.slot.habitId)
                  .map((habit) => ({ id: habit.id, title: habit.title, icon: habit.icon })),
              },
            ]}
            value={oneOf.habitId}
            onSelect={(id) => setOneOf({ ...oneOf, habitId: id })}
            createLabel={COPY.d.addAStep}
            onCreate={() => setStepSheetOpen(true)}
            searchLabel={COPY.d.pickerSearch}
            emptyText={COPY.d.pickerEmpty}
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
              {COPY.d.include}
            </Button>
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        disabled={disabled || list.templateId === null}
        onClick={() => setStepSheetOpen(true)}
        className="w-full wide:w-auto wide:self-start"
      >
        {COPY.d.addAStep}
      </Button>

      {/* Sticky, tabular — the list against *working by* (§4.13d). */}
      <div className="bg-paper border-hairline sticky bottom-[calc(var(--target)+2*var(--space-3)+env(safe-area-inset-bottom))] border-t pt-(--space-3)">
        <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
          {COPY.d.sticky(list.name ?? COPY.d.heading, total, from, to)}
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
