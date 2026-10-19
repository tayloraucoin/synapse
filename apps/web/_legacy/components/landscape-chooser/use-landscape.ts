"use client";

import * as React from "react";

import { ACTIVITY_GROUPS, MORNING_GROUPS, STARTER_LIBRARY, type ActivityGroup, type MorningGroup, type StarterLibraryEntry } from "@syn/constants";
import type { HabitSummaryView, IconValue } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { LANDSCAPE_COPY as COPY } from "./copy";

/**
 * The landscape's state — UX v1.2 §4.8 (R30, TD-18; RUN-10), on DYN-11.
 *
 * A TICK CREATES THE HABIT AT ONCE. The row shows its tick on the tap;
 * `habit.createFromStarterLibrary` runs for that one title (with the entry's
 * glyph and range), and — on first run, `withTemplate` — the morning
 * template gets a slot at the range's midpoint in tick order. A second tap
 * un-ticks: the slot goes, and the habit is archived if it has never been
 * used on a day (`habit.usage`); a used one stays in the library.
 *
 * NEVER A DUPLICATE (S7.5). Every row keys its in-flight create by the
 * starter's title in a promise map; an un-tick during the create awaits it
 * and then removes what it made, and a second tick during an in-flight
 * create is the same promise, not a second one. A rejected create puts the
 * tick back and says one line.
 *
 * NOTHING IS PRE-CHECKED. The library's own morning habits show as selected
 * because they are already the person's; the starters begin unticked.
 * No number about minutes leaves this hook — the fit is nobody's job here.
 */

export type LandscapeRow = {
  /** The starter's title. */
  key: string;
  title: string;
  icon: IconValue;
  rangeMin: number;
  rangeMax: number;
  selected: boolean;
  /** A write is out for this row. */
  committing: boolean;
  /** In the library and used on a day — shown selected, not un-tickable. */
  locked: boolean;
  /**
   * UX v1.3 R66 (DAY-10): the *All* tab's group — the starter's `group`;
   * null for a habit the person added, listed under *Your own*.
   */
  group: MorningGroup | ActivityGroup | null;
};

export function midpointOf(min: number | null, max: number | null): number {
  if (min === null || max === null) return 15;
  return Math.round((min + max) / 2);
}

/**
 * The two landscapes (UX v1.3 R50, R66; DAY-11): the morning's (screen 8, B9)
 * and free time's (B15a). Each ticks into its own kind's template, whose
 * slots carry *usually* for the ranking screen after it.
 */
export type LandscapeKind = "morning" | "activity";

