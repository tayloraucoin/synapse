import { and, asc, count, countDistinct, eq, isNull, isNotNull } from "drizzle-orm";

import {
  dayBlocks,
  dayPlans,
  habits,
  templateSlots,
  templates,
  users,
  type RlsClient,
} from "@syn/db";
import type {
  BlockFlow,
  BlockKind,
  BlockStructure,
  SlotView,
  TemplateSummaryView,
  WorkDayTypeView,
} from "@syn/types";
import type {
  RestoreSlotInput,
  TemplatePatchInput,
  WorkDayTypeFieldsInput,
} from "@syn/validators";

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
  toWorkDayTypeView,
  walkTemplate,
  type SlotRow,
  type TemplateRow,
} from "./to-view";

/**
 * The four work-day-type columns are meaningful on `kind = work` alone (UX
 * v1.2 §3.8, TD-14). The patch schema cannot know the row's kind, so this is
 * the rule's one home; the router phrases it as a `BAD_REQUEST`.
 */
export class NotWorkTemplateError extends Error {
  constructor() {
    super("not_work_template");
    this.name = "NotWorkTemplateError";
  }
}

const TEMPLATE_COLUMNS = {
  id: templates.id,
  name: templates.name,
  kind: templates.kind,
  flow: templates.flow,
  structure: templates.structure,
  anchorTime: templates.anchorTime,
  weeklyTarget: templates.weeklyTarget,
  typicalDays: templates.typicalDays,
  archivedAt: templates.archivedAt,
  workEndTime: templates.workEndTime,
  locationKind: templates.locationKind,
  anchorDirection: templates.anchorDirection,
  icon: templates.icon,
} as const;

/** Trims Postgres' `HH:mm:ss` to the `HH:mm` every clock in the API speaks. */
function toRow(row: {
  [K in keyof TemplateRow]: K extends "anchorTime" | "workEndTime" ? string | null : TemplateRow[K];
}): TemplateRow {
  return {
    ...row,
    anchorTime: row.anchorTime === null ? null : row.anchorTime.slice(0, 5),
    workEndTime: row.workEndTime === null ? null : row.workEndTime.slice(0, 5),
  };
}

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
    /** UX v1.2 §3.8 — the work-day type's four columns; null for every other kind. */
    workDayType: WorkDayTypeView | null;
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
  options: {
    includeArchived?: boolean;
    kind?: BlockKind;
    /** `name` (default — kind, then name) or `created`, oldest first: the builder's pickers (v1.3 R65). */
    order?: "name" | "created";
  } = {},
): Promise<TemplateSummaryView[]> {
  const includeArchived = options.includeArchived ?? true;
  const profile = await anchorProfileFor(rls, userId);

  return rls.execute(async (tx) => {
    const conditions = [eq(templates.userId, userId)];
    if (!includeArchived) conditions.push(isNull(templates.archivedAt));
    if (options.kind) conditions.push(eq(templates.kind, options.kind));

    const rows = (
      await tx
        .select(TEMPLATE_COLUMNS)
        .from(templates)
        .where(and(...conditions))
        .orderBy(
          ...(options.order === "created"
            ? [asc(templates.createdAt), asc(templates.id)]
            : [asc(templates.kind), asc(templates.name)]),
        )
    ).map(toRow);

    // A template is on a day through its block (TD-1): one block per day.
    const used = await tx
      .select({ templateId: dayBlocks.templateId, value: countDistinct(dayBlocks.dayId) })
      .from(dayBlocks)
      .where(and(eq(dayBlocks.userId, userId), isNotNull(dayBlocks.templateId)))
      .groupBy(dayBlocks.templateId);

    const usedByTemplate = new Map(
      used.map((row) => [row.templateId, Number(row.value)]),
    );

    const plansByTemplate = await readUsedBy(tx, userId);

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
          plansByTemplate.get(row.id) ?? [],
        ),
      );
    }
    return views;
  });
}

/**
 * Which day plans reference each template through any of their six
 * template FKs (UX v1.2 §3.13, TD-10; v1.3 adds the after-work list and the
 * free-time pool) — *used by Day A, Day B* on the block
 * editor's template list. One query over `day_plans`, grouped in code; never
 * a query per template.
 */
async function readUsedBy(
  tx: Tx,
  userId: string,
): Promise<Map<string, Array<{ id: string; name: string }>>> {
  const plans = await tx
    .select({
      id: dayPlans.id,
      name: dayPlans.name,
      prepTemplateId: dayPlans.prepTemplateId,
      morningTemplateId: dayPlans.morningTemplateId,
      windDownTemplateId: dayPlans.windDownTemplateId,
      workTemplateId: dayPlans.workTemplateId,
      afterWorkTemplateId: dayPlans.afterWorkTemplateId,
      activityTemplateId: dayPlans.activityTemplateId,
    })
    .from(dayPlans)
    .where(eq(dayPlans.userId, userId))
    .orderBy(asc(dayPlans.sortOrder), asc(dayPlans.createdAt));

  const byTemplate = new Map<string, Array<{ id: string; name: string }>>();
  for (const plan of plans) {
    const refs = new Set(
      [
        plan.prepTemplateId,
        plan.morningTemplateId,
        plan.windDownTemplateId,
        plan.workTemplateId,
        plan.afterWorkTemplateId,
        plan.activityTemplateId,
      ].filter((id): id is string => id !== null),
    );
    for (const templateId of refs) {
      const list = byTemplate.get(templateId) ?? [];
      list.push({ id: plan.id, name: plan.name });
      byTemplate.set(templateId, list);
    }
  }
  return byTemplate;
}

