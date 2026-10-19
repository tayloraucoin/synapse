import { cookies } from "next/headers";

import {
  buildAuthContext,
  createServerClient,
  getUser,
  type AppUserRole,
  type AuthUser,
} from "@syn/auth";
import {
  createRlsClient,
  db,
  ensureLocalUserFromSupabaseAuth,
  type RlsClient,
} from "@syn/db";
import type { AuthContext } from "@syn/types";

export type RequestAuthContext = {
  user: AuthUser;
  appRole: AppUserRole;
  authContext: AuthContext;
  rls: RlsClient;
};

/**
 * There is one person role and it is `guest`. Conscious Connections reads a
 * `role` column off `public.users` here; Synapse has no such column, because
 * there is no second role a person can hold. The constant is what makes that
 * explicit at the one place a role could otherwise creep in.
 */
const APP_USER_ROLE: AppUserRole = "guest";

async function buildContext(
  supabase: ReturnType<typeof createServerClient>,
): Promise<RequestAuthContext | null> {
  const { user } = await getUser(supabase);
  if (!user) return null;

  // No-op on hosted tiers; on `local` it writes the stub auth.users row.
  await ensureLocalUserFromSupabaseAuth(db, {
    supabaseUid: user.id,
    email: user.email,
  });

  const authContext = buildAuthContext(user, APP_USER_ROLE);
  const rls = createRlsClient(authContext);

  return { user, appRole: APP_USER_ROLE, authContext, rls };
}

/**
 * For callers inside the Next request scope (`next/headers` is available):
 * server components, server actions, and route handlers that do not need the
 * raw `Request`.
 *
 * Returns null when unauthenticated — callers decide whether that is a
 * redirect or a 401.
 */
export async function getRequestAuthContext(): Promise<RequestAuthContext | null> {
  const cookieStore = await cookies();

  const supabase = createServerClient({
    getAll() {
      return cookieStore.getAll();
    },
    setAll() {
      // Route handlers set cookies on their own response; RSC cannot at all.
    },
  });

  return buildContext(supabase);
}

/**
 * The same, from a raw `Request`.
 *
 * Preferred for new route handlers: it takes its cookies from the request it
 * was handed rather than from an ambient async-context store, which makes the
 * handler testable and keeps it working in contexts where `next/headers` is
 * not available (the tRPC fetch adapter, a cron invocation).
 */
export async function getRequestAuthContextFromRequest(
  request: Request,
): Promise<RequestAuthContext | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";

  const supabase = createServerClient({
    getAll() {
      if (!cookieHeader) return [];
      return cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const index = part.indexOf("=");
          if (index === -1) return { name: part, value: "" };
          return {
            name: part.slice(0, index),
            value: decodeURIComponent(part.slice(index + 1)),
          };
        });
    },
    setAll() {
      // The caller owns the response; a refresh here would be discarded.
    },
  });

  return buildContext(supabase);
}
