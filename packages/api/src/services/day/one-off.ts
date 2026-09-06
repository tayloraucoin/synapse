import { and, eq, inArray, isNotNull } from "drizzle-orm";

import {
  dayItems,
  days,
  habits,
  misses,
  timerSessions,
  users,
  type RlsClient,
} from "@syn/db";
import type { IconValue } from "@syn/types";
import { wallClockToInstant } from "@syn/utils";

import { touchedWhere, untouchedWhere } from "./untouched";

/**
 * One-off items — WK-03, and the door the day header opens.
 *
 * A ONE-OFF IS THE ONLY DELETABLE ITEM (cross-cutting §8.4). Everything else
 * on a day is annotated; this one a person put there by hand and may take
 * back, which is why `removeOneOff` returns its payload for the undo toast.
 *
 * THE DAY ROW IS CREATED IF ABSENT, with no template: "a day with no template
 * is an empty day" (official spec §3.6), and adding one item to an unplanned
 * Tuesday should not require planning Tuesday.
 */

const DEFAULT_ICON: IconValue = {
  kind: "curated",
  value: "dot",
  colorKey: null,
};

export type OneOffInput = {
  date: string;
  itemId?: string;
  /** Null for *Just a title*, which creates no library entry. */
  habitId: string | null;
  title: string;
  timeMode: "fixed_time" | "window" | "unscheduled";
  startClock: string | null;
  endClock: string | null;
  durationMin: number | null;
  priority: number;
  scheduling: "hard" | "soft";
  /** Set when the person answered the same-start question with *yes*. */
  multitaskWith?: string;
};

export type SameStartConflict = {
  code: "same_start";
  withItemId: string;
  withTitle: string;
};

export class OneOffSameStartError extends Error {
  readonly conflict: SameStartConflict;
  constructor(conflict: SameStartConflict) {
    super("same_start");
    this.name = "OneOffSameStartError";
    this.conflict = conflict;
  }
}

/**
 * The day's row, created from the account's defaults if it does not exist.
 *
 * EXPORTED FOR REV-2's CARRY. Carrying a task to tomorrow has to put it
 * somewhere, and tomorrow may never have been planned — the same situation a
 * one-off on an empty Tuesday is in, with the same answer: a day with no
 * template is a real, empty day (official spec §3.6). One helper, so the zone
 * and close time are snapshotted the same way whichever path created the row.
 */
