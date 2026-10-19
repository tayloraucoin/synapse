import {
  slotRecord,
  workItemRecord,
  type LinearIssue,
  type LinearSnapshotPayload,
} from "@syn/validators";
import { fixtureId } from "../ids";
import { noIntegrations } from "../integrations/records";
import {
  issueId,
  PROJECTS,
  stateId,
  teamId,
  withIntegrations,
} from "../integrations/workspaces";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { POOL_IDS, poolRecords } from "./pool";
import { SET_UP_IDS, SET_UP_NOW } from "./set-up";

/**
 * The phone's pool sheet (USE-79) on USE-55's this week, Sunday 21:10, over
 * Monday 12: the boards' rows. Kestrel Health (its own workspace: Portal team
 * and Records team), Alder Studio (the Brand site) and Personal, in that
 * order. In the pool: [Booking: reschedule flow] (KES-58, due Wed),
 * [Portal: e2e tests for sign-in] (KES-61), [Brand site: case study
 * template] (ALD-22, 8 Huge) and [Invoice template refresh] (no Linear).
 * [Portal sign-in: magic link flow] (KES-42) is on Mon 12 in Primary. In
 * Linear, not in the pool: KES-63 (Backlog), REC-9 and ALD-25; the search
 * scenarios add ALD-14, [Lay out the booking page]. Synced two minutes ago.
 * Bracketed names are the boards' placeholders.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

/** Two minutes before SET_UP_NOW (Sun 11 Oct, 21:10 in Toronto). */
export const POOL_SHEET_SYNCED = "2026-10-12T01:08:00.000Z";
/** Monday 12 October: the day the sheet opens over. */
export const POOL_SHEET_DATE = "2026-10-12";

/** Pool sheet ids count from 791, clear of the others. */
const id = (table: number, n: number) => fixtureId(table, 790 + n);

export const POOL_SHEET_IDS = {
  workItems: {
    kes58: id(4, 1),
    kes61: id(4, 2),
    ald22: id(4, 3),
    invoice: id(4, 4),
    kes42: id(4, 5),
  },
  slots: { kes42Mon: id(3, 1) },
} as const;

const C = POOL_IDS.clients;
const W = POOL_SHEET_IDS.workItems;
const RECORDS_IMPORT = "project-records-import";
const emoji = (value: string) => ({ kind: "emoji" as const, value });

const workItems = [
  {
    id: W.kes58,
    title: "[Booking: reschedule flow]",
    icon: emoji("📅"),
    size: "medium",
    clientId: C.kestrel,
    linearIdentifier: "KES-58",
    dueOn: "2026-10-14",
  },
  {
    id: W.kes61,
    title: "[Portal: e2e tests for sign-in]",
    icon: emoji("🧪"),
    size: "large",
    clientId: C.kestrel,
    linearIdentifier: "KES-61",
  },
  {
    id: W.ald22,
    title: "[Brand site: case study template]",
    icon: emoji("🎨"),
    size: "huge",
    clientId: C.alder,
    linearIdentifier: "ALD-22",
  },
  {
    id: W.invoice,
    title: "[Invoice template refresh]",
    icon: emoji("🧾"),
    size: "quick",
    clientId: C.personal,
    linearIdentifier: null,
  },
  {
    id: W.kes42,
    title: "[Portal sign-in: magic link flow]",
    icon: emoji("🔑"),
    size: "medium",
    clientId: C.kestrel,
    linearIdentifier: "KES-42",
  },
].map((item) =>
  workItemRecord.parse({
    ...stamps,
    notes: null,
    lengthMinMin: null,
    lengthMaxMin: null,
    dueOn: null,
    parentWorkItemId: null,
    doneAt: null,
    doneSource: null,
    archivedAt: null,
    linearConnectionId: null,
    linearIssueId: null,
    ...item,
  }),
);

type Seed = [
  identifier: string,
  title: string,
  state: "Backlog" | "Todo" | "In progress",
  estimate: number,
  projectId: string,
  dueDate?: string,
];

function issue(urlKey: string, seed: Seed): LinearIssue {
  const [identifier, title, state, estimate, projectId, dueDate] = seed;
  const key = identifier.split("-")[0]!;
  return {
    id: issueId(identifier),
    identifier,
    title,
    description: null,
    url: `https://linear.app/${urlKey}/issue/${identifier}`,
    stateId: stateId(key, state),
    priority: 3,
    estimate,
    dueDate: dueDate ?? null,
    labels: [],
    projectId,
    teamId: teamId(key),
    parentId: null,
    assignedToMe: true,
  };
}

