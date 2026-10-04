import type {
  WorkflowColumnView,
  WorkflowNext,
  WorkflowTaskView,
} from "@syn/types";

/**
 * Which task is next — Workflow UX spec v0.1 §3.4 (W7, W8), Epic 7 TD-38.
 *
 * ORDER AND NOTHING ELSE. Among the active column's tasks that are the
 * person's (not firing), the first found walking the lanes in today's order
 * and, inside a lane, the cell's order — which is the tasks array's order. A
 * collapsed lane is walked like any other. The lane *No group* is walked last,
 * and so are tasks whose group is not in `groupsInOrder` (an archived group's
 * leftovers), in array order.
 *
 * Total: every board yields exactly one of the three results, so no caller
 * re-derives *everything is firing* its own way. No clock and no store — the
 * client re-runs this over its patched cache the instant a toggle is pressed,
 * and the server never stores or returns the answer.
 */
export function resolveNext(input: {
  groupsInOrder: readonly { id: string }[];
  tasks: readonly WorkflowTaskView[];
  columns: readonly WorkflowColumnView[];
}): WorkflowNext {
  const active = input.columns.find((column) => column.role === "active");
  if (active === undefined) return { kind: "none" };

  // A closed task never sits in the active column; one that somehow does is ignored.
  const inActive = input.tasks.filter(
    (task) => task.columnId === active.id && task.closedAt === null,
  );
  if (inActive.length === 0) return { kind: "none" };

  const rank = new Map(input.groupsInOrder.map((group, index) => [group.id, index]));
  const last = input.groupsInOrder.length;
  const rankOf = (task: WorkflowTaskView): number =>
    task.groupId === null ? last : (rank.get(task.groupId) ?? last);

  // `Array.prototype.sort` is stable, so array order — the cell's order — holds inside a rank.
  const walked = [...inActive].sort((a, b) => rankOf(a) - rankOf(b));
  const next = walked.find((task) => task.firingStartedAt === null);

  return next === undefined
    ? { kind: "all_firing" }
    : { kind: "task", taskId: next.id };
}
