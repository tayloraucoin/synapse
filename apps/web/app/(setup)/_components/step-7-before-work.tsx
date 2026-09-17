"use client";

import * as React from "react";

import {
  Button,
  EllipsesMenu,
  EmojiSlot,
  GroupHeading,
  MinutesStepper,
  PickerList,
  SelectRow,
  SelectRowList,
  SkeletonRow,
  SortableHandle,
  SortableList,
  StatusLine,
  Text,
  type PickerListGroup,
} from "@syn/ui";
import { DURATION_MAX, DURATION_MIN } from "@syn/constants";
import { clockToMinutes, computeBudget, formatClockFromMinutes } from "@syn/utils";

import { midpoint, walkSlots } from "@/components/block-editor";
import { HabitSheet } from "@/components/habit-sheet";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";
import { usePrepSteps } from "./use-prep-steps";

/**
 * Screen 7 — Before work (UX v1.2 §4.7; RUN-10), on DYN-11.
 *
 * Two parts under `GroupHeading`s with a hairline between (S7.7):
 *
 * WHAT'S INCLUDED — the ten starter steps as `SelectRow`s with their glyphs
 * and ranges, plus the person's own; nothing pre-selected. A tap ticks at
 * once and creates the step and its slot; a second tap un-ticks (R30, never
 * a duplicate). *Add something else* opens *A step before work* — emoji,
 * name, a compact range, and nothing else.
 *
 * HOW LONG EACH TAKES — one row per included step, in order: handle · glyph
 * · title · `MinutesStepper` · menu, centred on the stepper's 44px (S7.6).
 * The stepper's accessible name is *Length, Breakfast*; nothing visible says
 * *Takes*. The menu offers *Make it one of two* (the inline second row, as
 * v1.1) and *Remove*. The list reorders by handle — the getting-ready order
 * the day builder starts from.
 *
 * Nothing here asks for a time — the stack is computed backward from work
 * (§3.3). The sticky line is `computeBudget` over the profile's wake and
 * work start, the orient template's total and this list's walk — the same
 * arithmetic the block editor shows. *Continue · n steps* only navigates.
 */

const ORIENT_FALLBACK_MIN = 0;

