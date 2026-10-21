import { describe, expect, it } from "vitest";
import { assertDeployEnv, missingDeployEnv } from "./deploy-env";

// USE-138: production went live without UNDO_TOKEN_KEY and every planner
// write answered 500. A production build on the production tier now refuses.

const key = "k".repeat(44);

describe("a production deploy's required env", () => {
  it("refuses a production build on the production tier with no UNDO_TOKEN_KEY, naming it", () => {
    const env = {
      NODE_ENV: "production",
      DATABASE_ENVIRONMENT: "production",
    } as const;
    expect(missingDeployEnv(env)).toEqual(["UNDO_TOKEN_KEY"]);
    expect(() => assertDeployEnv(env)).toThrow(/UNDO_TOKEN_KEY/);
  });

  it("lets it build once the key is set", () => {
    expect(() =>
      assertDeployEnv({
        NODE_ENV: "production",
        DATABASE_ENVIRONMENT: "production",
        UNDO_TOKEN_KEY: key,
      }),
    ).not.toThrow();
  });

  it("leaves local, staging and CI builds alone", () => {
    for (const DATABASE_ENVIRONMENT of ["local", "staging"] as const) {
      expect(
        missingDeployEnv({ NODE_ENV: "production", DATABASE_ENVIRONMENT }),
      ).toEqual([]);
    }
    expect(
      missingDeployEnv({
        NODE_ENV: "development",
        DATABASE_ENVIRONMENT: "production",
      }),
    ).toEqual([]);
  });
});
