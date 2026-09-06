"use client";

import * as React from "react";

import {
  Button,
  DiscardDialog,
  HelperText,
  InlineQuestionRow,
  MinutesStepper,
  PickerList,
  ResponsiveSheet,
  SegmentedControl,
  Stepper17,
  Text,
  TimeField,
  type Stepper17Value,
} from "@syn/ui";
import { DURATION_MAX, DURATION_MIN } from "@syn/constants";
import type { HabitSummaryView } from "@syn/types";
import { clockFromMinutes, clockToMinutes, formatClockFromMinutes } from "@syn/utils";

import { HabitSheet } from "@/components/habit-sheet";
import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { TEMPLATE_COPY as COPY } from "./copy";

/**
 * TP-03 — one habit's place in the template.
 *
 * THE COLLISION QUESTION IS THE SERVER'S, ASKED IN THE PERSON'S WORDS. Save
 * sends the slot; if another fixed slot already holds that start, the service
 * refuses with the other slot's title and time, and the footer becomes the
 * question. Two answers, never three (Epic 1 TP-03): they happen together, or
 * this one moves.
 *
 * TIMES ARE CLOCKS ON SCREEN AND OFFSETS IN THE ROW. A template has no zone,
 * so the conversion is plain arithmetic against the anchor — done here, at the
 * one boundary where a person's "7:20" becomes a stored `+20`.
 */

type WhenMode = "fixed_time" | "window" | "unscheduled";

