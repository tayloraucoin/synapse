"use client";

import * as React from "react";

import {
  Button,
  DateField,
  DiscardDialog,
  HelperText,
  InlineQuestionRow,
  Input,
  MinutesStepper,
  PickerList,
  ResponsiveSheet,
  SegmentedControl,
  StatusLine,
  Stepper17,
  TimeField,
  type Stepper17Value,
} from "@syn/ui";
import {
  DURATION_MAX,
  DURATION_MIN,
  HABIT_TITLE_MAX,
  detectTimezone,
} from "@syn/constants";
import type { HabitSummaryView } from "@syn/types";
import { dateKeyIn } from "@syn/utils";

import { HabitSheet } from "@/components/habit-sheet";
import { SheetHost } from "@/components/page-frame";
import { ReminderPrompt, useReminderPrompt } from "@/components/reminder-prompt";
import { WEEK_COPY as COPY } from "@/components/week-build/copy";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

/**
 * WK-03 — one item on one day, and one of the two doors the List opens.
 *
 * *JUST A TITLE* CREATES NO LIBRARY ENTRY, and the helper says so. Not every
 * task is a habit; a dentist appointment on Thursday should not become a thing
 * the person is asked about every week. *Save to habits instead* is there for
 * when it should be.
 *
 * `allowDateChange` is what makes this the day header's door as well as the
 * week's: opened from WK-02 the day is fixed, opened from a day header it may
 * be moved (cross-cutting §9.3 G4).
 */
