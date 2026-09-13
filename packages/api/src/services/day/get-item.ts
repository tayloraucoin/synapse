import { and, asc, eq, ne } from "drizzle-orm";

import {
  categories,
  dayItems,
  days,
  habits,
  templateSlots,
  timerSessions,
  type RlsClient,
} from "@syn/db";
import type {
  DayMode,
  ItemState,
  TimerSessionSource,
} from "@syn/types";
import { deriveItemState, dayModeFor } from "@syn/utils";

/**
 * Everything the item sheet shows — IT-01.
 *
 * IT IS ITS OWN READ, not a widening of `DayItemView`. The sheet needs the
 * preflight note, the reflection axes and their ratings, the note, and every
 * session; the list needs none of those and renders thirty rows. Putting them
 * on the row view would send a day's worth of notes and session history down
 * the wire so that one sheet can open, on the screen a person looks at most.
 *
 * THE SESSIONS ARE THE TIMER'S TRUTH. The store publishes a ticking number,
 * but whether a timer exists — and how much time is already logged — is these
 * rows and nothing else.
 */
export type SessionView = {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  source: TimerSessionSource;
};

export type ItemDetailView = {
  id: string;
  dayKey: string;
  mode: DayMode;
  timezone: string;
  /** The day's own close time — IT-02 bounds its fields to that window. */
  dayCloseTime: string;
  habitId: string | null;
  title: string;
  icon: unknown;
  type: string;
  category: { key: string; name: string } | null;
  timeMode: "fixed_time" | "window" | "unscheduled";
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  originalScheduledStart: Date | null;
  durationMin: number | null;
  scheduling: "hard" | "soft";
  origin: string;
  doneAt: Date | null;
  deferredAt: Date | null;
  state: ItemState;
  notesPreflight: string | null;
  notesReflection: string | null;
  quantityUnit: string | null;
  quantityValue: number | null;
  reflectionAxes: string[];
  reflectionRatings: Record<string, number>;
  multitaskId: string | null;
  /**
   * The habit this came from is archived (cross-cutting §8.3). The item still
   * renders from its own snapshot; this is what puts *archived* beside the
   * type word so the absence of it in the library is explained rather than
   * puzzling.
   */
  habitArchived: boolean;
  /**
   * *From {template}* — USE-4's line on a template-derived item, which
   * explains why *Edit* and *Remove* are absent. Null on a one-off.
   */
  templateNameSnapshot: string | null;
  sessions: SessionView[];
  /** Seconds across every ENDED session — the store adds the running one. */
  loggedSec: number;
  /** Set while a session is open. */
  runningSince: Date | null;

  /* ---- UX v1.1 §6.3, §6.4 (DYN-15) ---- */
  /** Resolved, 1–7 — *Priority today*. */
  priority: number;
  /** A pin — the anchor glyph; *At* on the habit-day sheet reads it. */
  pinned: boolean;
  /** The habit's range, as information under *Takes* (R21); null without one. */
  habitRange: { min: number; max: number } | null;
  /** The *one of* group, with the other member named for the two-segment control. */
  alternates: { otherTitle: string; otherDurationMin: number } | null;
  dayBlockId: string | null;
  assignmentState: string;
};

