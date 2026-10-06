import { and, eq, inArray, sql } from "drizzle-orm";

import { dayBlocks, dayItems, days, journalEntries, templateSlots, users, type RlsClient } from "@syn/db";
import type { JournalEntryView, JournalPrompt, QuoteView } from "@syn/types";
import { addDays } from "@syn/utils";

import { quoteSlotFor } from "./reading";

/**
 * The journal — UX v1.1 §7.2, §11.10 (TD-7).
 *
 * ONE KEY PER SAVE, MERGED. The screen autosaves each field as the person
 * pauses; `saveJournalAnswer` upserts the day's one row and merges the key
 * (`answers || excluded.answers`), so a field written from one device never
 * overwrites a different field written from another. An emptied field is
 * stored as an empty string, which the readers treat as absent: the row is
 * the day's, and a day with a row and nothing in it is still nothing.
 *
 * A JOURNAL IS WRITTEN ON ITS DAY OR AFTER, never ahead: the orient frame
 * reads the past, and a line written for a day that has not happened would
 * be read back before it was lived.
 *
 * `days` ROW ON DEMAND. A person can journal on a day that was never planned
 * (an unstructured Sunday with no items yet); the row is created with the
 * account's current zone and close time, as the materialiser does.
 */

export class JournalRuleError extends Error {
  readonly code: "future_day";
  constructor(code: JournalRuleError["code"]) {
    super(code);
    this.name = "JournalRuleError";
    this.code = code;
  }
}

/**
 * The journal's close — UX v1.3 R54, §7.2 (DAY-6). After the last line, on a
 * quote-day with the bank opted in, the SAME quote the morning showed for
 * that date (`quoteSlotFor`, the one arithmetic the frame uses); `null` on a
 * passage-day or with the bank off. The app never speaks it and nothing about
 * the entries chooses it — *keyed to the entries* is phase 2 (P2-18).
 */
export async function readJournalClose(
  rls: RlsClient,
  userId: string,
  date: string,
): Promise<{ quote: QuoteView | null }> {
  const slot = await rls.execute((tx) => quoteSlotFor(tx, userId, date));
  return { quote: slot.quoteToday ? slot.quote : null };
}

async function promptsFor(
  rls: RlsClient,
  userId: string,
): Promise<JournalPrompt[]> {
  const rows = await rls.execute((tx) =>
    tx
      .select({ journalPrompts: users.journalPrompts })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
  );
  return rows[0]?.journalPrompts ?? [];
}

export async function getJournalEntry(
  rls: RlsClient,
  userId: string,
  date: string,
): Promise<JournalEntryView> {
  const prompts = await promptsFor(rls, userId);
  const rows = await rls.execute((tx) =>
    tx
      .select({ answers: journalEntries.answers })
      .from(journalEntries)
      .innerJoin(days, eq(days.id, journalEntries.dayId))
      .where(and(eq(journalEntries.userId, userId), eq(days.date, date)))
      .limit(1),
  );
  return { date, answers: rows[0]?.answers ?? {}, prompts };
}

/**
 * The entry for the day before `todayKey` — "last night" in the person's own
 * day boundaries (a line written at 00:30 on Tuesday is Monday's).
 */
export async function getLastNight(
  rls: RlsClient,
  userId: string,
  todayKey: string,
): Promise<JournalEntryView> {
  return getJournalEntry(rls, userId, addDays(todayKey, -1));
}

