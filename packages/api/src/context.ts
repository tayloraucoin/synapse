import type { SupabaseClient, User } from "@supabase/supabase-js";

import { buildAuthContext, getUser } from "@syn/auth";
import {
  createRlsClient,
  db,
  ensureLocalUserFromSupabaseAuth,
  type RlsClient,
} from "@syn/db";
import type { AuthContext } from "@syn/types";

/**
 * The per-request tRPC context: the Supabase user, and the RLS-scoped database
 * handle every procedure reads through.
 *
 * `db` appears in this file and nowhere else in `@syn/api` — it is needed to
 * write the local `auth.users` stub, which by definition happens before there
 * is an RLS context. Every other access in the package goes through
 * `ctx.rls.execute()`.
 */

export type Context = {
  supabase: SupabaseClient;
  user: User | null;
  authContext: AuthContext | null;
  rls: RlsClient | null;
};

export type CreateContextInput = {
  supabase: SupabaseClient;
};

/**
 * Apps pass a cookie-bound server client from `@syn/auth`'s
 * `createServerClient` — the fetch adapter builds one from the request's
 * cookie header, the server caller from `next/headers`.
 */
export async function createContext({
  supabase,
}: CreateContextInput): Promise<Context> {
  const { user } = await getUser(supabase);

  if (!user) {
    return { supabase, user: null, authContext: null, rls: null };
  }

  // No-op on hosted tiers, where the trigger already made the row; on `local`
  // it writes the stub `auth.users` row so the foreign key resolves.
  await ensureLocalUserFromSupabaseAuth(db, {
    supabaseUid: user.id,
    email: user.email,
  });

  const authContext = buildAuthContext(user);
  const rls = createRlsClient(authContext);

  return { supabase, user, authContext, rls };
}