export async function ensureDay(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  date: string,
): Promise<{ id: string; timezone: string; anchorTime: string }> {
  const [existing] = await tx
    .select({
      id: days.id,
      timezone: days.timezone,
      anchorTime: days.anchorTime,
    })
    .from(days)
    .where(and(eq(days.userId, userId), eq(days.date, date)))
    .limit(1);

  if (existing) return existing;

  const [account] = await tx
    .select({
      timezone: users.timezone,
      dayCloseTime: users.dayCloseTime,
      usualWakeTime: users.usualWakeTime,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!account) throw new Error("no account row");

  const [created] = await tx
    .insert(days)
    .values({
      userId,
      date,
      anchorTime: account.usualWakeTime,
      timezone: account.timezone,
      dayCloseTime: account.dayCloseTime,
    })
    .returning({
      id: days.id,
      timezone: days.timezone,
      anchorTime: days.anchorTime,
    });

  if (!created) throw new Error("day insert returned no row");
  return created;
}

export async function saveOneOff(
  rls: RlsClient,
  userId: string,
  input: OneOffInput,
): Promise<{ id: string }> {
  return rls.execute(async (tx) => {
    const day = await ensureDay(tx, userId, input.date);

    const start =
      input.startClock === null
        ? null
        : wallClockToInstant(input.date, input.startClock, day.timezone);

    const end =
      input.timeMode === "window" && input.endClock !== null
        ? wallClockToInstant(input.date, input.endClock, day.timezone)
        : start !== null && input.durationMin !== null
          ? new Date(start.getTime() + input.durationMin * 60000)
          : null;

    let multitaskId: string | null = null;

    // The same-start question, against the day's items rather than a
    // template's slots — same rule, different scope.
    if (input.timeMode === "fixed_time" && start !== null) {
      const occupants = await tx
        .select({
          id: dayItems.id,
          title: dayItems.title,
          multitaskId: dayItems.multitaskId,
        })
        .from(dayItems)
        .where(
          and(
            eq(dayItems.dayId, day.id),
            eq(dayItems.userId, userId),
            eq(dayItems.timeMode, "fixed_time"),
            eq(dayItems.scheduledStart, start),
            eq(dayItems.assignmentState, "assigned"),
          ),
        );

      const others = occupants.filter((row) => row.id !== input.itemId);

      if (others.length > 0) {
        const partner =
          others.find((row) => row.id === input.multitaskWith) ?? others[0];

        if (input.multitaskWith === undefined || partner === undefined) {
          const first = others[0];
          if (first) {
            throw new OneOffSameStartError({
              code: "same_start",
              withItemId: first.id,
              withTitle: first.title,
            });
          }
        } else {
          multitaskId = partner.multitaskId ?? crypto.randomUUID();
          if (partner.multitaskId === null) {
            await tx
              .update(dayItems)
              .set({ multitaskId, updatedAt: new Date() })
              .where(eq(dayItems.id, partner.id));
          }
        }
      }
    }

    // A chosen habit's fields are snapshotted, exactly as materialisation does.
    const [habit] = input.habitId
      ? await tx
          .select({
            title: habits.title,
            icon: habits.icon,
            type: habits.type,
            quantityUnit: habits.quantityUnit,
            reflectionAxes: habits.reflectionAxes,
            defaultNotesPreflight: habits.defaultNotesPreflight,
          })
          .from(habits)
          .where(
            and(eq(habits.id, input.habitId), eq(habits.userId, userId)),
          )
          .limit(1)
      : [];

    const values = {
      title: habit?.title ?? input.title,
      icon: habit?.icon ?? DEFAULT_ICON,
      // A bare title is a task or appointment — it is not a habit, and calling
      // it one would put it in the library's reporting.
      type: habit?.type ?? ("task_appointment" as const),
      quantityUnit: habit?.quantityUnit ?? null,
      reflectionAxes: habit?.reflectionAxes ?? [],
      notesPreflight: habit?.defaultNotesPreflight ?? null,
      timeMode: input.timeMode,
      scheduledStart: start,
      scheduledEnd: end,
      durationMin: input.durationMin,
      priority: input.priority,
      scheduling: input.scheduling,
      ...(multitaskId === null ? {} : { multitaskId }),
    };

    if (input.itemId) {
      const rows = await tx
        .update(dayItems)
        .set({ ...values, updatedAt: new Date() })
        .where(
          and(eq(dayItems.id, input.itemId), eq(dayItems.userId, userId)),
        )
        .returning({ id: dayItems.id });
      const row = rows[0];
      if (!row) throw new Error("no such item");
      return row;
    }

    const rows = await tx
      .insert(dayItems)
      .values({
        ...values,
        userId,
        dayId: day.id,
        habitId: input.habitId,
        origin: "one_off",
        originalScheduledStart: start,
      })
      .returning({ id: dayItems.id });

    const row = rows[0];
    if (!row) throw new Error("one-off insert returned no row");
    return row;
  });
}

/** Returns the removed row so the undo toast can put it back. */
/**
 * Everything a removal took, typed against the schema rather than as loose
 * records — so a column added later travels with the undo automatically
 * instead of being silently dropped by a hand-written shape.
 */
export type RemovedOneOff = {
  item: typeof dayItems.$inferSelect;
  /** Captured before the delete, because they cascade away with it. */
  sessions: (typeof timerSessions.$inferSelect)[];
  miss: typeof misses.$inferSelect | null;
};

/**
 * Remove a one-off, keeping everything needed to put it back.
 *
 * `timer_sessions` AND `misses` CASCADE FROM `day_items`, so deleting the row
 * takes them with it and no later insert can bring them back. They are read
 * FIRST and returned alongside the item — which is why this returns a bundle
 * rather than a row. Without that, the five-second undo would restore an item
 * that had lost the time somebody spent on it, silently, and the record would
 * be quietly wrong in exactly the way the product promises it never is.
 */
export async function removeOneOff(
  rls: RlsClient,
  userId: string,
  itemId: string,
): Promise<RemovedOneOff | null> {
  return rls.execute(async (tx) => {
    const sessions = await tx
      .select()
      .from(timerSessions)
      .where(
        and(
          eq(timerSessions.dayItemId, itemId),
          eq(timerSessions.userId, userId),
        ),
      );

    const missRows = await tx
      .select()
      .from(misses)
      .where(and(eq(misses.dayItemId, itemId), eq(misses.userId, userId)))
      .limit(1);

    const rows = await tx
      .delete(dayItems)
      .where(
        and(
          eq(dayItems.id, itemId),
          eq(dayItems.userId, userId),
          eq(dayItems.origin, "one_off"),
        ),
      )
      .returning();

    const item = rows[0];
    if (!item) return null;

    return { item, sessions, miss: missRows[0] ?? null };
  });
}

/**
 * Put a removed one-off back, whole — the five-second undo (§9.3 G1).
 *
 * WITH ITS ORIGINAL ID. Anything pointing at the row survives the round trip:
 * a notification deep link, an open sheet, a `carried_from_item_id` on
 * tomorrow. Re-inserting under a new id would leave every one of those
 * pointing at nothing, which is a worse outcome than the removal it undoes —
 * and it is only possible because the delete was a real delete rather than a
 * flag, so the id is free.
 *
 * THE SESSIONS AND THE MISS COME BACK TOO. They cascaded away with the item,
 * so `removeOneOff` captured them; restoring the item alone would give back
 * something that had quietly lost the time spent on it. The item goes first —
 * the others reference it.
 */
export async function restoreOneOff(
  rls: RlsClient,
  userId: string,
  payload: RemovedOneOff,
): Promise<{ id: string } | null> {
  return rls.execute(async (tx) => {
    const rows = await tx
      .insert(dayItems)
      // `userId` is re-asserted rather than trusted from the payload: the row
      // came back through a browser, and RLS would refuse a foreign one anyway
      // — this makes the refusal unnecessary rather than merely certain.
      .values({ ...payload.item, userId })
      .onConflictDoNothing()
      .returning({ id: dayItems.id });

    const row = rows[0];
    if (!row) return null;

    if (payload.sessions.length > 0) {
      await tx
        .insert(timerSessions)
        .values(payload.sessions.map((session) => ({ ...session, userId })))
        .onConflictDoNothing();
    }

    if (payload.miss !== null) {
      await tx
        .insert(misses)
        .values({ ...payload.miss, userId })
        .onConflictDoNothing();
    }

    return row;
  });
}

/**
 * Removing a template from a day: untouched items go, touched items stay
 * (Epic 1 WK-02's dialog says exactly this).
 *
 * The survivors lose their slot link and keep `template_name_snapshot`, so the
 * List can still say where they came from after the template is gone.
 */
export async function removeTemplateFromDay(
  rls: RlsClient,
  userId: string,
  date: string,
): Promise<{ removed: number; kept: number }> {
  return rls.execute(async (tx) => {
    const [day] = await tx
      .select({ id: days.id })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, date)))
      .limit(1);

    if (!day) return { removed: 0, kept: 0 };

    // The shared predicate, never a local copy of it. An earlier draft of this
    // function inlined the four column checks and omitted the session and miss
    // sub-selects, which would have deleted an item somebody had already run a
    // timer on — the precise drift `untouched.ts` exists to prevent.
    const mine = and(
      eq(dayItems.dayId, day.id),
      eq(dayItems.userId, userId),
      isNotNull(dayItems.templateSlotId),
    );

    const doomed = await tx
      .select({ id: dayItems.id })
      .from(dayItems)
      .where(and(mine, untouchedWhere()));

    const kept = await tx
      .select({ id: dayItems.id })
      .from(dayItems)
      .where(and(mine, touchedWhere()));

    if (doomed.length > 0) {
      await tx.delete(dayItems).where(
        inArray(
          dayItems.id,
          doomed.map((row) => row.id),
        ),
      );
    }

    // A kept row loses its slot id but keeps `template_name_snapshot`, so the
    // record still says which template put it there.
    if (kept.length > 0) {
      await tx
        .update(dayItems)
        .set({ templateSlotId: null, updatedAt: new Date() })
        .where(
          inArray(
            dayItems.id,
            kept.map((row) => row.id),
          ),
        );
    }

    await tx
      .update(days)
      .set({ templateId: null, updatedAt: new Date() })
      .where(eq(days.id, day.id));

    return { removed: doomed.length, kept: kept.length };
  });
}

