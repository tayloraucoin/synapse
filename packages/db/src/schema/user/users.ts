/**
 * users.ts — the shadow of `auth.users`.
 *
 * Supabase owns `auth.users`. This row is created by the `handle_new_user()`
 * trigger, never by the app, and its primary key IS the foreign key to the
 * auth row: one identity, two schemas, no drift. Deleting the auth user
 * cascades this row away, which is how account deletion (Epic 1 ST-10a)
 * removes everything a person has.
 *
 * WHAT IS NOT HERE. Official spec §3.1 also lists `notification_prefs` and
 * `avatar`; both are satellite tables (`notification_prefs`, `user_avatars`),
 * because both are lists rather than scalars.
 *
 * THERE IS NO WAKE ANCHOR (UX v1.1 R11). v1.0 kept `wake_anchor_habit_id`
 * here (SET-1); the orient frame is the wake moment since DYN-13 and the
 * column is gone since `0006` (DYN-21). `days.woke_at_source = anchor` stays
 * on rows written under v1.0.
 *
 * THE PENDING PAIR (SET-1). A time-zone switch and a day-close change take
 * effect FROM TOMORROW (cross-cutting §7.3, §7.5), so writing them straight to
 * `timezone` / `day_close_time` would reclassify "now" the moment they were
 * saved — change the close from 03:00 to 05:00 at 04:00 and today's date flips
 * backwards. The four `pending_*` columns hold the new value and the date it
 * starts; `services/user/preferences.ts` applies and clears the pair on read,
 * and the scheduler's per-user pass does the same so the switch happens even
 * if the app is never opened.
 *
 * THE v1.1 PROFILE (UX v1.1 §11.2, migration 0005). The shape of the week
 * (`schedule_shape`, `work_days`, `work_start_time`, `work_end_time`,
 * `anchor_direction`), the wake range (`earliest_wake_time`), the evening
 * (`lights_out_time`, `devices_off_time`), the overflow mode, the orient
 * frame's three settings, the journal's switch and prompts, and the block
 * order. These are the anchors the materialiser lays every block out from;
 * a template no longer carries its own (TD-1).
 *
 * THE v1.2 ADDITIONS (UX v1.2 §11.1, migration 0007). How mornings go
 * (`morning_mode`, R37), the quote opt-in (`quotes_opt_in`, R36), the two
 * further morning lines (`orient_ask_intention`, `orient_ask_visualisation`),
 * and the journal reminder (`journal_reminder_enabled`, `journal_reminder_time`,
 * R38). Three v1.1 columns stop being written under v1.2 — `earliest_wake_time`
 * (R39), `orient_passage` (copied into `passages` by 0007) and
 * `orient_show_last_night` (R41) — and are dropped in `0008`, never in the
 * migration that adds their replacements.
 *
 * POLICIES. Select and update are the owner's alone. Insert and delete are
 * denied to the authenticated role outright: the trigger inserts, and deletion
 * goes through `auth.admin.deleteUser` and cascades. There is no admin read.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import type { BlockKind, JournalPrompt, WorkDays } from "@syn/types";

import { authUsers } from "../auth";
import { categories } from "../library/categories";
import { habits } from "../library/habits";
import { reasons } from "../library/reasons";
import { notificationPrefs } from "../notification/notification-prefs";
import { webPushSubscriptions } from "../notification/web-push-subscriptions";
import { days } from "../plan/days";
import { templates } from "../plan/templates";
import { denyAuthenticated, isOwner } from "../rls/helpers";
import {
  anchorDirectionEnum,
  morningModeEnum,
  overflowModeEnum,
  scheduleShapeEnum,
} from "./enums";
import { userAvatars } from "./user-avatars";

/**
 * The column defaults for the two jsonb settings — copied once into 0005 as
 * history; `@syn/constants` (`DEFAULT_BLOCK_ORDER`, `DEFAULT_JOURNAL_PROMPTS`)
 * is the living copy and the seed reads from there.
 */
const DEFAULT_BLOCK_ORDER_LITERAL: BlockKind[] = [
  "orient",
  "morning",
  "prep",
  "work",
  "activity",
  "wind_down",
];

