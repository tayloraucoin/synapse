"use client";

import * as React from "react";

import { STARTER_LIBRARY, type StarterLibraryEntry } from "@syn/constants";
import type { HabitSummaryView, IconValue } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

/**
 * The landscape's state — UX v1.1 §4.8 (DYN-11).
 *
 * SELECTION IS A SINGLE COMMIT (W4). Ticks are local; the two facts the rest
 * of the system needs — a priority and a rough length — are edited on the
 * *Selected* tab; *Continue* (or the library's *Add*) writes everything at
 * once: one `habit.create` per ticked starter with the entry's range and the
 * chosen priority (the person's edit wins over the library's number), then,
 * when a morning template exists or is made, one slot per selected habit in
 * priority order at the chosen length. A habit already in the library with
 * `block_kind = morning` is listed as selected and cannot be un-ticked here
 * (the library archives).
 *
 * NOTHING IS PRE-CHECKED. The library's habits are not "checked" — they are
 * already the person's; the starters begin unticked, every one.
 */

const DEFAULT_ICON: IconValue = { kind: "curated", value: "dot", colorKey: null };

export type LandscapeRow = {
  /** The starter's title, or the habit's id when it is already the person's. */
  key: string;
  title: string;
  rangeMin: number | null;
  rangeMax: number | null;
  priority: number;
  durationMin: number;
  /** In the library already: shown as selected, not un-tickable. */
  existing: boolean;
};

export function midpointOf(min: number | null, max: number | null): number {
  if (min === null || max === null) return 15;
  return Math.round((min + max) / 2);
}

export function useLandscape(options: { withTemplate: boolean }) {
  const utils = trpc.useUtils();
  const habits = trpc.habit.list.useQuery({ includeArchived: false, blockKind: "morning" });
  const templates = trpc.template.list.useQuery({ includeArchived: false, kind: "morning" });
  const createHabit = trpc.habit.create.useMutation();
  const createTemplate = trpc.template.create.useMutation();
  const saveSlot = trpc.template.saveSlot.useMutation();

  /** Ticked starters, by title, with their edited facts. */
  const [ticked, setTicked] = React.useState<Map<string, { priority: number; durationMin: number }>>(new Map());
  /** Edits to existing habits' length (their priority is the library's). */
  const [lengths, setLengths] = React.useState<Map<string, number>>(new Map());

  const existing = React.useMemo(
    () => (habits.data?.habits ?? []).filter((habit) => habit.type === "habit"),
    [habits.data?.habits],
  );
  const existingTitles = React.useMemo(
    () => new Set(existing.map((habit) => habit.title.toLowerCase())),
    [existing],
  );

  const entries = STARTER_LIBRARY.morning;

  const toggle = React.useCallback(
    (entry: StarterLibraryEntry, on: boolean) => {
      setTicked((current) => {
        const next = new Map(current);
        if (on) {
          next.set(entry.title, {
            priority: entry.importance,
            durationMin: midpointOf(entry.rangeMin, entry.rangeMax),
          });
        } else {
          next.delete(entry.title);
        }
        return next;
      });
    },
    [],
  );

  const setPriority = React.useCallback((title: string, priority: number) => {
    setTicked((current) => {
      const row = current.get(title);
      if (!row) return current;
      const next = new Map(current);
      next.set(title, { ...row, priority });
      return next;
    });
  }, []);

  const setLength = React.useCallback((key: string, durationMin: number, isExisting: boolean) => {
    if (isExisting) {
      setLengths((current) => new Map(current).set(key, durationMin));
      return;
    }
    setTicked((current) => {
      const row = current.get(key);
      if (!row) return current;
      const next = new Map(current);
      next.set(key, { ...row, durationMin });
      return next;
    });
  }, []);

  /** The *Selected* tab's rows: the library's morning habits, then the ticks. */
  const selected: LandscapeRow[] = React.useMemo(() => {
    const own: LandscapeRow[] = existing.map((habit: HabitSummaryView) => ({
      key: habit.id,
      title: habit.title,
      rangeMin: habit.durationMin,
      rangeMax: habit.durationMax,
      priority: habit.lifePriority,
      durationMin: lengths.get(habit.id) ?? midpointOf(habit.durationMin, habit.durationMax),
      existing: true,
    }));
    const starters: LandscapeRow[] = [...ticked.entries()].map(([title, row]) => {
      const entry = entries.find((candidate) => candidate.title === title);
      return {
        key: title,
        title,
        rangeMin: entry?.rangeMin ?? null,
        rangeMax: entry?.rangeMax ?? null,
        priority: row.priority,
        durationMin: row.durationMin,
        existing: false,
      };
    });
    return [...own, ...starters];
  }, [existing, ticked, entries, lengths]);

  const [committing, setCommitting] = React.useState(false);

  /** Everything at once: habits, then the template's slots. */
  const commit = React.useCallback(async (): Promise<{ created: number }> => {
    setCommitting(true);
    try {
      const created: Array<{ id: string; priority: number; durationMin: number }> = [];
      for (const [title, row] of ticked) {
        const entry = entries.find((candidate) => candidate.title === title);
        if (!entry) continue;
        const habit = await createHabit.mutateAsync({
          title,
          icon: DEFAULT_ICON,
          categoryId: null,
          blockKind: "morning",
          durationMinMin: entry.rangeMin,
          durationMaxMin: entry.rangeMax,
          lifePriority: row.priority,
          quantityUnit: null,
          reflectionAxes: [],
          defaultNotesPreflight: null,
        });
        created.push({ id: habit.id, priority: row.priority, durationMin: row.durationMin });
      }

      if (options.withTemplate) {
        let templateId = templates.data?.[0]?.id ?? null;
        if (templateId === null) {
          templateId = (await createTemplate.mutateAsync({ kind: "morning" })).id;
        }
        const detail = await utils.template.get.fetch({ id: templateId });
        const placed = new Set(detail.slots.map((slot) => slot.habitId));
        const wanted = [
          ...existing.map((habit) => ({
            id: habit.id,
            priority: habit.lifePriority,
            durationMin: lengths.get(habit.id) ?? midpointOf(habit.durationMin, habit.durationMax),
          })),
          ...created,
        ]
          .filter((row) => !placed.has(row.id))
          .sort((a, b) => b.priority - a.priority);
        for (const row of wanted) {
          await saveSlot.mutateAsync({
            templateId,
            habitId: row.id,
            durationMin: row.durationMin,
            gapBeforeMin: 0,
            pinnedClock: null,
            role: "stack",
            priorityOverride: null,
            scheduling: "soft",
          });
        }
      }

      setTicked(new Map());
      setLengths(new Map());
      await utils.habit.list.invalidate();
      await utils.template.list.invalidate();
      return { created: created.length };
    } finally {
      setCommitting(false);
    }
  }, [ticked, entries, createHabit, options.withTemplate, templates.data, createTemplate, utils, existing, lengths, saveSlot]);

  return {
    loading: habits.isLoading,
    entries,
    existingTitles,
    ticked,
    selected,
    count: selected.length,
    toggle,
    setPriority,
    setLength,
    commit,
    committing,
    refresh: () => utils.habit.list.invalidate(),
  };
}

export type LandscapeApi = ReturnType<typeof useLandscape>;