export function SlotSheet({
  open,
  templateId,
  anchorTime,
  slotId,
  previousEndMin,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  templateId: string;
  anchorTime: string;
  /** Absent in create mode. */
  slotId?: string;
  /** Where *Starts at* defaults to — the previous slot's end, or the anchor. */
  previousEndMin: number;
  onOpenChange: (open: boolean) => void;
  /**
   * The saved slot, described enough for SET-9's reminder ask: it fires only
   * for a fixed time, and it names that time in its question.
   */
  onSaved?: (saved: {
    timeMode: "fixed_time" | "window" | "unscheduled";
    startLabel: string | null;
  }) => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const anchorMinutes = clockToMinutes(anchorTime);

  const habits = trpc.habit.list.useQuery(
    { includeArchived: false },
    { enabled: open },
  );
  const detail = trpc.template.get.useQuery(
    { id: templateId },
    { enabled: open },
  );
  const saveSlot = trpc.template.saveSlot.useMutation();

  const [habitId, setHabitId] = React.useState<string | null>(null);
  const [when, setWhen] = React.useState<WhenMode>("fixed_time");
  const [startClock, setStartClock] = React.useState<string>("");
  const [endClock, setEndClock] = React.useState<string>("");
  const [duration, setDuration] = React.useState<number | null>(null);
  const [priority, setPriority] = React.useState<number | null>(null);
  const [scheduling, setScheduling] = React.useState<"hard" | "soft">("soft");
  const [error, setError] = React.useState<string | null>(null);
  const [habitChanged, setHabitChanged] = React.useState(false);
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const [habitSheetOpen, setHabitSheetOpen] = React.useState(false);
  const [conflict, setConflict] = React.useState<{
    withSlotId: string;
    withTitle: string;
    atClock: string;
  } | null>(null);

  const list = habits.data?.habits ?? [];
  const habit = list.find((row) => row.id === habitId) ?? null;
  const existing = detail.data?.slots.find((slot) => slot.id === slotId);

  // Seed once per open: the existing slot in edit, or the defaults in create.
  const seeded = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!open) {
      seeded.current = null;
      return;
    }
    const key = slotId ?? "new";
    if (seeded.current === key) return;
    if (slotId && !existing) return;

    seeded.current = key;
    setError(null);
    setConflict(null);
    setHabitChanged(false);

    if (existing) {
      setHabitId(existing.habitId);
      setWhen(existing.timeMode);
      setDuration(existing.durationMin);
      setPriority(existing.overridden ? existing.priority : null);
      setScheduling(existing.scheduling);
      // The row carries display strings; the offsets come back through them.
      setStartClock(existing.startClock ?? "");
      setEndClock(existing.endClock ?? "");
      return;
    }

    setHabitId(null);
    setWhen("fixed_time");
    setStartClock(clockFromMinutes(anchorMinutes + previousEndMin));
    setEndClock(clockFromMinutes(anchorMinutes + previousEndMin + 180));
    setDuration(null);
    setPriority(null);
    setScheduling("soft");
  }, [open, slotId, existing, anchorMinutes, previousEndMin]);

  /** Choosing a habit prefills the midpoint and the life default (TP-03). */
  function chooseHabit(id: string): void {
    const chosen = list.find((row) => row.id === id);
    if (!chosen) return;

    const wasSet = habitId !== null && habitId !== id;
    setHabitId(id);
    setDuration(midpoint(chosen));
    setPriority(null);
    // A task defaults to Fixed; a habit or deep work to Flexible.
    setScheduling(chosen.type === "task_appointment" ? "hard" : "soft");
    if (wasSet) setHabitChanged(true);
  }

  async function submit(multitaskWith?: string): Promise<void> {
    if (!habitId || duration === null) return;
    setError(null);

    const startMin =
      when === "unscheduled" ? null : clockToMinutes(startClock) - anchorMinutes;
    const endMin =
      when === "window" ? clockToMinutes(endClock) - anchorMinutes : null;

    try {
      await saveSlot.mutateAsync({
        templateId,
        slotId,
        habitId,
        timeMode: when,
        offsetStartMin: startMin,
        offsetEndMin: endMin,
        durationMin: duration,
        priorityOverride: priority,
        scheduling,
        ...(multitaskWith ? { multitaskWith } : {}),
      });

      await utils.template.get.invalidate({ id: templateId });
      await utils.template.list.invalidate();
      onSaved?.({
        timeMode: when,
        startLabel: when === "unscheduled" ? null : startClock,
      });
      onOpenChange(false);
    } catch (caught) {
      const parsed = parseConflict(caught);
      if (parsed) {
        setConflict(parsed);
        return;
      }
      setError(messageFrom(caught));
    }
  }

  const range = habit
    ? {
        min: habit.durationMin ?? DURATION_MIN,
        max: habit.durationMax ?? DURATION_MAX,
      }
    : { min: DURATION_MIN, max: DURATION_MAX };

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => {
          if (!next && habitId !== null) {
            setDiscardOpen(true);
            return;
          }
          onOpenChange(next);
        }}
        title={slotId ? COPY.slotEditTitle : COPY.slotCreateTitle}
        size="tall"
        dirty={habitId !== null}
        onDiscardRequest={() => {
          setDiscardOpen(true);
        }}
        footer={
          conflict !== null ? (
            <InlineQuestionRow
              text={COPY.sameStartQuestion(conflict.atClock, conflict.withTitle)}
              primary={{
                label: COPY.sameStartYes,
                onClick: () => {
                  void submit(conflict.withSlotId);
                },
              }}
              secondary={{
                label: COPY.sameStartNo,
                onClick: () => {
                  setConflict(null);
                },
              }}
            />
          ) : (
            <div className="flex justify-end gap-(--space-2)">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {COPY.cancel}
              </Button>
              <Button
                onClick={() => void submit()}
                busy={saveSlot.isPending}
                disabled={!online || habitId === null || duration === null}
              >
                {COPY.save}
              </Button>
            </div>
          )
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          <PickerList
            groups={groupHabits(list)}
            value={habitId}
            onSelect={chooseHabit}
            searchLabel={COPY.habitSearchLabel}
            emptyText={COPY.habitEmpty("")}
            createLabel={COPY.newHabit}
            onCreate={() => {
              setHabitSheetOpen(true);
            }}
            presentation="inline"
          />

          {habit === null ? null : (
            <Text as="p" variant="secondary" tone="secondary">
              {COPY.habitMeta(
                habit.durationMin,
                habit.durationMax,
                habit.lifePriority,
              )}
            </Text>
          )}

          {habitChanged ? (
            <Text as="p" variant="secondary" tone="secondary">
              {COPY.habitChanged}
            </Text>
          ) : null}

          <SegmentedControl
            label={COPY.when}
            value={when}
            onChange={setWhen}
            options={[
              { value: "fixed_time" as const, label: COPY.whenAt },
              { value: "window" as const, label: COPY.whenWindow },
              { value: "unscheduled" as const, label: COPY.whenAnytime },
            ]}
          />

          {when === "fixed_time" ? (
            <TimeField
              label={COPY.startsAt}
              value={startClock}
              onChange={setStartClock}
              required
            />
          ) : null}

          {when === "window" ? (
            <div className="flex gap-(--space-3)">
              <TimeField
                label={COPY.between}
                value={startClock}
                onChange={setStartClock}
                required
              />
              <TimeField
                label={COPY.and}
                value={endClock}
                onChange={setEndClock}
                required
              />
            </div>
          ) : null}

          <MinutesStepper
            label={COPY.takes}
            value={duration}
            onChange={setDuration}
            min={range.min}
            max={range.max}
            step={5}
            boundedNote
            helperText={COPY.takesHelper(range.min, range.max)}
            disabled={habit === null}
          />

          <Stepper17
            label={COPY.priority}
            value={(priority as Stepper17Value | null) ?? null}
            onChange={(next) => {
              setPriority(next);
            }}
            resting={
              (habit?.lifePriority as Stepper17Value | undefined) ?? null
            }
            onReset={
              priority === null
                ? undefined
                : () => {
                    setPriority(null);
                  }
            }
            helperText={COPY.priorityHelper(habit?.lifePriority ?? 4)}
            disabled={habit === null}
          />

          <SegmentedControl
            label={COPY.timing}
            value={scheduling}
            onChange={setScheduling}
            options={[
              {
                value: "hard" as const,
                label: COPY.fixed,
                helper: COPY.timingFixedHelper,
              },
              {
                value: "soft" as const,
                label: COPY.flexible,
                helper: COPY.timingFlexibleHelper,
              },
            ]}
          />

          {!online ? <HelperText>{COPY.offline}</HelperText> : null}
          {error === null ? null : <HelperText error>{error}</HelperText>}
        </div>
      </ResponsiveSheet>

      <DiscardDialog
        open={discardOpen}
        onKeepEditing={() => {
          setDiscardOpen(false);
        }}
        onDiscard={() => {
          setDiscardOpen(false);
          onOpenChange(false);
        }}
      />

      {/* *New habit* stacks the habit sheet; on save the new habit is chosen. */}
      <HabitSheet
        open={habitSheetOpen}
        mode="create"
        onOpenChange={setHabitSheetOpen}
        onSaved={(created) => {
          void utils.habit.list.invalidate().then(() => {
            setHabitId(created.id);
          });
        }}
      />
    </SheetHost>
  );
}

