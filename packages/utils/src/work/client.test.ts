import { describe, expect, it } from "vitest";
import { resolveClient, type ClientConnection, type ClientItem } from "./client";

const connections = new Map<string, ClientConnection>([
  ["one", { clientId: "acme", perProject: false }],
  ["split", { clientId: null, perProject: true }],
]);

const projectClients = new Map<string, string | null>([
  ["split:p-globex", "globex"],
  ["split:p-mine", null],
]);

const item = (extra: Partial<ClientItem> = {}): ClientItem => ({
  clientId: null,
  linearConnectionId: null,
  linearProjectId: null,
  ...extra,
});

const resolve = (
  it: ClientItem,
  extra: { clientsEnabled?: boolean; archived?: string[] } = {},
) =>
  resolveClient({
    clientsEnabled: extra.clientsEnabled ?? true,
    item: it,
    connections,
    projectClients,
    archived: new Set(extra.archived ?? []),
  });

describe("C5: the item's own client, then its project's, then the workspace's; No client stays none", () => {
  it("takes the item's own client over its workspace's", () => {
    expect(resolve(item({ clientId: "own", linearConnectionId: "one" }))).toBe("own");
  });

  it("takes the item's own client over its project's", () => {
    expect(
      resolve(item({ clientId: "own", linearConnectionId: "split", linearProjectId: "p-globex" })),
    ).toBe("own");
  });

  it("takes the project's client in a per-project workspace", () => {
    expect(
      resolve(item({ linearConnectionId: "split", linearProjectId: "p-globex" })),
    ).toBe("globex");
  });

  it("takes the workspace's one client", () => {
    expect(resolve(item({ linearConnectionId: "one", linearProjectId: "p-any" }))).toBe("acme");
  });

  it("a project set to No client stays with none", () => {
    expect(
      resolve(item({ linearConnectionId: "split", linearProjectId: "p-mine" })),
    ).toBeNull();
  });

  it("an unmapped project, or none, in a per-project workspace has no client", () => {
    expect(
      resolve(item({ linearConnectionId: "split", linearProjectId: "p-new" })),
    ).toBeNull();
    expect(resolve(item({ linearConnectionId: "split" }))).toBeNull();
  });

  it("an item from no workspace, or an unknown one, has no client", () => {
    expect(resolve(item())).toBeNull();
    expect(resolve(item({ linearConnectionId: "gone" }))).toBeNull();
  });
});

describe("C6: clients off, or the resolved client archived, is none", () => {
  it("returns none with clients off, whatever is mapped", () => {
    const off = { clientsEnabled: false };
    expect(resolve(item({ clientId: "own" }), off)).toBeNull();
    expect(resolve(item({ linearConnectionId: "one" }), off)).toBeNull();
    expect(
      resolve(item({ linearConnectionId: "split", linearProjectId: "p-globex" }), off),
    ).toBeNull();
  });

  it("returns none when the resolved client is archived", () => {
    expect(resolve(item({ clientId: "own" }), { archived: ["own"] })).toBeNull();
    expect(resolve(item({ linearConnectionId: "one" }), { archived: ["acme"] })).toBeNull();
  });

  it("an archived client elsewhere leaves this one alone", () => {
    expect(resolve(item({ linearConnectionId: "one" }), { archived: ["globex"] })).toBe("acme");
  });
});
