/**
 * What a production deploy must hold before it builds (USE-138).
 *
 * Every secret in `env.ts` is optional so a type-check, a test or CI's build
 * succeeds without it (`env.ts`' header). That left a production deploy free
 * to go live without one a request path needs: with no `UNDO_TOKEN_KEY`, every
 * planner write threw at the first save. This list is the set a production
 * build on the production tier refuses to go without. Local, staging and CI
 * builds are untouched.
 */

/** The names a production build on the production tier must have set. */
export const REQUIRED_IN_PRODUCTION = ["UNDO_TOKEN_KEY"] as const;

type RequiredName = (typeof REQUIRED_IN_PRODUCTION)[number];

export type DeployEnv = {
  NODE_ENV: "development" | "test" | "production";
  DATABASE_ENVIRONMENT: "local" | "staging" | "production";
} & Partial<Record<RequiredName, string | undefined>>;

/** The required names missing for this build; empty when it may go ahead. */
export function missingDeployEnv(env: DeployEnv): RequiredName[] {
  if (env.NODE_ENV !== "production") return [];
  if (env.DATABASE_ENVIRONMENT !== "production") return [];
  return REQUIRED_IN_PRODUCTION.filter((name) => !env[name]);
}

/** Throws, naming each missing variable, when the build may not go ahead. */
export function assertDeployEnv(env: DeployEnv): void {
  const missing = missingDeployEnv(env);
  if (missing.length === 0) return;
  throw new Error(
    `Production build refused: set ${missing.join(", ")} in the production environment (see .env.example).`,
  );
}