/** The range's midpoint, rounded — TP-03's prefill. */
function midpoint(habit: HabitSummaryView): number {
  if (habit.durationMin === null || habit.durationMax === null) return 15;
  return Math.round((habit.durationMin + habit.durationMax) / 2);
}

/** Grouped exactly as LB-01, archived hidden (TP-03). */
function groupHabits(habits: readonly HabitSummaryView[]) {
  const groups: Array<{ heading: string; type: HabitSummaryView["type"] }> = [
    { heading: "Habits", type: "habit" },
    { heading: "Tasks & appointments", type: "task_appointment" },
    { heading: "Deep work", type: "deep_work" },
  ];

  return groups
    .map((group) => ({
      heading: group.heading,
      items: habits
        .filter((habit) => habit.type === group.type && !habit.archived)
        .map((habit) => ({
          id: habit.id,
          icon: habit.icon,
          title: habit.title,
        })),
    }))
    .filter((group) => group.items.length > 0);
}

/** The service packs the collision into the error message as JSON. */
function parseConflict(error: unknown): {
  withSlotId: string;
  withTitle: string;
  atClock: string;
} | null {
  const message = messageFrom(error);
  if (!message.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(message) as {
      code?: string;
      withSlotId?: string;
      withTitle?: string;
      atClock?: string;
    };
    if (parsed.code !== "same_start") return null;
    if (!parsed.withSlotId || !parsed.withTitle || !parsed.atClock) return null;
    return {
      withSlotId: parsed.withSlotId,
      withTitle: parsed.withTitle,
      atClock: parsed.atClock,
    };
  } catch {
    return null;
  }
}

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Re-exported for the row, which shows the same clock arithmetic. */
export { formatClockFromMinutes };
