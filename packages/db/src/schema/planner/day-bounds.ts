/**
 * day_bounds — a day's Up at and Lights out (N2, Set my days). A row is a
 * weekday's usual (Monday 0, as `RepeatRule.weekdays`) or one date's own
 * controls, never both (`day_bounds_weekday_or_on_date_check`). A date's row
 * wins over its weekday's. Orient sits at Up at.
 *
 * One row per user per weekday and per date: the two unique keys. Lights out
 * is after Up at on the same day (`day_bounds_lights_out_after_up_at_check`).
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  pgTable,
  smallint,
  time,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const dayBounds = pgTable(
  "day_bounds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    lightsOut: time("lights_out").notNull(),
    /** This week's one date; null on a weekday's usual. */
    onDate: date("on_date"),
    upAt: time("up_at").notNull(),
    /** Monday 0 to Sunday 6; null on a date's own row. */
    weekday: smallint("weekday"),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    check(
      "day_bounds_weekday_or_on_date_check",
      sql`num_nonnulls(${table.weekday}, ${table.onDate}) = 1`,
    ),
    check("day_bounds_weekday_check", sql`${table.weekday} BETWEEN 0 AND 6`),
    check(
      "day_bounds_lights_out_after_up_at_check",
      sql`${table.lightsOut} > ${table.upAt}`,
    ),
    unique("day_bounds_user_id_weekday_key").on(table.userId, table.weekday),
    unique("day_bounds_user_id_on_date_key").on(table.userId, table.onDate),
    index("day_bounds_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "day_bounds",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const dayBoundsRelations = relations(dayBounds, ({ one }) => ({
  user: one(users, {
    fields: [dayBounds.userId],
    references: [users.id],
  }),
}));
