import { z } from "zod";
import { readApiEnv } from "../../env";
import { refuse } from "../../errors";
import type { RowStore } from "./row-store";
import {
  UNDO_TABLE_NAMES,
  UNDO_TABLES,
  type Row,
  type UndoTable,
} from "./tables";
import { openToken, signToken } from "./token";

/**
 * Every write's Undo (USE-92; decided at the gate, no table). A write lists
 * what it changed, `recordUndo` signs that list into the token the write
 * hands back, and `undoWrite` reads it back and, inside the same RLS, puts
 * exactly those rows back: a row the write added is deleted, a row it
 * changed is restored to `before`, a row it deleted is inserted again. The
 * planner's, the work pool's and the to-dos' writes (USE-93 to USE-99) call
 * the same two.
 *
 * REFUSED, CHANGING NOTHING: a token whose signature fails (before any row is
 * read), one signed for another account, one naming a table not in
 * `UNDO_TABLES`, and one whose row the caller cannot reach (RLS hides it,
 * so its step reaches no row). Every step runs in the caller's one
 * transaction, so a refusal part way undoes the steps before it.
 */

/** One row a write touched, as Undo needs it. */
export type UndoChange =
  | { table: UndoTable; op: "insert"; id: string }
  | { table: UndoTable; op: "update" | "delete"; before: Row };

/** What a write did to one row: as it stood before, and after (null = none). */
export interface RowChange {
  table: UndoTable;
  id: string;
  before: Row | null;
  after: Row | null;
}

export const NOTHING_TO_UNDO = "Nothing to undo.";

const TOKEN_VERSION = 1;

/** A write's row changes as Undo's list; a row made and gone again is left out. */
export function undoChangesOf(changes: readonly RowChange[]): UndoChange[] {
  const out: UndoChange[] = [];
  for (const { table, id, before, after } of changes) {
    if (before === null && after === null) continue;
    if (before === null) out.push({ table, op: "insert", id });
    else out.push({ table, op: after === null ? "delete" : "update", before });
  }
  return out;
}

function undoKey(): string {
  const key = readApiEnv().UNDO_TOKEN_KEY;
  if (!key) throw new Error("UNDO_TOKEN_KEY is not set.");
  return key;
}

/** The signed token for one write's changes, for the caller's account. */
export function recordUndo(
  changes: readonly UndoChange[],
  userId: string,
  key: string = undoKey(),
): string {
  return signToken({ v: TOKEN_VERSION, userId, changes }, key);
}

/** One change per table, its `before` parsed by that table's record. */
const changeSchema = z.union(
  UNDO_TABLE_NAMES.map((table) =>
    z.union([
      z.object({
        table: z.literal(table),
        op: z.literal("insert"),
        id: z.string().uuid(),
      }),
      z.object({
        table: z.literal(table),
        op: z.enum(["update", "delete"]),
        before: UNDO_TABLES[table].record,
      }),
    ]),
  ) as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]],
);

const payloadSchema = z.object({
  v: z.literal(TOKEN_VERSION),
  userId: z.string().uuid(),
  changes: z.array(changeSchema),
});

/** The token's changes when it is genuine and the caller's, else a refusal. */
export function readUndo(
  token: string,
  userId: string,
  key: string = undoKey(),
): UndoChange[] {
  const parsed = payloadSchema.safeParse(openToken(token, key));
  if (!parsed.success || parsed.data.userId !== userId) {
    throw refuse("unknown", NOTHING_TO_UNDO);
  }
  return parsed.data.changes as UndoChange[];
}

/** Puts back what the token's write changed, last change first. */
export async function undoWrite(
  store: RowStore,
  token: string,
  userId: string,
  key: string = undoKey(),
): Promise<void> {
  const changes = readUndo(token, userId, key);
  for (const change of [...changes].reverse()) {
    const reached =
      change.op === "insert"
        ? await store.remove(change.table, change.id)
        : change.op === "update"
          ? await store.update(change.table, change.before)
          : await store.insert(change.table, change.before);
    if (!reached) throw refuse("unknown", NOTHING_TO_UNDO);
  }
}
