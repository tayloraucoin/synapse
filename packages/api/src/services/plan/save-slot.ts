import { and, eq, ne, sql } from "drizzle-orm";

import { habits, templateSlots, templates, type RlsClient } from "@syn/db";
import { clockToMinutes, formatClockFromMinutes } from "@syn/utils";
import type { SlotFormInput } from "@syn/validators";

import { anchorOrFallback } from "./anchor-fallback";

/**
 * Saving one slot, and THE invariant.
 *
 * TWO FIXED SLOTS AT ONE START MUST BE A MULTITASK GROUP (official spec §3.5:
 * "two slots sharing a start offset must be in the same group or the template
 * won't save"). This is enforced HERE, in the service, on every write — not in
 * the sheet.
 *
 * The difference matters. A rule that lives in the sheet is a rule that a
 * duplicate, a move, an anchor change, a second device, or the next write path
 * someone adds can walk straight past, and the result is a template that
 * silently stacks two things at 7:00 and a day that materialises them on top
 * of each other. In the service, every path pays the check: add, edit,
 * duplicate, restore-after-undo, and whatever SET-6 and SET-7 add later.
 *
 * WINDOWS AND ANYTIME NEVER COLLIDE. A window is a span the person may do the
 * thing inside, and two spans overlapping is a fact rather than an error
 * (Epic 1 TP-02's Vesper call: "enforcing non-overlap would make the editor
 * argue with the person"). Only an exact shared `fixed_time` start is asked
 * about, because only that is genuinely ambiguous.
 */

export type SameStartConflict = {
  code: "same_start";
  withSlotId: string;
  withTitle: string;
  atClock: string;
};

export class SameStartError extends Error {
  readonly conflict: SameStartConflict;
  constructor(conflict: SameStartConflict) {
    super("same_start");
    this.name = "SameStartError";
    this.conflict = conflict;
  }
}

/** Short and local to the template; SET-6 turns it into a per-day uuid. */
function newMultitaskGroup(): string {
  return crypto.randomUUID().slice(0, 8);
}

export async function saveSlot(
  rls: RlsClient,
  userId: string,
  input: SlotFormInput,
): Promise<{ id: string } | null> {
  return rls.execute(async (tx) => {
    const [template] = await tx
      .select({ id: templates.id, anchorTime: templates.anchorTime })
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

    let multitaskGroup: string | null = null;

    if (input.timeMode === "fixed_time" && input.offsetStartMin !== null) {
      const occupants = await tx
        .select({
          id: templateSlots.id,
          multitaskGroup: templateSlots.multitaskGroup,
          title: habits.title,
        })
        .from(templateSlots)
        .innerJoin(habits, eq(habits.id, templateSlots.habitId))
        .where(
          and(
            eq(templateSlots.templateId, input.templateId),
            eq(templateSlots.userId, userId),
            eq(templateSlots.timeMode, "fixed_time"),
            eq(templateSlots.offsetStartMin, input.offsetStartMin),
            input.slotId
              ? ne(templateSlots.id, input.slotId)
              : sql`true`,
          ),
        );

      if (occupants.length > 0) {
        const partner =
          occupants.find((slot) => slot.id === input.multitaskWith) ??
          occupants[0];

        if (input.multitaskWith === undefined || partner === undefined) {
          const first = occupants[0];
          if (!first) return null;
          throw new SameStartError({
            code: "same_start",
            withSlotId: first.id,
            withTitle: first.title,
            atClock: formatClockFromMinutes(
              clockToMinutes(anchorOrFallback(template.anchorTime)) +
                input.offsetStartMin,
            ),
          });
        }

        // Joining an existing bracket keeps its id; two loose slots start one.
        multitaskGroup = partner.multitaskGroup ?? newMultitaskGroup();

        if (partner.multitaskGroup === null) {
          await tx
            .update(templateSlots)
            .set({ multitaskGroup, updatedAt: new Date() })
            .where(eq(templateSlots.id, partner.id));
        }
      }
    }

    // `sort_order` only means anything inside a bracket; elsewhere the list is
    // in time order and this is a stable tie-break.
    const nextSortOrder = multitaskGroup === null ? 0 : await nextOrder(tx, multitaskGroup);

    if (input.slotId) {
      const rows = await tx
        .update(templateSlots)
        .set({
          habitId: input.habitId,
          timeMode: input.timeMode,
          offsetStartMin: input.offsetStartMin,
          offsetEndMin: input.offsetEndMin,
          durationMin: input.durationMin,
          priorityOverride: input.priorityOverride,
          scheduling: input.scheduling,
          ...(multitaskGroup === null ? {} : { multitaskGroup, sortOrder: nextSortOrder }),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(templateSlots.id, input.slotId),
            eq(templateSlots.userId, userId),
          ),
        )
        .returning({ id: templateSlots.id });

      return rows[0] ?? null;
    }

    const rows = await tx
      .insert(templateSlots)
      .values({
        userId,
        templateId: input.templateId,
        habitId: input.habitId,
        timeMode: input.timeMode,
        offsetStartMin: input.offsetStartMin,
        offsetEndMin: input.offsetEndMin,
        durationMin: input.durationMin,
        priorityOverride: input.priorityOverride,
        scheduling: input.scheduling,
        multitaskGroup,
        sortOrder: nextSortOrder,
      })
      .returning({ id: templateSlots.id });

    return rows[0] ?? null;
  });
}

