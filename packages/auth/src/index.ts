/**
 * @syn/auth — Supabase Auth client factories, session helpers, and the
 * AuthContext bridge.
 *
 * THE IMPORT RULE: `server`, `middleware`, and `admin` are server-only and
 * must never be reached from a `"use client"` file. The boundaries lint cannot
 * see that — it enforces package layers, not execution contexts — so the
 * discipline is the doc blocks, the app-local browser client, and the
 * acceptance grep. `admin` in particular carries the service-role key, which
 * reaching a browser bundle would hand every reader every row.
 *
 * `getUser`, not `getSession`, for authorisation: `getUser` validates the JWT
 * against the auth server, `getSession` only decodes the cookie.
 *
 * SUBPATHS FOR CLIENT CODE. This barrel re-exports `middleware`, which imports
 * `next/server` — so a `"use client"` file that reaches here for one pure
 * function drags a server module into the browser bundle and fails at build
 * with an error that names neither. The auth screens want `mapAuthError`, so
 * it has its own entry:
 *
 *   import { mapAuthError } from "@syn/auth/errors";   // pure, client-safe
 *   import { buildAuthContext } from "@syn/auth/context"; // types + pure
 *   import { createBrowserClientFromCredentials } from "@syn/auth/browser";
 *                                                // the browser client
 *
 * THE VENDOR STAYS HERE. Only this package imports `@supabase/*`
 * (`RESTRICTED_EXTERNAL` in packages/config/eslint/boundaries.js); callers
 * take `AuthUser` and `AuthClient` from this barrel or `./context`.
 *
 * Server code may keep importing the barrel.
 */

export { createAdminClient } from "./admin";
export { createBrowserClient } from "./client";
export {
  createBrowserClientFromCredentials,
  type PublicAuthCredentials,
} from "./browser";
export { createServerClient } from "./server";
export { updateSession } from "./middleware";
export {
  getSession,
  getUser,
  isEmailVerified,
  verifiedEmail,
  type AuthSessionResult,
  type AuthUserResult,
} from "./session";
export {
  buildAuthContext,
  buildServiceRoleAuthContext,
  type AppUserRole,
  type AuthClient,
  type AuthContext,
  type AuthContextRole,
  type AuthUser,
} from "./context";
export {
  buildSupabaseEnvForNextConfig,
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  requireSupabasePublicCredentials,
} from "./env";
export {
  clearSupabaseAuthCookies,
  getSupabaseCookieDomain,
  getSupabaseCookieOptions,
} from "./cookies";
export { mapAuthError } from "./auth-errors";
