/**
 * @syn/db — Drizzle schema, singleton client, migrations, RLS bridge.
 *
 * Public API: `db`, `createRlsClient`, schema tables + relations, inferred row
 * types. Not exported: `migrate-client` and `seed`, which are scripts.
 *
 * The rule the rest of the codebase inherits from this file: a user-scoped
 * query goes through `createRlsClient(...).execute()`. The exported `db`
 * connects as the table owner and bypasses every policy; it exists for the
 * bridge itself and for system paths, and a procedure that reaches for it is
 * unpoliced, not fast.
 */

export { buildDatabaseEnvForNextConfig } from "./build-database-env-for-next-config";
export { db, getDb, type Db } from "./client";
export {
  describeDatabaseUrl,
  parseDatabaseEnvironment,
  resolveByDatabaseEnvironment,
  resolveDbEnvironment,
  resolveMigrateDatabaseUrl,
  resolveOptionalByDatabaseEnvironment,
  resolveOptionalMigrateDatabaseUrl,
  resolveOptionalRuntimeDatabaseUrl,
  resolveRuntimeDatabaseUrl,
  type DatabaseEnvironmentValueMap,
  type DbEnvironment,
  type ResolveByDatabaseEnvironmentOptions,
} from "./connection-env";
export { createRlsClient, type RlsClient } from "./rls";
export {
  ensureLocalUserFromSupabaseAuth,
  type EnsureLocalUserFromSupabaseAuthInput,
} from "./local-dev/ensure-local-user-from-supabase-auth";

export * from "./schema";

import {
  categories,
  dataExports,
  dayItems,
  days,
  feedbackMessages,
  habits,
  misses,
  notificationPrefs,
  reasons,
  shifts,
  templateSlots,
  templates,
  timerSessions,
  userAvatars,
  users,
  webPushSubscriptions,
} from "./schema";

/**
 * Row types — one `$inferSelect` / `$inferInsert` pair per public table.
 *
 * `@syn/db` owns row types; they are never re-declared in `@syn/types`, which
 * holds the shapes a row cannot give you (the unions the DB and the UI share,
 * and the view models the API maps rows into). Nothing outside `@syn/db` and
 * `@syn/api` imports a table — everyone else takes one of these types or a
 * view model.
 */
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type DataExport = typeof dataExports.$inferSelect;
export type NewDataExport = typeof dataExports.$inferInsert;
export type Day = typeof days.$inferSelect;
export type NewDay = typeof days.$inferInsert;
export type DayItem = typeof dayItems.$inferSelect;
export type NewDayItem = typeof dayItems.$inferInsert;
export type FeedbackMessage = typeof feedbackMessages.$inferSelect;
export type NewFeedbackMessage = typeof feedbackMessages.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type Miss = typeof misses.$inferSelect;
export type NewMiss = typeof misses.$inferInsert;
export type NotificationPref = typeof notificationPrefs.$inferSelect;
export type NewNotificationPref = typeof notificationPrefs.$inferInsert;
export type Reason = typeof reasons.$inferSelect;
export type NewReason = typeof reasons.$inferInsert;
export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type TemplateSlot = typeof templateSlots.$inferSelect;
export type NewTemplateSlot = typeof templateSlots.$inferInsert;
export type TimerSession = typeof timerSessions.$inferSelect;
export type NewTimerSession = typeof timerSessions.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserAvatar = typeof userAvatars.$inferSelect;
export type NewUserAvatar = typeof userAvatars.$inferInsert;
export type WebPushSubscription = typeof webPushSubscriptions.$inferSelect;
export type NewWebPushSubscription = typeof webPushSubscriptions.$inferInsert;
