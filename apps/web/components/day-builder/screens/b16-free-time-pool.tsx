"use client";

import * as React from "react";

import type { HabitSummaryView, SlotView, TemplateSummaryView } from "@syn/types";
import {
  Button,
  PriorityMark,
  SelectRow,
  SelectRowList,
  SortableHandle,
  SortableList,
  Text,
  type PriorityMarkValue,
} from "@syn/ui";

import { trpc } from "@/lib/trpc/client";

import { BuilderSkeleton } from "../builder-skeleton";
import { display, spanLabel } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { ListHeader } from "../list-header";
import { eveningRoom } from "../preview";
import type { BuilderScreen, DayBuilderApi } from "../use-day-builder";
import { useListScreen } from "../use-list-screen";
import { usePlanPreview } from "../use-plan-preview";

/** §13 #34: a new pool preselects the activities that matter 4 and up. */
const PRESELECT_FROM = 4;

function midpointOf(habit: HabitSummaryView): number {
  const min = habit.durationMin ?? 20;
  const max = habit.durationMax ?? min;
  return Math.round((min + max) / 2 / 5) * 5 || min;
}

function markOf(habit: HabitSummaryView): PriorityMarkValue {
  return Math.min(7, Math.max(1, Math.round(habit.lifePriority))) as PriorityMarkValue;
}

const poolMeta = (template: TemplateSummaryView) => COPY.b16.toChooseFrom(template.itemCount);

/**
 * B16 — free time on this day (UX v1.3 §4.4 B16, R50, TD-26; DAY-11).
 *
 * THE POOL IS A POOL. *Evenings A* is an `activity` template shaped as a
 * pool (structure `opener_pool_closer`, as DAY-6 ruled), referenced by the
 * plan (`activityTemplateId`); its members are `pool` slots — offered to the
 * evening, never placed on it. The body is the
 * evening's ROOM, stated as room (*2 h 15 between after work and wind-down.*),
 * from the same preview the review draws. The rows are the ranked activities
 * by *matters* — the mark leading, *usually 30* — and a new pool preselects
 * those at 4 and up (§13 #34); a tick adds one at its usual length, the
 * order is draggable. *The evening chooses from these. Nothing here is
 * scheduled.*
 */
