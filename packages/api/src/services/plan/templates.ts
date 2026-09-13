import { and, asc, count, eq, isNull, isNotNull } from "drizzle-orm";

import {
  days,
  habits,
  templateSlots,
  templates,
  type RlsClient,
} from "@syn/db";
import type {
  BlockFlow,
  BlockKind,
  BlockStructure,
  SlotView,
  TemplateSummaryView,
} from "@syn/types";
import type { RestoreSlotInput, TemplatePatchInput } from "@syn/validators";

import { readPreferences } from "../user/preferences";
import {
  defaultFlowFor,
  resolveTemplateAnchor,
  type AnchorProfile,
} from "./anchors";
import { densifyPositions, findCollisions } from "./save-slot";
import {
  compareSlots,
  toSlotViews,
  toTemplateSummaryView,
  walkTemplate,
  type SlotRow,
} from "./to-view";

/**
 * Block templates: list, read, create, patch, archive, restore, duplicate, and
 * the slot operations that are not `saveSlot` (UX v1.1 §3.11, §11.4, §11.5).
 *
 * A TEMPLATE IS ALWAYS EDITABLE (cross-cutting §8.1) — there is no locked
 * state, and days already applied are reconciled by the materialiser rather
 * than by refusing the edit.
 *
 * THE CLOCKS ARE DERIVED. `getTemplate` walks the slots once with `stackBlock`
 * from the anchor the profile supplies for the kind (`anchors.ts`) and hands
 * the editor `startClock`s; nothing is stored. A placeable kind (training,
 * break) has no anchor at planning time and no clocks.
 */

export type TemplateDetail = {
  template: {
    id: string;
    name: string;
    kind: BlockKind;
    flow: BlockFlow;
    structure: BlockStructure;
    /** The one override (v1.1 R5); null for every kind but work, usually. */
    anchorTime: string | null;
    /** "7:00" — where the walk started, or null for a placeable kind. */
    anchorClock: string | null;
    weeklyTarget: number | null;
    typicalDays: number[];
    archived: boolean;
  };
  slots: SlotView[];
  /** The walk's arithmetic, for the sticky footer (v1.1 §3.11). */
  footer: { totalMin: number; startClock: string | null; endClock: string | null };
  /** Slots sharing a position without a group — the editor's inline question. */
  collisions: Array<[string, string]>;
  /** Days this template is on, current and future (TP-04). */
  appliedDays: number;
};

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

async function readSlotRows(
  tx: Tx,
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
      gapBeforeMin: templateSlots.gapBeforeMin,
      pinnedAt: templateSlots.pinnedAt,
      role: templateSlots.role,
      priorityOverride: templateSlots.priorityOverride,
      scheduling: templateSlots.scheduling,
      multitaskGroup: templateSlots.multitaskGroup,
      alternatesGroup: templateSlots.alternatesGroup,
      alternatesDefault: templateSlots.alternatesDefault,
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
    )
    .orderBy(asc(templateSlots.sortOrder), asc(templateSlots.createdAt));

  return rows.sort(compareSlots);
}

async function anchorProfileFor(
  rls: RlsClient,
  userId: string,
): Promise<AnchorProfile> {
  const prefs = await readPreferences(rls, userId);
  return {
    usualWakeTime: prefs?.usualWakeTime ?? "07:00",
    workStartTime: prefs?.workStartTime ?? null,
    workEndTime: prefs?.workEndTime ?? null,
    lightsOutTime: prefs?.lightsOutTime ?? null,
  };
}

