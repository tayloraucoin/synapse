/**
 * Linear's parsed responses into `linear_snapshots.payload` (USE-101): the
 * five lists `@syn/validators`' `linearSnapshotPayload` holds, so Linear's
 * own shape stays out of the tables. Pure.
 *
 * - `issues`: the assigned open issues, then any placed issue read by id
 *   that is not among them (closed, or no longer assigned).
 * - `subIssues`: every issue whose parent is in the snapshot, assigned to
 *   Taylor or not, so the parent's checkboxes list it (D-USE-51).
 * - `projects`: each project an issue names, once. A project icon that is
 *   a named Linear icon, not an emoji, is dropped, so the item shows the
 *   project's colour square (calls.md) [ASSUMPTION: an icon with no
 *   pictograph in it is a name].
 * - `teams` and `states`: every team's workflow, each state with its team.
 */
import {
  linearSnapshotPayload,
  type LinearApiIssue,
  type LinearApiIssueWithChildren,
  type LinearIssue,
  type LinearProject,
  type LinearSnapshotPayload,
} from "@syn/validators";

export interface LinearFetched {
  viewerId: string;
  assigned: LinearApiIssueWithChildren[];
  placed: LinearApiIssueWithChildren[];
  teams: {
    id: string;
    key: string;
    name: string;
    icon: string | null;
    states: {
      nodes: {
        id: string;
        name: string;
        type: LinearSnapshotPayload["states"][number]["type"];
        position: number;
        color: string;
      }[];
    };
  }[];
}

const PICTOGRAPH = /\p{Extended_Pictographic}/u;

function emojiOrNull(icon: string | null): string | null {
  return icon !== null && PICTOGRAPH.test(icon) ? icon : null;
}

function issueOf(node: LinearApiIssue, viewerId: string): LinearIssue {
  return {
    id: node.id,
    identifier: node.identifier,
    title: node.title,
    description: node.description,
    url: node.url,
    stateId: node.state.id,
    priority: node.priority,
    estimate: node.estimate,
    dueDate: node.dueDate,
    labels: node.labels.nodes,
    projectId: node.project?.id ?? null,
    teamId: node.team.id,
    parentId: node.parent?.id ?? null,
    assignedToMe: node.assignee?.id === viewerId,
  };
}

export function snapshotOf(fetched: LinearFetched): LinearSnapshotPayload {
  const nodes = new Map<string, LinearApiIssue>();
  for (const node of [...fetched.assigned, ...fetched.placed]) {
    if (!nodes.has(node.id)) nodes.set(node.id, node);
  }
  for (const node of [...fetched.assigned, ...fetched.placed]) {
    for (const child of node.children.nodes) {
      if (!nodes.has(child.id)) nodes.set(child.id, child);
    }
  }
  // A sub-issue whose parent is here sits under it, assigned or not.
  const issueNodes = [...nodes.values()].filter(
    (node) => !node.parent || !nodes.has(node.parent.id),
  );
  const childNodes = [...nodes.values()].filter(
    (node) => node.parent && nodes.has(node.parent.id),
  );

  const projects = new Map<string, LinearProject>();
  for (const node of nodes.values()) {
    if (node.project && !projects.has(node.project.id)) {
      projects.set(node.project.id, {
        ...node.project,
        icon: emojiOrNull(node.project.icon),
      });
    }
  }

  return linearSnapshotPayload.parse({
    issues: issueNodes.map((node) => issueOf(node, fetched.viewerId)),
    subIssues: childNodes.map((node) => issueOf(node, fetched.viewerId)),
    teams: fetched.teams.map(({ id, key, name, icon }) => ({
      id,
      key,
      name,
      icon,
    })),
    projects: [...projects.values()],
    states: fetched.teams.flatMap((team) =>
      team.states.nodes.map((state) => ({ ...state, teamId: team.id })),
    ),
  });
}
