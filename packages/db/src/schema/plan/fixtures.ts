/**
 * fixtures — something that happens every week on set days at a set time
 * (UX v1.1 §3.6, §11.6, R27, TD-8). A stand-up on Tuesdays, football on
 * Thursdays.
 *
 * A FIXTURE BELONGS TO A WEEKDAY, NOT A TEMPLATE. It materialises on every
 * planned instance of its weekdays whatever template the day gets, as a
 * `day_items` row with `origin = fixture` and `pinned = true` in the block its
 * `block_kind` names; the quick-pick cannot remove it and the stack flows
 * around it. That is the whole reason it is not a template slot: a Tuesday
 * stand-up tied to whichever template Tuesday happens to get is the bug R27
 * exists to prevent.
 *
 * `weekdays` is a set, so a Mon/Wed/Fri class is one fixture. Mon = 0, as
 * everywhere. `habit_id` is optional — a fixture may point at a library habit
 * for its icon and category, and usually does not.
 *
 * THIS IS WHERE CALENDAR IMPORT LANDS (phase 2, P2-7): an imported event is a
 * fixture-shaped row with a `calendar_event_id`, added then.
 *
 * ARCHIVE, NEVER DELETE. A past day's pinned item snapshots the title.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { IconValue } from "@syn/types";

import { blockKindEnum, fixtureKindEnum, schedulingEnum } from "../enums";
import { habits } from "../library/habits";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

/**
 * The *other* kind's glyph — `FIXTURE_KINDS` in `@syn/constants` is the
 * living copy; this literal is the column default, copied once into 0007 as
 * history (the same arrangement as `DEFAULT_HABIT_ICON`).
 */
export const DEFAULT_FIXTURE_ICON: IconValue = { kind: "emoji", value: "📍" };

export const fixtures = pgTable(
  "fixtures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** The clock time it starts, in the person's zone. */
    atTime: time("at_time").notNull(),
    /** Which block it pins into — work or activity by v1.1 §4.4's sheet. */
    blockKind: blockKindEnum("block_kind").notNull().default("activity"),
    /** 1–480. */
    durationMin: smallint("duration_min").notNull(),
    /**
     * The fixture's glyph (UX v1.2 §3.6, R42, 0007) — the kind's default
     * unless the person chose one. Not null so `ItemIcon` never branches;
     * the default is the *other* kind's, the same object `FIXTURE_KINDS`
     * holds. JSON shape: IconValue.
     */
    icon: jsonb("icon").$type<IconValue>().notNull().default(DEFAULT_FIXTURE_ICON),
    /** A label and a default glyph and block — never a mechanic (UX v1.2 §3.6, 0007). */
    kind: fixtureKindEnum("kind").notNull().default("other"),
    /** Hard by default: a fixture is an appointment (v1.1 R22). */
    scheduling: schedulingEnum("scheduling").notNull().default("hard"),
    /** 1–60. */
    title: text("title").notNull(),
    /** Mon = 0 … Sun = 6; at least one. */
    weekdays: smallint("weekdays").array().notNull(),

    habitId: uuid("habit_id").references(() => habits.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("fixtures_user_id_archived_at_idx").on(
      table.userId,
      table.archivedAt,
    ),
    index("fixtures_user_id_idx").on(table.userId),
    index("fixtures_habit_id_idx").on(table.habitId),
    check(
      "fixtures_duration_min_check",
      sql`${table.durationMin} BETWEEN 1 AND 480`,
    ),
    check(
      "fixtures_title_check",
      sql`length(${table.title}) BETWEEN 1 AND 60`,
    ),
    check(
      "fixtures_weekdays_check",
      sql`cardinality(${table.weekdays}) >= 1 AND (${table.weekdays} <@ ARRAY[0,1,2,3,4,5,6]::smallint[])`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "fixtures",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const fixturesRelations = relations(fixtures, ({ one }) => ({
  habit: one(habits, {
    fields: [fixtures.habitId],
    references: [habits.id],
  }),
  user: one(users, {
    fields: [fixtures.userId],
    references: [users.id],
  }),
}));
