import { and, asc, eq, ne } from "drizzle-orm";

import { habits, templateSlots, templates, type RlsClient } from "@syn/db";
import type { SlotFormInput } from "@syn/validators";

/**
 * Saving one slot, and THE invariant — UX v1.1 §3.5, §11.5 (DYN-4).
 *
 * TWO SLOTS AT ONE POSITION MUST SHARE A GROUP. A POSITION is a place in the
 * stack (`sort_order`) or, for pins, a clock time (`pinned_at`). Two slots at
 * one position mean one of two things, and the person has to say which:
 * *Yes, multitask* (both happen — `multitask_group`, v1 §5.5) or *No, one or
 * the other* (`alternates_group`, v1.1 §3.5). A slot is never in both.
 * Otherwise the save is refused with `SamePositionError` carrying the occupant
 * and the position, so the sheet can ask the person's own question rather
 * than show an error code.
 *
 * ENFORCED HERE, IN THE SERVICE, ON EVERY WRITE — add, edit, duplicate,
 * restore-after-undo, move — for the reason the v1.0 rule was: a rule that
 * lives in a sheet is a rule the next write path walks past, and the result
 * is breakfast materialised on top of the walk.
 *
 * WHAT ELSE THE SERVICE OWNS, so no caller has to:
 *
 *  - `sort_order` is DENSE. A new slot appends; the caller never sends one.
 *    A bracket or a one-of group is one position.
 *  - A PIN HAS NO GAP. Normalised on write; the database check refuses it
 *    anyway, and the sheet never sees the check.
 *  - A ONE-OF GROUP'S MEMBERS ARE STRUCTURALLY IDENTICAL: same position, gap,
 *    pin and role. Writing one member syncs the others. Exactly one is the
 *    default; the partial unique index holds "at most one", this holds "at
 *    least one".
 *  - `role` is `stack` unless the template's structure allows otherwise.
 *  - A slot is always `fixed_time`; windows and *anytime* are day-level ideas
 *    (Mason, DYN-4 — logged). Legacy rows keep their mode on read.
 */

export type SamePositionConflict = {
  code: "same_position";
  withSlotId: string;
  withTitle: string;
  position: { sortOrder: number; pinnedClock: string | null };
};

export class SamePositionError extends Error {
  readonly conflict: SamePositionConflict;
  constructor(conflict: SamePositionConflict) {
    super("same_position");
    this.name = "SamePositionError";
    this.conflict = conflict;
  }
}

export class SlotRuleError extends Error {
  readonly code: "already_multitask" | "already_alternates" | "not_found";
  constructor(code: SlotRuleError["code"]) {
    super(code);
    this.name = "SlotRuleError";
    this.code = code;
  }
}

/** Short and local to the template; the materialiser mints per-day uuids. */
function newGroupId(): string {
  return crypto.randomUUID().slice(0, 8);
}

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

type PositionRow = {
  id: string;
  sortOrder: number;
  pinnedAt: string | null;
  multitaskGroup: string | null;
  alternatesGroup: string | null;
  alternatesDefault: boolean;
  gapBeforeMin: number;
  role: "stack" | "opener" | "pool" | "closer";
  title: string;
};

/** Two slots share a position when they share a pin time, or a stack index. */
export function samePosition(
  a: { sortOrder: number; pinnedAt: string | null },
  b: { sortOrder: number; pinnedAt: string | null },
): boolean {
  if (a.pinnedAt !== null || b.pinnedAt !== null) {
    return a.pinnedAt !== null && b.pinnedAt !== null && a.pinnedAt === b.pinnedAt;
  }
  return a.sortOrder === b.sortOrder;
}

