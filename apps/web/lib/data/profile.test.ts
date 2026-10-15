import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import {
  createFixtureServer,
  FixtureOfflineError,
  FixtureProfileError,
} from "@/lib/fixtures/server";
import { accountQueryKey, type AccountView } from "./use-account";
import { profileActions, profileDraftKey } from "./use-profile";

/**
 * C1 (USE-84): the Profile sheet's writes through `useProfile`'s actions on
 * the fixture server, read back as the avatar menu reads the account.
 */
async function setup(name: string, options: { offline?: boolean } = {}) {
  const scenario = { ...resolveScenario(name), ...options };
  const server = createFixtureServer(
    scenario,
    () => new Date(scenario.now),
  );
  const queryClient = new QueryClient();
  // The account as the menu has already read it.
  queryClient.setQueryData(
    accountQueryKey(scenario.name),
    await server.readAccount(),
  );
  return {
    server,
    queryClient,
    actions: profileActions(server, queryClient, scenario.name),
    menu: () =>
      queryClient.getQueryData<AccountView>(accountQueryKey(scenario.name)),
    draft: () =>
      queryClient.getQueryData<string | null>(profileDraftKey(scenario.name)),
  };
}

const PHOTO = new Blob(["photo"], { type: "image/jpeg" });

describe("C1: a saved name reaches the account the menu reads", () => {
  it("saves the trimmed name and clears the draft", async () => {
    const { server, actions, menu, draft } = await setup("profile");
    actions.setDraft("Taylor A. ");
    await actions.saveName("Taylor A.");

    expect(menu()?.name).toBe("Taylor A.");
    expect((await server.readAccount()).name).toBe("Taylor A.");
    expect(draft()).toBeNull();
  });

  it("refuses an empty name and stores nothing", async () => {
    const { server, actions } = await setup("profile");
    await expect(actions.saveName("   ")).rejects.toThrow();
    expect((await server.readAccount()).name).toBe("Taylor Aucoin");
  });
});

describe("C1: a failing save keeps the old name stored and the typed one", () => {
  it("on a server failure", async () => {
    const { server, actions, menu, draft } = await setup("profile-not-saved");
    await expect(actions.saveName("Taylor A.")).rejects.toBeInstanceOf(
      FixtureProfileError,
    );

    expect((await server.readAccount()).name).toBe("Taylor Aucoin");
    expect(menu()?.name).toBe("Taylor Aucoin");
    expect(draft()).toBe("Taylor A.");
  });

  it("offline, at once and not queued", async () => {
    const { server, actions, draft } = await setup("profile", {
      offline: true,
    });
    await expect(actions.saveName("Taylor A.")).rejects.toBeInstanceOf(
      FixtureOfflineError,
    );

    expect((await server.readAccount()).name).toBe("Taylor Aucoin");
    expect(draft()).toBe("Taylor A.");
  });
});

describe("C1: an upload lands at once, and a failed one keeps the old photo", () => {
  it("a landed upload changes the photo the menu reads", async () => {
    const { actions, menu } = await setup("profile");
    const before = menu()?.photoUrl;
    await actions.uploadPhoto(PHOTO);

    expect(menu()?.photoUrl).not.toBe(before);
    expect(menu()?.photoUrl).toMatch(/^blob:/);
    expect(menu()?.name).toBe("Taylor Aucoin");
  });

  it("a failed upload leaves the old photo", async () => {
    const { server, actions, menu } = await setup("profile-not-saved");
    const before = menu()?.photoUrl;
    await expect(actions.uploadPhoto(PHOTO)).rejects.toBeInstanceOf(
      FixtureProfileError,
    );

    expect(menu()?.photoUrl).toBe(before);
    expect((await server.readAccount()).photoUrl).toBe(before);
  });

  it("offline, the upload fails and the old photo stays", async () => {
    const { actions, menu } = await setup("profile", { offline: true });
    const before = menu()?.photoUrl;
    await expect(actions.uploadPhoto(PHOTO)).rejects.toBeInstanceOf(
      FixtureOfflineError,
    );
    expect(menu()?.photoUrl).toBe(before);
  });
});
