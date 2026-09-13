"use client";

import * as React from "react";

import {
  Button,
  HelperText,
  MinutesStepper,
  ResponsiveSheet,
  SegmentedControl,
  Stepper17,
  Text,
  TimeField,
  type Stepper17Value,
} from "@syn/ui";
import { DURATION_MAX, DURATION_MIN } from "@syn/constants";
import { clockFromMinutes, instantToWallClockMinutes } from "@syn/utils";

import { HabitSheet } from "@/components/habit-sheet";
import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { HABIT_DAY_COPY as COPY } from "./copy";

type ItemDetail = RouterOutputs["item"]["get"];

/**
 * Habit-day editing — UX v1.1 §6.4 (DYN-15): "Change this item on this day
 * — length, time, priority, whether it's in — without touching the habit."
 *
 * FOUR CONTROLS, ONE WRITE. *Takes* with the range as muted text and no
 * clamp (R21, W10); *At* — in the stack, or a time that pins it for today;
 * *Priority today*; the ghost row *Leave out today*. Save is one
 * `item.editToday` with what changed; the block re-flows. *Also change the
 * habit* opens the habit sheet stacked — the one door from here to the
 * library, and it is a different sheet.
 */
export function HabitDaySheet({
  open,
  item,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  item: ItemDetail;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const edit = trpc.item.editToday.useMutation();
  const [duration, setDuration] = React.useState<number>(item.durationMin ?? 15);
  const [at, setAt] = React.useState<"stack" | "clock">(item.pinned ? "clock" : "stack");
  const [clock, setClock] = React.useState<string>(
    item.scheduledStart === null ? "09:00" : clockFromMinutes(instantToWallClockMinutes(item.scheduledStart, item.timezone)),
  );
  const [priority, setPriority] = React.useState<number>(item.priority);
  const [error, setError] = React.useState<string | null>(null);
  const [habitOpen, setHabitOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setDuration(item.durationMin ?? 15);
    setAt(item.pinned ? "clock" : "stack");
    setClock(
      item.scheduledStart === null
        ? "09:00"
        : clockFromMinutes(instantToWallClockMinutes(item.scheduledStart, item.timezone)),
    );
    setPriority(item.priority);
    setError(null);
  }, [open, item]);

  // A done or running item's length and time are the record (the service's rule).
  const settled = item.doneAt !== null || item.runningSince !== null;
  const disabled = !online || edit.isPending;

  async function save(leaveOut = false): Promise<void> {
    setError(null);
    const patch: Parameters<typeof edit.mutateAsync>[0] = { itemId: item.id };
    if (leaveOut) patch.leaveOut = true;
    if (!settled && duration !== (item.durationMin ?? 15)) patch.durationMin = duration;
    if (!settled) {
      if (at === "clock" && (!item.pinned || clock !== initialClock(item))) patch.at = { kind: "clock", clock };
      else if (at === "stack" && item.pinned) patch.at = { kind: "stack" };
    }
    if (priority !== item.priority) patch.priority = priority;
    if (Object.keys(patch).length === 1) {
      onOpenChange(false);
      return;
    }
    try {
      await edit.mutateAsync(patch);
      onSaved?.();
      onOpenChange(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={item.title}
        subtitle={COPY.todayOnly}
        size="tall"
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            <Button disabled={disabled} busy={edit.isPending} onClick={() => void save()}>
              {COPY.save}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          <MinutesStepper
            label={COPY.takes}
            value={duration}
            onChange={setDuration}
            min={DURATION_MIN}
            max={DURATION_MAX}
            step={5}
            helperText={item.habitRange === null ? undefined : COPY.usually(item.habitRange.min, item.habitRange.max)}
            disabled={disabled || settled}
          />

          <SegmentedControl
            label={COPY.at}
            value={at}
            onChange={setAt}
            options={[
              { value: "stack" as const, label: COPY.inTheStack },
              { value: "clock" as const, label: COPY.atATime },
            ]}
            disabled={disabled || settled}
          />
          {at === "clock" ? (
            <TimeField label={COPY.time} value={clock} onChange={setClock} required disabled={disabled || settled} />
          ) : null}

          <Stepper17
            label={COPY.priorityToday}
            value={priority as Stepper17Value}
            onChange={(next) => setPriority(next)}
            disabled={disabled}
          />

          <Button variant="ghost" className="self-start" disabled={disabled} onClick={() => void save(true)}>
            {COPY.leaveOutToday}
          </Button>

          <div className="flex flex-wrap items-center gap-(--space-2)">
            <Text as="span" variant="caption" tone="secondary">
              {COPY.changesTheDay}
            </Text>
            {item.habitId === null ? null : (
              <Button variant="ghost" size="sm" onClick={() => setHabitOpen(true)}>
                {COPY.alsoChangeHabit}
              </Button>
            )}
          </div>

          {!online ? <HelperText>{COPY.offline}</HelperText> : null}
          {error === null ? null : <HelperText error>{error}</HelperText>}
        </div>
      </ResponsiveSheet>

      {item.habitId === null ? null : (
        <HabitSheet open={habitOpen} mode="edit" habitId={item.habitId} onOpenChange={setHabitOpen} />
      )}
    </SheetHost>
  );
}

function initialClock(item: ItemDetail): string {
  return item.scheduledStart === null
    ? ""
    : clockFromMinutes(instantToWallClockMinutes(item.scheduledStart, item.timezone));
}
