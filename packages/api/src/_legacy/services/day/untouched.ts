import { and, eq, isNull, not, notExists, sql, type SQL } from "drizzle-orm";

import { dayItems, misses, timerSessions } from "@syn/db";

/**
 * "Untouched" — the one predicate that decides what materialisation may
 * rewrite.
 *
 * THIS IS THE TICKET. Everything else in SET-6 is plumbing around one promise:
 * *a record is annotated, never rewritten* (cross-cutting §8). An item is
 * untouched only while nobody has done anything to it — not started it, not
 * finished it, not deferred it, not attributed a miss to it — and only on a
 * day that has not closed. Anything else is a record, and materialisation
 * leaves it exactly as it is.
 *
 * WHY BOTH FORMS. The SQL fragment is what the write paths filter on, so the
 * database decides; the TypeScript predicate is what the caller counts with,
 * so it can say *Applied to 3 days*. They are written next to each other on
 * purpose — two definitions of "untouched" that drifted apart would erase
 * someone's morning, quietly, on the second re-apply.
 */

/**
 * The TypeScript half, over a row already joined with its session and miss
 * counts. Kept as a function of plain fields so a caller can apply it to rows
 * it read for another reason.
 */
export type TouchableRow = {
  assignmentState: string;
  completionState: string;
  deferredAt: Date | null;
  doneAt: Date | null;
  sessionCount: number;
  missCount: number;
};

export function isUntouchedItem(row: TouchableRow): boolean {
  return (
    row.assignmentState === "assigned" &&
    row.completionState === "upcoming" &&
    row.deferredAt === null &&
    row.doneAt === null &&
    row.sessionCount === 0 &&
    row.missCount === 0
  );
}

/**
 * The block-level predicate — UX v1.1 §11.7, TD-2 (DYN-5).
 *
 * A block is untouched while every item in it is untouched AND nobody has set
 * the day: `original_scheduled_start` on a block is written by confirm alone,
 * so a confirmed block is touched by definition. The materialiser may delete
 * or re-point an untouched block; a touched one keeps its rows and, at most,
 * loses its template link — the same shape as an item.
 */
export type TouchableBlock = {
  originalScheduledStart: Date | null;
  items: ReadonlyArray<TouchableRow>;
};

export function isUntouchedBlock(block: TouchableBlock): boolean {
  return (
    block.originalScheduledStart === null && block.items.every(isUntouchedItem)
  );
}

/**
 * The two sub-selects the SQL half needs, as reusable fragments.
 *
 * THE PARENTHESES ARE LOAD-BEARING. `notExists()` renders `not exists ` and
 * then its argument verbatim: given a subquery builder it supplies its own
 * brackets, but given a raw `sql` template it does not, and the result is
 * `not exists SELECT 1 FROM ...` — a syntax error Postgres rejects outright.
 * Found by rendering the query with `toSQL()`, not by reading it.
 */
export const hasNoTimerSession = notExists(
  sql`(SELECT 1 FROM ${timerSessions} WHERE ${timerSessions.dayItemId} = ${dayItems.id})`,
);

export const hasNoMiss = notExists(
  sql`(SELECT 1 FROM ${misses} WHERE ${misses.dayItemId} = ${dayItems.id})`,
);

/**
 * The whole predicate, for a `where` clause.
 *
 * The return type is narrowed to `SQL`. Drizzle types `and()` as possibly
 * undefined because it is undefined for an empty argument list; this list is
 * six conditions long and written here, so the caller does not have to prove
 * that again at every call site — and `touchedWhere` below could not negate an
 * optional at all.
 */
export function untouchedWhere(): SQL {
  return and(
    eq(dayItems.assignmentState, "assigned"),
    eq(dayItems.completionState, "upcoming"),
    isNull(dayItems.deferredAt),
    isNull(dayItems.doneAt),
    hasNoTimerSession,
    hasNoMiss,
  ) as SQL;
}

/**
 * Its complement — the rows materialisation must leave alone.
 *
 * It is `NOT (untouched)` rather than its own list of conditions, so the two
 * halves cannot drift: every column the untouched predicate gains is a column
 * this one gains in the same edit. Each condition compares a value or a NULL
 * check, never producing an SQL NULL, so the negation is total.
 */
export function touchedWhere(): SQL {
  return not(untouchedWhere());
}
