"use client";

import * as React from "react";

import type { HabitSummaryView, SlotView } from "@syn/types";
import {
  BudgetLine,
  Button,
  SelectRow,
  SelectRowList,
  SortableHandle,
  SortableList,
  Text,
  cn,
} from "@syn/ui";
import { computeBudget, fitToBudget } from "@syn/utils";

import { toStackItems } from "@/components/block-editor";
import { trpc } from "@/lib/trpc/client";

import { display, minutesOf } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { ListHeader } from "../list-header";
import { totalOf, useTemplateSlots, type DayBuilderApi } from "../use-day-builder";
import { useListScreen } from "../use-list-screen";

/**
 * 13e — the morning routine against the room (UX v1.2 §4.13e, §3.10).
 *
 * THE ROOM IS STATED AS ROOM: wake to *working by*, minus orient, minus
 * getting ready — `computeBudget`, the one arithmetic (DYN-1) — and the
 * budget line reads the two numbers with *for the routine* as the second
 * word; past it, the third part says where the routine runs to, in the
 * same colour. Never a shortfall, never a judgement (§12.3, R7).
 *
 * A NEW ROUTINE PRESELECTS BY RANK DOWN TO THE ROOM (§13 #20): highest
 * `life_priority` first, each added while the total stays within the room;
 * one whose *usually* would pass it is skipped and the next tried. On a
 * *No work* day nothing is preselected — everything offered, nothing
 * chosen. An existing routine's slots are what they are.
 *
 * *USUALLY* IS SCREEN 9's SLOT (RUN-10): the habit's length in the first
 * morning template; the default version's minutes when it has none; the
 * range's midpoint last. A version tab writes the slot's minutes to that
 * version's — the slot stores minutes, and RUN-5 matches them back to a
 * version at materialisation (the ruling; no `version_key` on a slot).
 */

function midpointOf(habit: HabitSummaryView): number {
  const min = habit.durationMin ?? 10;
  const max = habit.durationMax ?? min;
  return Math.round((min + max) / 2 / 5) * 5 || min;
}

