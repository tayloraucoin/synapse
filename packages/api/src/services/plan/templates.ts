import { and, asc, count, eq, isNull, isNotNull, sql } from "drizzle-orm";

import {
  days,
  habits,
  templateSlots,
  templates,
  type RlsClient,
} from "@syn/db";
import type { SlotView, TemplateSummaryView } from "@syn/types";
import type { RestoreSlotInput, TemplatePatchInput } from "@syn/validators";

import { findCollisions } from "./save-slot";
import {
  compareSlots,
  toSlotViews,
  toTemplateSummaryView,
  type SlotRow,
} from "./to-view";

/**
 * Templates: list, read, patch, archive, restore, duplicate, and the slot
 * operations that are not `saveSlot`.
 *
 * A TEMPLATE IS ALWAYS EDITABLE (cross-cutting §8.1) — there is no locked
 * state, and days already applied are reconciled by TP-04 (SET-6) rather than
 * by refusing the edit.
 */

export type TemplateDetail = {
  template: {
    id: string;
    name: string;
    anchorTime: string;
    weeklyTarget: number | null;
    typicalDays: number[];
    archived: boolean;
  };
  slots: SlotView[];
  /** Ungrouped fixed slots sharing a start — the editor's inline question. */
  collisions: Array<[string, string]>;
  /** Zero until SET-6 creates days. */
  appliedDays: number;
};

async function readSlotRows(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  templateId: string,
): Promise<SlotRow[]> {
  const rows = await tx
    .select({
      id: templateSlots.id,
      habitId: templateSlots.habitId,
      timeMode: templateSlots.timeMode,
      offsetStartMin: templateSlots.offsetStartMin,
      offsetEndMin: templateSlots.offsetEndMin,
      durationMin: templateSlots.durationMin,
      priorityOverride: templateSlots.priorityOverride,
      scheduling: templateSlots.scheduling,
      multitaskGroup: templateSlots.multitaskGroup,
      sortOrder: templateSlots.sortOrder,
      habitTitle: habits.title,
      habitIcon: habits.icon,
      habitLifePriority: habits.lifePriority,
    })
    .from(templateSlots)
    .innerJoin(habits, eq(habits.id, templateSlots.habitId))
    .where(
      and(
        eq(templateSlots.templateId, templateId),
        eq(templateSlots.userId, userId),
      ),
    );

  return rows.sort(compareSlots);
}

export async function listTemplates(
  rls: RlsClient,
  userId: string,
  includeArchived = true,
): Promise<TemplateSummaryView[]> {
  return rls.execute(async (tx) => {
    const rows = await tx
      .select({
        id: templates.id,
        name: templates.name,
        anchorTime: templates.anchorTime,
        weeklyTarget: templates.weeklyTarget,
        typicalDays: templates.typicalDays,
        archivedAt: templates.archivedAt,
      })
      .from(templates)
      .where(
        includeArchived
          ? eq(templates.userId, userId)
          : and(eq(templates.userId, userId), isNull(templates.archivedAt)),
      )
      .orderBy(asc(templates.name));

    const totals = await tx
      .select({
        templateId: templateSlots.templateId,
        itemCount: count(),
        totalMin: sql<number>`COALESCE(SUM(${templateSlots.durationMin}), 0)`,
      })
      .from(templateSlots)
      .where(eq(templateSlots.userId, userId))
      .groupBy(templateSlots.templateId);

    const byTemplate = new Map(
      totals.map((row) => [
        row.templateId,
        { itemCount: Number(row.itemCount), totalMin: Number(row.totalMin) },
      ]),
    );

    // Zero until SET-6 writes days; the query is here so nothing changes then.
    const used = await tx
      .select({ templateId: days.templateId, value: count() })
      .from(days)
      .where(and(eq(days.userId, userId), isNotNull(days.templateId)))
      .groupBy(days.templateId);

    const usedByTemplate = new Map(
      used.map((row) => [row.templateId, Number(row.value)]),
    );

    return rows.map((row) => {
      const totalsFor = byTemplate.get(row.id);
      return toTemplateSummaryView(
        row,
        totalsFor?.itemCount ?? 0,
        totalsFor?.totalMin ?? 0,
        usedByTemplate.get(row.id) ?? 0,
      );
    });
  });
}

