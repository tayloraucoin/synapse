/**
 * How a Linear status is drawn and what it does here (USE-32; D-USE-35,
 * D-USE-78). Structural input only: `@syn/utils` never imports the zod
 * shapes, so any `{ id, type, position, teamId, name }` will do.
 *
 * Pure and total: no clock, no I/O, one answer for any input. The fill is
 * recomputed on every sync and never stored.
 */

export type LinearStateLike = {
  id: string;
  /** Linear's group: triage, backlog, unstarted, started, completed, canceled, duplicate. */
  type: string;
  position: number;
  teamId: string;
  name?: string;
};

export type StatusEffect =
  "check" | "off_today" | "waiting" | "to_pool" | "start" | "none";

/** By position, then id, so equal or non-finite positions still order one way. */
function byPosition(a: LinearStateLike, b: LinearStateLike): number {
  const pa = Number.isFinite(a.position) ? a.position : Infinity;
  const pb = Number.isFinite(b.position) ? b.position : Infinity;
  if (pa !== pb) return pa < pb ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * The state's team's started group, ordered by position. The state itself is
 * counted once even when the list does not carry it.
 */
function startedGroup(
  state: LinearStateLike,
  states: readonly LinearStateLike[],
): LinearStateLike[] {
  const group = states.filter(
    (other) =>
      other.type === "started" &&
      other.teamId === state.teamId &&
      other.id !== state.id,
  );
  if (state.type === "started") group.push(state);
  return group.sort(byPosition);
}

/**
 * How full the status disc is, 0 to 1 (the dev note): a started status is
 * its place ÷ (statuses in its team's started group + 1); completed is full;
 * every other group is empty.
 */
export function statusFill(
  state: LinearStateLike,
  states: readonly LinearStateLike[],
): number {
  if (state.type === "completed") return 1;
  if (state.type !== "started") return 0;
  const group = startedGroup(state, states);
  const place = group.findIndex((other) => other.id === state.id) + 1;
  return place / (group.length + 1);
}

const WAITING_NAMES = new Set(["blocked", "paused", "in review"]);
const TO_POOL_NAMES = new Set(["ongoing"]);

/**
 * What picking a status does here (the status sheet): Done checks it off;
 * Canceled and Duplicate take it off today; Blocked, Paused and In review
 * move it to Waiting; Ongoing goes back to the pool; the team's first started
 * status starts the timer; anything else does nothing more. The names are
 * the workspace's own, matched by name as drawn, since Blocked sits in
 * Unstarted.
 */
export function statusEffect(
  state: LinearStateLike,
  states: readonly LinearStateLike[],
): StatusEffect {
  if (state.type === "completed") return "check";
  if (state.type === "canceled" || state.type === "duplicate") {
    return "off_today";
  }
  const name = (state.name ?? "").trim().toLowerCase();
  if (WAITING_NAMES.has(name)) return "waiting";
  if (TO_POOL_NAMES.has(name)) return "to_pool";
  if (
    state.type === "started" &&
    startedGroup(state, states)[0]?.id === state.id
  ) {
    return "start";
  }
  return "none";
}
