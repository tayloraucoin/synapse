/**
 * The RLS bridge — the single path by which a request's identity reaches
 * Postgres.
 *
 * Every user-scoped query in Synapse goes through `ctx.rls.execute()`. The
 * singleton `db` connects as the table owner, which bypasses RLS entirely; a
 * procedure that reaches for it is not "faster", it is unpoliced. The whole
 * privacy promise — *only you can see your data, not the people who built
 * this* — is enforced here and in the policies, not in query bodies.
 *
 * `SET LOCAL role authenticated` is the part that matters: without the role
 * switch the session stays the owner and every policy is skipped even though
 * the session variables are set correctly.
 */

import type { AuthContext } from "@syn/types";
import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { getDb } from "./client";
import * as schema from "./schema";

type ScopedDb = PostgresJsDatabase<typeof schema>;

export type RlsClient = {
  /** Run queries inside a transaction with RLS session variables set. */
  execute<T>(callback: (tx: ScopedDb) => Promise<T>): Promise<T>;
};

/**
 * Per-request RLS bridge. Reuses the singleton runtime pool — each call only
 * opens a scoped transaction (SET LOCAL), never a new postgres() client.
 */
export function createRlsClient(authContext: AuthContext): RlsClient {
  const scopedDb = getDb();

  return {
    async execute<T>(callback: (tx: ScopedDb) => Promise<T>): Promise<T> {
      return scopedDb.transaction(async (tx) => {
        // Both session variables in one parameterised round trip. SET LOCAL
        // cannot take a bind parameter, so the role switch stays separate;
        // pgRole is never derived from input — it is one of the two literals
        // below, chosen by an equality test, so no caller can inject a role.
        await tx.execute(
          sql`SELECT set_config('app.user_id', ${authContext.userId}, true), set_config('app.user_role', ${authContext.role}, true)`,
        );

        const pgRole =
          authContext.role === "service_role" ? "service_role" : "authenticated";
        await tx.execute(sql.raw(`SET LOCAL role ${pgRole}`));

        return callback(tx as ScopedDb);
      });
    },
  };
}