export function useLandscape(options: { withTemplate: boolean; blockKind?: LandscapeKind }) {
  const blockKind: LandscapeKind = options.blockKind ?? "morning";
  const groups: readonly (MorningGroup | ActivityGroup)[] = blockKind === "activity" ? ACTIVITY_GROUPS : MORNING_GROUPS;
  const utils = trpc.useUtils();
  const habits = trpc.habit.list.useQuery({ includeArchived: false, blockKind });
  const templates = trpc.template.list.useQuery(
    { includeArchived: false, kind: blockKind },
    { enabled: options.withTemplate },
  );
  // Never a pool: free time's pools are `activity` templates too (TD-26), and the landscape is the library behind them.
  const templateId = templates.data?.find((template) => template.structure !== "opener_pool_closer")?.id ?? null;
  const detail = trpc.template.get.useQuery(
    { id: templateId ?? "" },
    { enabled: options.withTemplate && templateId !== null },
  );
  const fromLibrary = trpc.habit.createFromStarterLibrary.useMutation();
  const createTemplate = trpc.template.create.useMutation();
  const saveSlot = trpc.template.saveSlot.useMutation();
  const removeSlot = trpc.template.removeSlot.useMutation();
  const archive = trpc.habit.archive.useMutation();

  /** Rows whose tick is ahead of the record: on (create out) or off (removal out). */
  const [pending, setPending] = React.useState<Map<string, boolean>>(new Map());
  const [locked, setLocked] = React.useState<Set<string>>(new Set());
  const [line, setLine] = React.useState<string | null>(null);
  const inFlight = React.useRef<Map<string, Promise<void>>>(new Map());

  const existing = React.useMemo(
    () => (habits.data?.habits ?? []).filter((habit) => habit.type === "habit"),
    [habits.data?.habits],
  );
  const byTitle = React.useMemo(
    () => new Map(existing.map((habit) => [habit.title.toLowerCase(), habit])),
    [existing],
  );
  const slots = React.useMemo(() => detail.data?.slots ?? [], [detail.data?.slots]);
  const slotByHabit = React.useMemo(() => new Map(slots.map((slot) => [slot.habitId, slot])), [slots]);

  // The starters, then the person's own morning habits as entries of the same shape (v1.3 R66, *Your own*):
  // a tick on one finds the habit by title and adds or removes its slot, as a starter's does.
  const entries: ReadonlyArray<StarterLibraryEntry> = React.useMemo(() => {
    const starterTitles = new Set(STARTER_LIBRARY[blockKind].map((entry) => entry.title.toLowerCase()));
    const own = existing
      .filter((habit) => !starterTitles.has(habit.title.toLowerCase()))
      .map((habit) => ({
        title: habit.title,
        icon: habit.icon as StarterLibraryEntry["icon"],
        rangeMin: habit.durationMin ?? 10,
        rangeMax: habit.durationMax ?? habit.durationMin ?? 20,
        importance: habit.lifePriority,
        recommended: false,
      }));
    return [...STARTER_LIBRARY[blockKind], ...own];
  }, [existing, blockKind]);

  const isSelected = React.useCallback(
    (title: string): boolean => {
      const ahead = pending.get(title);
      if (ahead !== undefined) return ahead;
      const habit = byTitle.get(title.toLowerCase());
      if (!habit) return false;
      // On first run the selection is the morning template's slot; in the library, the row itself.
      return options.withTemplate ? slotByHabit.has(habit.id) : true;
    },
    [pending, byTitle, options.withTemplate, slotByHabit],
  );

  const refresh = React.useCallback(async () => {
    await utils.habit.list.invalidate();
    if (options.withTemplate) {
      await utils.template.list.invalidate();
      if (templateId !== null) await utils.template.get.invalidate({ id: templateId });
    }
  }, [utils, options.withTemplate, templateId]);

  const ensureTemplate = React.useCallback(async (): Promise<string> => {
    if (templateId !== null) return templateId;
    const created = await createTemplate.mutateAsync({ kind: blockKind });
    await utils.template.list.invalidate();
    return created.id;
  }, [templateId, createTemplate, utils, blockKind]);

  const setPendingFor = (title: string, value: boolean | null) =>
    setPending((current) => {
      const next = new Map(current);
      if (value === null) next.delete(title);
      else next.set(title, value);
      return next;
    });

  const doTick = React.useCallback(
    async (entry: StarterLibraryEntry): Promise<void> => {
      // Read the record, not the render: a queued tick after an un-tick must see the archive.
      const before = await utils.habit.list.fetch({ includeArchived: false, blockKind });
      let habit: HabitSummaryView | { id: string; title: string } | undefined = before.habits.find(
        (row) => row.title.toLowerCase() === entry.title.toLowerCase(),
      );
      if (!habit) {
        const made = await fromLibrary.mutateAsync({ blockKind, titles: [entry.title] });
        habit = made.rows[0];
        if (!habit) {
          // Already there under this title (a race with a refetch) — read it back.
          const fresh = await utils.habit.list.fetch({ includeArchived: false, blockKind });
          habit = fresh.habits.find((row) => row.title.toLowerCase() === entry.title.toLowerCase());
        }
      }
      if (!habit) throw new Error("no_habit");
      if (options.withTemplate) {
        const id = await ensureTemplate();
        const current = await utils.template.get.fetch({ id });
        if (!current.slots.some((slot) => slot.habitId === habit.id)) {
          await saveSlot.mutateAsync({
            templateId: id,
            habitId: habit.id,
            durationMin: midpointOf(entry.rangeMin, entry.rangeMax),
            gapBeforeMin: 0,
            pinnedClock: null,
            role: "stack",
            priorityOverride: null,
            scheduling: "soft",
          });
        }
      }
    },
    [fromLibrary, utils, options.withTemplate, ensureTemplate, saveSlot, blockKind],
  );

  const doUntick = React.useCallback(
    async (entry: StarterLibraryEntry): Promise<void> => {
      const fresh = await utils.habit.list.fetch({ includeArchived: false, blockKind });
      const habit = fresh.habits.find((row) => row.title.toLowerCase() === entry.title.toLowerCase());
      if (!habit) return;
      if (options.withTemplate && templateId !== null) {
        const current = await utils.template.get.fetch({ id: templateId });
        for (const slot of current.slots.filter((row) => row.habitId === habit.id)) {
          await removeSlot.mutateAsync({ id: slot.id });
        }
      }
      // Archived only if it has never been used on a day; a used one is a record.
      const usage = await utils.habit.usage.fetch({ id: habit.id });
      if (usage.recentDays.length === 0) {
        await archive.mutateAsync({ id: habit.id });
      } else {
        setLocked((current) => new Set(current).add(entry.title));
      }
    },
    [utils, options.withTemplate, templateId, removeSlot, archive, blockKind],
  );

  /** The tap. The tick moves at once; the write follows, one per row, in order. */
  const toggle = React.useCallback(
    (entry: StarterLibraryEntry, on: boolean) => {
      const title = entry.title;
      setLine(null);
      setPendingFor(title, on);
      // Queue behind whatever this row already has out — never two creates.
      const previous = inFlight.current.get(title) ?? Promise.resolve();
      const run = previous
        .catch(() => undefined)
        .then(() => (on ? doTick(entry) : doUntick(entry)))
        .then(async () => {
          await refresh();
        })
        .catch(() => {
          setLine(COPY.saveError(title));
        })
        .finally(() => {
          if (inFlight.current.get(title) === run) {
            inFlight.current.delete(title);
            setPendingFor(title, null);
          }
        });
      inFlight.current.set(title, run);
    },
    [doTick, doUntick, refresh],
  );

  /** *Add your own*: the sheet made the habit; on first run it also takes a slot at its midpoint. */
  const adopt = React.useCallback(
    async (habitId: string) => {
      try {
        if (options.withTemplate) {
          const id = await ensureTemplate();
          const habit = await utils.habit.get.fetch({ id: habitId });
          await saveSlot.mutateAsync({
            templateId: id,
            habitId,
            durationMin: midpointOf(habit.durationMinMin, habit.durationMaxMin),
            gapBeforeMin: 0,
            pinnedClock: null,
            role: "stack",
            priorityOverride: null,
            scheduling: "soft",
          });
        }
      } catch {
        setLine(COPY.saveError(""));
      } finally {
        await refresh();
      }
    },
    [options.withTemplate, ensureTemplate, utils, saveSlot, refresh],
  );

  const rows: LandscapeRow[] = React.useMemo(
    () =>
      entries.map((entry) => ({
        key: entry.title,
        title: entry.title,
        icon: entry.icon,
        rangeMin: entry.rangeMin,
        rangeMax: entry.rangeMax,
        selected: isSelected(entry.title),
        committing: pending.has(entry.title),
        locked: locked.has(entry.title),
        group: groups.find((group) => group === entry.group) ?? null,
      })),
    [entries, isSelected, pending, locked, groups],
  );

  const count = options.withTemplate
    ? slots.length + [...pending.entries()].filter(([title, on]) => on && !byTitle.has(title.toLowerCase())).length
    : existing.length + [...pending.entries()].filter(([title, on]) => on && !byTitle.has(title.toLowerCase())).length;

  return {
    loading: habits.isLoading || (options.withTemplate && templates.isLoading),
    blockKind,
    /** The *All* tab's groups, in order. */
    groups,
    /** The kind's landscape template — B15b reads its slots for *usually*. */
    templateId,
    entries,
    rows,
    count,
    toggle,
    adopt,
    line,
    refresh,
  };
}

export type LandscapeApi = ReturnType<typeof useLandscape>;
