import { describe, expect, it } from "vitest";
import { GOOGLE_SCOPES } from "@/lib/fixtures/integrations/connect";
import { INTEGRATION_IDS } from "@/lib/fixtures/integrations/workspaces";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import { connectionsRoute, settingsRoute } from "@/lib/routes";

/**
 * USE-85: Settings › Connections on fixtures. The page's reads and writes
 * go through `useConnections`, which calls these server methods as named.
 */

const CAL = INTEGRATION_IDS.calendars;
const CONN = INTEGRATION_IDS.connections;

function setup(name: string) {
  return createFixtureServer(resolveScenario(name), () => new Date(SET_UP_NOW));
}

describe("C-USE-settings-4: nothing on Connections writes to Google or Linear", () => {
  it("a switch, a connect and a disconnect leave the Linear outbox as it was", async () => {
    const server = setup("settings-connections");
    const before = (await server.readLinear()).outbox;
    await server.writeCalendar({ calendarId: CAL.personal, enabled: false });
    await server.connect("google");
    await server.connect("linear");
    await server.disconnect(CONN.lighthouse);
    expect((await server.readLinear()).outbox).toEqual(before);
  });

  it("the Google connect would ask for read-only calendar access alone (D-USE-116)", () => {
    expect(GOOGLE_SCOPES.every((scope) => scope.endsWith(".readonly"))).toBe(
      true,
    );
  });
});

describe("C-USE-settings-connections-1: as drawn", () => {
  it("clients off, Personal and Lighthouse team on, Family and Holidays off, two workspaces", async () => {
    const server = setup("settings-connections");
    const { calendars, accounts } = await server.readGoogleCalendars();
    expect(accounts).toHaveLength(1);
    expect(calendars.map((c) => [c.id, c.enabled])).toEqual([
      [CAL.personal, true],
      [CAL.team, true],
      [CAL.family, false],
      [CAL.holidays, false],
    ]);
    const connections = await server.readConnections();
    expect(connections.clientsEnabled).toBe(false);
    expect(connections.linear.map((c) => c.id)).toEqual([
      CONN.kestrel,
      CONN.lighthouse,
    ]);
  });
});

describe("C-USE-settings-connections-2: a calendar switched off", () => {
  it("reads off at once, so its dot empties", async () => {
    const server = setup("settings-connections");
    await server.writeCalendar({ calendarId: CAL.team, enabled: false });
    const { calendars } = await server.readGoogleCalendars();
    expect(calendars.find((c) => c.id === CAL.team)?.enabled).toBe(false);
  });
});

describe("C-USE-settings-error-2: a change that fails to save", () => {
  it("is refused and leaves the calendar as it was; Try again saves", async () => {
    const server = setup("settings-save-fails");
    await expect(
      server.writeCalendar({ calendarId: CAL.personal, enabled: false }),
    ).rejects.toThrow();
    let { calendars } = await server.readGoogleCalendars();
    expect(calendars.find((c) => c.id === CAL.personal)?.enabled).toBe(true);
    await server.writeCalendar({ calendarId: CAL.personal, enabled: false });
    ({ calendars } = await server.readGoogleCalendars());
    expect(calendars.find((c) => c.id === CAL.personal)?.enabled).toBe(false);
  });
});

describe("C-USE-settings-connecting-1: connect", () => {
  it("a Google account joins with its calendars off; a workspace joins connected", async () => {
    const server = setup("settings-empty");
    await server.connect("google");
    const { accounts, calendars } = await server.readGoogleCalendars();
    expect(accounts).toHaveLength(1);
    expect(calendars.every((c) => !c.enabled)).toBe(true);
    await server.connect("linear");
    expect((await server.readConnections()).linear).toHaveLength(1);
  });

  it("a failed connect changes nothing", async () => {
    const scenario = resolveScenario("settings-connections");
    const server = createFixtureServer(
      { ...scenario, failWrites: ["connect"] },
      () => new Date(SET_UP_NOW),
    );
    await expect(server.connect("linear")).rejects.toThrow();
    expect((await server.readConnections()).linear).toHaveLength(2);
  });
});

describe("C-USE-settings-empty-1: nothing connected", () => {
  it("has no account, no calendar and no workspace", async () => {
    const server = setup("settings-empty");
    const google = await server.readGoogleCalendars();
    expect(google.accounts).toEqual([]);
    expect(google.calendars).toEqual([]);
    expect((await server.readConnections()).linear).toEqual([]);
  });
});

describe("C-USE-settings-error-1: the calendar list fails alone", () => {
  it("rejects the calendars while Linear reads, until retried", async () => {
    const server = setup("settings-error");
    await expect(server.readGoogleCalendars()).rejects.toThrow();
    expect((await server.readConnections()).linear).toHaveLength(2);
    server.recoverCalendars();
    expect((await server.readGoogleCalendars()).calendars).toHaveLength(4);
  });
});

describe("C-USE-settings-offline-1: offline", () => {
  it("refuses connect and disconnect; a switch saves on the phone", async () => {
    const server = setup("settings-offline");
    await expect(server.connect("google")).rejects.toThrow();
    await expect(server.disconnect(CONN.kestrel)).rejects.toThrow();
    await server.writeCalendar({ calendarId: CAL.holidays, enabled: true });
    const { calendars } = await server.readGoogleCalendars();
    expect(calendars.find((c) => c.id === CAL.holidays)?.enabled).toBe(true);
  });
});

describe("Settings is pushed from the avatar, Connections under it", () => {
  it("drops the tabs on both, and Connect Linear's route is Connections", async () => {
    const { isPushedPath, tabForPath } =
      await import("@/app/(shell)/_components/nav-items");
    expect(connectionsRoute()).toBe(`${settingsRoute()}/connections`);
    expect(isPushedPath(settingsRoute())).toBe(true);
    expect(isPushedPath(connectionsRoute())).toBe(true);
    expect(tabForPath(connectionsRoute())).toBeNull();
  });
});
