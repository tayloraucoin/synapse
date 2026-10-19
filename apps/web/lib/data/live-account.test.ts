import { describe, expect, it } from "vitest";
import { createFixtureServer } from "@/lib/fixtures/server";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import type { TrpcClient } from "@/lib/trpc/client";
import { AccountNameRefusal, SavedColourRefusal } from "@/lib/data/refusals";
import { accountDomain } from "./live/account";
import { savedColoursDomain } from "./live/saved-colours";

/**
 * USE-97's C1: the live `readAccount` answers the `AccountView` the fixture
 * answers, from `user.me` and `user.avatar` stubbed; and the live domains
 * refuse bad input "invalid" before any call, as the fixture does. C2's
 * rules over rows are in `lib/trpc/planner-prefs.test.ts`.
 */

function fixtureServer() {
  const scenario = resolveScenario(null);
  return createFixtureServer(scenario, () => new Date(scenario.now));
}

function stubClient(parts: Record<string, unknown>): TrpcClient {
  return parts as unknown as TrpcClient;
}

describe("C1: the account reads from user.me and user.avatar", () => {
  const me = { displayName: "Taylor", email: "taylor@example.com" };

  it("answers the fixture's AccountView shape", async () => {
    const client = stubClient({
      user: {
        me: { query: () => Promise.resolve(me) },
        avatar: {
          query: () =>
            Promise.resolve({
              storagePath: "avatars/u1/photo.jpg",
              contentType: "image/jpeg",
              byteSize: 10,
            }),
        },
      },
    });
    const live = await accountDomain.methods(client).readAccount!();
    const fixture = await fixtureServer().readAccount();
    expect(Object.keys(live).sort()).toEqual(Object.keys(fixture).sort());
    expect(live).toEqual({
      name: "Taylor",
      email: "taylor@example.com",
      photoUrl: "/api/assets/avatars/u1/photo.jpg",
    });
  });

  it("reads no photo as null, and no name as empty", async () => {
    const client = stubClient({
      user: {
        me: { query: () => Promise.resolve({ displayName: null, email: null }) },
        avatar: { query: () => Promise.resolve(null) },
      },
    });
    await expect(accountDomain.methods(client).readAccount!()).resolves.toEqual({
      name: "",
      email: "",
      photoUrl: null,
    });
  });

  it("refuses a blank name before any call, in the schema's words", async () => {
    const client = stubClient({});
    const write = accountDomain.methods(client).writeAccountName!("   ");
    await expect(write).rejects.toBeInstanceOf(AccountNameRefusal);
  });
});

describe("C2: the live saved colours", () => {
  it("the live domain refuses a bad hex invalid, before any call", async () => {
    const write = savedColoursDomain
      .methods(stubClient({}))
      .writeSavedColour!({ hex: "red", sortOrder: 0 });
    await expect(write).rejects.toBeInstanceOf(SavedColourRefusal);
    await expect(write).rejects.toMatchObject({ reason: "invalid" });
  });
});