export function Step7BeforeWork({
  initialWake,
  initialWorkStart,
  embedded = false,
  onSaved,
}: {
  initialWake: string;
  initialWorkStart: string | null;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const steps = usePrepSteps();
  const orientList = trpc.template.list.useQuery({ includeArchived: false, kind: "orient" });

  const [oneOfOpen, setOneOfOpen] = React.useState<{ slotId: string; habitId: string | null; minutes: number } | null>(null);
  const [stepSheetOpen, setStepSheetOpen] = React.useState(false);

  const disabled = !online || steps.templateId === null;
  const { slots, habits } = steps;

  // The footer: this list's walk against the profile and the orient total.
  const walk = React.useMemo(() => walkSlots(slots, "prep", "backward", null, null), [slots]);
  const totalMin = walk.totalMin;
  const orientMin = orientList.data?.[0]?.totalMin ?? ORIENT_FALLBACK_MIN;
  const wakeMin = clockToMinutes(initialWake.slice(0, 5));
  const workMin = initialWorkStart === null ? null : clockToMinutes(initialWorkStart.slice(0, 5));
  const left =
    workMin === null
      ? null
      : computeBudget({ wakeMin, workStartMin: workMin, orientMin, prepTotalMin: totalMin }).availableMin;

  const groupsFor = (excludeHabitId: string | null): PickerListGroup[] => {
    const items = habits
      .filter((habit) => habit.id !== excludeHabitId)
      .map((habit) => ({ id: habit.id, icon: habit.icon, title: habit.title }));
    return items.length === 0 ? [] : [{ heading: COPY.addSomethingElse, items }];
  };
  const onWalk = slots.filter((slot) => slot.alternates === null || slot.alternates.isDefault);
  const stepCount = onWalk.length;

  return (
    <FactScreen
      step={7}
      heading={COPY.step7Heading}
      body={COPY.step7Body}
      save={null}
      primaryLabel={COPY.continueSteps(stepCount)}
      embedded={embedded}
      onSaved={onSaved}
    >
      <div className="flex flex-col gap-(--space-6)">
        {/* What's included: the starters and the person's own, nothing pre-selected (§4.7). */}
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{COPY.whatsIncluded}</GroupHeading>
          <SelectRowList columns={2}>
            {steps.rows.map((row) => (
              <SelectRow
                key={row.key}
                icon={row.icon}
                title={row.title}
                detail={COPY.rangeLabel(row.rangeMin, row.rangeMax)}
                selected={row.selected}
                committing={row.committing}
                disabled={disabled || row.locked}
                disabledCaption={row.locked ? COPY.alreadyInLibrary : undefined}
                onToggle={(next) => steps.toggle(row, next)}
              />
            ))}
          </SelectRowList>
          <Button
            variant="secondary"
            className="w-full wide:w-auto wide:self-start"
            disabled={disabled}
            onClick={() => setStepSheetOpen(true)}
          >
            {COPY.addSomethingElse}
          </Button>
          {steps.line === null ? null : <StatusLine variant="sync-issues" text={steps.line} placement="inline" />}
        </section>

        <hr className="border-hairline m-0 border-t" />

        {/* How long each takes: handle · glyph · title · stepper · menu, one line (§4.7). */}
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{COPY.howLongEachTakes}</GroupHeading>
          {!steps.ready ? (
            <div className="flex flex-col gap-(--space-2)">
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : onWalk.length === 0 ? (
            <Text as="p" variant="secondary" tone="secondary">
              {COPY.nothingYetPrep}
            </Text>
          ) : (
            <SortableList
              label={COPY.howLongEachTakes}
              items={onWalk.map((slot) => ({ id: slot.id, title: slot.title, slot }))}
              disabled={disabled}
              onReorder={(ids) => void steps.reorder(onWalk.map((slot) => slot.id), ids)}
              renderItem={(item, { handleProps }) => {
                const slot = item.slot;
                const other =
                  slot.alternates === null
                    ? null
                    : (slots.find((row) => row.id !== slot.id && row.alternates?.group === slot.alternates?.group) ?? null);
                return (
                  <div className="flex min-w-0 flex-1 flex-col gap-(--space-2)">
                    <div className="flex min-w-0 items-center gap-(--space-2)">
                      <SortableHandle {...handleProps} />
                      <EmojiSlot icon={slot.icon} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <Text as="span" variant="row-title" weight={500} truncate>
                          {slot.title}
                        </Text>
                        {other === null ? null : (
                          <Text as="span" variant="caption" tone="secondary" truncate>
                            {`${COPY.oneOf} · ${COPY.or} ${other.title} · ${other.durationMin} min`}
                          </Text>
                        )}
                      </span>
                      <MinutesStepper
                        label={COPY.lengthOf(slot.title)}
                        value={slot.durationMin}
                        onCommit={(next) => steps.setLength(slot, next)}
                        min={DURATION_MIN}
                        max={DURATION_MAX}
                        step={5}
                        disabled={disabled}
                        compact
                        className="shrink-0 [&>label]:sr-only"
                      />
                      <EllipsesMenu
                        label={slot.title}
                        disabled={disabled}
                        items={[
                          other === null
                            ? {
                                label: COPY.makeOneOf,
                                onClick: () => setOneOfOpen({ slotId: slot.id, habitId: null, minutes: 15 }),
                              }
                            : { label: COPY.justThisOne, onClick: () => void steps.remove(other) },
                          { label: COPY.remove, onClick: () => void steps.remove(slot) },
                        ]}
                      />
                    </div>

                    {oneOfOpen?.slotId === slot.id ? (
                      <div className="bg-surface/60 flex flex-col gap-(--space-3) rounded-(--radius) p-(--space-3)">
                        <Text as="span" variant="caption" tone="secondary">
                          {COPY.or}
                        </Text>
                        <PickerList
                          groups={groupsFor(slot.habitId)}
                          value={oneOfOpen.habitId}
                          onSelect={(id) => {
                            const chosen = habits.find((row) => row.id === id);
                            setOneOfOpen({ slotId: slot.id, habitId: id, minutes: chosen ? midpoint(chosen) : 15 });
                          }}
                          createLabel={COPY.addSomethingElse}
                          onCreate={() => setStepSheetOpen(true)}
                          searchLabel={COPY.searchHabits}
                          emptyText={COPY.nothingYetPrep}
                          presentation="inline"
                        />
                        <MinutesStepper
                          label={COPY.lengthOf(COPY.or)}
                          value={oneOfOpen.minutes}
                          onChange={(next) => setOneOfOpen({ ...oneOfOpen, minutes: next })}
                          min={DURATION_MIN}
                          max={DURATION_MAX}
                          step={5}
                          disabled={disabled || oneOfOpen.habitId === null}
                          className="[&>label]:sr-only"
                        />
                        <div className="flex justify-end gap-(--space-2)">
                          <Button variant="ghost" size="sm" onClick={() => setOneOfOpen(null)}>
                            {COPY.justThisOne}
                          </Button>
                          <Button
                            size="sm"
                            disabled={disabled || oneOfOpen.habitId === null}
                            busy={steps.busy}
                            onClick={() => {
                              if (oneOfOpen.habitId === null) return;
                              void steps
                                .addSlot(oneOfOpen.habitId, oneOfOpen.minutes, slot.id)
                                .then(() => steps.refresh())
                                .then(() => setOneOfOpen(null));
                            }}
                          >
                            {COPY.add}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              }}
            />
          )}
        </section>

        {/* Sticky, tabular — the budget the morning will have (§4.7). */}
        <div className="bg-paper border-hairline sticky bottom-[calc(var(--target)+2*var(--space-3)+env(safe-area-inset-bottom))] border-t pt-(--space-3)">
          <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
            {left === null || workMin === null
              ? COPY.prepFooterNoWork(totalMin)
              : COPY.prepFooter(totalMin, formatClockFromMinutes(wakeMin), formatClockFromMinutes(workMin), left)}
          </Text>
        </div>
      </div>

      <HabitSheet
        open={stepSheetOpen}
        mode="step"
        onOpenChange={setStepSheetOpen}
        onSaved={(created) => {
          void utils.habit.list.invalidate().then(async () => {
            const fresh = await utils.habit.get.fetch({ id: created.id });
            const minutes = midpoint({ durationMin: fresh.durationMinMin, durationMax: fresh.durationMaxMin });
            if (oneOfOpen !== null) {
              setOneOfOpen({ ...oneOfOpen, habitId: created.id, minutes });
              return;
            }
            await steps.addSlot(created.id, minutes);
            await steps.refresh();
          });
        }}
      />
    </FactScreen>
  );
}