/** Kestrel's workspace: one company, two teams, so one client with two lines (D-USE-42). */
function kestrel(payload: LinearSnapshotPayload): LinearSnapshotPayload {
  const records = payload.states
    .filter((s) => s.teamId === teamId("KES"))
    .map((s) => ({
      ...s,
      id: s.id.replace("state-KES-", "state-REC-"),
      teamId: teamId("REC"),
    }));
  const P = PROJECTS.patientPortal;
  return {
    ...payload,
    teams: [
      { id: teamId("KES"), key: "KES", name: "Portal team", icon: null },
      { id: teamId("REC"), key: "REC", name: "Records team", icon: null },
    ],
    projects: [
      { id: P, name: "Patient portal", icon: "🏥", color: "#4ea7fc" },
      {
        id: RECORDS_IMPORT,
        name: "Records import",
        icon: "📁",
        color: "#4cb782",
      },
    ],
    states: [
      ...payload.states.filter((s) => s.teamId === teamId("KES")),
      ...records,
    ],
    subIssues: [],
    issues: (
      [
        ["KES-58", "[Booking: reschedule flow]", "Todo", 3, P, "2026-10-14"],
        ["KES-61", "[Portal: e2e tests for sign-in]", "Todo", 5, P],
        // [ASSUMPTION] Due Wed where the board drew Thu: due words show two days ahead (D-USE-98).
        ["KES-63", "[Reminder opt-out link]", "Backlog", 2, P, "2026-10-14"],
        ["KES-42", "[Portal sign-in: magic link flow]", "In progress", 3, P],
        ["REC-9", "[CSV mapping screen]", "Todo", 3, RECORDS_IMPORT],
      ] satisfies Seed[]
    ).map((seed) => issue("kestrel", seed)),
  };
}

/** The Brand site, Alder's; ALD-14 waits in Linear in the search scenarios. */
function lighthouse(
  payload: LinearSnapshotPayload,
  bookingPage: boolean,
): LinearSnapshotPayload {
  const B = PROJECTS.brandSite;
  const seeds: Seed[] = [
    ["ALD-22", "[Brand site: case study template]", "Todo", 8, B],
    ["ALD-25", "[Brand site: contact form]", "Todo", 1, B],
  ];
  if (bookingPage)
    seeds.push(["ALD-14", "[Lay out the booking page]", "Todo", 1, B]);
  return {
    ...payload,
    // The team named as its project stands as the project alone.
    teams: [{ id: teamId("ALD"), key: "ALD", name: "Brand site", icon: null }],
    projects: [{ id: B, name: "Brand site", icon: "🌐", color: "#f2c94c" }],
    states: payload.states.filter((s) => s.teamId === teamId("ALD")),
    subIssues: [],
    issues: seeds.map((seed) => issue("lighthouse", seed)),
  };
}

export interface PoolSheetRecordsOptions {
  bookingPage?: boolean;
  empty?: boolean;
  linearOff?: boolean;
  clientsOff?: boolean;
}

/** USE-55's this week with the boards' pool, Kestrel and Lighthouse connected. */
export function poolSheetRecords(
  options: PoolSheetRecordsOptions = {},
): FixtureRecords {
  const base = poolRecords();
  const integrations = structuredClone(base.integrations ?? noIntegrations());
  integrations.linear = integrations.linear.map(({ connection, snapshot }) => {
    const isKestrel = connection.urlKey === "kestrel";
    return {
      connection: {
        ...connection,
        lastSyncedAt: POOL_SHEET_SYNCED,
        // Lighthouse is Alder's whole workspace here.
        clientId: isKestrel ? C.kestrel : C.alder,
        perProject: false,
      },
      snapshot: isKestrel
        ? kestrel(snapshot)
        : lighthouse(snapshot, options.bookingPage ?? false),
    };
  });
  integrations.projectClients = [];
  const items = options.empty ? [] : workItems;
  const kept = new Set(items.map((item) => item.id));
  const slots = base.slots.filter(
    (slot) => slot.workItemId === null || kept.has(slot.workItemId),
  );
  if (!options.empty) {
    slots.push(
      slotRecord.parse({
        ...stamps,
        id: POOL_SHEET_IDS.slots.kes42Mon,
        blockId: SET_UP_IDS.blocks.work,
        onDate: POOL_SHEET_DATE,
        skipped: false,
        sortOrder: 20,
        blockItemId: null,
        todoId: null,
        workItemId: W.kes42,
        tier: "primary",
        lengthMin: null,
        tookMin: null,
        doneAt: null,
      }),
    );
  }
  const clients = base.clients.map((client) => ({
    ...client,
    name: client.name.replace(" [placeholder]", ""),
  }));
  const records = withIntegrations(
    {
      ...base,
      clients,
      clientsEnabled: !options.clientsOff,
      workItems: structuredClone(items),
      slots,
    },
    options.linearOff
      ? {
          ...noIntegrations(),
          googleAccounts: integrations.googleAccounts,
          googleCalendars: integrations.googleCalendars,
        }
      : integrations,
  );
  return records;
}

export type PoolSheetScenarioName =
  | "pool-sheet"
  | "pool-filter"
  | "pool-search"
  | "pool-search-none"
  | "pool-from-linear"
  | "pool-sheet-linear-off"
  | "pool-sheet-empty"
  | "pool-clients-off";

const OPTIONS: Record<PoolSheetScenarioName, PoolSheetRecordsOptions> = {
  "pool-sheet": {},
  "pool-filter": {},
  "pool-search": { bookingPage: true },
  "pool-search-none": { bookingPage: true },
  "pool-from-linear": {},
  // USE-74's pool-linear-off is the desk's; the phone's takes its own name.
  "pool-sheet-linear-off": { linearOff: true },
  "pool-sheet-empty": { empty: true },
  "pool-clients-off": { clientsOff: true },
};

export const POOL_SHEET_SCENARIOS: Record<string, () => Scenario> =
  Object.fromEntries(
    Object.entries(OPTIONS).map(([name, options]) => [
      name,
      (): Scenario => ({
        name,
        now: SET_UP_NOW,
        records: poolSheetRecords(options),
        mode: "ready",
      }),
    ]),
  );