function clock(min: number | null): string | null {
  if (min === null) return null;
  const hour = Math.floor(min / 60) % 24;
  const minute = ((min % 60) + 60) % 60;
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

export async function listTemplates(
  rls: RlsClient,
  userId: string,
  options: { includeArchived?: boolean; kind?: BlockKind } = {},
): Promise<TemplateSummaryView[]> {
  const includeArchived = options.includeArchived ?? true;
  const profile = await anchorProfileFor(rls, userId);

  return rls.execute(async (tx) => {
    const conditions = [eq(templates.userId, userId)];
    if (!includeArchived) conditions.push(isNull(templates.archivedAt));
    if (options.kind) conditions.push(eq(templates.kind, options.kind));

    const rows = await tx
      .select({
        id: templates.id,
        name: templates.name,
        kind: templates.kind,
        flow: templates.flow,
        structure: templates.structure,
        anchorTime: templates.anchorTime,
        weeklyTarget: templates.weeklyTarget,
        typicalDays: templates.typicalDays,
        archivedAt: templates.archivedAt,
      })
      .from(templates)
      .where(and(...conditions))
      .orderBy(asc(templates.kind), asc(templates.name));

    // Zero until days carry blocks (DYN-5); the query is here so nothing
    // changes then. `days.template_id` is deprecated but still the v1.0 link.
    const used = await tx
      .select({ templateId: days.templateId, value: count() })
      .from(days)
      .where(and(eq(days.userId, userId), isNotNull(days.templateId)))
      .groupBy(days.templateId);

    const usedByTemplate = new Map(
      used.map((row) => [row.templateId, Number(row.value)]),
    );

    const views: TemplateSummaryView[] = [];
    for (const row of rows) {
      const slotRows = await readSlotRows(tx, userId, row.id);
      const anchor = resolveTemplateAnchor(row.kind, row.flow, profile, row.anchorTime);
      const walk = walkTemplate(slotRows, anchor.flow, anchor.anchorMin);
      views.push(
        toTemplateSummaryView(
          row,
          slotRows.length,
          walk.totalMin,
          usedByTemplate.get(row.id) ?? 0,
        ),
      );
    }
    return views;
  });
}

export async function getTemplate(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<TemplateDetail | null> {
  const profile = await anchorProfileFor(rls, userId);

  return rls.execute(async (tx) => {
    const [row] = await tx
      .select({
        id: templates.id,
        name: templates.name,
        kind: templates.kind,
        flow: templates.flow,
        structure: templates.structure,
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
    const anchor = resolveTemplateAnchor(row.kind, row.flow, profile, row.anchorTime);
    const walk = walkTemplate(slotRows, anchor.flow, anchor.anchorMin);

    const [applied] = await tx
      .select({ value: count() })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.templateId, id)));

    const hasClocks = anchor.anchorMin !== null && slotRows.length > 0;

    return {
      template: {
        id: row.id,
        name: row.name,
        kind: row.kind,
        flow: row.flow,
        structure: row.structure,
        anchorTime: row.anchorTime,
        anchorClock: clock(anchor.anchorMin),
        weeklyTarget: row.weeklyTarget,
        typicalDays: row.typicalDays ?? [],
        archived: row.archivedAt !== null,
      },
      slots: toSlotViews(slotRows, walk),
      footer: {
        totalMin: walk.totalMin,
        startClock: hasClocks ? clock(walk.startMin) : null,
        endClock: hasClocks ? clock(walk.endMin) : null,
      },
      collisions: findCollisions(slotRows),
      appliedDays: Number(applied?.value ?? 0),
    };
  });
}

/**
 * Create mode makes the row on open: a slot needs a template id to hang off.
 * `flow` follows the kind; `anchor_time` is null except for a work template,
 * which starts from the profile's work start until the person overrides it
 * (v1.1 R5).
 */
export async function createTemplate(
  rls: RlsClient,
  userId: string,
  kind: BlockKind,
): Promise<{ id: string }> {
  const profile = await anchorProfileFor(rls, userId);
  const rows = await rls.execute((tx) =>
    tx
      .insert(templates)
      .values({
        userId,
        name: "",
        kind,
        flow: defaultFlowFor(kind),
        structure: "stack",
        anchorTime: kind === "work" ? profile.workStartTime : null,
      })
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
    ...(input.patch.kind !== undefined ? { kind: input.patch.kind } : {}),
    ...(input.patch.flow !== undefined ? { flow: input.patch.flow } : {}),
    ...(input.patch.structure !== undefined
      ? { structure: input.patch.structure }
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
 * Delete a template nobody has put anything in.
 *
 * TWO CALLERS MEAN TWO DIFFERENT THINGS BY "EMPTY", so the rule is a
 * parameter rather than an assumption:
 *
 * - **The editor** (`requireUnnamed: true`) writes the row on open so slots
 *   have somewhere to go, so backing straight out would leave a nameless empty
 *   row in the list forever. A NAMED one is kept even with no slots: naming it
 *   was the person saying they meant it.
 * - **First run** (`requireUnnamed: false`) prefills the name itself, so
 *   nobody typed it. Keeping a slotless prefilled template after *Skip for
 *   now* would put a template in the list that the person explicitly declined
 *   to build.
 *
 * Either way a template WITH SLOTS survives: that is work, and this function
 * never deletes work.
 */
export async function discardIfEmpty(
  rls: RlsClient,
  userId: string,
  id: string,
  options: { requireUnnamed?: boolean } = {},
): Promise<{ discarded: boolean }> {
  const requireUnnamed = options.requireUnnamed ?? true;

  return rls.execute(async (tx) => {
    const [row] = await tx
      .select({ name: templates.name })
      .from(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, userId)))
      .limit(1);

    if (!row) return { discarded: false };
    if (requireUnnamed && row.name.trim() !== "") return { discarded: false };

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

/**
 * A copy is the same block with fresh group ids (a bracket or a one-of group
 * shared across templates would let a later regroup reach into both) and the
 * same positions, so the position rule holds by construction.
 */
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
        kind: source.kind,
        flow: source.flow,
        structure: source.structure,
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
      const remapped = new Map<string, string>();
      const remappedAlternates = new Map<string, string>();
      for (const slot of slots) {
        if (slot.multitaskGroup !== null && !remapped.has(slot.multitaskGroup)) {
          remapped.set(slot.multitaskGroup, crypto.randomUUID().slice(0, 8));
        }
        if (
          slot.alternatesGroup !== null &&
          !remappedAlternates.has(slot.alternatesGroup)
        ) {
          remappedAlternates.set(
            slot.alternatesGroup,
            crypto.randomUUID().slice(0, 8),
          );
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
          gapBeforeMin: slot.gapBeforeMin,
          pinnedAt: slot.pinnedAt,
          role: slot.role,
          alternatesGroup:
            slot.alternatesGroup === null
              ? null
              : (remappedAlternates.get(slot.alternatesGroup) ?? null),
          alternatesDefault: slot.alternatesDefault,
        })),
      );
    }

    return copy;
  });
}

