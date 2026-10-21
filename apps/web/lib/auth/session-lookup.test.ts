import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getUser, type AuthClient } from "@syn/auth";
import { proxy } from "@/proxy";

/**
 * The unexplained sign-out on the installed app (2026-10-21, no ticket).
 *
 * 1. An auth server that could not answer is not an answer about the
 *    session: `getUser` throws, so no caller reads it as "signed out" and
 *    serves the landing page, a sign-in redirect or the expiry dialog.
 * 2. `/api/*` goes through the proxy's refresh, so a session refreshed while
 *    serving a tRPC call is written back to the browser, not thrown away.
 *
 * All tokens and ids here are synthetic.
 */

const PROJECT_URL = "https://synthetic-ref.supabase.co";
const COOKIE = "sb-synthetic-ref-auth-token";

/** The SDK's error shapes, built here: the app never imports the vendor. */
function authError(name: string, message: string, status: number): Error {
  return Object.assign(new Error(message), {
    name,
    status,
    __isAuthError: true,
  });
}

function fakeClient(result: { user: null; error: Error }): AuthClient {
  return {
    auth: {
      getUser: async () => ({
        data: { user: result.user },
        error: result.error,
      }),
    },
  } as unknown as AuthClient;
}

function base64url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function syntheticJwt(exp: number): string {
  return [
    base64url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    base64url(
      JSON.stringify({ sub: "00000000-0000-4000-8000-000000000001", exp }),
    ),
    "synthetic-signature",
  ].join(".");
}

const syntheticUser = {
  id: "00000000-0000-4000-8000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: "person@example.test",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};

function sessionCookie(expiresAt: number): string {
  const session = {
    access_token: syntheticJwt(expiresAt),
    refresh_token: "synthetic-refresh-old",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: expiresAt,
    user: syntheticUser,
  };
  return `base64-${base64url(JSON.stringify(session))}`;
}

describe("getUser: an unanswered lookup is not a signed-out person", () => {
  it("throws when the auth server could not be reached", async () => {
    const client = fakeClient({
      user: null,
      error: authError("AuthRetryableFetchError", "fetch failed", 0),
    });
    await expect(getUser(client)).rejects.toThrow();
  });

  it("throws when the auth server is rate limiting", async () => {
    const client = fakeClient({
      user: null,
      error: authError("AuthApiError", "rate limited", 429),
    });
    await expect(getUser(client)).rejects.toThrow();
  });

  it("still returns no user when there is no session", async () => {
    const client = fakeClient({
      user: null,
      error: authError("AuthSessionMissingError", "Auth session missing!", 400),
    });
    await expect(getUser(client)).resolves.toMatchObject({ user: null });
  });

  it("still returns no user when the session was rejected", async () => {
    const client = fakeClient({
      user: null,
      error: authError("AuthApiError", "Invalid Refresh Token", 400),
    });
    await expect(getUser(client)).resolves.toMatchObject({ user: null });
  });
});

describe("proxy: tRPC requests keep the refreshed session", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_ENVIRONMENT", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", PROJECT_URL);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "synthetic-anon-key");
    const fresh = Math.floor(Date.now() / 1000) + 3600;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input instanceof Request ? input.url : input);
        if (url.includes("/auth/v1/token")) {
          return Response.json({
            access_token: syntheticJwt(fresh),
            refresh_token: "synthetic-refresh-new",
            token_type: "bearer",
            expires_in: 3600,
            expires_at: fresh,
            user: syntheticUser,
          });
        }
        if (url.includes("/auth/v1/user")) return Response.json(syntheticUser);
        return new Response("unexpected", { status: 500 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("writes the refreshed session cookie on an /api/trpc response", async () => {
    const expired = Math.floor(Date.now() / 1000) - 60;
    const request = new NextRequest(
      "https://app.example.test/api/trpc/day.today",
      {
        headers: { cookie: `${COOKIE}=${sessionCookie(expired)}` },
      },
    );

    const response = await proxy(request);

    const written = response.cookies.get(COOKIE)?.value ?? "";
    expect(written).not.toBe("");
    const decoded = Buffer.from(
      written.replace(/^base64-/, ""),
      "base64url",
    ).toString();
    expect(decoded).toContain("synthetic-refresh-new");
    // ...and the handler behind the proxy is handed the same refreshed cookie.
    const forwarded = response.headers.get("x-middleware-request-cookie") ?? "";
    expect(forwarded).toContain(`${COOKIE}=${written}`);
  });
});
