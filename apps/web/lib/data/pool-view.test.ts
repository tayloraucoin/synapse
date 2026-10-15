import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { POOL_IDS } from "@/lib/fixtures/scenarios/pool";
import { WEEK_NOW } from "@/lib/fixtures/scenarios/week";
import { createFixtureServer } from "@/lib/fixtures/server";
import { clientOf } from "./integration-records";
import { groupPool } from "./pool-records";
import {
  poolView,
  type PoolGroupBy,
  type PoolLineView,
  type PoolPanelView,
  type PoolSort,
  type PoolTab,
} from "./pool-view";

const C = POOL_IDS.clients;
const TODAY = "2026-10-12";

/** The panel as usePoolView works it out, read straight from the fixture server. */
async function panel(
  scenario: string,
  choices: {
    group?: PoolGroupBy;
    sort?: PoolSort;
    query?: string;
    tab?: PoolTab;
  } = {},
  server = createFixtureServer(
    resolveScenario(scenario),
    () => new Date(WEEK_NOW),
  ),
): Promise<PoolPanelView> {
  const [records, connections, linear] = await Promise.all([
    server.readPool(),
    server.readConnections(),
    server.readLinear(),
  ]);
  const resolve = (item: Parameters<typeof clientOf>[2]) =>
    clientOf(connections, linear, item);
  const clients = connections.clients.filter((c) => c.archivedAt === null);
  return poolView({
    pool: groupPool(records, resolve),
    linear,
    clients,
    clientsEnabled: connections.clientsEnabled,
    clientFor: resolve,
    personName: "Taylor",
    todayKey: TODAY,
    now: new Date(WEEK_NOW),
    group: choices.group ?? "client",
    sort: choices.sort ?? "due",
    query: choices.query ?? "",
    tab: choices.tab ?? "pool",
  });
}

const heads = (view: PoolPanelView) => view.groups.map((g) => g.head.name);

