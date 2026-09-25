"use client";

import * as React from "react";

import { STARTER_LIBRARY } from "@syn/constants";
import type { HabitSummaryView } from "@syn/types";
import { Button, GroupHeading, SelectRow, SelectRowList, StatusLine, Text } from "@syn/ui";

import { usePrepSteps } from "../use-prep-steps";
import { QuickHabitSheet } from "@/components/habit-sheet";
import { trpc } from "@/lib/trpc/client";

import { BuilderSkeleton } from "../builder-skeleton";
import { display, minutesOf } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { ListHeader } from "../list-header";
import { cutFromWorkEnd } from "../preview";
import { PreviewStrip } from "../preview-strip";
import { SlotRows } from "../slot-rows";
import { totalOf, type BuilderScreen, type DayBuilderApi } from "../use-day-builder";
import { useListScreen } from "../use-list-screen";
import { usePlanPreview } from "../use-plan-preview";

const STARTER_TITLES = new Set(STARTER_LIBRARY.transition.map((entry) => entry.title.toLowerCase()));

function midpointOf(habit: HabitSummaryView): number {
  const min = habit.durationMin ?? 10;
  const max = habit.durationMax ?? min;
  return Math.round((min + max) / 2 / 5) * 5 || min;
}

/**
 * B14 — after work (UX v1.3 §4.4 B14, R48, TD-25; DAY-11). A *No work* plan
 * never shows it.
 *
 * THE HAND-OFF AS ITS OWN LIST — *After work A*, a `transition` template the
 * plan references (`afterWorkTemplateId`), flowing forward from the end of
 * work or of an after-work workout (DAY-6). Above it the strip from *until
 * about* to lights out: the transition, free time (open until B16 builds the
 * pool), the wind-down. A new list starts empty with the eight starters
 * above it; a tick creates the step (`block_kind: transition`) and its slot
 * at the midpoint through B5's queue, and the row moves into *In order*.
 *
 * *Nothing after work* (the frame's ghost, `useNothingAfterWork`) leaves the
 * plan with no list and no orphan template behind it.
 */
