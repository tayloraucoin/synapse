/**
 * Auth context passed from `@syn/auth` → tRPC context → `createRlsClient`
 * (`@syn/db`).
 *
 * There is no admin role. Synapse's promise is that only the person can see
 * their own data — not the people who built this — so there is no role that
 * reads user rows on their behalf, and no policy to grant one (README
 * § Non-negotiables). `service_role` exists for migrations and the scheduler,
 * which touch delivery rows, never day content.
 */

export type AuthContextRole = "guest" | "service_role";

export interface AuthContext {
  userId: string;
  role: AuthContextRole;
}
