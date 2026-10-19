import { randomBytes } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { decryptToken, encryptToken } from "../integrations/token-crypto";
import { createLinearTokens, LinearReconnectNeeded } from "./refresh";
import type { LinearTokenStore, StoredLinearTokens } from "./token-store";

// USE-100 C7: a refresh stores the new access and refresh token in one
// write, and two refreshes at once for one connection make one call to
// Linear. The store is in memory, with the row lock as a queue.

const key = randomBytes(32);
const now = new Date("2026-10-16T12:00:00Z");

function memoryStore(initial: StoredLinearTokens) {
  let row = initial;
  const writes: StoredLinearTokens[] = [];
  const errors: string[] = [];
  let lock: Promise<unknown> = Promise.resolve();
  const store: LinearTokenStore = {
    read: async () => row,
    withLockedTokens(_id, run) {
      const next = lock.then(async () => {
        const { write, result } = await run(row);
        if (write) {
          writes.push(write);
          row = write;
        }
        return result;
      });
      lock = next.catch(() => undefined);
      return next;
    },
    markSyncError: async (_id, message) => {
      errors.push(message);
    },
  };
  return { store, writes, errors, current: () => row };
}

function expiredRow(): StoredLinearTokens {
  return {
    accessTokenCt: encryptToken("access-old", key),
    refreshTokenCt: encryptToken("refresh-old", key),
    tokenExpiresAt: new Date(now.getTime() - 1000),
  };
}

function linearReturning(pair: { access: string; refresh: string }) {
  return vi.fn(async () =>
    Response.json({
      access_token: pair.access,
      refresh_token: pair.refresh,
      expires_in: 86399,
      token_type: "Bearer",
      scope: "read,write",
    }),
  );
}

describe("C7: refreshing a Linear connection", () => {
  it("stores the new access and refresh token together, in one write", async () => {
    const memory = memoryStore(expiredRow());
    const fetchStub = linearReturning({
      access: "access-new",
      refresh: "refresh-new",
    });
    const tokens = createLinearTokens({
      store: memory.store,
      fetch: fetchStub,
      key,
      clientId: "client",
      now: () => now,
    });

    await expect(tokens.accessToken("c1")).resolves.toBe("access-new");

    expect(memory.writes).toHaveLength(1);
    const [write] = memory.writes;
    expect(decryptToken(write!.accessTokenCt, key)).toBe("access-new");
    expect(decryptToken(write!.refreshTokenCt, key)).toBe("refresh-new");
    expect(write!.tokenExpiresAt.getTime()).toBe(now.getTime() + 86399_000);
    const [, init] = fetchStub.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    const form = new URLSearchParams(String(init.body));
    expect(form.get("grant_type")).toBe("refresh_token");
    expect(form.get("refresh_token")).toBe("refresh-old");
  });

  it("two refreshes at once for one connection make one call to Linear", async () => {
    const memory = memoryStore(expiredRow());
    const fetchStub = linearReturning({
      access: "access-new",
      refresh: "refresh-new",
    });
    const tokens = createLinearTokens({
      store: memory.store,
      fetch: fetchStub,
      key,
      clientId: "client",
      now: () => now,
    });

    const results = await Promise.all([
      tokens.accessToken("c1"),
      tokens.accessToken("c1"),
      tokens.refresh("c1"),
    ]);

    expect(results).toEqual(["access-new", "access-new", "access-new"]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(memory.writes).toHaveLength(1);
  });

  it("a second instance behind the row lock finds the pair fresh and makes no call", async () => {
    const memory = memoryStore(expiredRow());
    const fetchStub = linearReturning({
      access: "access-new",
      refresh: "refresh-new",
    });
    const deps = {
      store: memory.store,
      fetch: fetchStub,
      key,
      clientId: "client",
      now: () => now,
    };
    // Another instance has its own in-flight map: a second id for the same
    // row stands for it, so only the row lock keeps this to one call.
    const first = createLinearTokens(deps);
    const second = createLinearTokens(deps);
    await Promise.all([first.refresh("c1"), second.refresh("c2-same-row")]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(memory.writes).toHaveLength(1);
  });

  it("after a 401, refreshes once even though the token has not expired", async () => {
    const fresh = {
      accessTokenCt: encryptToken("access-old", key),
      refreshTokenCt: encryptToken("refresh-old", key),
      tokenExpiresAt: new Date(now.getTime() + 3_600_000),
    };
    const memory = memoryStore(fresh);
    const fetchStub = linearReturning({
      access: "access-new",
      refresh: "refresh-new",
    });
    const tokens = createLinearTokens({
      store: memory.store,
      fetch: fetchStub,
      key,
      clientId: "client",
      now: () => now,
    });

    await expect(
      tokens.refresh("c1", { rejected: "access-old" }),
    ).resolves.toBe("access-new");
    // A late 401 for the token already replaced makes no second call.
    await expect(
      tokens.refresh("c1", { rejected: "access-old" }),
    ).resolves.toBe("access-new");
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("a refresh Linear refuses keeps the old pair and sets the Reconnect state", async () => {
    const memory = memoryStore(expiredRow());
    const fetchStub = vi.fn(async () => new Response("{}", { status: 400 }));
    const tokens = createLinearTokens({
      store: memory.store,
      fetch: fetchStub,
      key,
      clientId: "client",
      now: () => now,
    });

    await expect(tokens.accessToken("c1")).rejects.toBeInstanceOf(
      LinearReconnectNeeded,
    );
    expect(memory.writes).toHaveLength(0);
    expect(memory.errors).toEqual(["Reconnect"]);
    expect(decryptToken(memory.current().refreshTokenCt, key)).toBe(
      "refresh-old",
    );
  });
});
