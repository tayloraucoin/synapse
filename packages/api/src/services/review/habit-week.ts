import { and, asc, eq, inArray } from "drizzle-orm";

import { dayItems, days, reasons, type RlsClient } from "@syn/db";
import type { IconValue, MissTier } from "@syn/types";
import {
  computeAdherence,
  mondayOf,
  stripStateFor,
  weekDates,
  weekKeyOf,
  type StripSquare,
} from "@syn/utils";

import { readMisses, toScoredItems } from "./to-scored";

/**
 * WR-02 — one habit's week, day by day, plus the four-week fact.
 *
 * THE FOUR-WEEK LINE IS ONE MORE `computeAdherence`, over four weeks' items at
 * once — never an average of four weekly percents, for the same reason a week
 * is not an average of seven daily ones (REV-1): a week with two assignments
 * and a week with fourteen are not equal halves of a month.
 *
 * IT IS A FACT, NOT A TREND. *Last 4 weeks: 9 of 12* is a count. There is no
 * arrow, no comparison to the previous four, and no sentence about direction —
 * the reader draws the conclusion, which is the whole posture of this epic.
 *
 * EVERY LABEL COMES FROM THE ITEM'S SNAPSHOT. A habit archived or renamed
 * mid-week still draws its row with the words that were true on the day.
 */

export type HabitDayOutcome = {
  date: string;
  /** Null on a day the habit was not assigned. */
  itemId: string | null;
  state: StripSquare;
  scheduledStart: Date | null;
  doneAt: Date | null;
  originalScheduledStart: Date | null;
  minutes: number | null;
  quantityUnit: string | null;
  quantityValue: number | null;
  /** The miss's words, when there is one. */
  reasonLabel: string | null;
  tier: MissTier | null;
  tradedUpTitle: string | null;
  cutByShift: boolean;
  verdict: "not-counted" | "half" | "missed" | "pending" | null;
};

export type HabitWeekView = {
  habitId: string;
  title: string;
  icon: IconValue;
  days: HabitDayOutcome[];
  strip: StripSquare[];
  credit: number;
  counted: number;
  lastFourWeeks: { credit: number; counted: number };
};

const WEEKS_BACK = 4;