async function nextOrder(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  multitaskGroup: string,
): Promise<number> {
  const rows = await tx
    .select({ sortOrder: templateSlots.sortOrder })
    .from(templateSlots)
    .where(eq(templateSlots.multitaskGroup, multitaskGroup));

  return rows.reduce((max, row) => Math.max(max, row.sortOrder + 1), 0);
}

/**
 * Fixed slots that share a start without sharing a bracket.
 *
 * THE READER'S RULE MATCHES THE WRITER'S, and that is the whole point of it.
 * `saveSlot` refuses to put a slot at an occupied fixed start unless it joins
 * that start's group, so at any one start the slots must ALL be in ONE
 * non-null group. Anything else is an anomaly:
 *
 * - two loose slots (the obvious case);
 * - a loose slot stacked beside an existing bracket (subtler, and just as
 *   ambiguous — the loose one is not in the multitask, it is merely on top of
 *   it);
 * - two different brackets at one start (only reachable by a data edit).
 *
 * An earlier version exempted every grouped slot and so reported none of the
 * last two. Reachable only by a second device, a SQL edit, or a bug — which is
 * exactly the population this function exists for. A reader that is more
 * permissive than the writer cannot surface the states the writer prevents,
 * and those are the ones nobody is looking for.
 */
export function findCollisions(
  slots: ReadonlyArray<{
    id: string;
    timeMode: string;
    offsetStartMin: number | null;
    multitaskGroup: string | null;
  }>,
): Array<[string, string]> {
  const byStart = new Map<
    number,
    Array<{ id: string; multitaskGroup: string | null }>
  >();

  for (const slot of slots) {
    if (slot.timeMode !== "fixed_time") continue;
    if (slot.offsetStartMin === null) continue;
    const members = byStart.get(slot.offsetStartMin) ?? [];
    members.push({ id: slot.id, multitaskGroup: slot.multitaskGroup });
    byStart.set(slot.offsetStartMin, members);
  }

  const pairs: Array<[string, string]> = [];

  for (const members of byStart.values()) {
    if (members.length < 2) continue;

    const first = members[0];
    if (!first) continue;

    // One shared, non-null group is the only legal shape at a shared start.
    const settled =
      first.multitaskGroup !== null &&
      members.every((member) => member.multitaskGroup === first.multitaskGroup);
    if (settled) continue;

    for (let index = 1; index < members.length; index += 1) {
      const earlier = members[index - 1];
      const later = members[index];
      if (earlier && later) pairs.push([earlier.id, later.id]);
    }
  }

  return pairs;
}
