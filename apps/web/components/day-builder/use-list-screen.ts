"use client";

import * as React from "react";

import type { BlockKind, SlotView, TemplateSummaryView } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { letterOf, toInputClock } from "./clock";
import { useTemplateSlots, type DayBuilderApi } from "./use-day-builder";

/**
 * A list screen's writes — 13d, 13e, 13h (UX v1.2 §4.13, §3.13; TD-10; RUN-12).
 *
 * CREATE ON ARRIVAL, ONCE. When the plan has no list of this kind, the
 * screen creates a named template — *Getting ready A*, the letter from the
 * plan's name — writes the FK on the plan at once, and seeds it (each screen
 * says how). Choosing an existing list from the picker writes the FK and
 * creates nothing; *New list* creates. A list chosen from another plan is
 * the same template, edited in place — a plan references, never copies.
 *
 * THE SLOTS ARE THE LIST: a tick appends a slot, a stepper writes its
 * minutes, a drop is `moveSlot`, *Leave out on this day* removes it. Every
 * write refreshes the template so the sticky line is the walk's own number.
 */

export type SeedSlot = {
  habitId: string;
  durationMin: number;
  priorityOverride?: number | null;
  scheduling?: "hard" | "soft";
  /** *One of two* — the slot this one alternates with (v1.1 §3.5). */
  alternatesWith?: string;
  /** UX v1.3 TD-26 (DAY-11): a pool's members are `pool` slots — offered, never scheduled. */
  role?: "stack" | "pool";
};