const DEFAULT_JOURNAL_PROMPTS_LITERAL: JournalPrompt[] = [
  { key: "day_went", label: "How the day went" },
  { key: "gratitude_today", label: "Grateful for today" },
  { key: "gratitude_life", label: "Grateful for, in life" },
  { key: "looking_forward", label: "Looking forward to" },
  { key: "make_happen_tomorrow", label: "What I want to make happen tomorrow" },
  { key: "visualisation", label: "Tomorrow, as I see it" },
];

/**
 * The Appearance setting (Epic 1 ST-09). One table uses it, so it lives here
 * rather than in the root enums file. The three values are next-themes' own,
 * so the stored preference and the control speak the same words.
 */
export const themePreferenceEnum = pgEnum("theme_preference", [
  "system",
  "light",
  "dark",
]);

export const users = pgTable(
  "users",
  {
    // The PK *is* the FK to auth.users(id). Cascade so deleting the auth user
    // removes the shadow row. Populated by handle_new_user(), not the app.
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // UX v1.1 §3.3 — "when your morning runs long, what gives?" (0005).
    anchorDirection: anchorDirectionEnum("anchor_direction"),
    // UX v1.1 §3.1 — the person's order for the six non-placeable kinds (0005).
    // JSON shape: BlockKind[] — see @syn/types.
    blockOrder: jsonb("block_order")
      .$type<BlockKind[]>()
      .notNull()
      .default(DEFAULT_BLOCK_ORDER_LITERAL),
    // A day opens at this wall-clock time and closes at the next one (§6.1).
    dayCloseTime: time("day_close_time").notNull().default("03:00"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    // UX v1.1 §7.1 — *Phone away*; a pin in the wind-down routine (0005).
    devicesOffTime: time("devices_off_time"),
    // What the app calls you. 1–40 (Epic 1 §9).
    displayName: text("display_name"),
    // UX v1.1 §4.5 — the wake range's early end; informational in v1.1 (0005).
    earliestWakeTime: time("earliest_wake_time"),
    // Mirrored from auth.users by handle_user_email_sync().
    email: text("email"),
    // Which first-run step to resume at; null once first run is done.
    firstRunStep: smallint("first_run_step"),
    firstRunCompletedAt: timestamp("first_run_completed_at", {
      withTimezone: true,
    }),
    // UX v1.1 §7.2 — *A few lines at night* (0005).
    journalEnabled: boolean("journal_enabled").notNull().default(true),
    // UX v1.2 §9 N2, R38 — the journal reminder's switch; on by default (0007).
    journalReminderEnabled: boolean("journal_reminder_enabled").notNull().default(true),
    // UX v1.2 §4.11 — the reminder's time; null = derived, phone away − 60 (0007).
    journalReminderTime: time("journal_reminder_time"),
    // UX v1.1 §7.2, TD-7 — the person's prompts, ordered, keyed stably (0005).
    // JSON shape: JournalPrompt[] — see @syn/types.
    journalPrompts: jsonb("journal_prompts")
      .$type<JournalPrompt[]>()
      .notNull()
      .default(DEFAULT_JOURNAL_PROMPTS_LITERAL),
    // UX v1.1 §7.1 — the wind-down routine flows backward to this (0005).
    lightsOutTime: time("lights_out_time"),
    // UX v1.2 R37, TD-17 — set from the plan, or build each morning (0007).
    morningMode: morningModeEnum("morning_mode").notNull().default("set_from_plan"),
    // UX v1.1 §5.2 — the one optional morning line, and with it the R18 line (0005).
    orientAskGratitude: boolean("orient_ask_gratitude").notNull().default(true),
    // UX v1.2 §4.6, §5.2 — the second and third optional morning lines (0007).
    orientAskIntention: boolean("orient_ask_intention").notNull().default(true),
    orientAskVisualisation: boolean("orient_ask_visualisation").notNull().default(true),
    // UX v1.1 §4.6 — the passage read every morning; ≤ 2000 (0005). UNWRITTEN
    // since UX v1.2 (RUN-3): `0007` copied it into `passages`; dropped in `0008`.
    orientPassage: text("orient_passage"),
    // UX v1.1 §4.6 — show last night's journal lines on the orient frame (0005).
    // UNWRITTEN since UX v1.2 R41 (the *Last night* row); dropped in `0008`.
    orientShowLastNight: boolean("orient_show_last_night")
      .notNull()
      .default(true),
    // UX v1.1 §3.10 — how the days that do not fit are handled (0005). A
    // Settings preference since UX v1.2 §3.10; no longer asked at first run.
    overflowMode: overflowModeEnum("overflow_mode")
      .notNull()
      .default("daily_menu"),
    // The pending pair — see the header. `*_from` is the day key the new value
    // takes effect on; a reader applies it once the person's current day key is
    // at or past that date, then clears both.
    pendingDayCloseTime: time("pending_day_close_time"),
    pendingDayCloseTimeFrom: date("pending_day_close_time_from"),
    pendingTimezone: text("pending_timezone"),
    pendingTimezoneFrom: date("pending_timezone_from"),
    // UX v1.2 §3.12, R36 — a quote from the bank joins the passage cycle. Off
    // by default: the app never supplies the words unless asked (0007).
    quotesOptIn: boolean("quotes_opt_in").notNull().default(false),
    // "*Not now* is remembered" (official spec §8.3, Epic 1 §8.7) — the app
    // never re-prompts for notification permission on its own after this.
    reminderPromptAnsweredAt: timestamp("reminder_prompt_answered_at", {
      withTimezone: true,
    }),
    // The review reminder's time (§8.2 N4). Default 21:00.
    reviewReminderTime: time("review_reminder_time").notNull().default("21:00"),
    // UX v1.3 R61 — *Same routine every day?*, asked once after the first
    // ranking: true = one morning template every plan references; false = each
    // day picks or builds its own; null = not yet asked (0009).
    sameMorningRoutine: boolean("same_morning_routine"),
    // UX v1.1 §4.1 — which archetype; only the first is live (0005).
    scheduleShape: scheduleShapeEnum("schedule_shape"),
    theme: themePreferenceEnum("theme").notNull().default("system"),
    // The zone the person's days are stored and rendered in (cross-cutting
    // §7.3) — not the viewer's device zone. Defaults from the device at first
    // run; 'UTC' is only the value before that happens.
    timezone: text("timezone").notNull().default("UTC"),
    // When the day usually starts (Epic 1 FR-01, ST-08). The default
    // `anchor_time` for a new template, and nothing else — it is not a day
    // boundary and it is not an alarm.
    usualWakeTime: time("usual_wake_time").notNull().default("07:00"),
    // N6's day and time. Mon = 0, so 6 is Sunday — official spec §8.2's default.
    weekBuildReminderTime: time("week_build_reminder_time")
      .notNull()
      .default("18:00"),
    weekBuildReminderWeekday: smallint("week_build_reminder_weekday")
      .notNull()
      .default(6),
    // UX v1.1 §4.2 — always · sometimes · never, per weekday, Mon = "0" (0005).
    // JSON shape: WorkDays — see @syn/types.
    workDays: jsonb("work_days").$type<WorkDays>(),
    // UX v1.1 §4.3 — *until about*; where the evening starts (0005, R24).
    workEndTime: time("work_end_time"),
    // UX v1.1 §4.3 — the anchor prep flows backward to (0005).
    workStartTime: time("work_start_time"),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    check(
      "users_week_build_reminder_weekday_check",
      sql`${table.weekBuildReminderWeekday} BETWEEN 0 AND 6`,
    ),
    check(
      "users_orient_passage_check",
      sql`${table.orientPassage} IS NULL OR length(${table.orientPassage}) <= 2000`,
    ),
    pgPolicy("users_select", {
      for: "select",
      to: authenticatedRole,
      using: isOwner(sql`${table.id}`),
    }),
    pgPolicy("users_update", {
      for: "update",
      to: authenticatedRole,
      using: isOwner(sql`${table.id}`),
      withCheck: isOwner(sql`${table.id}`),
    }),
    pgPolicy("users_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: denyAuthenticated,
    }),
    pgPolicy("users_delete", {
      for: "delete",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
  ],
);

export const usersRelations = relations(users, ({ many, one }) => ({
  avatar: one(userAvatars),
  categories: many(categories),
  days: many(days),
  habits: many(habits),
  notificationPrefs: many(notificationPrefs),
  reasons: many(reasons),
  templates: many(templates),
  webPushSubscriptions: many(webPushSubscriptions),
}));
