import type { ClientRecord, WorkItemRecord } from "@syn/validators";
import type {
  PriorityLevel,
  WorkRowForm,
  WorkRowView,
} from "@/components/work";
import {
  rangeWords,
  SIZE_RANGE,
  sizeWords,
} from "@/components/work/add/new-task/form";
import type { LinearIssueJoin } from "./integration-records";

/**
 * A work item as USE-10's row prints it, in the locked anatomy (Today's
 * index): the client tile, the project's emoji and name, the ID or "No
 * Linear", the priority chip, the size chip, Linear's labels, the session's
 * place and the length range. Shared by Today (USE-57) and the opened day
 * (USE-58), so both print one row the same way. Pure; the form and the clock's
 * words are the caller's.
 */

export const WORK_ROW_COPY = {
  noLinear: "No Linear",
  session: (n: number, of: number) => `session ${n} of ${of}`,
  priority: {
    urgent: "Urgent",
    high: "High",
    normal: "Normal",
    low: "Low",
  } satisfies Record<PriorityLevel, string>,
  /** The phone's fold (D-USE-51): "2 sub-issues · 1 done". */
  subIssues: (count: number, done: number) =>
    `${count} sub-issue${count === 1 ? "" : "s"} · ${done} done`,
} as const;

/** Linear's 1 to 4 (0 is none). */
const PRIORITY: Record<number, PriorityLevel> = {
  1: "urgent",
  2: "high",
  3: "normal",
  4: "low",
};

/**
 * Whole minutes as the work words read them (D-USE-29): "4 min", "1 h",
 * "1 h 20" past an hour. Never seconds.
 */
export function workMinutes(minutes: number): string {
  const total = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest} min`;
  // "2 h 05", as the boards print a time taken (done-for-today.md).
  return rest === 0
    ? `${hours} h`
    : `${hours} h ${String(rest).padStart(2, "0")}`;
}

/** "30 to 60 min" from the item's own range, else its size's. */
export function lengthOf(item: WorkItemRecord): string | null {
  const preset = item.size ? SIZE_RANGE[item.size] : null;
  const min = item.lengthMinMin ?? preset?.min ?? null;
  const max = item.lengthMaxMin ?? preset?.max ?? null;
  return rangeWords(min, max) || null;
}

export interface WorkRowInput {
  /** The slot's id: one item may sit on several dates as sessions. */
  id: string;
  item: WorkItemRecord;
  emoji: string | null;
  form: WorkRowForm;
  session: { n: number; of: number } | null;
  client: ClientRecord | null;
  issue: LinearIssueJoin | null;
  subIssues?: { id: string; title: string; done: boolean }[];
  /** Linear's line under the meta (USE-63). */
  linear?: WorkRowView["linear"];
}

export function workRowView(input: WorkRowInput): WorkRowView {
  const { item, issue, client } = input;
  const identifier = issue?.identifier ?? item.linearIdentifier;
  const level = issue ? PRIORITY[issue.priority] : undefined;
  const subs = input.subIssues ?? [];
  return {
    id: input.id,
    title: item.title,
    emoji: input.emoji,
    form: input.form,
    client: client
      ? {
          letter: client.name.slice(0, 1).toUpperCase(),
          name: client.name,
          hue: client.colorKey,
        }
      : null,
    project: issue?.project
      ? { emoji: issue.project.icon ?? null, name: issue.project.name }
      : null,
    identifier,
    noLinear: identifier === null ? WORK_ROW_COPY.noLinear : null,
    priority: level ? { level, word: WORK_ROW_COPY.priority[level] } : null,
    size: item.size ? sizeWords(item.size) : null,
    labels: (issue?.labels ?? []).map((label) => ({
      name: label.name,
      color: label.color,
    })),
    session: input.session
      ? WORK_ROW_COPY.session(input.session.n, input.session.of)
      : null,
    worked: null,
    length: lengthOf(item),
    firing: null,
    doneRecord: null,
    ...(input.linear ? { linear: input.linear } : {}),
    subIssues:
      subs.length === 0
        ? null
        : {
            summary: WORK_ROW_COPY.subIssues(
              subs.length,
              subs.filter((sub) => sub.done).length,
            ),
            items: subs,
          },
  };
}
