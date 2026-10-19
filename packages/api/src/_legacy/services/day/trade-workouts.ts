import { eq } from "drizzle-orm";

import { dayItems, type RlsClient } from "@syn/db";
import { weekdayForDayKey } from "@syn/utils";

import {
  ensureTrainingBlock,
  habitItem,
  readHabits,
  typicalWorkoutFor,
  workoutLength,
  type HabitLite,
} from "./confirm-day";
import { readDay, readDayProfile, type BlockRow, type Tx } from "./materialize-day";
import { isUntouchedItem } from "./untouched";

/**
 * The training swap in the week build — UX v1.1 §4.13, R25 (DYN-12):
 * "dragging Push from Monday onto Tuesday shows one confirm line — Trade with
 * Tuesday's pull? — Trade · Cancel."
 *
 * THIS IS `confirmDay`'S TRADE, BEFORE THE PICK. The quick-pick's trade
 * (`resolveTraining`) writes the other day's workout item so the rotation's
 * counts stay true; this writes both days' items the same way, from the week
 * build, on days nobody has set yet. The rows are the same rows: the
 * quick-pick reads a day's workout from its training block's item before it
 * falls back to the rotation's typical one, so a traded Monday asks
 * *Monday's is pull — still?*.
 *
 * A SET DAY IS A RECORD. Either day confirmed → `TradeRuleError("day_set")`
 * with the weekday, and nothing is written. A touched workout item (started,
 * done, moved) is left alone for the same reason; the trade then reports
 * `traded: false` rather than half-swapping.
 */

export class TradeRuleError extends Error {
  readonly code: "day_set" | "nothing_to_trade";
  readonly detail: string | null;
  constructor(code: TradeRuleError["code"], detail: string | null = null) {
    super(code);
    this.name = "TradeRuleError";
    this.code = code;
    this.detail = detail;
  }
}

/** A day's workout as the week build sees it: its item, else the rotation's. */
async function workoutOn(
  tx: Tx,
  userId: string,
  date: string,
  blocks: readonly BlockRow[],
): Promise<HabitLite | null> {
  const training = blocks.find((row) => row.kind === "training");
  const item = training?.items.find((row) => row.type === "workout");
  if (item?.habitId) {
    const found = (await readHabits(tx, userId, [item.habitId])).get(item.habitId);
    if (found) return found;
  }
  return typicalWorkoutFor(tx, userId, date);
}

async function writeWorkout(
  tx: Tx,
  userId: string,
  dayId: string,
  blocks: readonly BlockRow[],
  workout: HabitLite,
): Promise<boolean> {
  const training = blocks.find((row) => row.kind === "training");
  if (!training) return false;
  const existing = training.items.find((row) => row.type === "workout");
  const values = habitItem(workout, {
    durationMin: workoutLength(workout),
    sortOrder: 0,
    snapshot: null,
  });
  if (existing) {
    if (!isUntouchedItem(existing)) return false;
    await tx
      .update(dayItems)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(dayItems.id, existing.id));
    return true;
  }
  await tx.insert(dayItems).values({ ...values, userId, dayId, dayBlockId: training.id });
  return true;
}

export async function tradeWorkouts(
  rls: RlsClient,
  userId: string,
  date: string,
  withDate: string,
): Promise<{ traded: boolean }> {
  if (date === withDate) return { traded: false };

  return rls.execute(async (tx) => {
    const [mine, theirs] = await Promise.all([
      readDay(tx, userId, date),
      readDay(tx, userId, withDate),
    ]);
    if (mine?.confirmedAt) throw new TradeRuleError("day_set", weekdayForDayKey(date));
    if (theirs?.confirmedAt) throw new TradeRuleError("day_set", weekdayForDayKey(withDate));

    const profile = await readDayProfile(tx, userId);
    const myBlocks = await ensureTrainingBlock(tx, userId, profile, date);
    const theirBlocks = await ensureTrainingBlock(tx, userId, profile, withDate);

    const myWorkout = await workoutOn(tx, userId, date, myBlocks);
    const theirWorkout = await workoutOn(tx, userId, withDate, theirBlocks);
    if (myWorkout === null && theirWorkout === null) {
      throw new TradeRuleError("nothing_to_trade");
    }

    // Both days exist after `ensureTrainingBlock`; read their ids afresh.
    const myDay = await readDay(tx, userId, date);
    const theirDay = await readDay(tx, userId, withDate);
    if (!myDay || !theirDay) return { traded: false };

    let traded = true;
    if (theirWorkout !== null) {
      traded = (await writeWorkout(tx, userId, myDay.id, myBlocks, theirWorkout)) && traded;
    }
    if (myWorkout !== null) {
      traded = (await writeWorkout(tx, userId, theirDay.id, theirBlocks, myWorkout)) && traded;
    }
    return { traded };
  });
}
