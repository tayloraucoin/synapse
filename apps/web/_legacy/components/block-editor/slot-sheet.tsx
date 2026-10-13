"use client";

import * as React from "react";

import {
  Button,
  EllipsesMenu,
  HelperText,
  InlineQuestionRow,
  MinutesStepper,
  PickerList,
  ResponsiveSheet,
  SegmentedControl,
  Stepper17,
  Text,
  TimeField,
  toastUndo,
  type PickerListGroup,
  type Stepper17Value,
} from "@syn/ui";
import { DURATION_MAX, DURATION_MIN, GAP_MAX, UNDO_LONG_MS } from "@syn/constants";
import type { BlockStructure, HabitSummaryView, SlotRole, SlotView } from "@syn/types";

import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { midpoint } from "./add-sheet";
import { BLOCK_EDITOR_COPY as COPY } from "./copy";
import { parseClock } from "./use-block-editor";

/**
 * The slot sheet — UX v1.1 §3.11: "number fields exist only inside the slot
 * sheet as the keyboard fallback". It is the editor's ONE form: the habit
 * (read-only once saved; *Change* re-opens the picker), *Takes* with the
 * range as information and no clamp (R21), *Gap before* (0 and disabled when
 * pinned — a pin has no gap), *At* (*In the stack · At a time*, the pin's
 * clock), *Role* (only under opener·pool·closer), the priority for this
 * block, *Fixed / Can move*, and *One of* with the second member.
 *
 * THE SAME-POSITION QUESTION HAS THREE ANSWERS (§3.5). Save sends the slot;
 * if another slot already holds that position the service refuses with the
 * occupant's title, and the footer becomes the question: *Yes, multitask* →
 * `multitaskWith`; *No, one or the other* → `alternatesWith`; *Move it* →
 * the sheet stays open on the position controls. Never an error code.
 *
 * A PIN NEVER MOVES BY *Move up / Move down*. `moveSlot` swaps stack
 * positions; a pin keeps its clock, the strip re-walks, and the pin is where
 * it was — the moving slot passes it.
 */

type AtMode = "stack" | "time";

export interface SlotSheetProps {
  open: boolean;
  templateId: string;
  structure: BlockStructure;
  /** The slot being edited; the sheet is edit-only — *Add* creates. */
  slot: SlotView | null;
  /** Every slot in the template — the one-of partner is found here. */
  slots: readonly SlotView[];
  onOpenChange: (open: boolean) => void;
  onChanged: () => Promise<void> | void;
}

type Conflict = { withSlotId: string; withTitle: string };

