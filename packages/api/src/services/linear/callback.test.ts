import { describe, expect, it, vi } from "vitest";
import { handleLinearCallback } from "./callback";
import { completeLinearConnect } from "./connect";
import { createLinearAuthorization } from "./oauth";
import { encodeLinearOAuthCookie } from "./oauth-cookie";

// USE-100 C6: a state that does not match its cookie, or no verifier,
// lands on Connections' failed state and stores nothing. `complete` stands
// for the exchange and the write, through a stubbed fetch: neither runs.

const callbackUrl = "https://synapse.test/api/integrations/linear/callback";

function setUp() {
  const { state, verifier } = createLinearAuthorization();
  const cookie = encodeLinearOAuthCookie({
    state,
    verifier,
    return: "/settings/connections",
  });
  const fetchStub = vi.fn(async () => new Response("{}", { status: 200 }));
  const stored: unknown[] = [];
  const rls = {
    execute: vi.fn(async () => {
      stored.push("write");
      return [{ id: "00000000-0000-4000-8000-000000000001" }];
    }),
  };
  const complete = vi.fn(async (code: string, v: string) => {
    await completeLinearConnect(
      rls as never,
      "user",
      { code, verifier: v, redirectUri: callbackUrl },
      { fetch: fetchStub, key: Buffer.alloc(32), clientId: "client" },
    );
  });
  return { state, verifier, cookie, fetchStub, stored, complete };
}

function url(params: Record<string, string>) {
  const u = new URL(callbackUrl);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u;
}

describe("C6: the Linear callback refuses before it stores", () => {
  it("a state that does not match its cookie fails and stores nothing", async () => {
    const t = setUp();
    const outcome = await handleLinearCallback(
      {
        url: url({ code: "abc", state: `${t.state.slice(0, -1)}x` }),
        cookie: t.cookie,
        signedIn: true,
      },
      t.complete,
    );
    expect(outcome).toEqual({ kind: "failed", reason: "state" });
    expect(t.complete).not.toHaveBeenCalled();
    expect(t.fetchStub).not.toHaveBeenCalled();
    expect(t.stored).toEqual([]);
  });

  it("a missing state fails and stores nothing", async () => {
    const t = setUp();
    const outcome = await handleLinearCallback(
      { url: url({ code: "abc" }), cookie: t.cookie, signedIn: true },
      t.complete,
    );
    expect(outcome.kind).toBe("failed");
    expect(t.complete).not.toHaveBeenCalled();
    expect(t.stored).toEqual([]);
  });

  it("no cookie, or a cookie without its verifier, fails and stores nothing", async () => {
    const t = setUp();
    const noVerifier = Buffer.from(
      JSON.stringify({ state: t.state, return: "/settings/connections" }),
    ).toString("base64url");
    for (const cookie of [undefined, noVerifier, "not-a-cookie"]) {
      const outcome = await handleLinearCallback(
        { url: url({ code: "abc", state: t.state }), cookie, signedIn: true },
        t.complete,
      );
      expect(outcome).toEqual({ kind: "failed", reason: "no-cookie" });
    }
    expect(t.complete).not.toHaveBeenCalled();
    expect(t.fetchStub).not.toHaveBeenCalled();
    expect(t.stored).toEqual([]);
  });

  it("a signed-out caller fails and stores nothing", async () => {
    const t = setUp();
    const outcome = await handleLinearCallback(
      {
        url: url({ code: "abc", state: t.state }),
        cookie: t.cookie,
        signedIn: false,
      },
      t.complete,
    );
    expect(outcome).toEqual({ kind: "failed", reason: "signed-out" });
    expect(t.complete).not.toHaveBeenCalled();
  });

  it("a cancel at Linear goes back where it began, nothing said, nothing stored", async () => {
    const t = setUp();
    const outcome = await handleLinearCallback(
      {
        url: url({ error: "access_denied", state: t.state }),
        cookie: t.cookie,
        signedIn: true,
      },
      t.complete,
    );
    expect(outcome).toEqual({
      kind: "cancelled",
      returnTo: "/settings/connections",
    });
    expect(t.complete).not.toHaveBeenCalled();
  });

  it("an exchange Linear refuses fails and stores nothing", async () => {
    const t = setUp();
    t.fetchStub.mockResolvedValueOnce(new Response("{}", { status: 400 }));
    const outcome = await handleLinearCallback(
      {
        url: url({ code: "abc", state: t.state }),
        cookie: t.cookie,
        signedIn: true,
      },
      t.complete,
    );
    expect(outcome).toEqual({ kind: "failed", reason: "exchange" });
    expect(t.fetchStub).toHaveBeenCalledTimes(1);
    expect(t.stored).toEqual([]);
  });

  it("a matching state with its verifier exchanges with that verifier", async () => {
    const t = setUp();
    t.fetchStub
      .mockResolvedValueOnce(
        Response.json({
          access_token: "access-1",
          refresh_token: "refresh-1",
          expires_in: 86399,
          token_type: "Bearer",
          scope: "read,write",
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          data: {
            viewer: {
              organization: {
                id: "org-1",
                name: "Lighthouse",
                urlKey: "lighthouse",
                logoUrl: null,
              },
            },
          },
        }),
      );
    const outcome = await handleLinearCallback(
      {
        url: url({ code: "abc", state: t.state }),
        cookie: t.cookie,
        signedIn: true,
      },
      t.complete,
    );
    expect(outcome).toEqual({
      kind: "connected",
      returnTo: "/settings/connections",
    });
    const [, init] = t.fetchStub.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    const form = new URLSearchParams(String(init.body));
    expect(form.get("code_verifier")).toBe(t.verifier);
    expect(form.get("grant_type")).toBe("authorization_code");
    expect(form.get("client_secret")).toBeNull();
    expect(t.stored).toEqual(["write"]);
  });
});
