/**
 * Schema barrel — re-exports tables, relations, and enums for the Drizzle
 * client and for drizzle-kit.
 *
 * Order is dependency-friendly (auth and enums first). `auth` is the
 * reference-only mirror of Supabase's `auth.users` — exported so foreign keys
 * resolve in TypeScript, while `drizzle.config.ts` pins
 * `schemaFilter: ["public"]` so drizzle-kit never migrates that schema.
 *
 * No domain table (habits, categories, templates, slots, week plans, days, day
 * items, misses, shifts, reasons, timer sessions) exists yet. Those come from
 * the feature epics' tech spec, built on the patterns in `rls/`.
 */
export * from "./auth";
export * from "./enums";

export * from "./user";
export * from "./notification";
export * from "./rls/helpers";
export * from "./rls/standard-policies";