/**
 * Returns the removed slot so the undo toast can put it back exactly — the
 * stacked shape included. Removing the last-but-one member of a one-of group
 * dissolves the group: the survivor is just a slot again.
 */
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

    if (row.alternatesGroup !== null) {
      const survivors = await tx
        .select({ id: templateSlots.id })
        .from(templateSlots)
        .where(
          and(
            eq(templateSlots.templateId, row.templateId),
            eq(templateSlots.alternatesGroup, row.alternatesGroup),
          ),
        );
      if (survivors.length === 1) {
        await tx
          .update(templateSlots)
          .set({ alternatesGroup: null, alternatesDefault: false, updatedAt: new Date() })
          .where(eq(templateSlots.id, survivors[0]!.id));
      } else if (survivors.length > 1 && row.alternatesDefault) {
        // The default left; the first survivor by creation takes it.
        const [first] = await tx
          .select({ id: templateSlots.id })
          .from(templateSlots)
          .where(
            and(
              eq(templateSlots.templateId, row.templateId),
              eq(templateSlots.alternatesGroup, row.alternatesGroup),
            ),
          )
          .orderBy(asc(templateSlots.createdAt))
          .limit(1);
        if (first) {
          await tx
            .update(templateSlots)
            .set({ alternatesDefault: true, updatedAt: new Date() })
            .where(eq(templateSlots.id, first.id));
        }
      }
    }

    await densifyPositions(tx, userId, row.templateId);

    return {
      templateId: row.templateId,
      habitId: row.habitId,
      timeMode: row.timeMode,
      durationMin: row.durationMin,
      gapBeforeMin: row.gapBeforeMin,
      pinnedAt: row.pinnedAt === null ? null : row.pinnedAt.slice(0, 5),
      role: row.role,
      priorityOverride: row.priorityOverride,
      scheduling: row.scheduling,
      multitaskGroup: row.multitaskGroup,
      alternatesGroup: row.alternatesGroup,
      alternatesDefault: row.alternatesDefault,
      sortOrder: row.sortOrder,
    };
  });
}