export function OneOffSheet({
  open,
  date,
  itemId,
  allowDateChange = false,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  date: string;
  itemId?: string;
  allowDateChange?: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const reminder = useReminderPrompt();

  const habits = trpc.habit.list.useQuery(
    { includeArchived: false },
    { enabled: open },
  );
  const save = trpc.week.addOneOff.useMutation();

  const [source, setSource] = React.useState<"habit" | "title">("habit");
  const [habitId, setHabitId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [day, setDay] = React.useState(date);
  const [when, setWhen] = React.useState<
    "fixed_time" | "window" | "unscheduled"
  >("fixed_time");
  const [startClock, setStartClock] = React.useState("09:00");
  const [endClock, setEndClock] = React.useState("12:00");
  const [duration, setDuration] = React.useState<number | null>(null);
  const [priority, setPriority] = React.useState<number>(4);
  // A one-off with a fixed time defaults to Fixed (official spec §4.5).
  const [scheduling, setScheduling] = React.useState<"hard" | "soft">("hard");
  const [error, setError] = React.useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const [habitSheetOpen, setHabitSheetOpen] = React.useState(false);
  const [conflict, setConflict] = React.useState<{
    withItemId: string;
    withTitle: string;
  } | null>(null);

  const list = habits.data?.habits ?? [];
  const habit = list.find((row) => row.id === habitId) ?? null;

  // Editing loads the row from the same preview WK-02 already has; creating
  // starts at the next quarter hour on today and 09:00 on any other day.
  const existing = trpc.week.dayPreview.useQuery(
    { date },
    { enabled: open && itemId !== undefined },
  );

  React.useEffect(() => {
    if (!open) return;
    setDay(date);
    setError(null);
    setConflict(null);

    if (itemId === undefined) {
      setSource("habit");
      setHabitId(null);
      setTitle("");
      setWhen("fixed_time");
      setStartClock(defaultStartClock(date, existing.data?.timezone ?? null));
      setEndClock("12:00");
      setDuration(null);
      setPriority(4);
      setScheduling("hard");
      return;
    }

    const row = existing.data?.parts
      .flatMap((part) => part.items)
      .find((item) => item.id === itemId);
    if (!row) return;

    setSource(row.habitId === null ? "title" : "habit");
    setHabitId(row.habitId);
    setTitle(row.title);
    setWhen(row.timeMode);
    setDuration(row.durationMin);
    setPriority(row.priority);
    setScheduling(row.scheduling);
    if (row.scheduledStart !== null) {
      setStartClock(clockIn(row.scheduledStart, existing.data?.timezone ?? "UTC"));
    }
    if (row.scheduledEnd !== null) {
      setEndClock(clockIn(row.scheduledEnd, existing.data?.timezone ?? "UTC"));
    }
  }, [open, date, itemId, existing.data]);

  async function submit(multitaskWith?: string): Promise<void> {
    setError(null);
    try {
      await save.mutateAsync({
        date: day,
        itemId,
        habitId: source === "habit" ? habitId : null,
        title: source === "title" ? title : (habit?.title ?? ""),
        timeMode: when,
        startClock: when === "unscheduled" ? null : startClock,
        endClock: when === "window" ? endClock : null,
        durationMin: duration,
        priority,
        scheduling,
        ...(multitaskWith ? { multitaskWith } : {}),
      });
      await utils.week.get.invalidate();
      await utils.week.dayPreview.invalidate();
      onSaved?.();
      // SET-9's ask, from the second of its two trigger points.
      reminder.maybeOffer({
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
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  const canSave =
    source === "habit" ? habitId !== null : title.trim().length > 0;

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => {
          if (!next && canSave) {
            setDiscardOpen(true);
            return;
          }
          onOpenChange(next);
        }}
        title={itemId ? COPY.editTitle : COPY.addTitle}
        size="tall"
        dirty={canSave}
        onDiscardRequest={() => {
          setDiscardOpen(true);
        }}
        footer={
          conflict !== null ? (
            <InlineQuestionRow
              text={COPY.sameStartQuestion(conflict.withTitle)}
              primary={{
                label: COPY.sameStartYes,
                onClick: () => void submit(conflict.withItemId),
              }}
              secondary={{
                label: COPY.sameStartNo,
                onClick: () => setConflict(null),
              }}
            />
          ) : (
            <div className="flex justify-end gap-(--space-2)">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {COPY.cancel}
              </Button>
              <Button
                onClick={() => void submit()}
                busy={save.isPending}
                disabled={!online || !canSave}
              >
                {COPY.save}
              </Button>
            </div>
          )
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          <SegmentedControl
            label={COPY.what}
            value={source}
            onChange={setSource}
            options={[
              { value: "habit" as const, label: COPY.fromHabits },
              { value: "title" as const, label: COPY.justATitle },
            ]}
          />

          {source === "habit" ? (
            <PickerList
              groups={groupHabits(list)}
              value={habitId}
              onSelect={(id) => {
                setHabitId(id);
                const chosen = list.find((row) => row.id === id);
                if (chosen) {
                  setDuration(midpoint(chosen));
                  setPriority(chosen.lifePriority);
                }
              }}
              searchLabel="Search habits"
              emptyText="No habits match"
              presentation="inline"
            />
          ) : (
            <>
              <Input
                label={COPY.titleLabel}
                value={title}
                maxLength={HABIT_TITLE_MAX}
                onChange={(event) => setTitle(event.target.value)}
                helperText={COPY.titleHelper}
              />
              <Button
                variant="ghost"
                className="self-start"
                onClick={() => setHabitSheetOpen(true)}
              >
                {COPY.saveToHabits}
              </Button>
            </>
          )}

          {allowDateChange ? (
            <DateField label={COPY.day} value={day} onChange={setDay} />
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
              label={COPY.dayStartsAt}
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
            min={habit?.durationMin ?? DURATION_MIN}
            max={habit?.durationMax ?? DURATION_MAX}
            step={5}
            boundedNote={habit !== null}
          />

          <Stepper17
            label={COPY.priority}
            value={priority as Stepper17Value}
            onChange={setPriority}
          />

          <SegmentedControl
            label={COPY.timing}
            value={scheduling}
            onChange={setScheduling}
            options={[
              { value: "hard" as const, label: COPY.fixed },
              { value: "soft" as const, label: COPY.flexible },
            ]}
          />

          {!online ? <StatusLine variant="offline" placement="inline" /> : null}
          {error === null ? null : <HelperText error>{error}</HelperText>}
        </div>
      </ResponsiveSheet>

      <DiscardDialog
        open={discardOpen}
        onKeepEditing={() => setDiscardOpen(false)}
        onDiscard={() => {
          setDiscardOpen(false);
          onOpenChange(false);
        }}
      />

      <HabitSheet
        open={habitSheetOpen}
        mode="create"
        defaults={{ type: "task_appointment" }}
        onOpenChange={setHabitSheetOpen}
        onSaved={(created) => {
          void utils.habit.list.invalidate().then(() => {
            setSource("habit");
            setHabitId(created.id);
          });
        }}
      />

      <ReminderPrompt controller={reminder} />
    </SheetHost>
  );
}

function midpoint(habit: HabitSummaryView): number {
  if (habit.durationMin === null || habit.durationMax === null) return 15;
  return Math.round((habit.durationMin + habit.durationMax) / 2);
}

/** "14:45" — the wall clock in a zone, for prefilling a `TimeField`. */
function clockIn(at: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(at);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "09";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

/**
 * Now rounded up to the next quarter hour on today, 09:00 on any other day
 * (WK-03). Adding something to this afternoon should not start by scrolling
 * a picker back to the present.
 */
function defaultStartClock(date: string, timeZone: string | null): string {
  // One device-zone reader in the codebase (SYS-2): `detectTimezone`.
  const zone = timeZone ?? detectTimezone();
  const now = new Date();
  if (dateKeyIn(now, zone) !== date) return "09:00";

  const rounded = new Date(now.getTime());
  rounded.setSeconds(0, 0);
  const remainder = rounded.getMinutes() % 15;
  rounded.setMinutes(rounded.getMinutes() + (remainder === 0 ? 0 : 15 - remainder));
  return clockIn(rounded, zone);
}

function groupHabits(habits: readonly HabitSummaryView[]) {
  const groups = [
    { heading: "Habits", type: "habit" as const },
    { heading: "Tasks & appointments", type: "task_appointment" as const },
    { heading: "Deep work", type: "deep_work" as const },
  ];
  return groups
    .map((group) => ({
      heading: group.heading,
      items: habits
        .filter((habit) => habit.type === group.type && !habit.archived)
        .map((habit) => ({ id: habit.id, icon: habit.icon, title: habit.title })),
    }))
    .filter((group) => group.items.length > 0);
}

function parseConflict(
  error: unknown,
): { withItemId: string; withTitle: string } | null {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(message) as {
      code?: string;
      withItemId?: string;
      withTitle?: string;
    };
    if (parsed.code !== "same_start") return null;
    if (!parsed.withItemId || !parsed.withTitle) return null;
    return { withItemId: parsed.withItemId, withTitle: parsed.withTitle };
  } catch {
    return null;
  }
}
