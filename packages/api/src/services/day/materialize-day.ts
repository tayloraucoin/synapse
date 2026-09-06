import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";

import {
  dayItems,
  days,
  habits,
  templateSlots,
  templates,
  users,
  type RlsClient,
} from "@syn/db";
import { clockMinutes, wallClockToInstant } from "@syn/utils";

import { isUntouchedItem } from "./untouched";

/**
 * THE materialiser. One function, four callers: apply a template, change a
 * day's start, remove a template, and re-apply after a template edit (TP-04).
 *
 * IT RECONCILES; IT DOES NOT REBUILD. The obvious implementation — delete the
 * day's template items and insert the new set — passes every happy path and
 * destroys a record the first time someone re-applies a template on a day they
 * have already started. So instead: match existing rows by `template_slot_id`,
 * update the untouched, insert the missing, delete the untouched whose slot is
 * gone, and leave everything else exactly as it is.
 *
 * APPLYING IS IMMEDIATE (official spec §4.5). There is no lazy "materialise on
 * open": tomorrow's list is real tonight, which is the point of planning a
 * week at all.
 *
 * ABSOLUTE TIMES COME FROM USE-1, in the day's OWN snapshotted zone. A slot
 * holds an offset; a day holds a zone; the instant is
 * `wallClockToInstant(date, anchor + offset, zone)` — which resolves a
 * spring-forward gap forward and never repeats a fall-back hour. There is no
 * local date arithmetic in this file and there must not be.
 */

export type MaterializeResult = {
  dayId: string;
  inserted: number;
  updated: number;
  deleted: number;
  kept: number;
};

export type MaterializeInput = {
  date: string;
  /** Null removes the template's untouched items and clears `template_id`. */
  templateId: string | null;
  /** Overrides the template's own start. */
  anchorTime?: string;
  /**
   * An anchor change is the ONE case that writes to touched rows, and only
   * their two scheduled-time columns (Epic 1 WK-02: "the done ones keep their
   * `done_at`; scheduled times still recompute").
   */
  recomputeTouchedTimes?: boolean;
};