async function readPositions(
  tx: Tx,
  userId: string,
  templateId: string,
): Promise<PositionRow[]> {
  return tx
    .select({
      id: templateSlots.id,
      sortOrder: templateSlots.sortOrder,
      pinnedAt: templateSlots.pinnedAt,
      multitaskGroup: templateSlots.multitaskGroup,
      alternatesGroup: templateSlots.alternatesGroup,
      alternatesDefault: templateSlots.alternatesDefault,
      gapBeforeMin: templateSlots.gapBeforeMin,
      role: templateSlots.role,
      title: habits.title,
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
}

/**
 * Re-number positions 0…n densely, keeping bracket and one-of members on one
 * number. Called after every write that can leave a hole.
 */
export async function densifyPositions(
  tx: Tx,
  userId: string,
  templateId: string,
): Promise<void> {
  const rows = await readPositions(tx, userId, templateId);
  let position = -1;
  let previous: PositionRow | null = null;
  for (const row of rows) {
    const shares =
      previous !== null &&
      ((row.multitaskGroup !== null &&
        row.multitaskGroup === previous.multitaskGroup) ||
        (row.alternatesGroup !== null &&
          row.alternatesGroup === previous.alternatesGroup));
    if (!shares) position += 1;
    if (row.sortOrder !== position) {
      await tx
        .update(templateSlots)
        .set({ sortOrder: position, updatedAt: new Date() })
        .where(eq(templateSlots.id, row.id));
    }
    previous = { ...row, sortOrder: position };
  }
}

/** Copy the structural fields to every other member of a one-of group. */
async function syncAlternates(
  tx: Tx,
  userId: string,
  templateId: string,
  group: string,
  fromSlotId: string,
): Promise<void> {
  const [source] = await tx
    .select({
      sortOrder: templateSlots.sortOrder,
      gapBeforeMin: templateSlots.gapBeforeMin,
      pinnedAt: templateSlots.pinnedAt,
      role: templateSlots.role,
      alternatesDefault: templateSlots.alternatesDefault,
    })
    .from(templateSlots)
    .where(eq(templateSlots.id, fromSlotId))
    .limit(1);
  if (!source) return;

  await tx
    .update(templateSlots)
    .set({
      sortOrder: source.sortOrder,
      gapBeforeMin: source.gapBeforeMin,
      pinnedAt: source.pinnedAt,
      role: source.role,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(templateSlots.templateId, templateId),
        eq(templateSlots.userId, userId),
        eq(templateSlots.alternatesGroup, group),
        ne(templateSlots.id, fromSlotId),
      ),
    );

  // At least one default: if none is, the first member by creation is.
  const members = await tx
    .select({ id: templateSlots.id, isDefault: templateSlots.alternatesDefault })
    .from(templateSlots)
    .where(
      and(
        eq(templateSlots.templateId, templateId),
        eq(templateSlots.alternatesGroup, group),
      ),
    )
    .orderBy(asc(templateSlots.createdAt));
  if (members.length > 0 && !members.some((member) => member.isDefault)) {
    const first = members[0];
    if (first) {
      await tx
        .update(templateSlots)
        .set({ alternatesDefault: true, updatedAt: new Date() })
        .where(eq(templateSlots.id, first.id));
    }
  }
}

export async function saveSlot(
  rls: RlsClient,
  userId: string,
  input: SlotFormInput,
): Promise<{ id: string } | null> {
  return rls.execute(async (tx) => {
    const [template] = await tx
      .select({ id: templates.id, structure: templates.structure })
      .from(templates)
      .where(
        and(
          eq(templates.id, input.templateId),
          eq(templates.userId, userId),
        ),
      )
      .limit(1);

    // Another person's template is NOT_FOUND to the caller, never FORBIDDEN.
    if (!template) return null;

    // Normalise what the service owns.
    const pinnedAt = input.pinnedClock;
    const gapBeforeMin = pinnedAt === null ? input.gapBeforeMin : 0;
    const role =
      template.structure === "opener_pool_closer" ? input.role : "stack";

    const positions = await readPositions(tx, userId, input.templateId);
    const existing = input.slotId
      ? (positions.find((row) => row.id === input.slotId) ?? null)
      : null;
    if (input.slotId && !existing) return null;

    // Where this slot will sit: an edit keeps its position unless it is
    // being pinned; a new slot appends after the last position.
    const lastPosition = positions.reduce(
      (max, row) => Math.max(max, row.sortOrder),
      -1,
    );
    let sortOrder = existing ? existing.sortOrder : lastPosition + 1;
    let multitaskGroup = existing?.multitaskGroup ?? null;
    let alternatesGroup = existing?.alternatesGroup ?? null;
    let alternatesDefault = input.alternatesDefault ?? existing?.alternatesDefault ?? false;

    const partnerId = input.multitaskWith ?? input.alternatesWith;
    if (partnerId !== undefined) {
      const partner = positions.find((row) => row.id === partnerId);
      if (!partner || partner.id === input.slotId) {
        throw new SlotRuleError("not_found");
      }
      if (input.multitaskWith !== undefined) {
        if (partner.alternatesGroup !== null) {
          throw new SlotRuleError("already_alternates");
        }
        multitaskGroup = partner.multitaskGroup ?? newGroupId();
        alternatesGroup = null;
        if (partner.multitaskGroup === null) {
          await tx
            .update(templateSlots)
            .set({ multitaskGroup, updatedAt: new Date() })
            .where(eq(templateSlots.id, partner.id));
        }
      } else {
        if (partner.multitaskGroup !== null) {
          throw new SlotRuleError("already_multitask");
        }
        alternatesGroup = partner.alternatesGroup ?? newGroupId();
        multitaskGroup = null;
        if (partner.alternatesGroup === null) {
          await tx
            .update(templateSlots)
            .set({
              alternatesGroup,
              // The occupant was the only member; it is the default unless
              // the newcomer claims it.
              alternatesDefault: !(input.alternatesDefault ?? false),
              updatedAt: new Date(),
            })
            .where(eq(templateSlots.id, partner.id));
        }
        if (input.alternatesDefault === undefined) alternatesDefault = false;
      }
      // Joining a group means taking its position and its pin.
      sortOrder = partner.sortOrder;
    }

    // THE POSITION RULE. Anyone else at this position must share our group.
    const candidate = { sortOrder, pinnedAt };
    for (const occupant of positions) {
      if (occupant.id === input.slotId) continue;
      if (!samePosition(occupant, candidate)) continue;
      const shared =
        (multitaskGroup !== null && occupant.multitaskGroup === multitaskGroup) ||
        (alternatesGroup !== null && occupant.alternatesGroup === alternatesGroup);
      if (shared) continue;
      throw new SamePositionError({
        code: "same_position",
        withSlotId: occupant.id,
        withTitle: occupant.title,
        position: {
          sortOrder: occupant.sortOrder,
          pinnedClock: occupant.pinnedAt === null ? null : occupant.pinnedAt.slice(0, 5),
        },
      });
    }

    // The partial unique index holds "at most one default per group" and is
    // checked per statement, so the old default yields BEFORE the new one is
    // written, never after.
    if (alternatesGroup !== null && alternatesDefault) {
      await tx
        .update(templateSlots)
        .set({ alternatesDefault: false, updatedAt: new Date() })
        .where(
          and(
            eq(templateSlots.templateId, input.templateId),
            eq(templateSlots.alternatesGroup, alternatesGroup),
            ...(input.slotId ? [ne(templateSlots.id, input.slotId)] : []),
          ),
        );
    }

    const values = {
      habitId: input.habitId,
      timeMode: "fixed_time" as const,
      durationMin: input.durationMin,
      gapBeforeMin,
      pinnedAt,
      role,
      priorityOverride: input.priorityOverride,
      scheduling: input.scheduling,
      multitaskGroup,
      alternatesGroup,
      alternatesDefault: alternatesGroup === null ? false : alternatesDefault,
      sortOrder,
      // DEPRECATED columns are never written again (v1.1 §11.5).
    };

    let savedId: string;
    if (input.slotId) {
      const rows = await tx
        .update(templateSlots)
        .set({ ...values, updatedAt: new Date() })
        .where(
          and(
            eq(templateSlots.id, input.slotId),
            eq(templateSlots.userId, userId),
          ),
        )
        .returning({ id: templateSlots.id });
      const row = rows[0];
      if (!row) return null;
      savedId = row.id;
    } else {
      const rows = await tx
        .insert(templateSlots)
        .values({ ...values, userId, templateId: input.templateId })
        .returning({ id: templateSlots.id });
      const row = rows[0];
      if (!row) return null;
      savedId = row.id;
    }

    if (alternatesGroup !== null) {
      await syncAlternates(tx, userId, input.templateId, alternatesGroup, savedId);
    }
    await densifyPositions(tx, userId, input.templateId);

    return { id: savedId };
  });
}

/**
 * Slots sharing a position without sharing a group — the read side of the
 * rule above, for the editor's inline question and for anything a second
 * device, a SQL edit, or a bug left behind. THE READER'S RULE MATCHES THE
 * WRITER'S: at any one position every slot must be in ONE non-null group,
 * multitask or alternates; anything else is a pair to report.
 */
export function findCollisions(
  slots: ReadonlyArray<{
    id: string;
    sortOrder: number;
    pinnedAt: string | null;
    multitaskGroup: string | null;
    alternatesGroup: string | null;
  }>,
): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < slots.length; i += 1) {
    const a = slots[i];
    if (!a) continue;
    for (let j = i + 1; j < slots.length; j += 1) {
      const b = slots[j];
      if (!b) continue;
      if (!samePosition(a, b)) continue;
      const shared =
        (a.multitaskGroup !== null && a.multitaskGroup === b.multitaskGroup) ||
        (a.alternatesGroup !== null && a.alternatesGroup === b.alternatesGroup);
      if (!shared) pairs.push([a.id, b.id]);
    }
  }
  return pairs;
}

