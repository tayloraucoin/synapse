import { clientRecord, slotRecord, workItemRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import {
  integrationRecords,
  PROJECTS,
  withIntegrations,
} from "../integrations/workspaces";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { SET_UP_IDS, SET_UP_NOW, setUpThisWeekRecords } from "./set-up";

/**
 * The pool (USE-55): the ledger's placeholders on USE-36's this week (12 to
 * 18 Oct, Work Monday to Thursday), clients on. Kestrel Health, Alder Studio
 * and Personal in that order; KES-58, KES-63 and BIZ-9 under Kestrel; ALD-21
 * and ALD-17 (sessions Mon to Wed) under Alder; SYN-218 at 20 h and SYN-212
 * (three sessions) under Personal; a Synapse-only item with no client. One
 * done and one archived item stand outside the pool. Bracketed names are the
 * boards' placeholders.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

/** Eight minutes before SET_UP_NOW (Sun 11 Oct, 21:10 in Toronto). */
export const POOL_LAST_SYNCED = "2026-10-12T01:02:00.000Z";

/** Pool ids count from 301, clear of the set-up's. */
const id = (table: number, n: number) => fixtureId(table, 300 + n);

export const POOL_IDS = {
  clients: { kestrel: id(5, 1), alder: id(5, 2), personal: id(5, 3) },
  workItems: {
    kes58: id(4, 1),
    kes63: id(4, 2),
    biz9: id(4, 3),
    ald21: id(4, 4),
    ald17: id(4, 5),
    syn218: id(4, 6),
    syn212: id(4, 7),
    synapseOnly: id(4, 8),
    done: id(4, 9),
    archived: id(4, 10),
  },
  slots: {
    ald17Mon: id(3, 1),
    ald17Tue: id(3, 2),
    ald17Wed: id(3, 3),
    syn212Mon: id(3, 4),
    syn212Wed: id(3, 5),
    syn212Thu: id(3, 6),
    kes58Tue: id(3, 7),
  },
} as const;

const C = POOL_IDS.clients;
const W = POOL_IDS.workItems;
const S = POOL_IDS.slots;

const clients = [
  { id: C.kestrel, name: "Kestrel Health [placeholder]", colorKey: "rose" },
  { id: C.alder, name: "Alder Studio [placeholder]", colorKey: "moss" },
  { id: C.personal, name: "Personal", colorKey: "ink" },
].map((client, sortOrder) =>
  clientRecord.parse({
    ...stamps,
    logoPath: null,
    archivedAt: null,
    sortOrder,
    ...client,
  }),
);

const workItems = [
  {
    id: W.kes58,
    title: "[Patient intake form]",
    size: "medium",
    clientId: C.kestrel,
    linearIdentifier: "KES-58",
    dueOn: "2026-10-15",
  },
  {
    id: W.kes63,
    title: "[Appointment reminders]",
    size: "small",
    clientId: C.kestrel,
    linearIdentifier: "KES-63",
  },
  {
    id: W.biz9,
    title: "[Partnership one-pager]",
    size: "quick",
    clientId: C.kestrel,
    linearIdentifier: "BIZ-9",
  },
  {
    id: W.ald21,
    title: "[Brand site footer]",
    size: "small",
    clientId: C.alder,
    linearIdentifier: "ALD-21",
  },
  {
    id: W.ald17,
    title: "[Brand site case studies]",
    size: "large",
    clientId: C.alder,
    linearIdentifier: "ALD-17",
  },
  {
    id: W.syn218,
    title: "[Synapse: offline sync]",
    size: "huge",
    clientId: C.personal,
    linearIdentifier: "SYN-218",
    lengthMinMin: 960,
    lengthMaxMin: 1200,
  },
  {
    id: W.syn212,
    title: "[Synapse: desk Today layout]",
    size: "large",
    clientId: C.personal,
    linearIdentifier: "SYN-212",
  },
  {
    id: W.synapseOnly,
    title: "[Renew the domain]",
    size: "quick",
    clientId: null,
    linearIdentifier: null,
  },
  {
    id: W.done,
    title: "[Portal sign-in copy]",
    size: "small",
    clientId: C.kestrel,
    linearIdentifier: "KES-51",
    doneAt: "2026-10-09T15:00:00.000Z",
    doneSource: "linear",
  },
  {
    id: W.archived,
    title: "[Old landing page]",
    size: "small",
    clientId: C.alder,
    linearIdentifier: "ALD-9",
    archivedAt: "2026-10-08T15:00:00.000Z",
  },
].map((item) =>
  workItemRecord.parse({
    ...stamps,
    notes: null,
    icon: null,
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

const sessions = [
  [S.ald17Mon, W.ald17, "2026-10-12", "secondary"],
  [S.ald17Tue, W.ald17, "2026-10-13", "secondary"],
  [S.ald17Wed, W.ald17, "2026-10-14", "secondary"],
  [S.syn212Mon, W.syn212, "2026-10-12", "stretch"],
  [S.syn212Wed, W.syn212, "2026-10-14", "primary"],
  [S.syn212Thu, W.syn212, "2026-10-15", "secondary"],
  [S.kes58Tue, W.kes58, "2026-10-13", "primary"],
] as const;

/** USE-36's this week, Monday's four slotted first, then the pool's sessions after them. */
export function poolRecords(): FixtureRecords {
  const week = setUpThisWeekRecords();
  const slots = sessions.map(([slotId, workItemId, onDate, tier]) =>
    slotRecord.parse({
      ...stamps,
      id: slotId,
      blockId: SET_UP_IDS.blocks.work,
      onDate,
      skipped: false,
      sortOrder:
        10 +
        sessions
          .filter(([, , date]) => date === onDate)
          .findIndex(([sid]) => sid === slotId),
      blockItemId: null,
      todoId: null,
      workItemId,
      tier,
      lengthMin: null,
      tookMin: null,
      doneAt: null,
    }),
  );
  // A copy, so no scenario shares rows with another.
  return withIntegrations(
    structuredClone({
      ...week,
      clients,
      clientsEnabled: true,
      workItems: [...week.workItems, ...workItems],
      slots: [...week.slots, ...slots],
    }),
    poolIntegrations(),
  );
}

/**
 * The pool's workspaces (USE-56): Kestrel's is Kestrel's; Lighthouse is set
 * per project, Brand site Alder's and Synapse Personal.
 */
function poolIntegrations() {
  const integrations = integrationRecords(POOL_LAST_SYNCED);
  const [kestrel, lighthouse] = integrations.linear;
  kestrel!.connection.clientId = C.kestrel;
  lighthouse!.connection.perProject = true;
  const connectionId = lighthouse!.connection.id;
  integrations.projectClients = [
    { connectionId, projectId: PROJECTS.brandSite, clientId: C.alder },
    { connectionId, projectId: PROJECTS.synapse, clientId: C.personal },
  ];
  return integrations;
}

export const POOL_SCENARIOS: Record<string, () => Scenario> = {
  pool: () => ({
    name: "pool",
    now: SET_UP_NOW,
    records: poolRecords(),
    mode: "ready",
  }),
};
