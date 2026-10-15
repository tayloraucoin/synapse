import {
  blockItemRecord,
  blockRecord,
  clientRecord,
  dayRecordRecord,
  journalEntryRecord,
  linkRecord,
  mealTopicRecord,
  passageRecord,
  quoteRecord,
  savedColourRecord,
  slotEventRecord,
  slotRecord,
  todoRecord,
  workItemRecord,
} from "@syn/validators";
import { fixtureId } from "../ids";
import {
  integrationRecords,
  withIntegrations,
} from "../integrations/workspaces";
import type { FixtureRecords } from "../records";

/**
 * The base day (USE-7): Monday 12 October 2026 at 10:20, Toronto time, the
 * day opening at 03:00. Wellness is done, Urgent is done, Primary is running;
 * Lunch and the To-dos block are ahead. Names and times are placeholders.
 *
 * Every record is built through its schema's `parse`, so a record that drifts
 * from USE-3 fails `yarn test` instead of rendering.
 */

export const BASE_DATE = "2026-10-12";
export const BASE_NOW = "2026-10-12T10:20:00-04:00";

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

/** An instant on the base date, `HH:MM` in Toronto (EDT, -04:00). */
function onBase(time: string): string {
  return `${BASE_DATE}T${time}:00-04:00`;
}

const DAILY = "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=DAILY";
const WEEKDAYS =
  "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";

export const BASE_IDS = {
  blocks: {
    wellness: fixtureId(1, 1),
    work: fixtureId(1, 2),
    lunch: fixtureId(1, 3),
    todos: fixtureId(1, 4),
  },
  blockItems: { stretch: fixtureId(2, 1), walk: fixtureId(2, 2) },
  slots: {
    stretch: fixtureId(3, 1),
    walk: fixtureId(3, 2),
    urgent: fixtureId(3, 3),
    primary: fixtureId(3, 4),
    secondary: fixtureId(3, 5),
    stretchWork: fixtureId(3, 6),
    errand: fixtureId(3, 7),
    call: fixtureId(3, 8),
  },
  workItems: {
    urgent: fixtureId(4, 1),
    primary: fixtureId(4, 2),
    secondary: fixtureId(4, 3),
    stretch: fixtureId(4, 4),
    unslotted: fixtureId(4, 5),
  },
  clients: { kestrel: fixtureId(5, 1), harbor: fixtureId(5, 2) },
  todos: {
    errand: fixtureId(6, 1),
    call: fixtureId(6, 2),
    home: fixtureId(6, 3),
    reminder: fixtureId(6, 4),
  },
} as const;

const B = BASE_IDS;

const blockDefaults = {
  ...stamps,
  icon: null,
  color: null,
  onDate: null,
  checklist: false,
  meal: false,
  notify: false,
  archivedAt: null,
};

const blocks = [
  {
    id: B.blocks.wellness,
    kind: "wellness",
    name: "Wellness",
    startsAt: "07:00",
    endsAt: "08:00",
    rrule: DAILY,
    fill: "set_items",
    checklist: true,
  },
  {
    id: B.blocks.work,
    kind: "work",
    name: "Work",
    startsAt: "09:00",
    endsAt: "12:00",
    rrule: WEEKDAYS,
    fill: "tasks_for_the_day",
  },
  {
    id: B.blocks.lunch,
    kind: "break",
    name: "Lunch",
    startsAt: "12:00",
    endsAt: "13:00",
    rrule: WEEKDAYS,
    fill: null,
    meal: true,
  },
  {
    id: B.blocks.todos,
    kind: "todos",
    name: "To-dos",
    startsAt: "16:00",
    endsAt: "17:00",
    rrule: WEEKDAYS,
    fill: "from_todos",
  },
].map((block) => blockRecord.parse({ ...blockDefaults, ...block }));