export function ScreenAfterWork({
  api,
  disabled,
  onTotal,
  onGo,
}: {
  api: DayBuilderApi;
  disabled: boolean;
  onTotal: (minutes: number) => void;
  onGo: (screen: BuilderScreen) => void;
}) {
  const utils = trpc.useUtils();
  const plan = api.plan;
  const seed = React.useCallback(() => [], []);
  const list = useListScreen({ api, kind: "transition", fk: "afterWorkTemplateId", defaultName: COPY.b14.defaultName, seed });
  const steps = usePrepSteps({ templateId: list.templateId, kind: "transition" });
  const candidates = React.useMemo(() => api.habitsOf((habit) => habit.blockKind === "transition"), [api]);
  const { preview, loading } = usePlanPreview(api, { openEvening: plan?.evenings === null });
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const [startedEmpty, setStartedEmpty] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    if (startedEmpty !== null || list.templateId === null || list.slots === null) return;
    setStartedEmpty(list.slots.length === 0);
  }, [startedEmpty, list.templateId, list.slots]);

  const total = list.slots === null ? 0 : totalOf(list.slots);
  React.useEffect(() => {
    onTotal(total);
  }, [total, onTotal]);

  if (plan === null) return null;

  // The sticky's clocks are the preview's: the transition as DAY-6 lays it, after an after-work workout.
  const transition = preview?.blocks.find((block) => block.kind === "transition") ?? null;
  const workEnd = minutesOf(api.times.workEnd);
  const from = transition !== null ? transition.startMin : workEnd;
  const to = transition !== null ? transition.endMin : workEnd === null ? null : workEnd + total;
  const starters = steps.rows.filter((row) => STARTER_TITLES.has(row.title.toLowerCase()) && !row.selected);
  const showStarters = startedEmpty === true && starters.length > 0;

  return (
    <div className="flex flex-col gap-(--space-5)">
      {loading || preview === null ? <BuilderSkeleton /> : <PreviewStrip preview={cutFromWorkEnd(preview)} hue disabled={disabled} onGo={onGo} />}

      <ListHeader list={list} nameLabel={COPY.b14.listName} newLabel={COPY.b14.newList} disabled={disabled} />

      {list.templateId === null || list.slots === null || startedEmpty === null ? (
        list.missing ? null : <BuilderSkeleton />
      ) : (
        <>
          {showStarters ? (
            <SelectRowList columns={2}>
              {starters.map((row) => (
                <SelectRow
                  key={row.key}
                  icon={row.icon}
                  title={row.title}
                  detail={COPY.b14.range(row.rangeMin, row.rangeMax)}
                  selected={false}
                  committing={row.committing}
                  disabled={disabled || row.locked}
                  onToggle={(next) => steps.toggle(row, next)}
                />
              ))}
            </SelectRowList>
          ) : null}
          {steps.line === null ? null : <StatusLine variant="sync-issues" text={steps.line} placement="inline" />}

          <section className="flex flex-col gap-(--space-3)">
            <GroupHeading>{COPY.b14.inOrder}</GroupHeading>
            <SlotRows
              list={list}
              candidates={candidates}
              disabled={disabled}
              listLabel={COPY.b14.heading}
              leaveOutLabel={COPY.b14.leaveOut}
              notOnThisDayLabel={COPY.b14.notOnThisDay}
              includeLabel={COPY.b14.include}
              usualOf={midpointOf}
            />
          </section>

          <Button variant="ghost" disabled={disabled} onClick={() => setSheetOpen(true)} className="w-full wide:w-auto wide:self-start">
            {COPY.b14.somethingElse}
          </Button>
        </>
      )}

      {/* Sticky, tabular — *After work A · 40 min · 17:30 to 18:10.* (§4.4 B14). */}
      <div className="bg-paper border-hairline sticky bottom-[calc(var(--target)+2*var(--space-3)+env(safe-area-inset-bottom))] border-t pt-(--space-3)">
        <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
          {COPY.b14.sticky(
            list.name ?? COPY.b14.heading,
            total,
            from === null ? null : display(from),
            to === null ? null : display(to),
          )}
        </Text>
      </div>

      <QuickHabitSheet
        open={sheetOpen}
        mode="after-work-step"
        onOpenChange={setSheetOpen}
        onSaved={(habit) => {
          void utils.habit.list.fetch({ includeArchived: false }).then((result) => {
            const fresh = result.habits.find((row) => row.id === habit.id);
            void list.addSlot({ habitId: habit.id, durationMin: fresh === undefined ? 15 : midpointOf(fresh), scheduling: "soft" });
          });
        }}
      />
    </div>
  );
}

/**
 * *Nothing after work* — v1.3 §4.4 B14 (DAY-11): the evening starts at *until
 * about*. The plan's reference goes; a list only this plan uses is emptied
 * and discarded (`template.discardIfEmpty`), so no orphan template is left;
 * a list another plan shares is left as it is — that plan still has it.
 */
export function useNothingAfterWork(api: DayBuilderApi) {
  const utils = trpc.useUtils();
  const removeSlot = trpc.template.removeSlot.useMutation();
  const discard = trpc.template.discardIfEmpty.useMutation();

  return React.useCallback(async () => {
    const plan = api.plan;
    const id = plan?.afterWork?.templateId ?? null;
    if (plan === null || id === null) return;
    const template = api.templates.find((row) => row.id === id);
    const others = (template?.usedBy ?? []).filter((user) => user.id !== plan.id);
    await api.patch({ afterWorkTemplateId: null });
    if (others.length > 0) return;
    const detail = await utils.template.get.fetch({ id });
    for (const slot of detail.slots) await removeSlot.mutateAsync({ id: slot.id });
    await discard.mutateAsync({ id, requireUnnamed: false });
    await api.refreshTemplates();
  }, [api, utils, removeSlot, discard]);
}
