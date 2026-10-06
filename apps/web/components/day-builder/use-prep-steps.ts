"use client";

import * as React from "react";

import { STARTER_LIBRARY } from "@syn/constants";
import type { HabitSummaryView, IconValue, SlotView } from "@syn/types";

import { midpointOf } from "@/components/landscape-chooser";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "@/app/(setup)/_components/copy";

/**
 * Screen 7's writes — UX v1.2 §4.7 (R30, S7.5, TD-18; RUN-10), on DYN-11.
 *
 * A TICK WRITES TWO THINGS: the step itself (`createFromStarterLibrary` for
 * a starter; a custom step already exists from its sheet) and a slot on the
 * prep template — priority 7, hard, the range's midpoint, appended. An
 * un-tick removes the slot and archives the step if it has never been used
 * on a day. The row's tick moves on the tap; the writes queue per row in a
 * promise map, so a second tap during a create is an un-tick behind it and
 * never a second create (S7.5). A rejected write puts the tick back and says
 * one line.
 *
 * THE LENGTHS ARE THE SLOTS' (`duration_min`), written by the row's stepper
 * on its debounce; the order is the slots' order, written by `moveSlot` on a
 * drop. The prep template exists from the first visit, as DYN-11 made it.
 *
 * UX v1.3 §4.4 B5 (DAY-9): given a `templateId`, the ticks write into THAT
 * list — the plan's own *Getting ready A* — and nothing creates the profile's
 * template; `null` means the list is not there yet and nothing writes. Left
 * out, it is screen 7's profile list as before.
 */

export type PrepRow = {
  key: string;
  title: string;
  icon: IconValue;
  rangeMin: number;
  rangeMax: number;
  selected: boolean;
  committing: boolean;
  locked: boolean;
  /** The step's habit id, once it exists. */
  habitId: string | null;
};

/**
 * The kinds whose list is built by ticking starters (UX v1.3 §4.4 B5, B12,
 * B14): a prep step's slot is priority 7 and hard, as screen 7 made it; a
 * wind-down or after-work step's is the plain soft slot the builder seeds.
 */
export type StarterKind = "prep" | "wind_down" | "transition";

