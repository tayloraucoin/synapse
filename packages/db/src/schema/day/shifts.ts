/**
 * shifts — one "shift my day forward" event (official spec §3.9, §5.6).
 *
 * One row per shift, so the Day Review can say "shifted 60 min at 8:10 — slept
 * in". A shift is undoable for ten minutes (cross-cutting §8.1); after that it
 * is a fact, and the only way past it is another shift, which is also
 * recorded.
 *
 * NO `cut_item_ids[]` COLUMN. Official §3.9 lists one; a cut item is instead a
 * `day_items` row with `assignment_state = cut_by_shift` and a `misses` row
 * whose `shift_id` points here. Normalised, so the Day Review's *Change* on a
 * cut item edits one row and this shift's own record stays untouched (Epic 3
 * DR-05). See the Epic 1 DEVIATIONS line.
 *
 * `reason_key` is text rather than a foreign key for the same reason it is on
 * `misses`: an archived or renamed reason must never rewrite a past record.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { missTierEnum } from "../enums";
import { days } from "../plan/days";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const shifts = pgTable(
  "shifts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** When the shift was made. */
    at: timestamp("at", { withTimezone: true }).notNull(),
    /** 5–600 minutes (§5.6). */
    deltaMin: smallint("delta_min").notNull(),
    /** A `reasons.key` — text, so an archived reason keeps this record honest. */
    reasonKey: text("reason_key"),
    /** ≤ 80, behind *Other*. */
    reasonText: text("reason_text"),
    tier: missTierEnum("tier").notNull(),

    dayId: uuid("day_id")
      .notNull()
      .references(() => days.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("shifts_day_id_at_idx").on(table.dayId, table.at),
    index("shifts_user_id_idx").on(table.userId),
    check("shifts_delta_min_check", sql`${table.deltaMin} BETWEEN 5 AND 600`),
    ...ownerPrivateCrudPolicies({
      prefix: "shifts",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const shiftsRelations = relations(shifts, ({ one }) => ({
  day: one(days, {
    fields: [shifts.dayId],
    references: [days.id],
  }),
  user: one(users, {
    fields: [shifts.userId],
    references: [users.id],
  }),
}));