export async function getHabitWeek(
  rls: RlsClient,
  userId: string,
  weekKey: string,
  habitId: string,
): Promise<HabitWeekView | null> {
  const dates = weekDates(weekKey);

  // Four weeks ending with this one — the fact line's window.
  const monday = dates[0] ?? "";
  const fourWeekDates: string[] = [];
  for (let back = 0; back < WEEKS_BACK; back += 1) {
    const start = shiftWeeks(monday, -back);
    fourWeekDates.push(...weekDates(weekKeyFromMonday(start)));
  }

  const raw = await rls.execute(async (tx) => {
    const dayRows = await tx
      .select({ id: days.id, date: days.date, reviewedAt: days.reviewedAt })
      .from(days)
      .where(and(eq(days.userId, userId), inArray(days.date, fourWeekDates)))
      .orderBy(asc(days.date));

    const dayIds = dayRows.map((row) => row.id);
    if (dayIds.length === 0) return { dayRows, items: [], labels: [] };

    const items = await tx
      .select({
        id: dayItems.id,
        dayId: dayItems.dayId,
        habitId: dayItems.habitId,
        title: dayItems.title,
        icon: dayItems.icon,
        priority: dayItems.priority,
        durationMin: dayItems.durationMin,
        timeMode: dayItems.timeMode,
        scheduledStart: dayItems.scheduledStart,
        scheduledEnd: dayItems.scheduledEnd,
        originalScheduledStart: dayItems.originalScheduledStart,
        doneAt: dayItems.doneAt,
        deferredAt: dayItems.deferredAt,
        assignmentState: dayItems.assignmentState,
        completionState: dayItems.completionState,
        quantityUnit: dayItems.quantityUnit,
        quantityValue: dayItems.quantityValue,
      })
      .from(dayItems)
      .where(
        and(
          eq(dayItems.userId, userId),
          eq(dayItems.habitId, habitId),
          inArray(dayItems.dayId, dayIds),
        ),
      );

    const labels = await tx
      .select({ key: reasons.key, label: reasons.label })
      .from(reasons)
      .where(eq(reasons.userId, userId));

    return { dayRows, items, labels };
  });

  if (raw.items.length === 0) return null;

  const missRows = await readMisses(
    rls,
    userId,
    raw.items.map((item) => item.id),
  );
  const scored = await toScoredItems(rls, userId, raw.items, missRows);
  const verdicts = computeAdherence(scored).perItem;

  const labelByKey = new Map(raw.labels.map((row) => [row.key, row.label]));
  const missByItem = new Map(missRows.map((miss) => [miss.dayItemId, miss]));
  const dateByDayId = new Map(
    raw.dayRows.map((row) => [row.id, String(row.date)]),
  );
  const reviewedDayIds = new Set(
    raw.dayRows.filter((row) => row.reviewedAt !== null).map((row) => row.id),
  );

  const titleById = new Map(raw.items.map((item) => [item.id, item.title]));

  const thisWeek = raw.items.filter((item) =>
    dates.includes(dateByDayId.get(item.dayId) ?? ""),
  );

  const byDate = new Map(
    thisWeek.map((item) => [dateByDayId.get(item.dayId) ?? "", item]),
  );

  const strip: StripSquare[] = dates.map((date) => {
    const item = byDate.get(date);
    if (item === undefined) return "not-assigned";
    return stripStateFor(verdicts[item.id]?.verdict ?? null);
  });

  const days7: HabitDayOutcome[] = dates.map((date) => {
    const item = byDate.get(date);
    if (item === undefined) {
      return {
        date,
        itemId: null,
        state: "not-assigned",
        scheduledStart: null,
        doneAt: null,
        originalScheduledStart: null,
        minutes: null,
        quantityUnit: null,
        quantityValue: null,
        reasonLabel: null,
        tier: null,
        tradedUpTitle: null,
        cutByShift: false,
        verdict: null,
      };
    }

    const miss = missByItem.get(item.id) ?? null;
    const verdict = verdicts[item.id]?.verdict ?? null;

    return {
      date,
      itemId: item.id,
      state: stripStateFor(verdict),
      scheduledStart: item.scheduledStart,
      doneAt: item.doneAt,
      originalScheduledStart: item.originalScheduledStart,
      minutes: item.durationMin,
      quantityUnit: item.quantityUnit,
      quantityValue:
        item.quantityValue === null ? null : Number(item.quantityValue),
      /*
       * `readMisses` returns the key, not the free text — the resolver has no
       * use for words. An *Other* reason therefore shows no label here rather
       * than a wrong one; WR-02 falls back to the tier's phrase, which is the
       * fact that actually decided the score.
       */
      reasonLabel:
        miss?.reasonKey == null
          ? null
          : (labelByKey.get(miss.reasonKey) ?? null),
      tier: miss?.tier ?? null,
      tradedUpTitle:
        miss?.tradedUpItemId == null
          ? null
          : (titleById.get(miss.tradedUpItemId) ?? null),
      // The row says it was cut; the shift's own size is WR-04's to report.
      cutByShift: item.assignmentState === "cut_by_shift",
      verdict:
        verdict === "not-counted" ||
        verdict === "half" ||
        verdict === "missed" ||
        verdict === "pending"
          ? verdict
          : null,
    };
  });

  const creditOver = (rows: typeof raw.items) =>
    rows.reduce(
      (acc, item) => {
        if (!reviewedDayIds.has(item.dayId)) return acc;
        const credit = verdicts[item.id]?.credit ?? null;
        if (credit === null) return acc;
        return { credit: acc.credit + credit, counted: acc.counted + 1 };
      },
      { credit: 0, counted: 0 },
    );

  const first = raw.items[0];

  return {
    habitId,
    title: first?.title ?? "",
    icon: first?.icon as IconValue,
    days: days7,
    strip,
    ...creditOver(thisWeek),
    lastFourWeeks: creditOver(raw.items),
  };
}

/** `YYYY-MM-DD` of the Monday `n` weeks from the given Monday. */
function shiftWeeks(monday: string, weeks: number): string {
  const [y = "0", m = "1", d = "1"] = monday.split("-");
  const at = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  at.setUTCDate(at.getUTCDate() + weeks * 7);
  return at.toISOString().slice(0, 10);
}

/** The ISO week a Monday belongs to — `mondayOf` is idempotent on one. */
function weekKeyFromMonday(monday: string): string {
  return weekKeyOf(mondayOf(monday));
}
