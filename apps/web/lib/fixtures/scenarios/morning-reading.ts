import { linkRecord, passageRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE, baseRecords } from "./base-day";
import type { Scenario } from "./index";

/**
 * Settings › Morning reading's scenarios (USE-151): one per key in the
 * ledger's States table (`ux/account/morning-reading/index.md`), named
 * `morning-reading-<key>`, at 21:40 on the base Monday. The words are the
 * boards' [placeholder]s: three passages (the third untitled), two links,
 * one passage off ("The long view") and one link off ("A cup, not a race").
 *
 * The sheet, menu and overlay keys hold their start in `view.open`, read by
 * USE-152 (rows) and USE-153 (sheets): `sheet:add-passage`,
 * `sheet:edit-passage:<id>`, `sheet:add-link`, `sheet:edit-link:<id>`,
 * `discard:<id>`, `link-invalid:<id>`, `menu:<id>`, `off-undo:<id>`,
 * `delete-confirm:<id>`, `saved-drop:passage`, `saved`, and
 * `off-open:passage` for the open Off list.
 */

const AT = `${BASE_DATE}T21:40:00-04:00`;
const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

/** Fixed ids past every other morning id (passages 2001…, links 2011…). */
export const READING_IDS = {
  feet: fixtureId(0, 2001),
  slow: fixtureId(0, 2002),
  kettle: fixtureId(0, 2003),
  longView: fixtureId(0, 2004),
  /** The passage `saved` adds at the end. */
  added: fixtureId(0, 2005),
  calm: fixtureId(0, 2011),
  stretching: fixtureId(0, 2012),
  cup: fixtureId(0, 2013),
} as const;

const R = READING_IDS;

function passage(
  id: string,
  title: string | null,
  bodyMd: string,
  sortOrder: number,
) {
  return passageRecord.parse({
    id,
    ...stamps,
    title,
    bodyMd,
    images: [],
    sortOrder,
  });
}

function link(id: string, title: string, url: string, sortOrder: number) {
  return linkRecord.parse({
    id,
    ...stamps,
    title,
    url,
    kind: url.startsWith("https://open.spotify.com/") ? "spotify" : "other",
    sortOrder,
  });
}

function readingPassages() {
  return [
    passage(
      R.feet,
      "Where the feet are",
      "Begin where the feet are. The breath has kept time all night without being asked, and the floor is cool under the heels.",
      0,
    ),
    passage(
      R.slow,
      "Slow is a speed too",
      "Nothing about this hour needs to be won. *The kettle* takes as long as it takes.",
      1,
    ),
    passage(
      R.kettle,
      null,
      "Before the kettle boils, notice the window and what the light is doing on the far wall.",
      2,
    ),
  ];
}

function readingLinks() {
  return [
    link(
      R.calm,
      "Morning calm",
      "https://open.spotify.com/playlist/morning-calm",
      0,
    ),
    link(
      R.stretching,
      "Ten minutes of stretching",
      "https://example.org/stretching",
      1,
    ),
  ];
}

/** As drawn on `list`: three passages, two links, one of each off. */
export function morningReadingRecords(): FixtureRecords {
  const records = baseRecords();
  records.passages = readingPassages();
  records.links = readingLinks();
  records.passagesOff = [
    {
      ...passage(
        R.longView,
        "The long view",
        "A year from now, this morning will be one of three hundred and sixty-five, and it will still have mattered.",
        3,
      ),
      archivedAt: "2026-10-10T12:00:00.000Z",
    },
  ];
  records.linksOff = [
    {
      ...link(R.cup, "A cup, not a race", "https://example.org/cup", 2),
      archivedAt: "2026-10-09T12:00:00.000Z",
    },
  ];
  return records;
}

/** Nothing yet: no passages, no links, nothing off. */
function emptyReadingRecords(): FixtureRecords {
  const records = morningReadingRecords();
  records.passages = [];
  records.links = [];
  records.passagesOff = [];
  records.linksOff = [];
  return records;
}

/** After the drop: "Slow is a speed too" moved to the top. */
function droppedRecords(): FixtureRecords {
  const records = morningReadingRecords();
  const order = [R.slow, R.feet, R.kettle];
  for (const row of records.passages) row.sortOrder = order.indexOf(row.id);
  return records;
}

/** After Save: a new passage at the end. */
function savedRecords(): FixtureRecords {
  const records = morningReadingRecords();
  records.passages.push(
    passage(
      R.added,
      "A cup of something warm",
      "Hands around the cup before anything else.",
      3,
    ),
  );
  return records;
}

/** Off with Undo showing: "Slow is a speed too" just went off, its place kept. */
function offUndoRecords(): FixtureRecords {
  const records = morningReadingRecords();
  const index = records.passages.findIndex((row) => row.id === R.slow);
  const [row] = records.passages.splice(index, 1);
  records.passagesOff = [
    { ...row!, archivedAt: "2026-10-13T01:40:00.000Z" },
    ...(records.passagesOff ?? []),
  ];
  return records;
}

function reading(
  key: string,
  extra: Partial<Scenario> = {},
  records: () => FixtureRecords = morningReadingRecords,
): [string, () => Scenario] {
  const name = `morning-reading-${key}`;
  return [
    name,
    () => ({ name, now: AT, records: records(), mode: "ready", ...extra }),
  ];
}

const open = (what: string): Partial<Scenario> => ({ view: { open: what } });

export const MORNING_READING_SCENARIOS: Record<string, () => Scenario> =
  Object.fromEntries([
    reading("list"),
    reading("list-off-open", open("off-open:passage")),
    reading("empty", {}, emptyReadingRecords),
    reading("add-passage", open("sheet:add-passage")),
    reading("add-passage-images", open("sheet:add-passage")),
    reading("edit-passage", open(`sheet:edit-passage:${R.feet}`)),
    reading("edit-passage-images", open(`sheet:edit-passage:${R.feet}`)),
    reading("discard", open(`discard:${R.feet}`)),
    reading("add-link", open("sheet:add-link")),
    reading("edit-link", open(`sheet:edit-link:${R.calm}`)),
    reading("link-invalid", open(`link-invalid:${R.calm}`)),
    reading("reorder", {
      view: { drag: { itemId: R.kettle, beforeId: R.slow } },
    }),
    reading("row-menu", open(`menu:${R.slow}`)),
    reading("off-undo", open(`off-undo:${R.slow}`), offUndoRecords),
    reading("delete-confirm", open(`delete-confirm:${R.longView}`)),
    reading("saved-drop", open("saved-drop:passage"), droppedRecords),
    reading("saved", open("saved"), savedRecords),
    reading("save-failed", {
      ...open(`sheet:edit-passage:${R.feet}`),
      failWrites: [R.feet],
    }),
    reading("loading", { regions: { morningReading: "loading" } }),
    reading("error", { regions: { morningReading: "error" } }),
    reading("offline", { offline: true }),
    reading("offline-sheet", {
      ...open(`sheet:edit-passage:${R.feet}`),
      offline: true,
    }),
  ]);
