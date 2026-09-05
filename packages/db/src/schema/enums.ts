/**
 * Root enums — pgEnum types shared across 2+ schema directories.
 *
 * Colocation rule (drizzle-orm-conventions §4):
 * - One table only → define in that table's file.
 * - 2+ tables in one directory → that directory's `enums.ts`.
 * - 2+ directories → this file.
 *
 * Empty on purpose. Nothing in the foundation is shared across directories
 * yet; the feature epics' first migration adds the domain enums (item type,
 * time mode, scheduling, assignment state, completion state, miss tier, item
 * origin) with the same spelling as `@syn/types`' schema unions.
 */

export {};