export async function saveJournalAnswer(
  rls: RlsClient,
  userId: string,
  input: { date: string; key: string; value: string },
  context: { todayKey: string; timeZone: string; dayCloseTime: string },
): Promise<JournalEntryView> {
  if (input.date > context.todayKey) {
    throw new JournalRuleError("future_day");
  }

  await rls.execute(async (tx) => {
    const [existing] = await tx
      .select({ id: days.id })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, input.date)))
      .limit(1);

    let dayId = existing?.id;
    if (dayId === undefined) {
      const [account] = await tx
        .select({ usualWakeTime: users.usualWakeTime })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      const [created] = await tx
        .insert(days)
        .values({
          userId,
          date: input.date,
          anchorTime: account?.usualWakeTime ?? "07:00",
          timezone: context.timeZone,
          dayCloseTime: context.dayCloseTime,
        })
        .returning({ id: days.id });
      if (!created) throw new Error("day insert returned no row");
      dayId = created.id;
    }

    const [before] = await tx
      .select({ answers: journalEntries.answers })
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.dayId, dayId)))
      .limit(1);
    const hadText = Object.values(before?.answers ?? {}).some((value) => value.trim() !== "");

    const patch = { [input.key]: input.value };
    await tx
      .insert(journalEntries)
      .values({ userId, dayId, answers: patch })
      .onConflictDoUpdate({
        target: journalEntries.dayId,
        set: {
          answers: sql`${journalEntries.answers} || ${JSON.stringify(patch)}::jsonb`,
          updatedAt: new Date(),
        },
      });

    await syncJournalItem(tx, userId, dayId, hadText);
  });

  return getJournalEntry(rls, userId, input.date);
}

/**
 * The wind-down *Journal* row ticks itself — UX v1.1 §7.2 (DYN-18): "The row
 * in the wind-down section ticks itself when any field has text." Done when
 * any answer is non-empty, cleared when the last text goes — but a row the
 * person ticked by hand with nothing written is theirs and is left alone:
 * the clear runs only on the save that took the entry from text to none.
 *
 * THE ROW IS RECOGNISED THE WAY THE MATERIALISER PLACES IT (`markerPosition`):
 * the wind-down block's closer, else the item titled *journal*. The closer
 * is a template slot's role, so the block's items are matched to their slots.
 */
export async function syncJournalItem(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  dayId: string,
  hadText: boolean,
): Promise<void> {
  const [entry] = await tx
    .select({ answers: journalEntries.answers })
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), eq(journalEntries.dayId, dayId)))
    .limit(1);
  const hasText = Object.values(entry?.answers ?? {}).some((value) => value.trim() !== "");

  const [block] = await tx
    .select({ id: dayBlocks.id })
    .from(dayBlocks)
    .where(and(eq(dayBlocks.userId, userId), eq(dayBlocks.dayId, dayId), eq(dayBlocks.kind, "wind_down")))
    .limit(1);
  if (!block) return;

  const rows = await tx
    .select({
      id: dayItems.id,
      title: dayItems.title,
      templateSlotId: dayItems.templateSlotId,
      doneAt: dayItems.doneAt,
      completionState: dayItems.completionState,
    })
    .from(dayItems)
    .where(and(eq(dayItems.userId, userId), eq(dayItems.dayBlockId, block.id)));

  let journal = rows.find((row) => row.title.trim().toLowerCase() === "journal") ?? null;
  if (journal === null) {
    const slotIds = rows.map((row) => row.templateSlotId).filter((id): id is string => id !== null);
    if (slotIds.length > 0) {
      const closers = await tx
        .select({ id: templateSlots.id })
        .from(templateSlots)
        .where(and(inArray(templateSlots.id, slotIds), eq(templateSlots.role, "closer")));
      const closerIds = new Set(closers.map((slot) => slot.id));
      journal = rows.find((row) => row.templateSlotId !== null && closerIds.has(row.templateSlotId)) ?? null;
    }
  }
  if (journal === null) return;

  const now = new Date();
  if (hasText && journal.doneAt === null && journal.completionState !== "done") {
    await tx
      .update(dayItems)
      .set({ completionState: "done", doneAt: now, updatedAt: now })
      .where(eq(dayItems.id, journal.id));
  } else if (hadText && !hasText && journal.doneAt !== null && journal.completionState === "done") {
    // The save that cleared the last field un-writes the tick it made.
    await tx
      .update(dayItems)
      .set({ completionState: "upcoming", doneAt: null, updatedAt: now })
      .where(eq(dayItems.id, journal.id));
  }
}
