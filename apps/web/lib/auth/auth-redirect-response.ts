import { type NextRequest, type NextResponse } from "next/server";

import { createServerClient, getUser } from "@syn/auth";
import { db, ensureLocalUserFromSupabaseAuth } from "@syn/db";

/** Append a status flag to a relative path that may already carry a query. */
export function appendAuthQuery(
  path: string,
  key: string,
  value: string,
): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${key}=${encodeURIComponent(value)}`;
}

/**
 * A Supabase client whose cookie writes land on the redirect response — the
 * only way a route handler can both establish a session and 302 in one shot.
 * Writing to `next/headers` cookies here would set them on a response that is
 * about to be replaced by the redirect.
 */
export function createSupabaseForResponse(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient({
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
    },
  });
}

/**
 * Everything a freshly established session needs before the redirect.
 *
 * On a hosted tier that is nothing: the `handle_new_user()` trigger already
 * created the `public.users` row when Supabase inserted the auth user. On the
 * `local` tier the app database and the auth project are different databases,
 * so `ensureLocalUserFromSupabaseAuth` writes the stub `auth.users` row that
 * makes the foreign key resolve. It is a no-op on every other tier.
 */
export async function provisionUserFromSession(
  supabase: ReturnType<typeof createServerClient>,
): Promise<void> {
  const { user } = await getUser(supabase);
  if (!user) return;

  await ensureLocalUserFromSupabaseAuth(db, {
    supabaseUid: user.id,
    email: user.email,
  });
}
