import { eq, getTableColumns, type Table } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";

import {
  categories,
  dataExports,
  dayBlocks,
  dayItems,
  days,
  feedbackMessages,
  fixtures,
  habits,
  journalEntries,
  misses,
  notificationDeliveries,
  notificationPrefs,
  reasons,
  shifts,
  templates,
  templateSlots,
  timerSessions,
  userAvatars,
  users,
  webPushSubscriptions,
  type RlsClient,
} from "@syn/db";

/**
 * The export's contents — official spec §7.6, Epic 1 ST-10.
 *
 * THE PROMISE IS *NOTHING IS LEFT OUT*, and the screen says so in those words.
 * So the columns are not transcribed here. Every header and every value comes
 * from `getTableColumns`, which reads the Drizzle schema itself: a column added
 * to `day_items` next month appears in the export the day it is added, and
 * there is no second list to forget to update. A hand-written column list would
 * pass every check on the day it was written and quietly start lying afterwards
 * — which is exactly the failure this ticket's risk class names.
 *
 * ONE READ PER TABLE, NO JOINS. The export is the one place a whole-account
 * read is the right shape; the graph is assembled from the ids in memory
 * afterwards. Every read goes through `rls.execute`, so the policies decide
 * what "the account" means and this file cannot widen it.
 *
 * WHAT IS DELIBERATELY NOT IN IT, and why:
 *
 *  - **Push endpoints and their keys** (`endpoint`, `p256dh`, `auth`). They are
 *    device credentials — anyone holding them can send a notification to that
 *    browser — and they are not a record of anything the person did. The row is
 *    still exported, so "I had a subscription on this device from this date" is
 *    in the file; the ability to use it is not.
 *  - **`storage_path` values are kept**, because they name the person's own
 *    objects and are meaningless to anyone else, but the IMAGES themselves are
 *    not bundled: official spec §7.6's list is five CSVs and one JSON, and a
 *    zip that silently grew to include every icon would break the size promise
 *    the screen makes.
 *
 * Both logged in the track's `DEVIATIONS.md`.
 */

/** The five CSVs official spec §7.6 names, plus the whole graph as JSON. */
export const EXPORT_FILE_NAMES = [
  "days.csv",
  "items.csv",
  "misses.csv",
  "shifts.csv",
  "timer_sessions.csv",
  // UX v1.1 (DYN-19): the block model's three tables.
  "day_blocks.csv",
  "fixtures.csv",
  "journal_entries.csv",
  "synapse-export.json",
] as const;

/** Columns never written, whatever table they appear on. */
const REDACTED_COLUMNS = new Set(["endpoint", "p256dh", "auth"]);

type Row = Record<string, unknown>;

export type AccountData = {
  user: Row | null;
  userAvatar: Row | null;
  categories: Row[];
  habits: Row[];
  reasons: Row[];
  templates: Row[];
  templateSlots: Row[];
  days: Row[];
  dayItems: Row[];
  timerSessions: Row[];
  misses: Row[];
  shifts: Row[];
  notificationPrefs: Row | null;
  notificationDeliveries: Row[];
  webPushSubscriptions: Row[];
  dataExports: Row[];
  feedbackMessages: Row[];
  /* ---- UX v1.1 (DYN-19) ---- */
  dayBlocks: Row[];
  fixtures: Row[];
  journalEntries: Row[];
};

/**
 * Every row the account owns.
 *
 * `users` is matched on `id`; everything else on `user_id`. That asymmetry is
 * the only per-table knowledge in this file, and getting it wrong fails loudly
 * (no rows) rather than quietly (another person's rows), because RLS is still
 * underneath.
 */
