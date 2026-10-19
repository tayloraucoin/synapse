/**
 * AuthContext bridge: a Supabase `User` → the input `@syn/db`'s
 * `createRlsClient` takes. The `AuthContext` type lives in `@syn/types`; this
 * module re-exports it so consumers import identity from one place.
 *
 * THERE IS ONE PERSON ROLE, AND IT IS `guest`. Conscious Connections carries
 * `admin` and `super_admin` and an `isAppAdminRole` helper; Synapse has
 * neither, because there is no reader of a person's day other than that
 * person. `service_role` exists for the scheduler and for migrations, which
 * touch delivery rows, never day content.
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AuthContext, AuthContextRole } from "@syn/types";

export type { AuthContext, AuthContextRole };

/**
 * The vendor's types under this module's names. Callers outside `@syn/auth`
 * take the signed-in person and the client from here, never from
 * `@supabase/*` (the boundaries lint holds it), so the vendor is named in one
 * package.
 */
export type AuthUser = User;
export type AuthClient = SupabaseClient;

export type AppUserRole = Extract<AuthContextRole, "guest">;

/**
 * Maps a Supabase auth user to the RLS context consumed by
 * `@syn/db`'s `createRlsClient`.
 */
export function buildAuthContext(
  user: AuthUser,
  appRole: AppUserRole = "guest",
): AuthContext {
  return {
    userId: user.id,
    role: appRole,
  };
}

/**
 * Service-role RLS bypass — the scheduler and system paths only, never the
 * default authenticated path. Anything reachable from a request handler that
 * uses this is unpoliced.
 */
export function buildServiceRoleAuthContext(userId: string): AuthContext {
  return {
    userId,
    role: "service_role" satisfies AuthContextRole,
  };
}
