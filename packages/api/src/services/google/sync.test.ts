import { randomBytes } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { RlsClient } from "@syn/db";
import { encryptToken } from "../integrations/token-crypto";
import { GOOGLE_TOKEN_URL } from "./oauth";
import { GOOGLE_SYNC_FAILED_MESSAGE, syncGoogleAccountWeek } from "./sync";
import type { GoogleTokenStore } from "./token-store";
import { GOOGLE_RECONNECT_MESSAGE } from "./tokens";

/**
 * USE-103 C4: Google refusing the refresh (`invalid_grant`) sets the
 * account's `last_sync_error` (the Reconnect state) and writes nothing else,
 * so the last snapshot stays as it was. A payload that does not parse does
 * the same with its own message.
 */

const KEY = randomBytes(32);
const ACCOUNT = "00000000-0000-4000-8000-0000000000a1";
const USER = "00000000-0000-4000-8000-0000000000f1";
const MON = "2026-10-19";
const TZ = "America/Los_Angeles";

function store(): GoogleTokenStore & { errors: string[] } {
  const errors: string[] = [];
  return {
    errors,
    readRefreshToken: () => Promise.resolve(encryptToken("1//refresh", KEY)),
    writeRefreshToken: () => Promise.resolve(),
    markSyncError: (_id, message) => {
      errors.push(message);
      return Promise.resolve();
    },
  };
}

/** An RLS client that fails the test if anything reaches the database. */
function untouchedRls() {
  const execute = vi.fn(() => {
    throw new Error("The snapshot must not be written.");
  });
  return { rls: { execute } as unknown as RlsClient, execute };
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const deps = (tokens: GoogleTokenStore, fetch: typeof globalThis.fetch) => ({
  store: tokens,
  fetch,
  key: KEY,
  clientId: "id",
  clientSecret: "secret",
});

describe("a refused refresh is Reconnect (C-USE-103-4)", () => {
  it("sets last_sync_error and keeps the snapshot", async () => {
    const tokens = store();
    const { rls, execute } = untouchedRls();
    const fetch = vi.fn((url: string) =>
      Promise.resolve(
        url === GOOGLE_TOKEN_URL
          ? json(400, {
              error: "invalid_grant",
              error_description: "Token has been expired or revoked.",
            })
          : json(500, {}),
      ),
    );

    const result = await syncGoogleAccountWeek(
      rls,
      USER,
      ACCOUNT,
      MON,
      TZ,
      deps(tokens, fetch as unknown as typeof globalThis.fetch),
    );

    expect(result).toBe("reconnect");
    expect(tokens.errors).toEqual([GOOGLE_RECONNECT_MESSAGE]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(execute).not.toHaveBeenCalled();
  });

  it("a page that does not parse sets its error and keeps the snapshot", async () => {
    const tokens = store();
    const { rls, execute } = untouchedRls();
    const fetch = vi.fn((url: string) => {
      if (url === GOOGLE_TOKEN_URL) {
        return Promise.resolve(
          json(200, { access_token: "ya29.a", expires_in: 3599 }),
        );
      }
      if (url.includes("/calendarList")) {
        return Promise.resolve(
          json(200, {
            items: [
              {
                id: "taylor@example.com",
                summary: "Taylor",
                accessRole: "owner",
                primary: true,
              },
            ],
          }),
        );
      }
      // An event with no times.
      return Promise.resolve(
        json(200, { items: [{ id: "x", status: "confirmed" }] }),
      );
    });

    const result = await syncGoogleAccountWeek(
      rls,
      USER,
      ACCOUNT,
      MON,
      TZ,
      deps(tokens, fetch as unknown as typeof globalThis.fetch),
    );

    expect(result).toBe("failed");
    expect(tokens.errors).toEqual([GOOGLE_SYNC_FAILED_MESSAGE]);
    expect(execute).not.toHaveBeenCalled();
  });

  it("backs off on a rate limit and tries again", async () => {
    const tokens = store();
    const { rls } = untouchedRls();
    let listCalls = 0;
    const sleep = vi.fn(() => Promise.resolve());
    const fetch = vi.fn((url: string) => {
      if (url === GOOGLE_TOKEN_URL) {
        return Promise.resolve(
          json(200, { access_token: "ya29.a", expires_in: 3599 }),
        );
      }
      listCalls += 1;
      return Promise.resolve(
        listCalls === 1
          ? json(403, {
              error: { errors: [{ reason: "userRateLimitExceeded" }] },
            })
          : // The retry comes back, and fails to parse: the sync stops there.
            json(200, { items: [{ status: "confirmed" }] }),
      );
    });

    const result = await syncGoogleAccountWeek(rls, USER, ACCOUNT, MON, TZ, {
      ...deps(tokens, fetch as unknown as typeof globalThis.fetch),
      sleep,
    });

    expect(sleep).toHaveBeenCalledTimes(1);
    expect(listCalls).toBe(2);
    expect(result).toBe("failed");
  });
});
