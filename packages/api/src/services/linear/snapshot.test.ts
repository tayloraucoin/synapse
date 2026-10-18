import { describe, expect, it, vi } from "vitest";
import { linearAssignedIssuesData } from "@syn/validators";
import recorded from "./__recorded__/assigned-issues.json";
import { createLinearClient, LinearPayloadError } from "./client";
import { snapshotOf, type LinearFetched } from "./snapshot";

/**
 * USE-101 C1: the snapshot schema parses a recorded assigned-issues
 * response, drops a key it does not know, and fails on a missing
 * identifier. `__recorded__/assigned-issues.json` is shaped from Linear's
 * published SDK schema (the live spike is C6's) and carries two keys the
 * documents never select (`sortOrder`, `__typename`).
 */

const TEAM = "5b0b2d1e-7c1f-4c55-9c39-1f7c3a0e7a11";

const teams: LinearFetched["teams"] = [
  {
    id: TEAM,
    key: "SYN",
    name: "Synapse",
    icon: null,
    states: {
      nodes: [
        {
          id: "7a1b2c3d-0000-4000-8000-000000000001",
          name: "Todo",
          type: "unstarted",
          position: 0,
          color: "#e2e2e2",
        },
        {
          id: "7a1b2c3d-0000-4000-8000-000000000002",
          name: "In progress",
          type: "started",
          position: 1,
          color: "#f2c94c",
        },
        {
          id: "7a1b2c3d-0000-4000-8000-000000000003",
          name: "Done",
          type: "completed",
          position: 2,
          color: "#5e6ad2",
        },
      ],
    },
  },
];

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("the snapshot schema (C-USE-101-1)", () => {
  it("parses the recorded response into the five lists", () => {
    const data = linearAssignedIssuesData.parse(recorded.data);
    const payload = snapshotOf({
      viewerId: data.viewer.id,
      assigned: data.viewer.assignedIssues.nodes,
      placed: [],
      teams,
    });

    expect(payload.issues.map((issue) => issue.identifier)).toEqual([
      "SYN-101",
      "SYN-104",
    ]);
    // Under their parent, assigned (SYN-103) or not (SYN-102).
    expect(
      payload.subIssues.map((issue) => [issue.identifier, issue.assignedToMe]),
    ).toEqual([
      ["SYN-103", true],
      ["SYN-102", false],
    ]);
    expect(payload.issues[0]).toEqual({
      id: "0e1f2a3b-4c5d-4e6f-8a9b-0c1d2e3f40101",
      identifier: "SYN-101",
      title: "Linear sync",
      description: "Poll each workspace.",
      url: "https://linear.app/lighthouse/issue/SYN-101",
      stateId: "7a1b2c3d-0000-4000-8000-000000000002",
      priority: 2,
      estimate: 5,
      dueDate: "2026-10-23",
      labels: [{ name: "Integration", color: "#bec2c8" }],
      projectId: "a8c4e0f2-3d61-4b8e-9f0a-6b2e1c9d4f33",
      teamId: TEAM,
      parentId: null,
      assignedToMe: true,
    });
    expect(payload.teams).toEqual([
      { id: TEAM, key: "SYN", name: "Synapse", icon: null },
    ]);
    expect(payload.states.map((state) => state.teamId)).toEqual([
      TEAM,
      TEAM,
      TEAM,
    ]);
  });

  it("drops a key it does not know", () => {
    const data = linearAssignedIssuesData.parse(recorded.data);
    const [node] = data.viewer.assignedIssues.nodes;
    expect(node).not.toHaveProperty("sortOrder");
    expect(node).not.toHaveProperty("__typename");
    expect(node!.project).not.toHaveProperty("__typename");

    const payload = snapshotOf({
      viewerId: data.viewer.id,
      assigned: data.viewer.assignedIssues.nodes,
      placed: [],
      teams,
    });
    expect(JSON.stringify(payload)).not.toContain("sortOrder");
    // An emoji stays; a named icon goes, so the colour square shows.
    expect(payload.projects).toEqual([
      {
        id: "a8c4e0f2-3d61-4b8e-9f0a-6b2e1c9d4f33",
        name: "Synapse",
        icon: "🧠",
        color: "#5e6ad2",
      },
      {
        id: "c1d2e3f4-0a1b-4c2d-8e3f-4a5b6c7d8e9f",
        name: "Docs",
        icon: null,
        color: "#26b5ce",
      },
    ]);
  });

  it("fails on a missing identifier, and the client throws rather than return it", async () => {
    const broken = structuredClone(recorded);
    delete (
      broken.data.viewer.assignedIssues.nodes[0] as { identifier?: string }
    ).identifier;
    expect(linearAssignedIssuesData.safeParse(broken.data).success).toBe(false);

    const fetch = vi.fn(() => Promise.resolve(json(broken)));
    const client = createLinearClient("lin_oauth_a", { fetch });
    await expect(client.assignedIssues()).rejects.toBeInstanceOf(
      LinearPayloadError,
    );
  });
});
