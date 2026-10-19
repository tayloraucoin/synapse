/**
 * Schema barrel — re-exports tables, relations, and enums for the Drizzle
 * client and for drizzle-kit.
 *
 * Order is dependency-friendly (auth and enums first). `auth` is the
 * reference-only mirror of Supabase's `auth.users` — exported so foreign keys
 * resolve in TypeScript, while `drizzle.config.ts` pins
 * `schemaFilter: ["public"]` so drizzle-kit never migrates that schema.
 *
 * Fifteen tables in `public`: the two from the foundation (`users`,
 * `web_push_subscriptions`) and the thirteen SET-1 added for official spec §3.
 * Every one of them is owner-private except `feedback_messages`, which is
 * insert-only for its author and readable by nobody through the app.
 *
 * USE (USE-2, `0012_use_daily`) adds twelve: the planner's ten in `planner/`
 * and Work's two in `work/`. Every one is owner-private except
 * `slot_events`, which is append-only for its owner.
 *
 * USE-100 (`0016_use_integrations`) adds seven in `integrations/`: Linear's
 * four and Google's three, every one owner-private. The token ciphertext
 * columns are read only by `@syn/api`'s `services/linear` and
 * `services/google`.
 *
 * `enum-values.ts` is deliberately NOT re-exported: it is a compile-time parity
 * helper that schema files import directly, not part of `@syn/db`'s API.
 */
export * from "./auth";
export * from "./enums";

export * from "./user";
export * from "./library";
export * from "./plan";
export * from "./day";
export * from "./notification";
export * from "./system";
export * from "./workflow";
export * from "./planner";
export * from "./work";
export * from "./integrations";

export * from "./rls/helpers";
export * from "./rls/standard-policies";
