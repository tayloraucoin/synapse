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

export * from "./rls/helpers";
export * from "./rls/standard-policies";
