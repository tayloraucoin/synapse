import { fixtureId } from "../ids";
import { stateId } from "../integrations/workspaces";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import {
  mondayEvent,
  onMonday,
  TODAY_WORK_IDS,
  todayWorkRecords,
} from "./today-desk";

/**
 * Linear's side of work's Today (USE-63), on the Monday the boards draw:
 *
 * - `today-waiting` (10:20): [Portal sign-in] Blocked and [Desk Today
 *   layout] In review in Linear, so both sit in Waiting at the block's foot
 *   and [Alder intro] lifts as Next.
 * - `today-linear-failed` (11:15): [Portal sign-in] done at 11:12 (Took
 *   1 h 10 · fired 32 min); its Done failed to reach Linear, so the row
 *   stays done with "Not updated in Linear." and Try again, which sends the
 *   same row and lands.
 * - `today-linear-updating` (10:21): the SMS copy's move to In progress in
 *   flight (it stays pending: nothing sends it), and [Desk Today layout]
 *   closed in Linear at 10:12, every session with it; Reopen moves it back
 *   to In progress.
 * - `today-offline` (10:21): as working, offline; every control works and
 *   Linear's writes wait.
 */

const S = TODAY_WORK_IDS.slots;

/** "HH:MM" on the Monday as a scenario's fixed now. */
const at = (clock: string) => `2026-10-12T${clock}:00-04:00`;

/** The outbox rows this file seeds count from 631, clear of the loop's. */
const OUTBOX = { failed: fixtureId(8, 631), pending: fixtureId(8, 632) };

function itemOf(records: FixtureRecords, slotId: string): string {
  return records.slots.find((row) => row.id === slotId)!.workItemId!;
}

function linearOf(records: FixtureRecords, identifier: string) {
  const workspace = records.integrations!.linear.find((w) =>
    w.snapshot.issues.some((row) => row.identifier === identifier),
  )!;
  const issue = workspace.snapshot.issues.find(
    (row) => row.identifier === identifier,
  )!;
  return { workspace, issue };
}

/** An issue's status in Synapse's snapshot, by the workflow's name. */
function setStatus(
  records: FixtureRecords,
  identifier: string,
  name: Parameters<typeof stateId>[1],
) {
  linearOf(records, identifier).issue.stateId = stateId(
    identifier.split("-")[0]!,
    name,
  );
}

function scenario(
  name: string,
  now: string,
  events: ReturnType<typeof mondayEvent>[],
  edit: (records: FixtureRecords) => void,
  rest: Partial<Scenario> = {},
): () => Scenario {
  return () => {
    const records = todayWorkRecords(events);
    edit(records);
    return { name, now, records, mode: "ready", ...rest };
  };
}

/** [Portal sign-in] fired from its ring at 10:16. */
const PORTAL_FIRING = [mondayEvent(1, S.portal, "prompt_sent", "10:16")];

/** Closed in Linear at `clock` by someone else (D-USE-97): the task and every open session. */
function closedInLinear(
  records: FixtureRecords,
  slotId: string,
  identifier: string,
  clock: string,
) {
  const workItemId = itemOf(records, slotId);
  const closedAt = onMonday(clock);
  const item = records.workItems.find((row) => row.id === workItemId)!;
  item.doneAt = closedAt;
  item.doneSource = "linear";
  for (const slot of records.slots) {
    if (slot.workItemId === workItemId && slot.doneAt === null) {
      slot.doneAt = closedAt;
    }
  }
  const team = identifier.split("-")[0]!;
  setStatus(records, identifier, "Done");
  // Reopen moves it back to the status it had (`linear_prev_state_id`).
  records.integrations!.prevStateIds[workItemId] = stateId(team, "In progress");
}

export const TODAY_LINEAR_SCENARIOS: Record<string, () => Scenario> = {
  "today-waiting": scenario("today-waiting", at("10:20"), [], (records) => {
    setStatus(records, "KES-42", "Blocked");
    setStatus(records, "SYN-212", "In review");
  }),

  "today-linear-failed": scenario(
    "today-linear-failed",
    at("11:15"),
    [
      mondayEvent(1, S.portal, "started", "09:30"),
      mondayEvent(2, S.portal, "prompt_sent", "10:20"),
      mondayEvent(3, S.portal, "brought_back", "10:52"),
      mondayEvent(4, S.portal, "resumed", "10:52"),
      mondayEvent(5, S.portal, "done", "11:12"),
    ],
    (records) => {
      const workItemId = itemOf(records, S.portal);
      const doneAt = onMonday("11:12");
      const slot = records.slots.find((row) => row.id === S.portal)!;
      slot.doneAt = doneAt;
      slot.tookMin = 70;
      const item = records.workItems.find((row) => row.id === workItemId)!;
      item.doneAt = doneAt;
      item.doneSource = "synapse";
      // Synapse's value first: the issue reads Done here; the send failed once.
      const { workspace, issue } = linearOf(records, "KES-42");
      records.integrations!.prevStateIds[workItemId] = issue.stateId;
      setStatus(records, "KES-42", "Done");
      records.integrations!.outbox.push({
        id: OUTBOX.failed,
        workItemId,
        kind: "done",
        state: "failed",
        createdAt: doneAt,
        connectionId: workspace.connection.id,
        issueId: issue.id,
        change: { stateId: stateId("KES", "Done") },
        sends: 1,
      });
    },
  ),

  "today-linear-updating": scenario(
    "today-linear-updating",
    at("10:21"),
    PORTAL_FIRING,
    (records) => {
      const workItemId = itemOf(records, S.sms);
      const { workspace, issue } = linearOf(records, "KES-51");
      setStatus(records, "KES-51", "In progress");
      records.integrations!.outbox.push({
        id: OUTBOX.pending,
        workItemId,
        kind: "status",
        state: "pending",
        createdAt: onMonday("10:21"),
        connectionId: workspace.connection.id,
        issueId: issue.id,
        change: { stateId: stateId("KES", "In progress") },
        sends: 0,
      });
      closedInLinear(records, S.desk, "SYN-212", "10:12");
    },
  ),

  "today-offline": scenario(
    "today-offline",
    at("10:21"),
    PORTAL_FIRING,
    () => {},
    { offline: true },
  ),
};

/** The outbox rows the tests read. */
export const TODAY_LINEAR_OUTBOX = OUTBOX;