/**
 * Put a removed slot back at the position it had. If a loose slot has since
 * taken that number, the two get consecutive positions after re-densifying —
 * the restored one first, because it was there first is not knowable, so
 * creation order decides. A restored one-of member rejoins its group and the
 * group re-syncs from the survivor (the survivor is the source of truth for
 * the structure it kept).
 */
export async function restoreSlot(
  rls: RlsClient,
  userId: string,
  payload: RestoreSlotInput,
): Promise<{ id: string } | null> {
  return rls.execute(async (tx) => {
    let alternatesDefault = payload.alternatesDefault;
    if (payload.alternatesGroup !== null) {
      const [survivor] = await tx
        .select({ id: templateSlots.id, isDefault: templateSlots.alternatesDefault })
        .from(templateSlots)
        .where(
          and(
            eq(templateSlots.templateId, payload.templateId),
            eq(templateSlots.alternatesGroup, payload.alternatesGroup),
          ),
        )
        .limit(1);
      // The survivor kept (or was given) the default; the returner yields.
      if (survivor?.isDefault) alternatesDefault = false;
    }

    const rows = await tx
      .insert(templateSlots)
      .values({
        userId,
        templateId: payload.templateId,
        habitId: payload.habitId,
        timeMode: payload.timeMode,
        durationMin: payload.durationMin,
        gapBeforeMin: payload.pinnedAt === null ? payload.gapBeforeMin : 0,
        pinnedAt: payload.pinnedAt,
        role: payload.role,
        priorityOverride: payload.priorityOverride,
        scheduling: payload.scheduling,
        multitaskGroup: payload.multitaskGroup,
        alternatesGroup: payload.alternatesGroup,
        alternatesDefault,
        sortOrder: payload.sortOrder,
      })
      .returning({ id: templateSlots.id });

    const row = rows[0];
    if (!row) return null;

    await densifyPositions(tx, userId, payload.templateId);
    return row;
  });
}

/**
 * Move a position up or down the stack (v1.1 §3.11's *Move up · Move down*).
 * A bracket or a one-of group moves as one. Swapping past a pin moves the
 * pin's INDEX, never its time — the walk places a pin by its clock regardless,
 * so the moved slot simply lands on the other side of it.
 *
 * `steps` (DYN-9): a drag to a position is the same adjacent swap repeated
 * in one transaction; it stops at the edge of the stack and reports whether
 * anything moved.
 */
export async function moveSlot(
  rls: RlsClient,
  userId: string,
  id: string,
  direction: "up" | "down",
  steps = 1,
): Promise<boolean> {
  return rls.execute(async (tx) => {
    let moved = false;
    for (let step = 0; step < steps; step += 1) {
      const [slot] = await tx
        .select({
          id: templateSlots.id,
          templateId: templateSlots.templateId,
          sortOrder: templateSlots.sortOrder,
        })
        .from(templateSlots)
        .where(and(eq(templateSlots.id, id), eq(templateSlots.userId, userId)))
        .limit(1);

      if (!slot) return moved;

      const target = direction === "up" ? slot.sortOrder - 1 : slot.sortOrder + 1;
      if (target < 0) return moved;

      const movers = await tx
        .select({ id: templateSlots.id })
        .from(templateSlots)
        .where(
          and(
            eq(templateSlots.templateId, slot.templateId),
            eq(templateSlots.sortOrder, slot.sortOrder),
          ),
        );
      const displaced = await tx
        .select({ id: templateSlots.id })
        .from(templateSlots)
        .where(
          and(
            eq(templateSlots.templateId, slot.templateId),
            eq(templateSlots.sortOrder, target),
          ),
        );
      if (displaced.length === 0) return moved;

      for (const row of movers) {
        await tx
          .update(templateSlots)
          .set({ sortOrder: target, updatedAt: new Date() })
          .where(eq(templateSlots.id, row.id));
      }
      for (const row of displaced) {
        await tx
          .update(templateSlots)
          .set({ sortOrder: slot.sortOrder, updatedAt: new Date() })
          .where(eq(templateSlots.id, row.id));
      }
      moved = true;
    }

    return moved;
  });
}