export function usePrepSteps(options: { templateId?: string | null; kind?: StarterKind } = {}) {
  const utils = trpc.useUtils();
  const kind: StarterKind = options.kind ?? "prep";
  const slotRule =
    kind === "prep" ? { priorityOverride: 7, scheduling: "hard" as const } : { priorityOverride: null, scheduling: "soft" as const };
  const given = options.templateId !== undefined;
  const prepList = trpc.template.list.useQuery({ includeArchived: false, kind }, { enabled: !given });
  const createTemplate = trpc.template.create.useMutation();
  const templateId = given ? (options.templateId ?? null) : (prepList.data?.[0]?.id ?? null);

  const creating = React.useRef(false);
  React.useEffect(() => {
    if (given || !prepList.isSuccess || templateId !== null || creating.current) return;
    creating.current = true;
    void createTemplate.mutateAsync({ kind }).then(() => utils.template.list.invalidate());
  }, [given, kind, prepList.isSuccess, templateId, createTemplate, utils]);

  const detail = trpc.template.get.useQuery({ id: templateId ?? "" }, { enabled: templateId !== null });
  const prepHabits = trpc.habit.list.useQuery({ includeArchived: false, blockKind: kind });
  const fromLibrary = trpc.habit.createFromStarterLibrary.useMutation();
  const saveSlot = trpc.template.saveSlot.useMutation();
  const removeSlot = trpc.template.removeSlot.useMutation();
  const moveSlot = trpc.template.moveSlot.useMutation();
  const archive = trpc.habit.archive.useMutation();

  const [pending, setPending] = React.useState<Map<string, boolean>>(new Map());
  const [locked, setLocked] = React.useState<Set<string>>(new Set());
  const [line, setLine] = React.useState<string | null>(null);
  const inFlight = React.useRef<Map<string, Promise<void>>>(new Map());

  const slots = React.useMemo(() => detail.data?.slots ?? [], [detail.data?.slots]);
  const habits = React.useMemo(() => prepHabits.data?.habits ?? [], [prepHabits.data?.habits]);
  const slotByHabit = React.useMemo(() => new Map(slots.map((slot) => [slot.habitId, slot])), [slots]);
  const habitByTitle = React.useMemo(
    () => new Map(habits.map((habit) => [habit.title.toLowerCase(), habit])),
    [habits],
  );

  const refresh = React.useCallback(async () => {
    if (templateId !== null) await utils.template.get.invalidate({ id: templateId });
    await utils.template.list.invalidate();
    await utils.habit.list.invalidate();
  }, [utils, templateId]);

  const setPendingFor = (key: string, value: boolean | null) =>
    setPending((current) => {
      const next = new Map(current);
      if (value === null) next.delete(key);
      else next.set(key, value);
      return next;
    });

  /** A slot for the step, appended, at the midpoint — unless one is already there. */
  const addSlot = React.useCallback(
    async (habitId: string, durationMin: number, partnerId?: string) => {
      if (templateId === null) return;
      const current = await utils.template.get.fetch({ id: templateId });
      if (partnerId === undefined && current.slots.some((slot) => slot.habitId === habitId)) return;
      await saveSlot.mutateAsync({
        templateId,
        habitId,
        durationMin,
        gapBeforeMin: 0,
        pinnedClock: null,
        role: "stack",
        priorityOverride: slotRule.priorityOverride,
        scheduling: slotRule.scheduling,
        ...(partnerId === undefined ? {} : { alternatesWith: partnerId, alternatesDefault: false }),
      });
    },
    [templateId, utils, saveSlot, slotRule.priorityOverride, slotRule.scheduling],
  );

  const doTick = React.useCallback(
    async (title: string, rangeMin: number, rangeMax: number) => {
      const before = await utils.habit.list.fetch({ includeArchived: false, blockKind: kind });
      let habit: HabitSummaryView | { id: string } | undefined = before.habits.find(
        (row) => row.title.toLowerCase() === title.toLowerCase(),
      );
      if (!habit) {
        const made = await fromLibrary.mutateAsync({ blockKind: kind, titles: [title] });
        habit = made.rows[0];
      }
      if (!habit) throw new Error("no_habit");
      await addSlot(habit.id, midpointOf(rangeMin, rangeMax));
    },
    [utils, fromLibrary, addSlot, kind],
  );

  const doUntick = React.useCallback(
    async (title: string) => {
      if (templateId === null) return;
      const fresh = await utils.habit.list.fetch({ includeArchived: false, blockKind: kind });
      const habit = fresh.habits.find((row) => row.title.toLowerCase() === title.toLowerCase());
      if (!habit) return;
      const current = await utils.template.get.fetch({ id: templateId });
      for (const slot of current.slots.filter((row) => row.habitId === habit.id)) {
        await removeSlot.mutateAsync({ id: slot.id });
      }
      const usage = await utils.habit.usage.fetch({ id: habit.id });
      if (usage.recentDays.length === 0) await archive.mutateAsync({ id: habit.id });
      else setLocked((existing) => new Set(existing).add(title));
    },
    [templateId, utils, removeSlot, archive, kind],
  );

  const toggle = React.useCallback(
    (row: Pick<PrepRow, "title" | "rangeMin" | "rangeMax">, on: boolean) => {
      const key = row.title;
      setLine(null);
      setPendingFor(key, on);
      const previous = inFlight.current.get(key) ?? Promise.resolve();
      const run = previous
        .catch(() => undefined)
        .then(() => (on ? doTick(row.title, row.rangeMin, row.rangeMax) : doUntick(row.title)))
        .then(() => refresh())
        .catch(() => setLine(COPY.stepSaveError(row.title)))
        .finally(() => {
          if (inFlight.current.get(key) === run) {
            inFlight.current.delete(key);
            setPendingFor(key, null);
          }
        });
      inFlight.current.set(key, run);
    },
    [doTick, doUntick, refresh],
  );

  /** The rows: the kind's starters (never the placed ones), then the person's own not among them. */
  const offers = React.useMemo(() => STARTER_LIBRARY[kind].filter((entry) => entry.placed !== true), [kind]);
  const rows: PrepRow[] = React.useMemo(() => {
    const starters = offers.map((entry) => {
      const habit = habitByTitle.get(entry.title.toLowerCase()) ?? null;
      const ahead = pending.get(entry.title);
      return {
        key: entry.title,
        title: entry.title,
        icon: entry.icon as IconValue,
        rangeMin: entry.rangeMin,
        rangeMax: entry.rangeMax,
        selected: ahead ?? (habit !== null && slotByHabit.has(habit.id)),
        committing: pending.has(entry.title),
        locked: locked.has(entry.title),
        habitId: habit?.id ?? null,
      };
    });
    const starterTitles = new Set(offers.map((entry) => entry.title.toLowerCase()));
    const own = habits
      .filter((habit) => !starterTitles.has(habit.title.toLowerCase()))
      .map((habit) => {
        const ahead = pending.get(habit.title);
        return {
          key: habit.title,
          title: habit.title,
          icon: habit.icon,
          rangeMin: habit.durationMin ?? 10,
          rangeMax: habit.durationMax ?? 20,
          selected: ahead ?? slotByHabit.has(habit.id),
          committing: pending.has(habit.title),
          locked: locked.has(habit.title),
          habitId: habit.id,
        };
      });
    return [...starters, ...own];
  }, [offers, habitByTitle, pending, slotByHabit, locked, habits]);

  /** The stepper: the slot's `duration_min`, on the stepper's debounce. */
  const setLength = React.useCallback(
    async (slot: SlotView, durationMin: number) => {
      if (templateId === null) return;
      await saveSlot.mutateAsync({
        templateId,
        slotId: slot.id,
        habitId: slot.habitId,
        durationMin,
        gapBeforeMin: slot.gapBeforeMin,
        pinnedClock: toInputClock(slot.pinnedClock),
        role: slot.role,
        priorityOverride: slot.overridden ? slot.priority : null,
        scheduling: slot.scheduling,
      });
      await refresh();
    },
    [templateId, saveSlot, refresh],
  );

  /** A drop: the moved slot's adjacent swaps, repeated (DYN-9's rule). */
  const reorder = React.useCallback(
    async (fromIds: string[], toIds: string[]) => {
      const moved = toIds.find((id, index) => fromIds[index] !== id);
      if (moved === undefined) return;
      const from = fromIds.indexOf(moved);
      const to = toIds.indexOf(moved);
      if (from === -1 || to === -1 || from === to) return;
      try {
        await moveSlot.mutateAsync({
          id: moved,
          direction: to < from ? "up" : "down",
          steps: Math.abs(to - from),
        });
      } finally {
        await refresh();
      }
    },
    [moveSlot, refresh],
  );

  const remove = React.useCallback(
    async (slot: SlotView) => {
      await removeSlot.mutateAsync({ id: slot.id });
      await refresh();
    },
    [removeSlot, refresh],
  );

  return {
    templateId,
    ready: (given || prepList.isSuccess) && templateId !== null && !detail.isLoading,
    rows,
    slots,
    habits,
    toggle,
    setLength,
    reorder,
    remove,
    addSlot,
    line,
    refresh,
    busy: saveSlot.isPending,
  };
}

/** "07:20" for the validator from the view's "7:20" / "7:20 AM". */
function toInputClock(clock: string | null): string | null {
  if (clock === null) return null;
  const pm = /PM$/i.test(clock);
  const [hour = "0", minute = "00"] = clock.replace(/\s?[AP]M$/i, "").split(":");
  let h = Number(hour);
  if (pm && h < 12) h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}