export function ScreenFreeTimePool({
  api,
  disabled,
  onCount,
  onGo,
}: {
  api: DayBuilderApi;
  disabled: boolean;
  onCount: (count: number) => void;
  onGo: (screen: BuilderScreen) => void;
}) {
  const utils = trpc.useUtils();
  const plan = api.plan;
  const { preview } = usePlanPreview(api);

  const ranked = React.useMemo(
    () =>
      api
        .habitsOf((habit) => habit.blockKind === "activity" && habit.type === "habit")
        .slice()
        .sort((a, b) => b.lifePriority - a.lifePriority),
    [api],
  );

  // *usually* — B15b's slot on free time's landscape template, read once; the range's midpoint after.
  const landscape = React.useMemo(() => api.byKind("activity").find((template) => template.structure !== "opener_pool_closer") ?? null, [api]);
  const [usualByHabit, setUsualByHabit] = React.useState<Map<string, number> | null>(null);
  React.useEffect(() => {
    if (landscape === null) {
      setUsualByHabit(new Map());
      return;
    }
    let live = true;
    void utils.template.get.fetch({ id: landscape.id }).then((detail) => {
      if (live) setUsualByHabit(new Map(detail.slots.map((slot: SlotView) => [slot.habitId, slot.durationMin])));
    });
    return () => {
      live = false;
    };
  }, [landscape, utils]);
  const usualOf = React.useCallback((habit: HabitSummaryView) => usualByHabit?.get(habit.id) ?? midpointOf(habit), [usualByHabit]);

  const seed = React.useCallback(
    () =>
      ranked
        .filter((habit) => habit.lifePriority >= PRESELECT_FROM)
        .map((habit) => ({ habitId: habit.id, durationMin: usualOf(habit), role: "pool" as const, scheduling: "soft" as const })),
    [ranked, usualOf],
  );
  // Hold the create until *usually* is known, so the preselected slots carry the real lengths.
  const ready = usualByHabit !== null;
  const list = useListScreen({
    api: ready ? api : { ...api, plan: null },
    kind: "activity",
    fk: "activityTemplateId",
    defaultName: COPY.b16.defaultName,
    seed,
    structure: "opener_pool_closer",
    metaOf: poolMeta,
  });

  const members = React.useMemo(() => (list.slots ?? []).filter((slot) => slot.role === "pool"), [list.slots]);
  React.useEffect(() => {
    onCount(members.length);
  }, [members.length, onCount]);

  const [line, setLine] = React.useState<string | null>(null);
  if (plan === null) return null;

  const room = preview === null ? null : eveningRoom(preview);
  const roomLine =
    room === null
      ? null
      : room.after === "transition"
        ? COPY.b16.roomAfterTransition(spanLabel(room.minutes))
        : room.after === "work"
          ? COPY.b16.roomAfterWork(display(room.fromMin % (24 * 60)))
          : COPY.b16.roomAfterRoutine;

  const byId = new Map(ranked.map((habit) => [habit.id, habit]));
  const chosen = members
    .map((slot) => ({ id: slot.id, title: slot.title, slot, habit: byId.get(slot.habitId) ?? null }))
    .filter((row): row is { id: string; title: string; slot: SlotView; habit: HabitSummaryView } => row.habit !== null);
  const inPool = new Set(members.map((slot) => slot.habitId));
  const offered = ranked.filter((habit) => !inPool.has(habit.id));

  return (
    <div className="flex flex-col gap-(--space-5)">
      {roomLine === null ? null : (
        <Text as="p" tone="secondary" className="tabular-nums">
          {roomLine}
        </Text>
      )}

      <ListHeader list={list} nameLabel={COPY.b16.poolName} newLabel={COPY.b16.newPool} disabled={disabled} />

      {ranked.length === 0 ? (
        <div className="flex flex-col gap-(--space-3)">
          <Text as="p" variant="secondary" tone="secondary">
            {COPY.b16.nothingToChoose}
          </Text>
          {plan.sortOrder === 0 ? (
            <Button variant="secondary" disabled={disabled} onClick={() => onGo("b15a")} className="w-full wide:w-auto wide:self-start">
              {COPY.b16.backToFreeTime}
            </Button>
          ) : null}
        </div>
      ) : list.slots === null || !ready ? (
        list.missing ? null : <BuilderSkeleton />
      ) : (
        <>
          {chosen.length === 0 ? null : (
            <SortableList
              label={COPY.b16.heading}
              items={chosen}
              disabled={disabled}
              onReorder={(ids) => void list.reorder(chosen.map((row) => row.id), ids)}
              renderItem={(row, { handleProps }) => (
                <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
                  <SortableHandle {...handleProps} />
                  <SelectRow
                    icon={row.habit.icon}
                    leading={<PriorityMark value={markOf(row.habit)} />}
                    title={row.title}
                    detail={COPY.b16.usually(row.slot.durationMin)}
                    selected
                    disabled={disabled}
                    error={line}
                    onCommitError={() => setLine(COPY.saveError)}
                    onToggle={async (selected) => {
                      setLine(null);
                      if (!selected) await list.remove(row.slot);
                    }}
                    className="min-w-0 flex-1"
                  />
                </div>
              )}
            />
          )}
          {offered.length === 0 ? null : (
            <SelectRowList>
              {offered.map((habit) => (
                <SelectRow
                  key={habit.id}
                  icon={habit.icon}
                  leading={<PriorityMark value={markOf(habit)} />}
                  title={habit.title}
                  detail={COPY.b16.usually(usualOf(habit))}
                  selected={false}
                  disabled={disabled || list.templateId === null}
                  error={line}
                  onCommitError={() => setLine(COPY.saveError)}
                  onToggle={async (selected) => {
                    setLine(null);
                    if (selected) await list.addSlot({ habitId: habit.id, durationMin: usualOf(habit), role: "pool", scheduling: "soft" });
                  }}
                />
              ))}
            </SelectRowList>
          )}
        </>
      )}

      <Text as="p" variant="caption" tone="secondary">
        {COPY.b16.foot}
      </Text>
    </div>
  );
}
