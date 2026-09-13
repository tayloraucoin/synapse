import { and, eq, sql } from "drizzle-orm";

import { days, journalEntries, users, type RlsClient } from "@syn/db";
import type { JournalEntryView, JournalPrompt } from "@syn/types";
import { addDays } from "@syn/utils";

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
  });

  return getJournalEntry(rls, userId, input.date);
}
