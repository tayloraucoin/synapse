// NEVER use at runtime — direct/session connection for drizzle-kit and migrate scripts only.
// Uses DIRECT_DATABASE_URL (port 5432). See drizzle-orm-conventions.md.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { resolveMigrateDatabaseUrl } from "./connection-env";
import * as schema from "./schema";

const sql = postgres(resolveMigrateDatabaseUrl());
export const migrateDb = drizzle(sql, { schema });
