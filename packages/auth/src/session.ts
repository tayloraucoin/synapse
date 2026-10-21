// Typed server-side session helpers. Use with createServerClient from server.ts.

import {
  isAuthRetryableFetchError,
  type AuthError,
  type Session,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

export type AuthSessionResult = {
  session: Session | null;
  error: Error | null;
};

export type AuthUserResult = {
  user: User | null;
  error: Error | null;
};

/** Read the current session from a server-bound Supabase client. */
export async function getSession(
  client: SupabaseClient,
): Promise<AuthSessionResult> {
  const { data, error } = await client.auth.getSession();
  return {
    session: data.session,
    error: error ?? null,
  };
}

/**
 * Thrown when the auth server could not say whether there is a session: it was
 * unreachable, failing (5xx) or rate limiting (429).
 */
export class AuthUnavailableError extends Error {
  constructor(cause: Error) {
    super(`Auth server unavailable: ${cause.message}`, { cause });
    this.name = "AuthUnavailableError";
  }
}

/** True for an error that is about the auth server, not about the session. */
function isAuthServerUnavailable(error: AuthError): boolean {
  return isAuthRetryableFetchError(error) || error.status === 429;
}

/**
 * Read the authenticated user (validates JWT server-side).
 * Prefer this over getSession for authorization checks.
 *
 * `user: null` means signed out. A lookup the auth server could not answer
 * throws `AuthUnavailableError` instead: every caller reads `user: null` as
 * signed out (the landing page, the sign-in redirect, tRPC's UNAUTHORIZED and
 * the expiry dialog), and a network blip is not a sign-out.
 */
export async function getUser(client: SupabaseClient): Promise<AuthUserResult> {
  const { data, error } = await client.auth.getUser();
  if (error && isAuthServerUnavailable(error)) {
    throw new AuthUnavailableError(error);
  }
  return {
    user: data.user,
    error: error ?? null,
  };
}

/**
 * VER-1 — true when the user's email is confirmed at the identity provider.
 * OAuth and magic-link users carry email_confirmed_at by construction; only a
 * password signup under confirm-email-off can produce a session without it.
 * The Supabase dashboard setting is the primary gate; this is the app-layer
 * assertion consumed by page gates and the claim procedures.
 */
export function isEmailVerified(user: User | null): boolean {
  return Boolean(user?.email_confirmed_at);
}

/**
 * The user's email ONLY when the identity provider has confirmed it —
 * normalized, or null.
 *
 * Consumers that match on an address (partner-seat claiming) must take the
 * address and its verification from the same place. Passing a boolean
 * alongside an email read from somewhere else lets the two drift: the
 * `public.users` shadow column is a signup-time snapshot, so once a user can
 * change their email, a verified session could match a stale address it no
 * longer controls. Returning one value makes that state unrepresentable.
 */
export function verifiedEmail(user: User | null): string | null {
  if (!isEmailVerified(user)) return null;
  const email = user?.email?.trim().toLowerCase();
  return email || null;
}