export function ScreenMorning({
  api,
  disabled,
  onTotal,
}: {
  api: DayBuilderApi;
  disabled: boolean;
  onTotal: (minutes: number) => void;
}) {
  const utils = trpc.useUtils();
  const plan = api.plan;
  const prep = useTemplateSlots(plan?.gettingReady?.templateId ?? null);
  const prepTotal = prep.slots === null ? (plan?.gettingReady?.totalMin ?? 0) : totalOf(prep.slots);

  const ranked = React.useMemo(
    () =>
      api
        .habitsOf((habit) => habit.blockKind === "morning" && habit.type === "habit")
        .slice()
        .sort((a, b) => b.lifePriority - a.lifePriority),
    [api],
  );

  // *usually* — screen 9's slot, read once from the first morning template.
  const nine = api.byKind("morning")[0] ?? null;
  const [usualBySlot, setUsualBySlot] = React.useState<Map<string, number> | null>(null);
  React.useEffect(() => {
    if (nine === null) {
      setUsualBySlot(new Map());
      return;
    }
    let live = true;
    void utils.template.get.fetch({ id: nine.id }).then((detail) => {
      if (!live) return;
      setUsualBySlot(new Map(detail.slots.map((slot: SlotView) => [slot.habitId, slot.durationMin])));
    });
    return () => {
      live = false;
    };
  }, [nine, utils]);

  const usualOf = React.useCallback(
    (habit: HabitSummaryView): number =>
      usualBySlot?.get(habit.id) ?? habit.versions?.[0]?.minutes ?? midpointOf(habit),
    [usualBySlot],
  );

  const wake = minutesOf(api.times.wake);
  const workStart = api.plan?.work === null ? null : minutesOf(api.times.workStart);
  const room =
    wake === null || workStart === null
      ? null
      : computeBudget({ wakeMin: wake, workStartMin: workStart, orientMin: api.orientMin, prepTotalMin: prepTotal }).availableMin;
  const routineStart = wake === null ? null : wake + api.orientMin;
  const noRoom = wake !== null && workStart !== null && workStart - wake - api.orientMin - prepTotal < 0;

  const seed = React.useCallback(async () => {
    if (room === null || noRoom || usualBySlot === null) return [];
    const chosen: { habitId: string; durationMin: number; scheduling: "soft" }[] = [];
    let total = 0;
    for (const habit of ranked) {
      const usually = usualOf(habit);
      if (total + usually > room) continue;
      chosen.push({ habitId: habit.id, durationMin: usually, scheduling: "soft" });
      total += usually;
    }
    return chosen;
  }, [room, noRoom, usualBySlot, ranked, usualOf]);

  // Hold the create until *usually* is known, so the greedy fill sees the real lengths.
  const ready = usualBySlot !== null && prep.slots !== null;
  const list = useListScreen({
    api: ready ? api : { ...api, plan: null },
    kind: "morning",
    fk: "morningTemplateId",
    defaultName: COPY.e.defaultName,
    seed,
  });

  const slots = React.useMemo(() => (list.slots ?? []).filter((slot) => slot.role !== "pool"), [list.slots]);
  const chosenMin = totalOf(slots);
  React.useEffect(() => {
    onTotal(chosenMin);
  }, [chosenMin, onTotal]);

  const [line, setLine] = React.useState<string | null>(null);
  const slotOf = (habit: HabitSummaryView) => slots.find((slot) => slot.habitId === habit.id) ?? null;
  const selectedRows = slots
    .map((slot) => ({ id: slot.id, title: slot.title, slot, habit: ranked.find((habit) => habit.id === slot.habitId) ?? null }))
    .filter((row) => row.habit !== null);
  const unselected = ranked.filter((habit) => slotOf(habit) === null);

  const shorten = async () => {
    if (room === null) return;
    const items = toStackItems(slots).map((item) => {
      const slot = slots.find((row) => row.id === item.id);
      const habit = slot === undefined ? undefined : ranked.find((row) => row.id === slot.habitId);
      return { ...item, durationMinMin: habit?.durationMin ?? null, isAssigned: true };
    });
    const fit = fitToBudget(items, room, "shorten_then_cut");
    for (const kept of fit.keep) {
      const slot = slots.find((row) => row.id === kept.id);
      if (slot !== undefined && kept.shortened) await list.setMinutes(slot, kept.durationMin);
    }
    for (const cutId of fit.cut) {
      const slot = slots.find((row) => row.id === cutId);
      if (slot !== undefined) await list.remove(slot);
    }
  };

  const roomLine =
    plan?.work === null || wake === null || workStart === null
      ? COPY.e.noAnchor
      : noRoom
        ? COPY.e.noRoom(display(wake + api.orientMin + prepTotal))
        : COPY.e.room(room ?? 0, display(wake), api.orientMin, prepTotal, display(workStart));

  const renderVersions = (habit: HabitSummaryView, slot: SlotView | null) => {
    if (habit.versions === null || habit.versions.length < 2) return null;
    return (
      <div role="tablist" aria-label={COPY.e.versions} className="flex flex-wrap gap-(--space-1) ps-(--space-2)">
        {habit.versions.map((version) => {
          const current = slot !== null && slot.durationMin === version.minutes;
          return (
            <button
              key={version.key}
              type="button"
              role="tab"
              aria-selected={current}
              disabled={disabled || slot === null}
              onClick={() => {
                if (slot !== null) void list.setMinutes(slot, version.minutes);
              }}
              className={cn(
                "h-8 rounded-(--radius) border px-(--space-2) text-(length:--fs-caption) tabular-nums",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                current ? "bg-primary text-primary-foreground border-transparent" : "border-hairline text-text-secondary",
                (disabled || slot === null) && "opacity-40",
              )}
            >
              {`${version.label} · ${version.minutes}`}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-(--space-5)">
      <Text as="p" tone="secondary" className="tabular-nums">
        {roomLine}
      </Text>

      <ListHeader list={list} nameLabel={COPY.e.routineName} newLabel={COPY.e.newRoutine} disabled={disabled} />

      {selectedRows.length === 0 ? null : (
        <SortableList
          label={COPY.e.heading}
          items={selectedRows}
          disabled={disabled}
          onReorder={(ids) => void list.reorder(selectedRows.map((row) => row.id), ids)}
          renderItem={(row, { handleProps }) => (
            <div className="flex min-w-0 flex-1 flex-col gap-(--space-2)">
              <div className="flex min-w-0 items-center gap-(--space-2)">
                <SortableHandle {...handleProps} />
                <SelectRow
                  icon={row.habit?.icon ?? null}
                  title={row.title}
                  detail={COPY.e.usually(row.slot.durationMin)}
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
              {row.habit === null ? null : renderVersions(row.habit, row.slot)}
            </div>
          )}
        />
      )}

      {unselected.length === 0 ? null : (
        <SelectRowList>
          {unselected.map((habit) => (
            <div key={habit.id} className="flex flex-col gap-(--space-2)">
              <SelectRow
                icon={habit.icon}
                title={habit.title}
                detail={COPY.e.usually(usualOf(habit))}
                selected={false}
                disabled={disabled || list.templateId === null}
                error={line}
                onCommitError={() => setLine(COPY.saveError)}
                onToggle={async (selected) => {
                  setLine(null);
                  if (selected) await list.addSlot({ habitId: habit.id, durationMin: usualOf(habit), scheduling: "soft" });
                }}
              />
              {renderVersions(habit, null)}
            </div>
          ))}
        </SelectRowList>
      )}

      {room !== null && !noRoom && chosenMin > room ? (
        <Button variant="ghost" disabled={disabled} onClick={() => void shorten()} className="w-full wide:w-auto wide:self-start">
          {COPY.e.shortenToFit}
        </Button>
      ) : null}

      {room === null || noRoom ? null : (
        <BudgetLine
          sticky
          chosenMin={chosenMin}
          availableMin={room}
          availableLabel={COPY.e.forTheRoutine}
          trailing={chosenMin > room && routineStart !== null ? COPY.e.runsTo(display(routineStart + chosenMin)) : undefined}
          className="bottom-[calc(var(--target)+2*var(--space-3)+env(safe-area-inset-bottom))]"
        />
      )}
    </div>
  );
}