export async function getTemplate(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<TemplateDetail | null> {
  return rls.execute(async (tx) => {
    const [row] = await tx
      .select({
        id: templates.id,
        name: templates.name,
        anchorTime: templates.anchorTime,
        weeklyTarget: templates.weeklyTarget,
        typicalDays: templates.typicalDays,
        archivedAt: templates.archivedAt,
      })
      .from(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, userId)))
      .limit(1);

    if (!row) return null;

    const slotRows = await readSlotRows(tx, userId, id);

    const [applied] = await tx
      .select({ value: count() })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.templateId, id)));

    return {
      template: {
        id: row.id,
        name: row.name,
        anchorTime: row.anchorTime,
        weeklyTarget: row.weeklyTarget,
        typicalDays: row.typicalDays ?? [],
        archived: row.archivedAt !== null,
      },
      slots: toSlotViews(slotRows, row.anchorTime),
      collisions: findCollisions(slotRows),
      appliedDays: Number(applied?.value ?? 0),
    };
  });
}

/** Create mode makes the row on open: a slot needs a template id to hang off. */
export async function createTemplate(
  rls: RlsClient,
  userId: string,
  anchorTime: string,
): Promise<{ id: string }> {
  const rows = await rls.execute((tx) =>
    tx
      .insert(templates)
      .values({ userId, name: "", anchorTime })
      .returning({ id: templates.id }),
  );
  const row = rows[0];
  if (!row) throw new Error("template insert returned no row");
  return row;
}

export async function updateTemplate(
  rls: RlsClient,
  userId: string,
  input: TemplatePatchInput,
): Promise<{ id: string } | null> {
  const patch = {
    ...(input.patch.name !== undefined ? { name: input.patch.name } : {}),
    ...(input.patch.anchorTime !== undefined
      ? { anchorTime: input.patch.anchorTime }
      : {}),
    ...(input.patch.weeklyTarget !== undefined
      ? { weeklyTarget: input.patch.weeklyTarget }
      : {}),
    ...(input.patch.typicalDays !== undefined
      ? { typicalDays: input.patch.typicalDays }
      : {}),
  };

  if (Object.keys(patch).length === 0) return { id: input.id };

  const rows = await rls.execute((tx) =>
    tx
      .update(templates)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(templates.id, input.id), eq(templates.userId, userId)))
      .returning({ id: templates.id }),
  );
  return rows[0] ?? null;
}

/**
 * A draft nobody named and nothing was put in is not a template.
 *
 * Create mode writes the row on open so slots have somewhere to go, which
 * means backing straight out would otherwise leave a nameless empty row in the
 * list forever. One with slots is kept — the person did work.
 */
export async function discardIfEmpty(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<{ discarded: boolean }> {
  return rls.execute(async (tx) => {
    const [row] = await tx
      .select({ name: templates.name })
      .from(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, userId)))
      .limit(1);

    if (!row || row.name.trim() !== "") return { discarded: false };

    const [slots] = await tx
      .select({ value: count() })
      .from(templateSlots)
      .where(eq(templateSlots.templateId, id));

    if (Number(slots?.value ?? 0) > 0) return { discarded: false };

    await tx
      .delete(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, userId)));

    return { discarded: true };
  });
}

export async function archiveTemplate(
  rls: RlsClient,
  userId: string,
  id: string,
  archived: boolean,
): Promise<boolean> {
  const rows = await rls.execute((tx) =>
    tx
      .update(templates)
      .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
      .where(and(eq(templates.id, id), eq(templates.userId, userId)))
      .returning({ id: templates.id }),
  );
  return rows.length > 0;
}

/**
 * "{name} B" when the name ends in a single letter A–Y after a space, else
 * "{name} copy" (Epic 1 TP-01).
 *
 * Z is excluded deliberately: the next letter after Z is not a letter, and
 * "Morning [" would be worse than "Morning Z copy".
 */
export function duplicateName(name: string): string {
  const match = /^(.*) ([A-Y])$/.exec(name.trim());
  if (match) {
    const [, stem, letter] = match;
    const next = String.fromCharCode((letter as string).charCodeAt(0) + 1);
    return `${stem} ${next}`;
  }
  return `${name} copy`;
}

