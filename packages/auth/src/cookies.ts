import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Shared registrable domain for Supabase auth cookies.
 *
 * Synapse is one app, so this is normally unset and the cookie stays
 * host-only. It exists because a second surface on a sibling subdomain would
 * need the session, and discovering that after the fact means re-authing
 * every signed-in person.
 */
export function getSupabaseCookieDomain(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const domain = env.NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN?.trim();
  return domain || undefined;
}

/** Cookie options applied to all Supabase auth clients when domain is configured. */
export function getSupabaseCookieOptions(
  env: NodeJS.ProcessEnv = process.env,
): CookieOptionsWithName | undefined {
  const domain = getSupabaseCookieDomain(env);
  return domain ? { domain } : undefined;
}

function isSupabaseAuthCookieName(name: string): boolean {
  return name.startsWith("sb-");
}

type CookieReader = {
  getAll(): { name: string }[];
};

type CookieWriter = {
  set(
    name: string,
    value: string,
    options?: CookieOptionsWithName & { maxAge?: number; path?: string },
  ): void;
};

/** Clear Supabase auth cookies on a response (logout / auth error recovery). */
export function clearSupabaseAuthCookies(
  request: CookieReader,
  response: CookieWriter,
  env: NodeJS.ProcessEnv = process.env,
): void {
  const domain = getSupabaseCookieDomain(env);

  for (const { name } of request.getAll()) {
    if (!isSupabaseAuthCookieName(name)) continue;

    response.set(name, "", {
      maxAge: 0,
      path: "/",
      ...(domain ? { domain } : {}),
    });
  }
}