const blockItems = [
  { id: B.blockItems.stretch, title: "Stretch", sortOrder: 0 },
  { id: B.blockItems.walk, title: "Walk", sortOrder: 1 },
].map((item) =>
  blockItemRecord.parse({
    ...stamps,
    blockId: B.blocks.wellness,
    icon: null,
    isTransition: false,
    atTime: null,
    lengthMin: null,
    meal: false,
    onDate: null,
    ...item,
  }),
);

const clients = [
  { id: B.clients.kestrel, name: "Kestrel", colorKey: "rose", sortOrder: 0 },
  { id: B.clients.harbor, name: "Harbor", colorKey: "leaf", sortOrder: 1 },
].map((client) =>
  clientRecord.parse({
    ...stamps,
    logoPath: null,
    archivedAt: null,
    ...client,
  }),
);

const workItems = [
  {
    id: B.workItems.urgent,
    title: "Portal sign-in redirect",
    size: "small",
    clientId: B.clients.kestrel,
    linearIdentifier: "KES-41",
    doneAt: onBase("09:45"),
    doneSource: "synapse",
  },
  {
    id: B.workItems.primary,
    title: "Portal sign-in",
    size: "medium",
    clientId: B.clients.kestrel,
    linearIdentifier: "KES-42",
  },
  {
    id: B.workItems.secondary,
    title: "Invoice export",
    size: "small",
    clientId: B.clients.harbor,
    linearIdentifier: "HAR-17",
  },
  {
    id: B.workItems.stretch,
    title: "Archive old reports",
    size: "quick",
    clientId: B.clients.harbor,
    linearIdentifier: null,
  },
  {
    id: B.workItems.unslotted,
    title: "Onboarding emails",
    size: null,
    clientId: null,
    linearIdentifier: null,
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

const todos = [
  {
    id: B.todos.errand,
    title: "Pick up the dry cleaning",
    type: "errand",
    onDate: BASE_DATE,
  },
  { id: B.todos.call, title: "Call the dentist", type: "call", lengthMin: 10 },
  { id: B.todos.home, title: "Fix the cupboard hinge", type: "home" },
  {
    id: B.todos.reminder,
    title: "Drink water",
    type: "other",
    rrule: DAILY,
    remindAt: "10:00",
  },
].map((todo) =>
  todoRecord.parse({
    ...stamps,
    icon: null,
    lengthMin: null,
    notes: null,
    onDate: null,
    rrule: null,
    remindAt: null,
    remindOn: null,
    doneAt: null,
    archivedAt: null,
    ...todo,
  }),
);

const slotDefaults = {
  ...stamps,
  onDate: BASE_DATE,
  skipped: false,
  blockItemId: null,
  todoId: null,
  workItemId: null,
  tier: null,
  lengthMin: null,
  tookMin: null,
  doneAt: null,
};

const slots = [
  {
    id: B.slots.stretch,
    blockId: B.blocks.wellness,
    sortOrder: 0,
    blockItemId: B.blockItems.stretch,
    doneAt: onBase("07:20"),
  },
  {
    id: B.slots.walk,
    blockId: B.blocks.wellness,
    sortOrder: 1,
    blockItemId: B.blockItems.walk,
    doneAt: onBase("07:50"),
  },
  {
    id: B.slots.urgent,
    blockId: B.blocks.work,
    sortOrder: 0,
    workItemId: B.workItems.urgent,
    tier: "urgent",
    lengthMin: 45,
    tookMin: 45,
    doneAt: onBase("09:45"),
  },
  {
    id: B.slots.primary,
    blockId: B.blocks.work,
    sortOrder: 1,
    workItemId: B.workItems.primary,
    tier: "primary",
    lengthMin: 90,
  },
  {
    id: B.slots.secondary,
    blockId: B.blocks.work,
    sortOrder: 2,
    workItemId: B.workItems.secondary,
    tier: "secondary",
    lengthMin: 45,
  },
  {
    id: B.slots.stretchWork,
    blockId: B.blocks.work,
    sortOrder: 3,
    workItemId: B.workItems.stretch,
    tier: "stretch",
    lengthMin: 20,
  },
  {
    id: B.slots.errand,
    blockId: B.blocks.todos,
    sortOrder: 0,
    todoId: B.todos.errand,
  },
  {
    id: B.slots.call,
    blockId: B.blocks.todos,
    sortOrder: 1,
    todoId: B.todos.call,
  },
].map((slot) => slotRecord.parse({ ...slotDefaults, ...slot }));

const slotEvents = [
  { n: 1, slotId: B.slots.urgent, kind: "started", at: "09:00" },
  { n: 2, slotId: B.slots.urgent, kind: "done", at: "09:45" },
  { n: 3, slotId: B.slots.primary, kind: "started", at: "09:50" },
].map(({ n, at, ...event }) =>
  slotEventRecord.parse({
    id: fixtureId(7, n),
    createdAt: onBase(at),
    clientEventId: fixtureId(7, 100 + n),
    at: onBase(at),
    receivedAt: onBase(at),
    stepAwayId: null,
    ...event,
  }),
);

/** Four custom colours, newest (highest `sortOrder`) first as Saved shows them (USE-11). */
const savedColours = ["#3d5a80", "#d4893a", "#6a4c93", "#2f6f62"].map(
  (hex, n) =>
    savedColourRecord.parse({
      id: fixtureId(9, n + 1),
      ...stamps,
      hex,
      sortOrder: n,
    }),
);

/**
 * Meal topics (USE-22; the sheet's frame "with icons"): an icon on its kind
 * colour, a name and one link, in the chips' order. Every link is a
 * [placeholder].
 */
const mealTopics = [
  {
    name: "Agent workflows",
    icon: { kind: "lucide", value: "bot", color: "sky" },
    linkKind: "playlist",
    linkValue: "https://www.youtube.com/playlist?list=PLplaceholder0agents",
  },
  {
    name: "Strength training",
    icon: { kind: "lucide", value: "dumbbell", color: "rose" },
    linkKind: "channel",
    linkValue: "@placeholder",
  },
  {
    name: "Roman history",
    icon: { kind: "lucide", value: "landmark", color: "amber" },
    linkKind: "search",
    linkValue: "roman history documentary",
  },
  {
    name: "Cooking basics",
    icon: { kind: "lucide", value: "cooking-pot", color: "leaf" },
    linkKind: "search",
    linkValue: "simple weeknight cooking",
  },
].map((topic, n) =>
  mealTopicRecord.parse({
    id: fixtureId(0, 41 + n),
    ...stamps,
    ...topic,
    sortOrder: n,
  }),
);

/** The topics' ids, in order. */
export const MEAL_TOPIC_IDS = {
  agentWorkflows: fixtureId(0, 41),
  strengthTraining: fixtureId(0, 42),
  romanHistory: fixtureId(0, 43),
  cookingBasics: fixtureId(0, 44),
} as const;

/** The four topics, a fresh copy each call. */
export function baseMealTopics() {
  return structuredClone(mealTopics);
}

/**
 * The account on the boards (USE-83): "Taylor Aucoin", with a photo. The
 * photo is a drawn [placeholder] in warm tones, inline so a capture needs no
 * network; the no-photo scenario clears it.
 */
const PLACEHOLDER_PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="hsl(27 37% 50%)"/><circle cx="20" cy="16" r="7" fill="hsl(25 42% 38%)"/><path d="M6 40c2-9 8-13 14-13s12 4 14 13z" fill="hsl(25 42% 38%)"/></svg>',
)}`;

export const baseAccount = {
  name: "Taylor Aucoin",
  email: "taylor@example.com",
  photoUrl: PLACEHOLDER_PHOTO,
};

/*
 * ---- The morning (USE-12): Orient's reading, links and last night ----
 * Every passage, link, quote and line is a [placeholder].
 */

const passages = [
  {
    title: "Morning reading",
    bodyMd:
      "Begin where the feet are. The breath has kept time all night without being asked. Before the list and before the clock there is only this: cool air, a held breath, the weight of the body on the floor, and the slow return of the room as the light comes up behind the blinds.",
  },
  {
    title: "Morning reading",
    bodyMd:
      "Nothing has to be decided yet. The day will ask its questions soon enough; for now the kettle, the window, and one long exhale are enough to be getting on with.",
  },
].map((passage, n) =>
  passageRecord.parse({
    id: fixtureId(0, n + 1),
    ...stamps,
    ...passage,
    images: [],
    sortOrder: n,
  }),
);

const links = [
  {
    title: "Morning calm",
    url: "https://open.spotify.com/playlist/morning-calm",
  },
  { title: "Cold bath", url: "https://open.spotify.com/playlist/cold-bath" },
].map((link, n) =>
  linkRecord.parse({
    id: fixtureId(0, n + 11),
    ...stamps,
    ...link,
    kind: "spotify",
    sortOrder: n,
  }),
);

const quotes = [
  quoteRecord.parse({
    id: fixtureId(0, 21),
    ...stamps,
    onDate: BASE_DATE,
    text: "The morning is the one hour that belongs to no one else.",
    attribution: "A placeholder",
  }),
];

/** Sunday's evening, read back on Monday as "Last night". */
const journalEntries = [
  journalEntryRecord.parse({
    onDate: "2026-10-11",
    answers: {
      make_happen_tomorrow:
        "Finish the Primary before lunch and leave the desk by six.",
      visualisation: "A slow start, a long walk, and the hard part done early.",
      looking_forward: "The cold bath, and dinner with the light still out.",
    },
  }),
];

/** The base day was opened at 6:55 and readied at 7:05, and Start was tapped. */
const dayRecords = [
  dayRecordRecord.parse({
    id: fixtureId(0, 31),
    ...stamps,
    onDate: BASE_DATE,
    orientedAt: onBase("06:55"),
    readyAt: onBase("07:05"),
    closedAt: null,
  }),
];

/** The morning's rows, shared by every scenario unless it says otherwise. */
export function morningRecords() {
  return structuredClone({
    usualWakeTime: "07:00",
    dayRecords,
    passages,
    links,
    quotes,
    morningLines: [],
    journalEntries,
  });
}

/** Today's work linked to its issues (USE-56): Kestrel's workspace is Kestrel's; clients stay off. */
function baseIntegrations() {
  const integrations = integrationRecords("2026-10-12T14:10:00.000Z");
  integrations.linear[0]!.connection.clientId = B.clients.kestrel;
  return integrations;
}

export function baseRecords(): FixtureRecords {
  return withIntegrations(baseDayRecords(), baseIntegrations());
}

/** The base day's rows; a scenario copies them, never shares them. */
function baseDayRecords(): FixtureRecords {
  return structuredClone({
    timeZone: "America/Toronto",
    dayCloseTime: "03:00",
    blocks,
    blockChanges: [],
    blockItems,
    slots,
    workItems,
    clients,
    clientsEnabled: false,
    todos,
    dayEvents: [],
    dayBounds: [],
    slotEvents,
    savedColours,
    ...morningRecords(),
    account: baseAccount,
    mealTopics,
  });
}

/** The same person with nothing made yet. */
export function emptyRecords(): FixtureRecords {
  return {
    timeZone: "America/Toronto",
    dayCloseTime: "03:00",
    blocks: [],
    blockChanges: [],
    blockItems: [],
    slots: [],
    workItems: [],
    clients: [],
    clientsEnabled: false,
    todos: [],
    dayEvents: [],
    dayBounds: [],
    slotEvents: [],
    savedColours: [],
    ...morningRecords(),
    passages: [],
    quotes: [],
    journalEntries: [],
    account: { ...baseAccount },
  };
}
