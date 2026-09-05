/**
 * auth.ts — Reference-only mirror of Supabase's managed `auth` schema.
 *
 * WHY THIS EXISTS
 * Supabase (GoTrue) owns the `auth` schema and the `auth.users` table. We must
 * NOT let drizzle-kit create, alter, or drop anything in that schema, or it will
 * collide with the Supabase-managed objects and corrupt auth.
 *
 * We declare a *minimal* mirror of `auth.users` purely so that `.references()`
 * in our public tables resolve to a real Drizzle object and emit correct foreign
 * keys. drizzle.config.ts pins `schemaFilter: ['public']`, so drizzle-kit reads
 * this declaration for FK targets but never tries to migrate the `auth` schema.
 *
 * RULE: never add columns here beyond what we FK against (id). Never write to it
 * from the app — user creation flows through Supabase Auth, and a Postgres trigger
 * (`handle_new_user`, see supabase/setup) mirrors the row into public.users.
 */
import { pgSchema, uuid } from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});
