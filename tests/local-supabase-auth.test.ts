import assert from "node:assert/strict";
import test from "node:test";
import { register } from "tsx/esm/api";

// WEB-2: the local tier signs in against the Supabase stack on this machine
// only when it opts in; staging and production resolve exactly as before.
// tsx (@syn/db's) loads the real resolver: @syn/utils' barrel uses directory
// imports plain Node cannot resolve.
register();
const { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } =
  await import("../packages/auth/src/env.ts");

const hosted = {
  NEXT_PUBLIC_SUPABASE_URL_STAGING: "https://staging-ref.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_STAGING: "staging-publishable",
  SUPABASE_SECRET_KEY_STAGING: "staging-secret",
  NEXT_PUBLIC_SUPABASE_URL: "https://live-ref.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "live-publishable",
  SUPABASE_SECRET_KEY: "live-secret",
};

const local = {
  NEXT_PUBLIC_SUPABASE_URL_LOCAL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_LOCAL: "local-publishable",
  SUPABASE_SECRET_KEY_LOCAL: "local-secret",
};

const env = (vars: Record<string, string>) =>
  vars as unknown as NodeJS.ProcessEnv;

const resolve = (vars: Record<string, string>) => ({
  url: getSupabaseUrl(env(vars)),
  key: getSupabaseAnonKey(env(vars)),
  secret: getSupabaseServiceRoleKey(env(vars)),
});

test("C1: the local tier reads the _LOCAL values when NEXT_PUBLIC_SUPABASE_URL_LOCAL is set, and staging when it is not", () => {
  assert.deepEqual(
    resolve({ DATABASE_ENVIRONMENT: "local", ...hosted, ...local }),
    { url: "http://127.0.0.1:54321", key: "local-publishable", secret: "local-secret" },
  );
  assert.deepEqual(resolve({ DATABASE_ENVIRONMENT: "local", ...hosted }), {
    url: "https://staging-ref.supabase.co",
    key: "staging-publishable",
    secret: "staging-secret",
  });
  // localhost is this machine too.
  assert.equal(
    getSupabaseUrl(
      env({
        DATABASE_ENVIRONMENT: "local",
        NEXT_PUBLIC_SUPABASE_URL_LOCAL: "http://localhost:54321",
      }),
    ),
    "http://localhost:54321",
  );
});

test("C2: staging and production ignore _LOCAL, and a _LOCAL URL that is not this machine is refused by name", () => {
  for (const [tier, expected] of [
    ["staging", { url: "https://staging-ref.supabase.co", key: "staging-publishable", secret: "staging-secret" }],
    ["production", { url: "https://live-ref.supabase.co", key: "live-publishable", secret: "live-secret" }],
  ] as const) {
    assert.deepEqual(
      resolve({ DATABASE_ENVIRONMENT: tier, ...hosted, ...local }),
      expected,
    );
    assert.deepEqual(
      resolve({
        DATABASE_ENVIRONMENT: tier,
        ...hosted,
        NEXT_PUBLIC_SUPABASE_URL_LOCAL: "https://evil.example.com",
      }),
      expected,
    );
  }

  for (const bad of ["https://local-ref.supabase.co", "not a url"]) {
    assert.throws(
      () =>
        getSupabaseUrl(
          env({ DATABASE_ENVIRONMENT: "local", NEXT_PUBLIC_SUPABASE_URL_LOCAL: bad }),
        ),
      /NEXT_PUBLIC_SUPABASE_URL_LOCAL must point at this machine/,
    );
  }
});