/**
 * How many of a day's template items would survive removing its template —
 * WK-02's keep line, *{n} items already started or done stay on the day.*
 *
 * It asks the same question `removeTemplateFromDay` answers, with the same
 * predicate, so the number a person is shown before they choose is the number
 * they get. A count derived on the client from the view model could not be:
 * `DayItemView` carries a derived `state`, not the assignment and completion
 * columns the predicate reads.
 */
export async function countKeptOnRemove(
  rls: RlsClient,
  userId: string,
  date: string,
): Promise<number> {
  return rls.execute(async (tx) => {
    const [day] = await tx
      .select({ id: days.id })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, date)))
      .limit(1);

    if (!day) return 0;

    const rows = await tx
      .select({ id: dayItems.id })
      .from(dayItems)
      .where(
        and(
          eq(dayItems.dayId, day.id),
          eq(dayItems.userId, userId),
          isNotNull(dayItems.templateSlotId),
          touchedWhere(),
        ),
      );

    return rows.length;
  });
}

/** Which template a day currently uses — the anchor change needs to keep it. */
export async function readDayTemplateId(
  rls: RlsClient,
  userId: string,
  date: string,
): Promise<string | null> {
  const rows = await rls.execute((tx) =>
    tx
      .select({ templateId: days.templateId })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, date)))
      .limit(1),
  );
  return rows[0]?.templateId ?? null;
}