export async function getItem(
  rls: RlsClient,
  userId: string,
  itemId: string,
  context: { todayKey: string; now: Date },
): Promise<ItemDetailView | null> {
  return rls.execute(async (tx) => {
    const [row] = await tx
      .select({
        id: dayItems.id,
        dayId: dayItems.dayId,
        habitId: dayItems.habitId,
        title: dayItems.title,
        icon: dayItems.icon,
        type: dayItems.type,
        timeMode: dayItems.timeMode,
        scheduledStart: dayItems.scheduledStart,
        scheduledEnd: dayItems.scheduledEnd,
        originalScheduledStart: dayItems.originalScheduledStart,
        durationMin: dayItems.durationMin,
        scheduling: dayItems.scheduling,
        origin: dayItems.origin,
        doneAt: dayItems.doneAt,
        deferredAt: dayItems.deferredAt,
        assignmentState: dayItems.assignmentState,
        completionState: dayItems.completionState,
        notesPreflight: dayItems.notesPreflight,
        notesReflection: dayItems.notesReflection,
        quantityUnit: dayItems.quantityUnit,
        quantityValue: dayItems.quantityValue,
        reflectionAxes: dayItems.reflectionAxes,
        reflectionRatings: dayItems.reflectionRatings,
        multitaskId: dayItems.multitaskId,
        templateNameSnapshot: dayItems.templateNameSnapshot,
        priority: dayItems.priority,
        pinned: dayItems.pinned,
        dayBlockId: dayItems.dayBlockId,
        templateSlotId: dayItems.templateSlotId,
        alternatesId: dayItems.alternatesId,
        habitArchivedAt: habits.archivedAt,
        habitMin: habits.durationMinMin,
        habitMax: habits.durationMaxMin,
        categoryName: categories.name,
        categoryKey: categories.colorKey,
        dayDate: days.date,
        dayTimezone: days.timezone,
        dayCloseTime: days.dayCloseTime,
        dayClosedAt: days.closedAt,
      })
      .from(dayItems)
      .innerJoin(days, eq(days.id, dayItems.dayId))
      .leftJoin(habits, eq(habits.id, dayItems.habitId))
      .leftJoin(categories, eq(categories.id, habits.categoryId))
      .where(and(eq(dayItems.id, itemId), eq(dayItems.userId, userId)))
      .limit(1);

    if (!row) return null;

    const sessionRows = await tx
      .select({
        id: timerSessions.id,
        startedAt: timerSessions.startedAt,
        endedAt: timerSessions.endedAt,
        source: timerSessions.source,
      })
      .from(timerSessions)
      .where(
        and(
          eq(timerSessions.dayItemId, row.id),
          eq(timerSessions.userId, userId),
        ),
      )
      .orderBy(asc(timerSessions.startedAt));

    const running = sessionRows.find((session) => session.endedAt === null);

    const loggedSec = sessionRows.reduce((total, session) => {
      if (session.endedAt === null) return total;
      return (
        total +
        Math.max(
          0,
          Math.floor(
            (session.endedAt.getTime() - session.startedAt.getTime()) / 1000,
          ),
        )
      );
    }, 0);

    const dayKey = String(row.dayDate);
    const mode = dayModeFor(dayKey, context.todayKey);

    const state = deriveItemState(
      {
        assignmentState: row.assignmentState,
        completionState: row.completionState,
        timeMode: row.timeMode,
        scheduledStart: row.scheduledStart,
        scheduledEnd: row.scheduledEnd,
        originalScheduledStart: row.originalScheduledStart,
        doneAt: row.doneAt,
        deferredAt: row.deferredAt,
        hasRunningSession: running !== undefined,
      },
      { closedAt: row.dayClosedAt, mode },
      context.now,
    );

    return {
      id: row.id,
      dayKey,
      mode,
      timezone: row.dayTimezone,
      dayCloseTime: row.dayCloseTime,
      habitId: row.habitId,
      title: row.title,
      icon: row.icon,
      type: row.type,
      category:
        row.categoryName && row.categoryKey
          ? { key: row.categoryKey, name: row.categoryName }
          : null,
      timeMode: row.timeMode,
      scheduledStart: row.scheduledStart,
      scheduledEnd: row.scheduledEnd,
      originalScheduledStart: row.originalScheduledStart,
      durationMin: row.durationMin,
      scheduling: row.scheduling,
      origin: row.origin,
      doneAt: row.doneAt,
      deferredAt: row.deferredAt,
      state,
      notesPreflight: row.notesPreflight,
      notesReflection: row.notesReflection,
      quantityUnit: row.quantityUnit,
      quantityValue:
        row.quantityValue === null ? null : Number(row.quantityValue),
      reflectionAxes: row.reflectionAxes,
      reflectionRatings: row.reflectionRatings,
      multitaskId: row.multitaskId,
      habitArchived: row.habitArchivedAt !== null,
      templateNameSnapshot: row.templateNameSnapshot,
      sessions: sessionRows,
      loggedSec,
      runningSince: running?.startedAt ?? null,
      priority: row.priority,
      pinned: row.pinned,
      habitRange:
        row.habitMin === null || row.habitMax === null
          ? null
          : { min: row.habitMin, max: row.habitMax },
      alternates: await otherMemberOf(tx, userId, row.templateSlotId, row.alternatesId),
      dayBlockId: row.dayBlockId,
      assignmentState: row.assignmentState,
    };
  });
}

/** The other member of an item's *one of* group, by its template slot (§6.3). */
async function otherMemberOf(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  templateSlotId: string | null,
  alternatesId: string | null,
): Promise<{ otherTitle: string; otherDurationMin: number } | null> {
  if (templateSlotId === null || alternatesId === null) return null;
  const [current] = await tx
    .select({ templateId: templateSlots.templateId, group: templateSlots.alternatesGroup })
    .from(templateSlots)
    .where(eq(templateSlots.id, templateSlotId))
    .limit(1);
  if (!current || current.group === null) return null;
  const [other] = await tx
    .select({ title: habits.title, durationMin: templateSlots.durationMin })
    .from(templateSlots)
    .innerJoin(habits, eq(habits.id, templateSlots.habitId))
    .where(
      and(
        eq(templateSlots.userId, userId),
        eq(templateSlots.templateId, current.templateId),
        eq(templateSlots.alternatesGroup, current.group),
        ne(templateSlots.id, templateSlotId),
      ),
    )
    .limit(1);
  return other ? { otherTitle: other.title, otherDurationMin: other.durationMin } : null;
}
