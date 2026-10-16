import type { z } from "zod";
import {
  clientOrderInput,
  clientRecord,
  editWorkItemInput,
  placeSlotInput,
  removeSlotInput,
  slotRecord,
  slotUpdateInput,
  workItemInput,
  workItemRecord,
  type sessionsChoiceSchema,
  type SlotRecord,
  type WorkItemRecord,
  type workTierSchema,
} from "@syn/validators";
import { issueLength } from "@/lib/data/linear-size";
import type { PoolRecords } from "@/lib/data/pool-records";
import {
  ALREADY_PLACED,
  parse,
  patch,
  PlannerRefusal,
  slotClash,
  type PlannerWrite,
} from "../planner";
import type { Journal, WriteLog } from "../planner/journal";
import type { FixtureRecords } from "../records";
import { writeTask, type CreateTaskInput } from "./create-task";
import { NO_ISSUE, writeIssues, type PlaceIssuesInput } from "./place-issues";
import { readPool } from "./read-pool";

/**
 * The work side of the fixture server (USE-55): the pool read and the writes
 * that place, move and close work, an in-memory fake of the work router.
 * Each write parses its `@syn/validators` input, refuses in the schema's
 * words, lands all or nothing and returns USE-36's `{ undo }`, through the
 * one write log the planner writes use. Nothing here writes to Linear
 * (D-USE-57).
 */

export type WorkTier = z.infer<typeof workTierSchema>;
export type SessionsChoice = z.infer<typeof sessionsChoiceSchema>;

export interface PlaceWorkInput {
  workItemId: string;
  dateKey: string;
  blockId: string;
  tier: WorkTier | null;
  sortOrder: number;
}

/** Spread across the week (USE-77): one item's sessions, in one tier. */
export interface SpreadWorkInput {
  workItemId: string;
  tier: WorkTier;
  sessions: { dateKey: string; blockId: string; lengthMin: number }[];
  /** The item's hours when Work left was changed; left out, they stay. */
  lengthMaxMin?: number;
}

export interface MoveWorkInput {
  slotId: string;
  dateKey?: string;
  blockId?: string;
  tier?: WorkTier | null;
  sortOrder?: number;
}

export interface SetWorkTierInput {
  slotId: string;
  tier: WorkTier;
  /** D-USE-57: This session (the default) or All sessions. */
  sessions: SessionsChoice;
}

export interface LinkToLinearInput {
  workItemId: string;
  connectionId: string;
  issueId: string;
}

export const ALREADY_LINKED = "That task is in Linear already.";
export const ISSUE_TAKEN = "That issue is on another item already.";

/** D-USE-36: the description, then the item's notes at its end. */
export function joinNotes(
  description: string | null,
  notes: string | null,
): string | null {
  const parts = [description, notes]
    .map((part) => part?.trim() ?? "")
    .filter((part) => part !== "");
  return parts.length === 0 ? null : parts.join("\n\n");
}

export interface WorkServer {
  readPool(): Promise<PoolRecords>;
  placeWork(input: PlaceWorkInput): Promise<PlannerWrite>;
  /** A session to another date, block, tier or place; it stays one session. */
  moveWork(input: MoveWorkInput): Promise<PlannerWrite>;
  unplaceWork(input: { slotId: string }): Promise<PlannerWrite>;
  /**
   * Spread (USE-77, D-USE-40): a session of the one item per date, each its
   * length, after the block's own slots, in one journal so one Undo takes
   * every one back; a date that holds the item already refuses them all.
   */
  spreadWork(input: SpreadWorkInput): Promise<PlannerWrite>;
  setWorkTier(input: SetWorkTierInput): Promise<PlannerWrite>;
  editWorkItem(input: z.input<typeof editWorkItemInput>): Promise<PlannerWrite>;
  /** The task, not a session: it and every open session close. */
  markTaskDone(input: { workItemId: string }): Promise<PlannerWrite>;
  /**
   * Reopen (USE-63, D-USE-97): the task open again, and every session that
   * closed with it; a session done on its own day before stays done.
   */
  reopenTask(input: { workItemId: string }): Promise<PlannerWrite>;
  /** Off every day until it's slotted again: its open sessions go. */
  backToPool(input: { workItemId: string }): Promise<PlannerWrite>;
  /** Archived here; the Linear issue stays as it is. */
  removeFromSynapse(input: { workItemId: string }): Promise<PlannerWrite>;
  /**
   * Unlink from Linear (USE-66): a plain item from here on, the issue's
   * description kept as its notes; the issue is never written.
   */
  unlinkFromLinear(input: { workItemId: string }): Promise<PlannerWrite>;
  /**
   * Link a Linear issue (USE-68, D-USE-36): the item takes the issue's
   * title, size, length, project emoji and link, and its notes become the
   * description with the old notes at the end. No new item; Linear is not
   * written here (the description goes through the outbox).
   */
  linkToLinear(input: LinkToLinearInput): Promise<PlannerWrite>;
  /** New task (USE-51): the item, then a slot a picked day; `id` is the item. */
  createTask(input: CreateTaskInput): Promise<PlannerWrite>;
  /**
   * From Linear (USE-52): a work item per ticked issue (or its linked one)
   * and a slot each in the tier on the date; `id` is the first item.
   */
  placeIssues(input: PlaceIssuesInput): Promise<PlannerWrite>;
  /** D-USE-96: the one client order, top first. */
  setClientOrder(
    input: z.input<typeof clientOrderInput>,
  ): Promise<PlannerWrite>;
}