export async function getTemplate(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<TemplateDetail | null> {
  const profile = await anchorProfileFor(rls, userId);

  return rls.execute(async (tx) => {
    const [raw] = await tx
      .select(TEMPLATE_COLUMNS)
      .from(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, userId)))
      .limit(1);

    if (!raw) return null;
    const row = toRow(raw);

    const slotRows = await readSlotRows(tx, userId, id);
    const anchor = resolveTemplateAnchor(row.kind, row.flow, profile, row.anchorTime);
    const walk = walkTemplate(slotRows, anchor.flow, anchor.anchorMin);

    const [applied] = await tx
      .select({ value: countDistinct(dayBlocks.dayId) })
      .from(dayBlocks)
      .where(and(eq(dayBlocks.userId, userId), eq(dayBlocks.templateId, id)));

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
        workDayType: toWorkDayTypeView(row),
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
  /** UX v1.2 §3.8 — a work-day type's own hours, kind, anchor rule and glyph; work only. */
  workDayType: WorkDayTypeFieldsInput = {},
  /** RUN-12: the builder names its three lists on arrival. */
  name = "",
  /**
   * UX v1.3 R50, TD-26 (DAY-5): free time is a pool — an `activity` template
   * of structure `opener_pool_closer` whose slots are `pool` members. Every
   * other list stacks. `transition` needs nothing here: its flow is forward
   * by kind (`defaultFlowFor`).
   */
  structure: BlockStructure = "stack",
): Promise<{ id: string }> {
  if (kind !== "work" && hasWorkDayTypeFields(workDayType)) {
    throw new NotWorkTemplateError();
  }
  const profile = await anchorProfileFor(rls, userId);
  const rows = await rls.execute(async (tx) => {
    const inserted = await tx
      .insert(templates)
      .values({
        userId,
        name,
        kind,
        flow: defaultFlowFor(kind),
        structure,
        anchorTime:
          kind === "work"
            ? (workDayType.anchorTime ?? profile.workStartTime)
            : null,
        ...(kind === "work"
          ? {
              workEndTime: workDayType.workEndTime ?? null,
              locationKind: workDayType.locationKind ?? null,
              anchorDirection: workDayType.anchorDirection ?? null,
              icon: workDayType.icon ?? null,
            }
          : {}),
      })
      .returning({ id: templates.id });
    if (kind === "work") await adoptWorkDefaults(tx, userId, workDayType);
    return inserted;
  });
  const row = rows[0];
  if (!row) throw new Error("template insert returned no row");
  return row;
}

function hasWorkDayTypeFields(fields: WorkDayTypeFieldsInput): boolean {
  return (
    fields.workEndTime !== undefined ||
    fields.locationKind !== undefined ||
    fields.anchorDirection !== undefined ||
    fields.icon !== undefined
  );
}

/**
 * Screen 3's *No* path (UX v1.2 §4.3, TD-14): when the profile has no work
 * start yet, the first type's values become the defaults every other screen
 * reads. A profile that already has values is left alone — the type is its
 * own thing and never overwrites what the person set.
 */
async function adoptWorkDefaults(
  tx: Tx,
  userId: string,
  fields: WorkDayTypeFieldsInput,
): Promise<void> {
  const [current] = await tx
    .select({
      workStartTime: users.workStartTime,
      workEndTime: users.workEndTime,
      anchorDirection: users.anchorDirection,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!current || current.workStartTime !== null) return;

  const patch = {
    ...(fields.anchorTime ? { workStartTime: fields.anchorTime } : {}),
    ...(fields.workEndTime && current.workEndTime === null
      ? { workEndTime: fields.workEndTime }
      : {}),
    ...(fields.anchorDirection && current.anchorDirection === null
      ? { anchorDirection: fields.anchorDirection }
      : {}),
  };
  if (Object.keys(patch).length === 0) return;

  await tx
    .update(users)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(users.id, userId));
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
    // UX v1.2 §3.8 — the work-day type's columns; the kind rule is checked below.
    ...(input.patch.workEndTime !== undefined
      ? { workEndTime: input.patch.workEndTime }
      : {}),
    ...(input.patch.locationKind !== undefined
      ? { locationKind: input.patch.locationKind }
      : {}),
    ...(input.patch.anchorDirection !== undefined
      ? { anchorDirection: input.patch.anchorDirection }
      : {}),
    ...(input.patch.icon !== undefined ? { icon: input.patch.icon } : {}),
  };

  if (Object.keys(patch).length === 0) return { id: input.id };

  const touchesWorkColumns = hasWorkDayTypeFields(input.patch);

  return rls.execute(async (tx) => {
    if (touchesWorkColumns) {
      const [row] = await tx
        .select({ kind: templates.kind })
        .from(templates)
        .where(and(eq(templates.id, input.id), eq(templates.userId, userId)))
        .limit(1);
      if (!row) return null;
      const kindAfter = input.patch.kind ?? row.kind;
      if (kindAfter !== "work") throw new NotWorkTemplateError();
    }

    const rows = await tx
      .update(templates)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(templates.id, input.id), eq(templates.userId, userId)))
      .returning({ id: templates.id, kind: templates.kind });
    const row = rows[0];
    if (!row) return null;

    if (row.kind === "work") await adoptWorkDefaults(tx, userId, input.patch);
    return { id: row.id };
  });
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
        // UX v1.2 §3.8 — a copied work-day type keeps its hours, kind, rule and glyph.
        workEndTime: source.workEndTime,
        locationKind: source.locationKind,
        anchorDirection: source.anchorDirection,
        icon: source.icon,
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