export async function materializeDay(
  rls: RlsClient,
  userId: string,
  input: MaterializeInput,
): Promise<MaterializeResult> {
  return rls.execute(async (tx) => {
    const [account] = await tx
      .select({
        timezone: users.timezone,
        dayCloseTime: users.dayCloseTime,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!account) throw new Error("no account row");

    const [template] = input.templateId
      ? await tx
          .select({
            id: templates.id,
            name: templates.name,
            anchorTime: templates.anchorTime,
          })
          .from(templates)
          .where(
            and(
              eq(templates.id, input.templateId),
              eq(templates.userId, userId),
            ),
          )
          .limit(1)
      : [];

    if (input.templateId && !template) {
      throw new Error("no such template");
    }

    const anchorTime =
      input.anchorTime ?? template?.anchorTime ?? account.dayCloseTime;

    /*
     * The day row. Its zone and close time are snapshotted ON INSERT ONLY —
     * an existing day keeps the rules it was created under, which is what
     * makes a past day still read as it was lived after a move
     * (cross-cutting §7.3).
     */
    const [existingDay] = await tx
      .select({ id: days.id, timezone: days.timezone })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, input.date)))
      .limit(1);

    let dayId: string;
    let zone: string;

    if (existingDay) {
      dayId = existingDay.id;
      zone = existingDay.timezone;
      await tx
        .update(days)
        .set({
          anchorTime,
          templateId: input.templateId,
          updatedAt: new Date(),
        })
        .where(eq(days.id, dayId));
    } else {
      const [created] = await tx
        .insert(days)
        .values({
          userId,
          date: input.date,
          anchorTime,
          templateId: input.templateId,
          timezone: account.timezone,
          dayCloseTime: account.dayCloseTime,
        })
        .returning({ id: days.id, timezone: days.timezone });

      if (!created) throw new Error("day insert returned no row");
      dayId = created.id;
      zone = created.timezone;
    }

    // Existing template-derived rows, with the two facts the predicate needs.
    const existingItems = await tx
      .select({
        id: dayItems.id,
        templateSlotId: dayItems.templateSlotId,
        assignmentState: dayItems.assignmentState,
        completionState: dayItems.completionState,
        deferredAt: dayItems.deferredAt,
        doneAt: dayItems.doneAt,
        multitaskId: dayItems.multitaskId,
        sessionCount: sql<number>`(SELECT COUNT(*) FROM timer_sessions ts WHERE ts.day_item_id = ${dayItems.id})`,
        missCount: sql<number>`(SELECT COUNT(*) FROM misses m WHERE m.day_item_id = ${dayItems.id})`,
      })
      .from(dayItems)
      .where(
        and(
          eq(dayItems.dayId, dayId),
          eq(dayItems.userId, userId),
          isNotNull(dayItems.templateSlotId),
        ),
      );

    const bySlot = new Map(
      existingItems
        .filter((row) => row.templateSlotId !== null)
        .map((row) => [row.templateSlotId as string, row]),
    );

    const slots = input.templateId
      ? await tx
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
            habitType: habits.type,
            habitLifePriority: habits.lifePriority,
            habitQuantityUnit: habits.quantityUnit,
            habitReflectionAxes: habits.reflectionAxes,
            habitPreflight: habits.defaultNotesPreflight,
          })
          .from(templateSlots)
          .innerJoin(habits, eq(habits.id, templateSlots.habitId))
          .where(
            and(
              eq(templateSlots.templateId, input.templateId),
              eq(templateSlots.userId, userId),
            ),
          )
      : [];

    const anchorMinutes = clockMinutes(anchorTime);

    // One id per multitask group per day, reused across re-materialisation so
    // a bracket keeps its identity.
    const groupIds = new Map<string, string>();
    for (const slot of slots) {
      if (slot.multitaskGroup === null) continue;
      if (groupIds.has(slot.multitaskGroup)) continue;
      const existing = bySlot.get(slot.id)?.multitaskId ?? null;
      groupIds.set(slot.multitaskGroup, existing ?? crypto.randomUUID());
    }

    let inserted = 0;
    let updated = 0;
    let kept = 0;

    for (const slot of slots) {
      const start =
        slot.offsetStartMin === null
          ? null
          : wallClockToInstant(
              input.date,
              minutesToClock(anchorMinutes + slot.offsetStartMin),
              zone,
            );

      const end =
        slot.timeMode === "window" && slot.offsetEndMin !== null
          ? wallClockToInstant(
              input.date,
              minutesToClock(anchorMinutes + slot.offsetEndMin),
              zone,
            )
          : start === null
            ? null
            : new Date(start.getTime() + slot.durationMin * 60000);

      const shared = {
        title: slot.habitTitle,
        icon: slot.habitIcon,
        type: slot.habitType,
        quantityUnit: slot.habitQuantityUnit,
        reflectionAxes: slot.habitReflectionAxes,
        notesPreflight: slot.habitPreflight,
        timeMode: slot.timeMode,
        scheduledStart: start,
        scheduledEnd: end,
        durationMin: slot.durationMin,
        // §6.6: the slot's override, else the habit's life priority.
        priority: slot.priorityOverride ?? slot.habitLifePriority,
        scheduling: slot.scheduling,
        sortOrder: slot.sortOrder,
        multitaskId:
          slot.multitaskGroup === null
            ? null
            : (groupIds.get(slot.multitaskGroup) ?? null),
        templateNameSnapshot: template?.name ?? null,
      };

      const match = bySlot.get(slot.id);

      if (!match) {
        await tx.insert(dayItems).values({
          ...shared,
          userId,
          dayId,
          habitId: slot.habitId,
          templateSlotId: slot.id,
          origin: "template",
          // Written once, ever. The trigger enforces it; this is the only
          // place it appears in a write at all.
          originalScheduledStart: start,
        });
        inserted += 1;
        continue;
      }

      if (isUntouchedItem(match)) {
        await tx
          .update(dayItems)
          .set({ ...shared, updatedAt: new Date() })
          .where(eq(dayItems.id, match.id));
        updated += 1;
        continue;
      }

      /*
       * A touched row. The ONE permitted write is an anchor change moving its
       * two scheduled-time columns — never its snapshots, its states, its
       * `done_at`, and never `original_scheduled_start`, which is what the
       * ghost renders from.
       */
      if (input.recomputeTouchedTimes) {
        await tx
          .update(dayItems)
          .set({ scheduledStart: start, scheduledEnd: end, updatedAt: new Date() })
          .where(eq(dayItems.id, match.id));
      }
      kept += 1;
    }

    // Slots that are gone: their untouched rows go, their touched rows stay.
    const liveSlotIds = new Set(slots.map((slot) => slot.id));
    const orphaned = existingItems.filter(
      (row) => row.templateSlotId !== null && !liveSlotIds.has(row.templateSlotId),
    );
    const removable = orphaned.filter(isUntouchedItem).map((row) => row.id);
    const survivors = orphaned.filter((row) => !isUntouchedItem(row));

    let deleted = 0;
    if (removable.length > 0) {
      const gone = await tx
        .delete(dayItems)
        .where(inArray(dayItems.id, removable))
        .returning({ id: dayItems.id });
      deleted = gone.length;
    }

    // A survivor whose slot no longer exists keeps its record and loses the
    // link; the name snapshot is what lets it still say where it came from.
    if (survivors.length > 0) {
      await tx
        .update(dayItems)
        .set({ templateSlotId: null, updatedAt: new Date() })
        .where(
          inArray(
            dayItems.id,
            survivors.map((row) => row.id),
          ),
        );
      kept += survivors.length;
    }

    return { dayId, inserted, updated, deleted, kept };
  });
}

/** Minutes from midnight → "HH:mm", allowing past 24:00 for USE-1 to roll. */
function minutesToClock(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = ((minutes % 60) + 60) % 60;
  return `${hour}:${String(minute).padStart(2, "0")}`;
}