export function createWorkServer({
  records,
  now,
  log,
}: {
  records: FixtureRecords;
  now: () => Date;
  log: WriteLog;
}): WorkServer {
  const stamp = () => now().toISOString();

  function write(
    fn: (journal: Journal) => {
      id?: string;
    },
  ): Promise<PlannerWrite> {
    return log
      .commit(fn)
      .then(({ undo, out }) =>
        out.id === undefined ? { undo } : { undo, id: out.id },
      );
  }

  /** An archived item has left Synapse: no write reaches it. */
  function findWorkItem(id: string): WorkItemRecord {
    const item = records.workItems.find(
      (row) => row.id === id && row.archivedAt === null,
    );
    if (!item) {
      throw new PlannerRefusal("unknown", "No work item with that id.");
    }
    return item;
  }

  function findWorkSlot(id: string): SlotRecord & { workItemId: string } {
    const slot = records.slots.find((row) => row.id === id);
    if (!slot) throw new PlannerRefusal("unknown", "No slot with that id.");
    if (slot.workItemId === null) {
      throw new PlannerRefusal("invalid", "Only a work item takes a tier.");
    }
    return slot as SlotRecord & { workItemId: string };
  }

  function requireBlock(id: string) {
    if (!records.blocks.some((block) => block.id === id)) {
      throw new PlannerRefusal("unknown", "No block with that id.");
    }
  }

  function openSessions(workItemId: string): SlotRecord[] {
    return records.slots.filter(
      (slot) => slot.workItemId === workItemId && slot.doneAt === null,
    );
  }

  return {
    readPool() {
      return Promise.resolve(readPool(records));
    },

    placeWork(raw) {
      return write((journal) => {
        const input = parse(placeSlotInput, {
          blockId: raw.blockId,
          onDate: raw.dateKey,
          sortOrder: raw.sortOrder,
          workItemId: raw.workItemId,
          tier: raw.tier,
        });
        findWorkItem(raw.workItemId);
        requireBlock(input.blockId);
        // D-USE-40: a second day is a session; one date holds the item once.
        if (slotClash(records.slots, input)) {
          throw new PlannerRefusal("duplicate", ALREADY_PLACED);
        }
        const at = stamp();
        const row = journal.put(
          "slots",
          slotRecord.parse({
            id: crypto.randomUUID(),
            createdAt: at,
            updatedAt: at,
            blockId: input.blockId,
            onDate: input.onDate,
            skipped: false,
            sortOrder: input.sortOrder,
            blockItemId: null,
            todoId: null,
            workItemId: raw.workItemId,
            tier: input.tier ?? null,
            lengthMin: null,
            tookMin: null,
            doneAt: null,
          }),
        );
        return { id: row.id };
      });
    },

    spreadWork(raw) {
      return write((journal) => {
        const item = findWorkItem(raw.workItemId);
        const dates = new Set<string>();
        const at = stamp();
        for (const session of raw.sessions) {
          const input = parse(placeSlotInput, {
            blockId: session.blockId,
            onDate: session.dateKey,
            sortOrder: 0,
            workItemId: raw.workItemId,
            tier: raw.tier,
          });
          requireBlock(input.blockId);
          if (dates.has(session.dateKey) || slotClash(records.slots, input)) {
            throw new PlannerRefusal("duplicate", ALREADY_PLACED);
          }
          if (!(session.lengthMin > 0)) {
            throw new PlannerRefusal("invalid", "A session needs a length.");
          }
          dates.add(session.dateKey);
          const sortOrder =
            records.slots
              .filter(
                (slot) =>
                  slot.blockId === input.blockId &&
                  slot.onDate === input.onDate,
              )
              .reduce((top, slot) => Math.max(top, slot.sortOrder), -1) + 1;
          journal.put(
            "slots",
            slotRecord.parse({
              id: crypto.randomUUID(),
              createdAt: at,
              updatedAt: at,
              blockId: input.blockId,
              onDate: input.onDate,
              skipped: false,
              sortOrder,
              blockItemId: null,
              todoId: null,
              workItemId: raw.workItemId,
              tier: raw.tier,
              lengthMin: Math.round(session.lengthMin),
              tookMin: null,
              doneAt: null,
            }),
          );
        }
        if (
          raw.lengthMaxMin !== undefined &&
          raw.lengthMaxMin !== item.lengthMaxMin
        ) {
          const lengthMaxMin = Math.round(raw.lengthMaxMin);
          const next = patch(item, {
            lengthMaxMin,
            lengthMinMin:
              item.lengthMinMin === null
                ? null
                : Math.min(item.lengthMinMin, lengthMaxMin),
            updatedAt: at,
          });
          parse(workItemInput, next);
          journal.put("workItems", workItemRecord.parse(next));
        }
        return { id: raw.workItemId };
      });
    },

    moveWork(raw) {
      return write((journal) => {
        const { id, ...change } = parse(slotUpdateInput, {
          id: raw.slotId,
          onDate: raw.dateKey,
          blockId: raw.blockId,
          tier: raw.tier,
          sortOrder: raw.sortOrder,
        });
        const slot = findWorkSlot(id);
        if (change.blockId !== undefined) requireBlock(change.blockId);
        const onDate = change.onDate ?? slot.onDate;
        if (
          slotClash(records.slots, { onDate, workItemId: slot.workItemId }, id)
        ) {
          throw new PlannerRefusal("duplicate", ALREADY_PLACED);
        }
        journal.put(
          "slots",
          slotRecord.parse(patch(slot, { ...change, updatedAt: stamp() })),
        );
        return { id };
      });
    },

    unplaceWork(raw) {
      return write((journal) => {
        const { id } = parse(removeSlotInput, { id: raw.slotId });
        findWorkSlot(id);
        journal.remove("slots", id);
        return {};
      });
    },

    setWorkTier(raw) {
      return write((journal) => {
        const input = parse(slotUpdateInput, {
          id: raw.slotId,
          tier: raw.tier,
          sessions: raw.sessions,
        });
        const slot = findWorkSlot(input.id);
        // D-USE-57: All moves every session of the item; This, the one.
        const moved =
          input.sessions === "all"
            ? records.slots.filter((s) => s.workItemId === slot.workItemId)
            : [slot];
        const at = stamp();
        for (const session of moved) {
          journal.put(
            "slots",
            slotRecord.parse({ ...session, tier: input.tier, updatedAt: at }),
          );
        }
        return { id: input.id };
      });
    },

    editWorkItem(raw) {
      return write((journal) => {
        const { id, ...change } = parse(editWorkItemInput, raw);
        const item = findWorkItem(id);
        if (
          change.clientId != null &&
          !records.clients.some((client) => client.id === change.clientId)
        ) {
          throw new PlannerRefusal("unknown", "No client with that id.");
        }
        if (change.parentWorkItemId != null) {
          if (change.parentWorkItemId === id) {
            throw new PlannerRefusal(
              "invalid",
              "A task is not its own parent.",
            );
          }
          findWorkItem(change.parentWorkItemId);
        }
        const next = patch(item, { ...change, updatedAt: stamp() });
        // A lone end of the range is checked against the stored other, in its words.
        parse(workItemInput, next);
        journal.put("workItems", workItemRecord.parse(next));
        return { id };
      });
    },

    markTaskDone({ workItemId }) {
      return write((journal) => {
        const item = findWorkItem(workItemId);
        if (item.doneAt !== null) {
          throw new PlannerRefusal("invalid", "That task is already done.");
        }
        const at = stamp();
        journal.put(
          "workItems",
          workItemRecord.parse({
            ...item,
            doneAt: at,
            doneSource: "synapse",
            updatedAt: at,
          }),
        );
        for (const session of openSessions(workItemId)) {
          journal.put(
            "slots",
            slotRecord.parse({ ...session, doneAt: at, updatedAt: at }),
          );
        }
        return { id: workItemId };
      });
    },

    reopenTask({ workItemId }) {
      return write((journal) => {
        const item = findWorkItem(workItemId);
        if (item.doneAt === null) {
          throw new PlannerRefusal("invalid", "That task is open.");
        }
        const closedAt = item.doneAt;
        const at = stamp();
        journal.put(
          "workItems",
          workItemRecord.parse({
            ...item,
            doneAt: null,
            doneSource: null,
            updatedAt: at,
          }),
        );
        for (const session of records.slots) {
          if (session.workItemId !== workItemId) continue;
          if (session.doneAt !== closedAt) continue;
          journal.put(
            "slots",
            slotRecord.parse({ ...session, doneAt: null, updatedAt: at }),
          );
        }
        return { id: workItemId };
      });
    },

    backToPool({ workItemId }) {
      return write((journal) => {
        findWorkItem(workItemId);
        // [ASSUMPTION] A session already done stays: it is the record of that day's work.
        for (const session of openSessions(workItemId)) {
          journal.remove("slots", session.id);
        }
        return { id: workItemId };
      });
    },

    removeFromSynapse({ workItemId }) {
      return write((journal) => {
        const item = findWorkItem(workItemId);
        const at = stamp();
        journal.put(
          "workItems",
          workItemRecord.parse({ ...item, archivedAt: at, updatedAt: at }),
        );
        // [ASSUMPTION] It leaves every day it was still open on; done sessions stay.
        for (const session of openSessions(workItemId)) {
          journal.remove("slots", session.id);
        }
        return { id: workItemId };
      });
    },

    unlinkFromLinear({ workItemId }) {
      return write((journal) => {
        const item = findWorkItem(workItemId);
        if (item.linearIssueId === null) {
          throw new PlannerRefusal("invalid", "That task is not in Linear.");
        }
        // Synapse's copy of the issue: the description becomes the notes (D-USE-36).
        const issue = records.integrations?.linear
          .filter((w) => w.connection.id === item.linearConnectionId)
          .flatMap((w) => [...w.snapshot.issues, ...w.snapshot.subIssues])
          .find((row) => row.id === item.linearIssueId);
        const description = issue?.description ?? null;
        const at = stamp();
        journal.put(
          "workItems",
          workItemRecord.parse({
            ...item,
            notes:
              description === null || description.trim() === ""
                ? item.notes
                : description,
            // [ASSUMPTION] The identifier goes too, so nothing links it again.
            linearIdentifier: null,
            linearConnectionId: null,
            linearIssueId: null,
            updatedAt: at,
          }),
        );
        return { id: workItemId };
      });
    },

    linkToLinear({ workItemId, connectionId, issueId }) {
      return write((journal) => {
        const item = findWorkItem(workItemId);
        if (item.linearIssueId !== null) {
          throw new PlannerRefusal("invalid", ALREADY_LINKED);
        }
        const workspace = records.integrations?.linear.find(
          (w) => w.connection.id === connectionId,
        );
        const issue = workspace?.snapshot.issues.find(
          (row) => row.id === issueId,
        );
        if (!workspace || !issue) {
          throw new PlannerRefusal("unknown", NO_ISSUE);
        }
        // One issue, one item: a second link would be a copy of the work.
        if (
          records.workItems.some(
            (row) =>
              row.archivedAt === null &&
              row.linearConnectionId === connectionId &&
              row.linearIssueId === issueId,
          )
        ) {
          throw new PlannerRefusal("duplicate", ISSUE_TAKEN);
        }
        const project = workspace.snapshot.projects.find(
          (row) => row.id === issue.projectId,
        );
        const length = issueLength(issue.estimate);
        const at = stamp();
        journal.put(
          "workItems",
          workItemRecord.parse({
            ...item,
            title: issue.title,
            // [ASSUMPTION] With no estimate the item keeps its own size and length.
            ...(length.size === null
              ? {}
              : {
                  size: length.size,
                  lengthMinMin: length.lengthMinMin,
                  lengthMaxMin: length.lengthMaxMin,
                }),
            // [ASSUMPTION] A project with no emoji leaves the item's icon.
            icon:
              project?.icon == null
                ? item.icon
                : { kind: "emoji", value: project.icon },
            notes: joinNotes(issue.description, item.notes),
            linearIdentifier: issue.identifier,
            linearConnectionId: connectionId,
            linearIssueId: issue.id,
            updatedAt: at,
          }),
        );
        return { id: workItemId };
      });
    },

    createTask(raw) {
      return write((journal) => writeTask(journal, records, raw, stamp()));
    },

    placeIssues(raw) {
      return write((journal) => writeIssues(journal, records, raw, stamp()));
    },

    setClientOrder(raw) {
      return write((journal) => {
        const { ids } = parse(clientOrderInput, raw);
        const active = records.clients.filter((c) => c.archivedAt === null);
        // Every client once: the order is one list, never a partial one.
        if (
          ids.length !== active.length ||
          !active.every((client) => ids.includes(client.id))
        ) {
          throw new PlannerRefusal("invalid", "Each client once.");
        }
        const at = stamp();
        ids.forEach((id, index) => {
          const client = active.find((c) => c.id === id)!;
          if (client.sortOrder === index) return;
          journal.put(
            "clients",
            clientRecord.parse({ ...client, sortOrder: index, updatedAt: at }),
          );
        });
        return {};
      });
    },
  };
}