describe("C1: poolView groups, sorts and searches on the device", () => {
  it("groups by client in client order, then team and project lines", async () => {
    const view = await panel("pool-panel");
    expect(heads(view)).toEqual([
      "Kestrel Health [placeholder]",
      "Alder Studio [placeholder]",
      "Personal",
      "No client",
    ]);
    const [kestrel, alder, personal] = view.groups;
    const line = (l: PoolLineView) =>
      [
        l.team && `${l.team.emoji ?? ""} ${l.team.name}`.trim(),
        l.project && `${l.project.emoji} ${l.project.name}`,
      ]
        .filter(Boolean)
        .join(" · ");
    // One company with two teams is one client with two lines (D-USE-42).
    expect(kestrel!.lines.map(line)).toEqual([
      "💻 Product Engineering · 🏥 Patient portal [placeholder]",
      "💼 Business Development · 🤝 Partnerships [placeholder]",
    ]);
    expect(alder!.lines.map(line)).toEqual([
      "In Taylor's workspace · 🎨 Brand site [placeholder]",
    ]);
    // A team named as its project stands as the project; Synapse-only work closes the client.
    expect(personal!.lines.map(line)).toEqual(["🧠 Synapse", ""]);
    expect(view.byClient).toBe(true);
    expect(view.sync).toBe("Linear synced 2 min ago");
  });

  it("prints the drawn rows: due soon, due today, placed, big, No Linear", async () => {
    const view = await panel("pool-panel");
    const rows = view.groups.flatMap((g) => g.lines.flatMap((l) => l.rows));
    const row = (title: string) => rows.find((r) => r.title === title)!;
    expect(row("[Audit log export]")).toMatchObject({
      priority: { level: "high", word: "High" },
      identifier: "KES-58",
      size: "5 Large",
      labels: [{ name: "Compliance" }],
      due: { word: "Due Wed", tone: "warning" },
      placed: null,
    });
    expect(row("[Session timeout copy]")).toMatchObject({
      priority: { level: "urgent" },
      due: { word: "Due today", tone: "danger" },
    });
    // Placed rows stay in the pool, naming their sessions' days.
    expect(row("[Alder intro]")).toMatchObject({
      identifier: "ALD-17",
      placed: "on Mon, Tue, Wed",
      priority: null,
      labels: [],
    });
    expect(row("[Calendar connection settings]")).toMatchObject({
      size: "8 Huge · 20 h",
      spread: true,
    });
    expect(row("[Tidy the client files folder]")).toMatchObject({
      identifier: null,
      noLinear: "No Linear",
      size: "2 Small",
    });
  });

  it("Sort Due date orders by due date, then priority, then client order", async () => {
    // Grouped by project, so rows from several clients share one group.
    const view = await panel("pool-panel", { group: "project" });
    const portal = view.groups.find((g) =>
      g.head.name.startsWith("Patient portal"),
    )!;
    expect(portal.lines[0]!.rows.map((r) => r.identifier)).toEqual([
      "KES-63", // due Mon
      "KES-58", // due Wed
      "KES-60", // due Thu, Synapse's own date on a linked item with none in Linear
      "KES-42", // no due date, High
      "KES-51", // no due date, Normal
    ]);
  });

  it("client order breaks ties in Sort, and follows a reorder (C-USE-week-6)", async () => {
    // Linear off, grouped by workspace: every row sits under "No Linear",
    // with no priority, so rows sharing a due date fall to client order.
    const server = createFixtureServer(
      resolveScenario("pool-linear-off"),
      () => new Date(WEEK_NOW),
    );
    const items = (await server.readPool()).workItems;
    const clientOfTitle = new Map(items.map((i) => [i.title, i.clientId]));
    const undated = new Set(
      items.filter((i) => i.dueOn === null).map((i) => i.title),
    );
    const clientRun = async () => {
      const view = await panel(
        "pool-linear-off",
        { group: "workspace" },
        server,
      );
      expect(heads(view)).toEqual(["No Linear"]);
      const rows = view.groups[0]!.lines.flatMap((l) => l.rows);
      // The rows with no due date, as runs of their client.
      const run = rows
        .filter((r) => undated.has(r.title))
        .map((r) => clientOfTitle.get(r.title) ?? null);
      return run.filter((id, i) => i === 0 || run[i - 1] !== id);
    };
    expect(await clientRun()).toEqual([C.kestrel, C.alder, C.personal, null]);

    await server.setClientOrder({ ids: [C.alder, C.personal, C.kestrel] });
    // Settings › Clients reads the same order the heads wrote.
    const connections = await server.readConnections();
    expect(connections.clients.map((c) => c.id)).toEqual([
      C.alder,
      C.personal,
      C.kestrel,
    ]);
    expect(await clientRun()).toEqual([C.alder, C.personal, C.kestrel, null]);
    expect(heads(await panel("pool-linear-off", {}, server))).toEqual([
      "Alder Studio [placeholder]",
      "Personal",
      "Kestrel Health [placeholder]",
      "No client",
    ]);
  });

  it('a search for "audit" matches titles and IDs across both tabs and says where each lives', async () => {
    const view = await panel("pool-panel", { query: "audit" });
    expect(view.search!.pool.map((r) => [r.title, r.where])).toEqual([
      ["[Audit log export]", "Pool"],
      ["[Audit notes]", "Pool"],
    ]);
    expect(
      view.search!.linear.map((r) => [r.identifier, r.where, r.size]),
    ).toEqual([["KES-71", "Linear, not in the pool yet", "unsized"]]);
    expect(view.search!.newItem).toBe('+ New item "audit"');
    const byId = await panel("pool-panel", { query: "kes-6" });
    expect(byId.search!.pool.map((r) => r.identifier)).toEqual([
      "KES-63",
      "KES-60",
    ]);
    expect(byId.search!.linear.map((r) => r.identifier)).toEqual(["KES-66"]);
  });
});

describe("the Linear tab, the empty pool and Linear off", () => {
  it("lists issues not in the pool and the placed ones faded with their days", async () => {
    const view = await panel("pool-linear-tab", { tab: "linear" });
    const rows = view.groups.flatMap((g) => g.lines.flatMap((l) => l.rows));
    expect(rows.some((r) => r.identifier === "KES-58")).toBe(false);
    expect(rows.find((r) => r.identifier === "KES-71")).toMatchObject({
      status: { type: "unstarted", word: "Todo" },
      placed: null,
      workItemId: null,
    });
    expect(rows.find((r) => r.identifier === "ALD-17")).toMatchObject({
      placed: "on Mon, Tue, Wed",
      status: { word: "In progress" },
    });
    expect(heads(view)[0]).toBe("Kestrel Health [placeholder]");
  });

  it("the empty pool says so at the top, with no count", async () => {
    const view = await panel("pool-empty");
    expect(view.empty).toBe(true);
    expect(view.groups).toEqual([]);
    expect(view.linearConnected).toBe(true);
  });

  it("with Linear not connected there is no Linear tab and no sync line", async () => {
    const view = await panel("pool-linear-off");
    expect(view.linearConnected).toBe(false);
    expect(view.sync).toBeNull();
    expect(
      view.groups.every((g) => g.lines.every((l) => l.team === null)),
    ).toBe(true);
  });
});