/** The service packs the collision into the error message as JSON. */
function parseConflict(error: unknown): Conflict | null {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(message) as { code?: string; withSlotId?: string; withTitle?: string };
    if (parsed.code !== "same_position" || !parsed.withSlotId || !parsed.withTitle) return null;
    return { withSlotId: parsed.withSlotId, withTitle: parsed.withTitle };
  } catch {
    return null;
  }
}

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** "07:20" for the `TimeField` from the view's "7:20" / "7:20 AM". */
function toInputClock(clock: string | null): string {
  const minutes = parseClock(clock);
  if (minutes === null) return "";
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function groupHabits(habits: readonly HabitSummaryView[]): PickerListGroup[] {
  const items = habits
    .filter((habit) => !habit.archived)
    .map((habit) => ({ id: habit.id, icon: habit.icon, title: habit.title }));
  return items.length === 0 ? [] : [{ heading: COPY.habit, items }];
}

export function SlotSheet({
  open,
  templateId,
  structure,
  slot,
  slots,
  onOpenChange,
  onChanged,
}: SlotSheetProps) {
  const online = useOnline();
  const habits = trpc.habit.list.useQuery({ includeArchived: false }, { enabled: open });
  const saveSlot = trpc.template.saveSlot.useMutation();
  const removeSlot = trpc.template.removeSlot.useMutation();
  const restoreSlot = trpc.template.restoreSlot.useMutation();
  const moveSlot = trpc.template.moveSlot.useMutation();

  const [habitId, setHabitId] = React.useState<string>("");
  const [pickingHabit, setPickingHabit] = React.useState(false);
  const [duration, setDuration] = React.useState<number>(DURATION_MIN);
  const [gap, setGap] = React.useState<number>(0);
  const [atMode, setAtMode] = React.useState<AtMode>("stack");
  const [pinClock, setPinClock] = React.useState<string>("");
  const [role, setRole] = React.useState<SlotRole>("stack");
  const [priority, setPriority] = React.useState<number | null>(null);
  const [scheduling, setScheduling] = React.useState<"hard" | "soft">("soft");
  const [defaultIsThis, setDefaultIsThis] = React.useState(true);
  /** The second member being made, when the slot is not yet one of two. */
  const [other, setOther] = React.useState<{ habitId: string | null; duration: number } | null>(null);
  const [pickingOther, setPickingOther] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [conflict, setConflict] = React.useState<Conflict | null>(null);
  const positionRef = React.useRef<HTMLDivElement>(null);

  const list = React.useMemo(() => habits.data?.habits ?? [], [habits.data?.habits]);
  const habit = list.find((row) => row.id === habitId) ?? null;
  const partner =
    slot?.alternates === null || slot === null
      ? null
      : (slots.find((row) => row.id !== slot.id && row.alternates?.group === slot.alternates?.group) ?? null);

  // Seed once per open from the slot.
  const seeded = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!open || slot === null) {
      seeded.current = null;
      return;
    }
    if (seeded.current === slot.id) return;
    seeded.current = slot.id;
    setError(null);
    setConflict(null);
    setPickingHabit(false);
    setPickingOther(false);
    setOther(null);
    setHabitId(slot.habitId);
    setDuration(slot.durationMin);
    setGap(slot.gapBeforeMin);
    setAtMode(slot.pinnedClock === null ? "stack" : "time");
    setPinClock(toInputClock(slot.pinnedClock));
    setRole(slot.role);
    setPriority(slot.overridden ? slot.priority : null);
    setScheduling(slot.scheduling);
    setDefaultIsThis(slot.alternates === null ? true : slot.alternates.isDefault);
  }, [open, slot]);

  const pinned = atMode === "time";
  const pinnedClock = pinned && pinClock !== "" ? pinClock : null;
  const canSave =
    online &&
    habitId !== "" &&
    !(pinned && pinClock === "") &&
    !(other !== null && other.habitId === null) &&
    !saveSlot.isPending;

  async function submit(answer?: { multitaskWith?: string; alternatesWith?: string }): Promise<void> {
    if (slot === null) return;
    setError(null);
    try {
      await saveSlot.mutateAsync({
        templateId,
        slotId: slot.id,
        habitId,
        durationMin: duration,
        gapBeforeMin: pinned ? 0 : gap,
        pinnedClock,
        role: structure === "opener_pool_closer" ? role : "stack",
        priorityOverride: priority,
        scheduling,
        ...(slot.alternates === null ? {} : { alternatesDefault: defaultIsThis }),
        ...answer,
      });

      // The second member: a new slot joining this one's position (§3.5).
      if (other !== null && other.habitId !== null) {
        await saveSlot.mutateAsync({
          templateId,
          habitId: other.habitId,
          durationMin: other.duration,
          gapBeforeMin: pinned ? 0 : gap,
          pinnedClock,
          role: structure === "opener_pool_closer" ? role : "stack",
          priorityOverride: null,
          scheduling,
          alternatesWith: slot.id,
          alternatesDefault: !defaultIsThis,
        });
      } else if (partner !== null && !defaultIsThis && !partner.alternates?.isDefault) {
        // The default moved to the other member: written on that member, so
        // the "at most one default" index sees one write, not a race.
        await saveSlot.mutateAsync({
          templateId,
          slotId: partner.id,
          habitId: partner.habitId,
          durationMin: partner.durationMin,
          gapBeforeMin: pinned ? 0 : gap,
          pinnedClock,
          role: structure === "opener_pool_closer" ? role : "stack",
          priorityOverride: partner.overridden ? partner.priority : null,
          scheduling: partner.scheduling,
          alternatesDefault: true,
        });
      }

      await onChanged();
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

  async function remove(target: SlotView): Promise<void> {
    setError(null);
    try {
      const payload = await removeSlot.mutateAsync({ id: target.id });
      await onChanged();
      onOpenChange(false);
      // A canvas removal is undoable, not confirmed (Epic 1 §10).
      toastUndo({
        text: COPY.removed(target.title),
        durationMs: UNDO_LONG_MS,
        onUndo: () => {
          void restoreSlot.mutateAsync({ payload }).then(() => onChanged());
        },
      });
    } catch (caught) {
      setError(messageFrom(caught));
    }
  }

  async function move(direction: "up" | "down"): Promise<void> {
    if (slot === null) return;
    setError(null);
    try {
      await moveSlot.mutateAsync({ id: slot.id, direction });
      await onChanged();
    } catch (caught) {
      setError(messageFrom(caught));
    }
  }

  async function duplicate(): Promise<void> {
    if (slot === null) return;
    setError(null);
    try {
      // A copy lands at the end of the stack, unpinned: the same habit at the
      // same clock would be the same-position question, not a duplicate.
      await saveSlot.mutateAsync({
        templateId,
        habitId: slot.habitId,
        durationMin: slot.durationMin,
        gapBeforeMin: slot.gapBeforeMin,
        pinnedClock: null,
        role: structure === "opener_pool_closer" ? slot.role : "stack",
        priorityOverride: slot.overridden ? slot.priority : null,
        scheduling: slot.scheduling,
      });
      await onChanged();
      onOpenChange(false);
    } catch (caught) {
      setError(messageFrom(caught));
    }
  }

  const range = habit === null ? null : COPY.takesRange(habit.durationMin, habit.durationMax);

  const busy = saveSlot.isPending || removeSlot.isPending || moveSlot.isPending;
  const disabled = !online || busy;

  const menu = (
    <EllipsesMenu
      label={COPY.slotEditTitle}
      disabled={disabled || slot === null}
      items={[
        { label: COPY.moveUp, onClick: () => void move("up"), disabled: slot?.pinnedClock !== null },
        { label: COPY.moveDown, onClick: () => void move("down"), disabled: slot?.pinnedClock !== null },
        { label: COPY.duplicate, onClick: () => void duplicate() },
        {
          label: COPY.remove,
          onClick: () => {
            if (slot !== null) void remove(slot);
          },
        },
      ]}
    />
  );

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.slotEditTitle}
        size="tall"
        headerAction={menu}
        footer={
          conflict !== null ? (
            <InlineQuestionRow
              text={COPY.samePositionQuestion(conflict.withTitle)}
              primary={{
                label: COPY.yesMultitask,
                onClick: () => {
                  void submit({ multitaskWith: conflict.withSlotId });
                },
              }}
              secondary={{
                label: COPY.noOneOf,
                onClick: () => {
                  void submit({ alternatesWith: conflict.withSlotId });
                },
              }}
              tertiary={{
                label: COPY.moveIt,
                onClick: () => {
                  setConflict(null);
                  positionRef.current?.querySelector<HTMLElement>("input, button")?.focus();
                },
              }}
            />
          ) : (
            <div className="flex justify-end gap-(--space-2)">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {COPY.cancel}
              </Button>
              <Button onClick={() => void submit()} busy={saveSlot.isPending} disabled={!canSave}>
                {COPY.save}
              </Button>
            </div>
          )
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          {/* The habit: read-only once saved; *Change* re-opens the picker. */}
          <div className="flex items-center justify-between gap-(--space-3)">
            <div className="flex min-w-0 flex-col">
              <Text as="span" variant="caption" tone="secondary">
                {COPY.habit}
              </Text>
              <Text as="span" weight={500} truncate>
                {habit?.title ?? slot?.title ?? ""}
              </Text>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              aria-expanded={pickingHabit}
              onClick={() => setPickingHabit((value) => !value)}
            >
              {COPY.changeHabit}
            </Button>
          </div>
          {pickingHabit ? (
            <PickerList
              groups={groupHabits(list)}
              value={habitId}
              onSelect={(id) => {
                const chosen = list.find((row) => row.id === id);
                if (!chosen) return;
                setHabitId(id);
                setDuration(midpoint(chosen));
                setPriority(null);
                setPickingHabit(false);
              }}
              searchLabel={COPY.searchLabel}
              emptyText={COPY.habitEmpty("")}
              presentation="inline"
            />
          ) : null}

          <MinutesStepper
            label={COPY.takes}
            value={duration}
            onChange={setDuration}
            min={DURATION_MIN}
            max={DURATION_MAX}
            helperText={range ?? undefined}
            disabled={disabled}
          />

          <div ref={positionRef} className="flex flex-col gap-(--space-4)">
            <MinutesStepper
              label={COPY.gapBefore}
              value={pinned ? 0 : gap}
              onChange={setGap}
              min={0}
              max={GAP_MAX}
              helperText={pinned ? COPY.gapPinned : undefined}
              disabled={disabled || pinned}
            />

            <SegmentedControl
              label={COPY.at}
              value={atMode}
              onChange={setAtMode}
              options={[
                { value: "stack" as const, label: COPY.inTheStack },
                { value: "time" as const, label: COPY.atATime },
              ]}
              disabled={disabled}
            />

            {pinned ? (
              <TimeField
                label={COPY.pinTime}
                value={pinClock}
                onChange={setPinClock}
                required
                disabled={disabled}
              />
            ) : null}
          </div>

          {structure === "opener_pool_closer" ? (
            <SegmentedControl
              label={COPY.role}
              value={role === "stack" ? "opener" : role}
              onChange={setRole}
              options={[
                { value: "opener" as const, label: COPY.roleOpener },
                { value: "pool" as const, label: COPY.rolePool },
                { value: "closer" as const, label: COPY.roleCloser },
              ]}
              disabled={disabled}
            />
          ) : null}

          <Stepper17
            label={COPY.priority}
            value={(priority as Stepper17Value | null) ?? null}
            onChange={(next) => setPriority(next)}
            resting={(habit?.lifePriority as Stepper17Value | undefined) ?? null}
            onReset={priority === null ? undefined : () => setPriority(null)}
            helperText={COPY.priorityHelper(habit?.lifePriority ?? slot?.priority ?? 4)}
            disabled={disabled}
          />

          <SegmentedControl
            label={COPY.timing}
            value={scheduling}
            onChange={setScheduling}
            options={[
              { value: "hard" as const, label: COPY.fixed, helper: COPY.timingFixedHelper },
              { value: "soft" as const, label: COPY.canMove, helper: COPY.timingCanMoveHelper },
            ]}
            disabled={disabled}
          />

          {/* One of — §3.5: two members at one position, one the default. */}
          <div className="flex flex-col gap-(--space-3)">
            <Text as="span" variant="caption" tone="secondary">
              {COPY.oneOfSection}
            </Text>
            {slot?.alternates !== null && slot !== null && partner !== null ? (
              <>
                <div className="flex items-center justify-between gap-(--space-3)">
                  <Text as="span" truncate>
                    {`${COPY.orTitle} ${partner.title} · ${partner.durationMin} min`}
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => void remove(partner)}
                  >
                    {COPY.removeOneOf}
                  </Button>
                </div>
                <SegmentedControl
                  label={COPY.defaultMember}
                  value={defaultIsThis ? "this" : "other"}
                  onChange={(next) => setDefaultIsThis(next === "this")}
                  options={[
                    { value: "this" as const, label: habit?.title ?? slot.title },
                    { value: "other" as const, label: partner.title },
                  ]}
                  disabled={disabled}
                />
              </>
            ) : other === null ? (
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                disabled={disabled || slot?.multitask !== "none"}
                onClick={() => {
                  setOther({ habitId: null, duration: 15 });
                  setPickingOther(true);
                }}
              >
                {COPY.makeOneOf}
              </Button>
            ) : (
              <>
                <div className="flex items-center justify-between gap-(--space-3)">
                  <Text as="span" truncate>
                    {`${COPY.orTitle} ${list.find((row) => row.id === other.habitId)?.title ?? ""}`}
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    aria-expanded={pickingOther}
                    onClick={() => setPickingOther((value) => !value)}
                  >
                    {COPY.changeHabit}
                  </Button>
                </div>
                {pickingOther ? (
                  <PickerList
                    groups={groupHabits(list.filter((row) => row.id !== habitId))}
                    value={other.habitId}
                    onSelect={(id) => {
                      const chosen = list.find((row) => row.id === id);
                      if (!chosen) return;
                      setOther({ habitId: id, duration: midpoint(chosen) });
                      setPickingOther(false);
                    }}
                    searchLabel={COPY.searchLabel}
                    emptyText={COPY.habitEmpty("")}
                    presentation="inline"
                  />
                ) : null}
                <MinutesStepper
                  label={COPY.otherTakes}
                  value={other.duration}
                  onChange={(next) => setOther({ habitId: other.habitId, duration: next })}
                  min={DURATION_MIN}
                  max={DURATION_MAX}
                  disabled={disabled || other.habitId === null}
                />
                <SegmentedControl
                  label={COPY.defaultMember}
                  value={defaultIsThis ? "this" : "other"}
                  onChange={(next) => setDefaultIsThis(next === "this")}
                  options={[
                    { value: "this" as const, label: habit?.title ?? slot?.title ?? "" },
                    {
                      value: "other" as const,
                      label: list.find((row) => row.id === other.habitId)?.title ?? COPY.orTitle,
                    },
                  ]}
                  disabled={disabled || other.habitId === null}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-start"
                  disabled={disabled}
                  onClick={() => {
                    setOther(null);
                    setDefaultIsThis(true);
                  }}
                >
                  {COPY.removeOneOf}
                </Button>
              </>
            )}
          </div>

          {!online ? <HelperText>{COPY.offline}</HelperText> : null}
          {error === null ? null : <HelperText error>{error}</HelperText>}
        </div>
      </ResponsiveSheet>
    </SheetHost>
  );
}