export function useListScreen({
  api,
  kind,
  fk,
  defaultName,
  seed,
  structure,
  metaOf,
}: {
  api: DayBuilderApi;
  /** v1.3 (DAY-10): `transition` and `activity` for DAY-11's B14 and B16 — widened once, here. */
  kind: Extract<BlockKind, "prep" | "morning" | "wind_down" | "transition" | "activity">;
  fk: ListFk;
  defaultName: (letter: string) => string;
  /** The slots a NEW list starts with; called once, after the template exists. */
  seed: () => Promise<SeedSlot[]> | SeedSlot[];
  /** UX v1.3 TD-26 (DAY-11): B16's pool is created with structure `opener_pool_closer` (DAY-6's pool shape), and only pools are offered. */
  structure?: "opener_pool_closer";
  /** The picker's detail for a list — *Evenings A · 7 to choose from*; minutes and users by default. */
  metaOf?: (template: TemplateSummaryView) => string;
}) {
  const utils = trpc.useUtils();
  const create = trpc.template.create.useMutation();
  const rename = trpc.template.update.useMutation();
  const saveSlot = trpc.template.saveSlot.useMutation();
  const moveSlot = trpc.template.moveSlot.useMutation();
  const removeSlot = trpc.template.removeSlot.useMutation();

  const plan = api.plan;
  const templateId = plan === null ? null : (readFk(plan, fk) ?? null);
  const { slots, name, missing, refresh } = useTemplateSlots(templateId);
  // A pool screen offers pools only — free time's landscape template is an `activity` template too.
  const others = React.useMemo(
    () => api.byKind(kind).filter((template) => structure === undefined || template.structure === structure),
    [api, kind, structure],
  );
  const [busy, setBusy] = React.useState(false);
  const creating = React.useRef<string | null>(null);

  const seedInto = React.useCallback(
    async (id: string) => {
      const rows = await seed();
      for (const row of rows) {
        await saveSlot.mutateAsync({
          templateId: id,
          habitId: row.habitId,
          durationMin: row.durationMin,
          gapBeforeMin: 0,
          pinnedClock: null,
          role: row.role ?? "stack",
          priorityOverride: row.priorityOverride ?? null,
          scheduling: row.scheduling ?? "soft",
        });
      }
    },
    [seed, saveSlot],
  );

  const createNew = React.useCallback(async () => {
    if (plan === null) return;
    const key = `${plan.id}:${fk}`;
    if (creating.current === key) return;
    creating.current = key;
    setBusy(true);
    try {
      const made = await create.mutateAsync({ kind, name: defaultName(letterOf(plan.name)), ...(structure === undefined ? {} : { structure }) });
      await seedInto(made.id);
      await api.patch({ [fk]: made.id } as Record<typeof fk, string>);
      await api.refreshTemplates();
      await utils.template.get.invalidate({ id: made.id });
    } finally {
      setBusy(false);
      creating.current = null;
    }
  }, [plan, fk, create, kind, defaultName, seedInto, api, utils, structure]);

  // Arrival with no list: make one, once per plan.
  React.useEffect(() => {
    if (plan === null || templateId !== null || busy) return;
    void createNew();
  }, [plan, templateId, busy, createNew]);

  const choose = React.useCallback(
    async (id: string) => {
      await api.patch({ [fk]: id } as Record<typeof fk, string>);
    },
    [api, fk],
  );

  const setName = React.useCallback(
    async (next: string) => {
      if (templateId === null || next.trim() === "") return;
      await rename.mutateAsync({ id: templateId, patch: { name: next.trim() } });
      await refresh();
      await api.refreshTemplates();
    },
    [templateId, rename, refresh, api],
  );

  const addSlot = React.useCallback(
    async (row: SeedSlot) => {
      if (templateId === null) return;
      await saveSlot.mutateAsync({
        templateId,
        habitId: row.habitId,
        durationMin: row.durationMin,
        gapBeforeMin: 0,
        pinnedClock: null,
        role: row.role ?? "stack",
        priorityOverride: row.priorityOverride ?? null,
        scheduling: row.scheduling ?? "soft",
        ...(row.alternatesWith === undefined ? {} : { alternatesWith: row.alternatesWith, alternatesDefault: false }),
      });
      await refresh();
    },
    [templateId, saveSlot, refresh],
  );

  /** The slot again with one thing changed — the rest as it is. */
  const rewrite = React.useCallback(
    async (slot: SlotView, change: { durationMin?: number; pinnedClock?: string | null }) => {
      if (templateId === null) return;
      const pinnedClock = change.pinnedClock === undefined ? toInputClock(slot.pinnedClock) : change.pinnedClock;
      await saveSlot.mutateAsync({
        templateId,
        slotId: slot.id,
        habitId: slot.habitId,
        durationMin: change.durationMin ?? slot.durationMin,
        gapBeforeMin: pinnedClock === null ? slot.gapBeforeMin : 0,
        pinnedClock,
        role: slot.role,
        priorityOverride: slot.overridden ? slot.priority : null,
        scheduling: slot.scheduling,
      });
      await refresh();
    },
    [templateId, saveSlot, refresh],
  );

  const setMinutes = React.useCallback(
    (slot: SlotView, durationMin: number) => rewrite(slot, { durationMin }),
    [rewrite],
  );

  /** 13h: a habit after *Phone away* is pinned there (v1.1 §7.1); null puts it back on the walk. */
  const setPinned = React.useCallback(
    (slot: SlotView, pinnedClock: string | null) => rewrite(slot, { pinnedClock }),
    [rewrite],
  );

  const remove = React.useCallback(
    async (slot: SlotView) => {
      await removeSlot.mutateAsync({ id: slot.id });
      await refresh();
    },
    [removeSlot, refresh],
  );

  const reorder = React.useCallback(
    async (fromIds: string[], toIds: string[]) => {
      const moved = toIds.find((id, index) => fromIds[index] !== id);
      if (moved === undefined) return;
      const from = fromIds.indexOf(moved);
      const to = toIds.indexOf(moved);
      if (from === -1 || to === -1 || from === to) return;
      try {
        await moveSlot.mutateAsync({ id: moved, direction: to < from ? "up" : "down", steps: Math.abs(to - from) });
      } finally {
        await refresh();
      }
    },
    [moveSlot, refresh],
  );

  /** *Getting ready A · 45 min* rows for the picker, with who uses each. */
  const pickerItems = React.useMemo(
    () =>
      others.map((template: TemplateSummaryView) => ({
        id: template.id,
        title: template.name,
        meta:
          metaOf?.(template) ??
          `${template.totalMin} min${template.usedBy.length === 0 ? "" : ` · ${template.usedBy.map((plan) => plan.name).join(", ")}`}`,
      })),
    [others, metaOf],
  );

  return {
    templateId,
    slots,
    name,
    missing,
    busy,
    others,
    pickerItems,
    choose,
    createNew,
    setName,
    addSlot,
    setMinutes,
    setPinned,
    remove,
    reorder,
    refresh,
  };
}

type ListFk = "prepTemplateId" | "morningTemplateId" | "windDownTemplateId" | "afterWorkTemplateId" | "activityTemplateId";

function readFk(plan: DayBuilderApi["plan"] & object, fk: ListFk): string | null {
  switch (fk) {
    case "prepTemplateId":
      return plan.gettingReady?.templateId ?? null;
    case "morningTemplateId":
      return plan.morning?.templateId ?? null;
    case "windDownTemplateId":
      return plan.windDown?.templateId ?? null;
    case "afterWorkTemplateId":
      return plan.afterWork?.templateId ?? null;
    case "activityTemplateId":
      return plan.evenings?.templateId ?? null;
  }
}
