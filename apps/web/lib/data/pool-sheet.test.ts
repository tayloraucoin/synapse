import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { POOL_IDS } from "@/lib/fixtures/scenarios/pool";
import { POOL_SHEET_DATE } from "@/lib/fixtures/scenarios/pool-sheet";
import { SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import { clientOf } from "./integration-records";
import { groupPool } from "./pool-records";
import { poolSheetView, type PoolSheetView } from "./pool-sheet";
import {
  DEFAULT_LINEAR_FILTERS,
  NO_POOL_FILTERS,
  poolView,
  type LinearFilters,
  type PoolFilters,
  type PoolTab,
} from "./pool-view";

const C = POOL_IDS.clients;
const NOW = new Date(SET_UP_NOW);

type Server = ReturnType<typeof createFixtureServer>;

/** The sheet as PoolSheet works it out, read straight from the fixture server. */
async function sheet(
  server: Server,
  choices: {
    tab?: PoolTab;
    query?: string;
    filters?: Partial<PoolFilters>;
    linearFilters?: LinearFilters;
  } = {},
): Promise<PoolSheetView> {
  const [records, connections, linear] = await Promise.all([
    server.readPool(),
    server.readConnections(),
    server.readLinear(),
  ]);
  const resolve = (item: Parameters<typeof clientOf>[2]) =>
    clientOf(connections, linear, item);
  const filters = { ...NO_POOL_FILTERS, ...choices.filters };
  const tab = choices.tab ?? "pool";
  const panel = poolView({
    pool: groupPool(records, resolve),
    linear,
    clients: connections.clients.filter((c) => c.archivedAt === null),
    clientsEnabled: connections.clientsEnabled,
    clientFor: resolve,
    personName: "Taylor",
    todayKey: POOL_SHEET_DATE,
    now: NOW,
    group: "client",
    sort: "due",
    query: choices.query ?? "",
    tab,
    filters,
    linearFilters: choices.linearFilters ?? DEFAULT_LINEAR_FILTERS,
  });
  return poolSheetView({
    panel,
    tab,
    slots: records.slots,
    filtered: Object.values(filters).some((value) => value !== null),
  });
}

function serverFor(scenario: string): Server {
  return createFixtureServer(resolveScenario(scenario), () => NOW);
}

const heads = (view: PoolSheetView) => view.groups.map((g) => g.head.name);
const rows = (view: PoolSheetView) =>
  view.groups.flatMap((g) => g.lines.flatMap((l) => l.rows));

describe("C1: the pool sheet narrows the pool, searches both tabs and drops clients when off", () => {
  it("groups the Pool tab by client in Settings' order, each row with Place", async () => {
    const view = await sheet(serverFor("pool-sheet"));
    expect(heads(view)).toEqual(["Kestrel Health", "Alder Studio", "Personal"]);
    expect(rows(view).map((r) => [r.title, r.meta])).toEqual([
      ["[Booking: reschedule flow]", "KES-58 · 3 Medium · due Wed"],
      ["[Portal: e2e tests for sign-in]", "KES-61 · 5 Large"],
      [
        "[Brand site: case study template]",
        "ALD-22 · 8 Huge · Spread across the week",
      ],
      ["[Invoice template refresh]", "1 Quick · No Linear"],
    ]);
    // KES-42 is on Mon 12: the Pool tab is the work not yet on a day.
    expect(rows(view).every((r) => r.placeable && !r.faded)).toBe(true);
    expect(view.clientChoices.map((c) => [c.name, c.teams])).toEqual([
      ["Kestrel Health", 2],
      ["Alder Studio", 0],
      ["Personal", 0],
    ]);
  });

  it("a client picked narrows both tabs to that client, and the week's records are untouched", async () => {
    const server = serverFor("pool-sheet");
    const weekBefore = structuredClone(await server.readWeek("2026-10-12"));
    const poolBefore = structuredClone(await server.readPool());

    const pool = await sheet(server, { filters: { client: C.kestrel } });
    expect(heads(pool)).toEqual(["Kestrel Health"]);
    expect(rows(pool).map((r) => r.title)).toEqual([
      "[Booking: reschedule flow]",
      "[Portal: e2e tests for sign-in]",
    ]);
    const linear = await sheet(server, {
      tab: "linear",
      filters: { client: C.alder },
    });
    expect(heads(linear)).toEqual(["Alder Studio"]);
    expect(rows(linear).map((r) => r.title)).toEqual([
      "[Brand site: contact form]",
    ]);

    // Filtering reads; nothing is written to the days or the pool.
    expect(await server.readWeek("2026-10-12")).toEqual(weekBefore);
    expect(await server.readPool()).toEqual(poolBefore);
    expect((await server.readLinear()).outbox).toEqual([]);
  });

  it("Size and Due date narrow the Pool tab; nothing passing says so", async () => {
    const server = serverFor("pool-sheet");
    const huge = await sheet(server, { filters: { size: "huge" } });
    expect(rows(huge).map((r) => r.title)).toEqual([
      "[Brand site: case study template]",
    ]);
    const due = await sheet(server, { filters: { due: "week" } });
    expect(rows(due).map((r) => r.title)).toEqual([
      "[Booking: reschedule flow]",
    ]);
    const none = await sheet(server, { filters: { due: "today" } });
    expect(none.groups).toEqual([]);
    expect(none.filteredOut).toBe(true);
    expect(none.empty).toBe(false);
  });

  it("From Linear: issues not in the pool by client, team and project lines; a placed one faded with where, no Place", async () => {
    const view = await sheet(serverFor("pool-from-linear"), { tab: "linear" });
    expect(heads(view)).toEqual(["Kestrel Health", "Alder Studio"]);
    const [kestrel] = view.groups;
    expect(kestrel!.lines.map((l) => [l.team?.name, l.project?.name])).toEqual([
      ["Portal team", "Patient portal"],
      ["Records team", "Records import"],
    ]);
    const byTitle = new Map(rows(view).map((r) => [r.title, r]));
    expect(byTitle.get("[Reminder opt-out link]")).toMatchObject({
      meta: "KES-63 · Backlog · 2 Small · due Wed",
      placeable: true,
      lead: { kind: "status" },
    });
    expect(byTitle.get("[Portal sign-in: magic link flow]")).toMatchObject({
      meta: "KES-42 · already on Mon 12, Primary",
      placeable: false,
      faded: true,
    });
    expect(byTitle.get("[CSV mapping screen]")?.meta).toBe(
      "REC-9 · Todo · 3 Medium",
    );
    expect(view.sync).toBe("Synced 2 min ago");
  });

  it('a search for "booking" finds rows in both tabs, each meta saying where it lives first', async () => {
    const view = await sheet(serverFor("pool-search"), {
      query: "booking",
      filters: { client: C.personal },
    });
    // Search ignores the tab's filters and looks in both tabs.
    expect(view.search?.rows.map((r) => [r.title, r.meta])).toEqual([
      ["[Booking: reschedule flow]", "Pool · Kestrel · KES-58 · 3 Medium"],
      ["[Lay out the booking page]", "Linear · Alder · ALD-14 · 1 Quick"],
    ]);
    expect(view.search?.noMatch).toBe(false);
    const ids = await sheet(serverFor("pool-search"), { query: "ald-14" });
    expect(ids.search?.rows.map((r) => r.title)).toEqual([
      "[Lay out the booking page]",
    ]);
  });

  it("nothing matching is one New task row", async () => {
    const view = await sheet(serverFor("pool-search-none"), {
      query: "quarterly report",
    });
    expect(view.search).toEqual({ rows: [], noMatch: true });
  });

  it("with clients off no row carries a client: no heads, no choices, no client in search metas", async () => {
    const pool = await sheet(serverFor("pool-clients-off"), {
      filters: { client: C.kestrel },
    });
    expect(pool.groups.every((g) => g.head.kind !== "client")).toBe(true);
    expect(pool.clientChoices).toEqual([]);
    // A client filter left over narrows nothing with clients off.
    expect(rows(pool)).toHaveLength(4);
    const search = await sheet(serverFor("pool-clients-off"), {
      query: "booking",
    });
    expect(search.search?.rows.map((r) => r.meta)).toEqual([
      "Pool · KES-58 · 3 Medium",
    ]);
  });

  it("Linear not connected keeps the tab, as Connect Linear; the empty pool is empty, not filtered", async () => {
    const off = await sheet(serverFor("pool-sheet-linear-off"), {
      tab: "linear",
    });
    expect(off.linearConnected).toBe(false);
    const empty = await sheet(serverFor("pool-sheet-empty"));
    expect(empty).toMatchObject({
      empty: true,
      filteredOut: false,
      groups: [],
    });
  });
});