export async function readAccountData(
  rls: RlsClient,
  userId: string,
): Promise<AccountData> {
  return rls.execute(async (tx) => {
    /*
     * One read shape over seventeen tables.
     *
     * `PgTable` and `PgColumn` are the concrete types Drizzle's builder is
     * happy to be handed by variable — the bare `Table` interface trips its
     * "does this subquery return anything" conditional, which is written for
     * data-modifying CTEs and has nothing to say about a plain select. The
     * result is widened to plain rows because seventeen differently-shaped
     * selects have no useful common type, and everything downstream reads
     * columns through `getTableColumns` anyway.
     *
     * Both arguments are chosen below, from the schema. Neither is ever
     * derived from input, and RLS is underneath regardless.
     */
    const own = (table: PgTable, column: PgColumn): Promise<Row[]> =>
      tx.select().from(table).where(eq(column, userId)) as unknown as Promise<
        Row[]
      >;

    const [
      userRows,
      avatarRows,
      categoryRows,
      habitRows,
      reasonRows,
      templateRows,
      slotRows,
      dayRows,
      itemRows,
      sessionRows,
      missRows,
      shiftRows,
      prefRows,
      deliveryRows,
      pushRows,
      exportRows,
      feedbackRows,
      blockRows,
      fixtureRows,
      journalRows,
    ] = await Promise.all([
      own(users, users.id),
      own(userAvatars, userAvatars.userId),
      own(categories, categories.userId),
      own(habits, habits.userId),
      own(reasons, reasons.userId),
      own(templates, templates.userId),
      own(templateSlots, templateSlots.userId),
      own(days, days.userId),
      own(dayItems, dayItems.userId),
      own(timerSessions, timerSessions.userId),
      own(misses, misses.userId),
      own(shifts, shifts.userId),
      own(notificationPrefs, notificationPrefs.userId),
      own(notificationDeliveries, notificationDeliveries.userId),
      own(webPushSubscriptions, webPushSubscriptions.userId),
      own(dataExports, dataExports.userId),
      own(feedbackMessages, feedbackMessages.userId),
      own(dayBlocks, dayBlocks.userId),
      own(fixtures, fixtures.userId),
      own(journalEntries, journalEntries.userId),
    ]);

    return {
      user: userRows[0] ?? null,
      userAvatar: avatarRows[0] ?? null,
      categories: categoryRows,
      habits: habitRows,
      reasons: reasonRows,
      templates: templateRows,
      templateSlots: slotRows,
      days: dayRows,
      dayItems: itemRows,
      timerSessions: sessionRows,
      misses: missRows,
      shifts: shiftRows,
      notificationPrefs: prefRows[0] ?? null,
      notificationDeliveries: deliveryRows,
      webPushSubscriptions: pushRows,
      dataExports: exportRows,
      feedbackMessages: feedbackRows,
      dayBlocks: blockRows,
      fixtures: fixtureRows,
      journalEntries: journalRows,
    };
  });
}

/* ------------------------------------------------------------------ CSV -- */

/**
 * One field, RFC 4180.
 *
 * A field is quoted when it contains a comma, a quote, or a line break, and an
 * inner quote is doubled. Written by hand rather than pulled in: six files do
 * not justify a dependency, and the rule is four lines long.
 */
