import { and, desc, eq, isNotNull } from "drizzle-orm";

import { workflowGroups, workflowTasks, type RlsClient } from "@syn/db";
import type { CategoryKey } from "@syn/types";

export type WorkflowArchivedTask = {
  id: string;
  title: string;
  /** The lane it was in; null for *No group*. */
  groupName: string | null;
  archivedAt: Date;
};

export type WorkflowArchivedGroup = {
  id: string;
  name: string;
  hue: CategoryKey;
  archivedAt: Date;
};

/**
 * The *Archived* sheet (WF-05): archived tasks with their lane's name and the
 * date, and archived groups — newest first. Archived views are listed by
 * `view.list`, under *New view*.
 */
export async function listArchivedWorkflow(
  rls: RlsClient,
  userId: string,
): Promise<{ tasks: WorkflowArchivedTask[]; groups: WorkflowArchivedGroup[] }> {
  return rls.execute(async (tx) => {
    const [tasks, groups] = await Promise.all([
      tx
        .select({
          id: workflowTasks.id,
          title: workflowTasks.title,
          groupName: workflowGroups.name,
          archivedAt: workflowTasks.archivedAt,
        })
        .from(workflowTasks)
        .leftJoin(workflowGroups, eq(workflowGroups.id, workflowTasks.groupId))
        .where(and(eq(workflowTasks.userId, userId), isNotNull(workflowTasks.archivedAt)))
        .orderBy(desc(workflowTasks.archivedAt)),
      tx
        .select({
          id: workflowGroups.id,
          name: workflowGroups.name,
          hue: workflowGroups.hue,
          archivedAt: workflowGroups.archivedAt,
        })
        .from(workflowGroups)
        .where(and(eq(workflowGroups.userId, userId), isNotNull(workflowGroups.archivedAt)))
        .orderBy(desc(workflowGroups.archivedAt)),
    ]);

    return {
      tasks: tasks.flatMap((task) =>
        task.archivedAt === null ? [] : [{ ...task, archivedAt: task.archivedAt }],
      ),
      groups: groups.flatMap((group) =>
        group.archivedAt === null ? [] : [{ ...group, archivedAt: group.archivedAt }],
      ),
    };
  });
}