export async function duplicateTemplate(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<{ id: string } | null> {
  return rls.execute(async (tx) => {
    const [source] = await tx
      .select()
      .from(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, userId)))
      .limit(1);

    if (!source) return null;

    const [copy] = await tx
      .insert(templates)
      .values({
        userId,
        name: duplicateName(source.name),
        anchorTime: source.anchorTime,
        weeklyTarget: source.weeklyTarget,
        typicalDays: source.typicalDays,
      })
      .returning({ id: templates.id });

    if (!copy) return null;

    const slots = await tx
      .select()
      .from(templateSlots)
      .where(
        and(
          eq(templateSlots.templateId, id),
          eq(templateSlots.userId, userId),
        ),
      );

    if (slots.length > 0) {
      // Groups are re-keyed so the copy's brackets are its own; sharing a group
      // id across templates would make a later regroup reach into both.
      const remapped = new Map<string, string>();
      for (const slot of slots) {
        if (slot.multitaskGroup === null) continue;
        if (!remapped.has(slot.multitaskGroup)) {
          remapped.set(slot.multitaskGroup, crypto.randomUUID().slice(0, 8));
        }
      }

      await tx.insert(templateSlots).values(
        slots.map((slot) => ({
          userId,
          templateId: copy.id,
          habitId: slot.habitId,
          timeMode: slot.timeMode,
          offsetStartMin: slot.offsetStartMin,
          offsetEndMin: slot.offsetEndMin,
          durationMin: slot.durationMin,
          priorityOverride: slot.priorityOverride,
          scheduling: slot.scheduling,
          multitaskGroup:
            slot.multitaskGroup === null
              ? null
              : (remapped.get(slot.multitaskGroup) ?? null),
          sortOrder: slot.sortOrder,
        })),
      );
    }

    return copy;
  });
}

/** Returns the removed slot so the undo toast can put it back exactly. */
export async function removeSlot(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<RestoreSlotInput | null> {
  return rls.execute(async (tx) => {
    const rows = await tx
      .delete(templateSlots)
      .where(and(eq(templateSlots.id, id), eq(templateSlots.userId, userId)))
      .returning();

    const row = rows[0];
    if (!row) return null;

    return {
      templateId: row.templateId,
      habitId: row.habitId,
      timeMode: row.timeMode,
      offsetStartMin: row.offsetStartMin,
      offsetEndMin: row.offsetEndMin,
      durationMin: row.durationMin,
      priorityOverride: row.priorityOverride,
      scheduling: row.scheduling,
      multitaskGroup: row.multitaskGroup,
      sortOrder: row.sortOrder,
    };
  });
}

export async function restoreSlot(
  rls: RlsClient,
  userId: string,
  payload: RestoreSlotInput,
): Promise<{ id: string } | null> {
  const rows = await rls.execute((tx) =>
    tx
      .insert(templateSlots)
      .values({ ...payload, userId })
      .returning({ id: templateSlots.id }),
  );
  return rows[0] ?? null;
}

/**
 * Reorder within a bracket, and only there — Epic 1 TP-02: "only within a
 * shared start; otherwise order is time order". Two items at 7:00 have an
 * order the person chose; two items at 7:00 and 7:20 have one the clock chose.
 */
export async function moveSlot(
  rls: RlsClient,
  userId: string,
  id: string,
  direction: "up" | "down",
): Promise<boolean> {
  return rls.execute(async (tx) => {
    const [slot] = await tx
      .select({
        id: templateSlots.id,
        multitaskGroup: templateSlots.multitaskGroup,
        sortOrder: templateSlots.sortOrder,
      })
      .from(templateSlots)
      .where(and(eq(templateSlots.id, id), eq(templateSlots.userId, userId)))
      .limit(1);

    if (!slot || slot.multitaskGroup === null) return false;

    const siblings = await tx
      .select({ id: templateSlots.id, sortOrder: templateSlots.sortOrder })
      .from(templateSlots)
      .where(
        and(
          eq(templateSlots.multitaskGroup, slot.multitaskGroup),
          eq(templateSlots.userId, userId),
        ),
      )
      .orderBy(asc(templateSlots.sortOrder));

    const index = siblings.findIndex((row) => row.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    const partner = siblings[swapWith];
    if (index === -1 || !partner) return false;

    const self = siblings[index];
    if (!self) return false;

    await tx
      .update(templateSlots)
      .set({ sortOrder: partner.sortOrder, updatedAt: new Date() })
      .where(eq(templateSlots.id, self.id));
    await tx
      .update(templateSlots)
      .set({ sortOrder: self.sortOrder, updatedAt: new Date() })
      .where(eq(templateSlots.id, partner.id));

    return true;
  });
}