function csvField(value: unknown): string {
  const text = serializeScalar(value);
  if (text === null) return "";
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** The one value-to-text rule, shared by the CSVs and the JSON. */
function serializeScalar(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  // ISO-8601 in UTC. `days.csv` carries its own `timezone` column, so the
  // day's own zone travels with the row rather than being baked into the text.
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** A table's SQL column names, in the order the schema declares them. */
function columnNames(table: Table): string[] {
  return Object.values(getTableColumns(table))
    .map((column) => (column as { name: string }).name)
    .filter((name) => !REDACTED_COLUMNS.has(name));
}

/** Header row plus one line per row, columns from the schema. */
export function toCsv(table: Table, rows: Row[]): string {
  const names = columnNames(table);
  // Drizzle returns rows keyed by the TS property name, not the SQL name, so
  // the two are walked together rather than either being guessed from the
  // other — `dayCloseTime` and `day_close_time` are the same column.
  const keys = Object.entries(getTableColumns(table))
    .filter(
      ([, column]) => !REDACTED_COLUMNS.has((column as { name: string }).name),
    )
    .map(([key]) => key);

  const lines = [names.join(",")];
  for (const row of rows) {
    lines.push(keys.map((key) => csvField(row[key])).join(","));
  }
  // A trailing newline: a CSV without one is a file some tools read as
  // truncated, and every tool reads one with.
  return `${lines.join("\r\n")}\r\n`;
}

/* ----------------------------------------------------------------- JSON -- */

/** A row with its redacted columns dropped and its dates as ISO strings. */
function jsonRow(table: Table, row: Row | null): Row | null {
  if (row === null) return null;
  const out: Row = {};
  for (const [key, column] of Object.entries(getTableColumns(table))) {
    if (REDACTED_COLUMNS.has((column as { name: string }).name)) continue;
    const value = row[key];
    out[key] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
}

function jsonRows(table: Table, rows: Row[]): Row[] {
  return rows.map((row) => jsonRow(table, row) as Row);
}

/**
 * The whole record as one graph — templates carry their slots, days carry their
 * items, each item carries its sessions and its miss.
 *
 * THE FLAT LISTS ARE STILL THERE ALONGSIDE. Nesting is what makes the file
 * readable; the flat arrays are what make it complete, because a row whose
 * parent is missing (an orphan `shift`, a `miss` on a deleted item) would
 * vanish from a purely nested document without anyone noticing. Both views of
 * the same rows cost a few kilobytes and close that gap.
 */
export function buildExportJson(data: AccountData, exportedAt: Date): string {
  const slotsByTemplate = groupBy(data.templateSlots, "templateId");
  const itemsByDay = groupBy(data.dayItems, "dayId");
  const shiftsByDay = groupBy(data.shifts, "dayId");
  const sessionsByItem = groupBy(data.timerSessions, "dayItemId");
  const missesByItem = groupBy(data.misses, "dayItemId");

  const graph = {
    exportedAt: exportedAt.toISOString(),
    // The email is theirs; it is the one thing in here they will use to check
    // the file is about them.
    user: jsonRow(users, data.user),
    userAvatar: jsonRow(userAvatars, data.userAvatar),
    categories: jsonRows(categories, data.categories),
    habits: jsonRows(habits, data.habits),
    reasons: jsonRows(reasons, data.reasons),
    templates: data.templates.map((template) => ({
      ...(jsonRow(templates, template) as Row),
      slots: jsonRows(
        templateSlots,
        slotsByTemplate.get(String(template.id)) ?? [],
      ),
    })),
    days: data.days.map((day) => ({
      ...(jsonRow(days, day) as Row),
      items: (itemsByDay.get(String(day.id)) ?? []).map((item) => ({
        ...(jsonRow(dayItems, item) as Row),
        timerSessions: jsonRows(
          timerSessions,
          sessionsByItem.get(String(item.id)) ?? [],
        ),
        miss: jsonRow(misses, missesByItem.get(String(item.id))?.[0] ?? null),
      })),
      shifts: jsonRows(shifts, shiftsByDay.get(String(day.id)) ?? []),
    })),
    notificationPrefs: jsonRow(notificationPrefs, data.notificationPrefs),
    notificationDeliveries: jsonRows(
      notificationDeliveries,
      data.notificationDeliveries,
    ),
    webPushSubscriptions: jsonRows(
      webPushSubscriptions,
      data.webPushSubscriptions,
    ),
    dataExports: jsonRows(dataExports, data.dataExports),
    feedbackMessages: jsonRows(feedbackMessages, data.feedbackMessages),
    /** The flat view — see the note above. */
    flat: {
      templateSlots: jsonRows(templateSlots, data.templateSlots),
      dayItems: jsonRows(dayItems, data.dayItems),
      timerSessions: jsonRows(timerSessions, data.timerSessions),
      misses: jsonRows(misses, data.misses),
      shifts: jsonRows(shifts, data.shifts),
      // UX v1.1 (DYN-19): the block model, the fixtures, the journal.
      dayBlocks: jsonRows(dayBlocks, data.dayBlocks),
      fixtures: jsonRows(fixtures, data.fixtures),
      journalEntries: jsonRows(journalEntries, data.journalEntries),
    },
  };

  // Indented: this file is meant to be opened and read, not parsed by a
  // machine that will never exist.
  return JSON.stringify(graph, null, 2);
}

function groupBy(rows: Row[], key: string): Map<string, Row[]> {
  const out = new Map<string, Row[]>();
  for (const row of rows) {
    const value = row[key];
    if (value === null || value === undefined) continue;
    const id = String(value);
    const bucket = out.get(id);
    if (bucket) bucket.push(row);
    else out.set(id, [row]);
  }
  return out;
}

/* ------------------------------------------------------------- the zip -- */

/** The six files, as bytes, ready for `zipSync`. */
export function buildExportFiles(
  data: AccountData,
  exportedAt: Date,
): Record<string, Uint8Array> {
  const encoder = new TextEncoder();
  return {
    "days.csv": encoder.encode(toCsv(days, data.days)),
    "items.csv": encoder.encode(toCsv(dayItems, data.dayItems)),
    "misses.csv": encoder.encode(toCsv(misses, data.misses)),
    "shifts.csv": encoder.encode(toCsv(shifts, data.shifts)),
    "timer_sessions.csv": encoder.encode(
      toCsv(timerSessions, data.timerSessions),
    ),
    "day_blocks.csv": encoder.encode(toCsv(dayBlocks, data.dayBlocks)),
    "fixtures.csv": encoder.encode(toCsv(fixtures, data.fixtures)),
    "journal_entries.csv": encoder.encode(toCsv(journalEntries, data.journalEntries)),
    "synapse-export.json": encoder.encode(buildExportJson(data, exportedAt)),
  };
}
